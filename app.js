'use strict';
/* 정시 지원 찾기 — UX7 (단일 파일). 계산은 서버 /api/evaluate·/api/breakdown, 표시 데이터는 /data/ux7_*.json. */

const $ = (id) => document.getElementById(id);
const EDITIONS = { september_20260903: '9월 가채점', final_june_20260701: '6월 실채점' };
const EXAM_NAMES = { september_20260903: '2027학년도 9월 모의평가 가채점', final_june_20260701: '2027학년도 6월 모의평가 실채점' };
const MED_NAMES = { 의: '의예', 치: '치의예', 한: '한의예', 약: '약학', 수: '수의예' };
const CONV_CATS = { med: '의치한약수', S: '과학기술', H: '인문사회' };
const SOCIAL = ['생활과 윤리', '사회·문화', '윤리와 사상', '한국지리', '세계지리', '동아시아사', '세계사', '정치와 법', '경제'];
const SCIENCE = ['생명과학 Ⅰ', '지구과학 Ⅰ', '물리학 Ⅰ', '화학 Ⅰ', '생명과학 Ⅱ', '지구과학 Ⅱ', '물리학 Ⅱ', '화학 Ⅱ'];
const MATH = [['수학(확통)', '확률과 통계'], ['수학(미적)', '미적분'], ['수학(기하)', '기하']];
const KOREAN = [['국어(화작)', '화법과 작문'], ['국어(언매)', '언어와 매체']];
const SHORT = {
  '생활과 윤리': '생윤', '윤리와 사상': '윤사', '한국지리': '한지', '세계지리': '세지', '동아시아사': '동사', '세계사': '세계사',
  '정치와 법': '정법', '사회·문화': '사문', '경제': '경제', '물리학 Ⅰ': '물리1', '화학 Ⅰ': '화학1', '생명과학 Ⅰ': '생명1',
  '지구과학 Ⅰ': '지구1', '물리학 Ⅱ': '물리2', '화학 Ⅱ': '화학2', '생명과학 Ⅱ': '생명2', '지구과학 Ⅱ': '지구2',
  '수학(확통)': '확통', '수학(미적)': '미적', '수학(기하)': '기하',
};
const CATEGORIES = ['인문사회', '과학기술', '의치한약수', '계약학과', '초등교육', '예체능'];
const FACULTY = { 의: '의과대학', 치: '치과대학', 한: '한의과대학', 약: '약학대학', 수: '수의과대학', 교: '초등교육' };
const FACULTY_MONO = { 의: '의', 치: '치', 한: '한', 약: '약', 수: '수', 교: '교대' };
const SUB_ORDER = { 의: 0, 치: 1, 한: 2, 약: 3, 수: 4 };
const RANK_LABELS = ['서울대', '연고', '서성한', '중경외시', '건동홍', '국숭세단', '광명상가'];
const MED_LABELS = { 의: '의대', 치: '치대', 한: '한의대', 약: '약대', 수: '수의대' };
const GKEY = { S: 'science', H: 'humanities', A: 'all' };
const GNAME = { S: '이과', H: '문과', A: '전체' };
const ALIAS = {
  서울대: '서울대학교', 연대: '연세대학교', 연세: '연세대학교', 고대: '고려대학교', 고려: '고려대학교', 서강: '서강대학교', 성대: '성균관대학교',
  성균: '성균관대학교', 한대: '한양대학교', 한양: '한양대학교', 중대: '중앙대학교', 중앙: '중앙대학교', 경희: '경희대학교', 외대: '한국외국어대학교',
  시립: '서울시립대학교', 시립대: '서울시립대학교', 건대: '건국대학교', 동대: '동국대학교', 홍대: '홍익대학교', 국민: '국민대학교',
  숭실: '숭실대학교', 세종: '세종대학교', 단대: '단국대학교', 이대: '이화여자대학교', 숙대: '숙명여자대학교', 과기대: '서울과학기술대학교',
  서울교대: '서울교육대학교', 경인교대: '경인교육대학교',
};
const MAJOR_ALIAS = { 컴공: '컴퓨터', 전전: '전자전기', 경영: '경영', 경제: '경제', 기계: '기계', 전자: '전자', 약대: '약학', 의대: '의예', 치대: '치의', 한의대: '한의', 수의대: '수의', 교대: '초등교육' };
const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2 4.9 13.3a4.6 4.6 0 0 1 6.5-6.6l.6.6.6-.6a4.6 4.6 0 0 1 6.5 6.6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CALC_SHADES = ['#3b3b3b', '#6e6e6e', '#9a9a9a', '#bdbdbd', '#d6d6d6', '#e4e4e4'];

/* ───────── State ───────── */

const saved = load('sim7') || {};
const state = {
  edition: EDITIONS[saved.edition] ? saved.edition : 'september_20260903',
  record: saved.record || null,
  korean: saved.korean || '국어(화작)',
  group: saved.group || null,
  basis: saved.basis === 'pct' ? 'pct' : 'std',
  recCat: saved.recCat || null,
  findCat: saved.findCat || '',
  findRound: '',
  query: '',
  open: new Set(),
  favorites: new Set(saved.favorites || []),
  slots: saved.slots || {},
  raw: saved.raw || null,
  convTab: saved.convTab || null,
  transformUni: saved.transformUni || null,
  settings: Object.assign({ cross: true, region: '', metro: {} }, saved.settings || {}),
  view: 'overview',
  common: null,
  data: {},
  result: null,
  rows: new Map(),
  schemes: new Map(),
  breakdowns: new Map(),
  detail: null,
};

function load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function persist() {
  try {
    localStorage.setItem('sim7', JSON.stringify({
      edition: state.edition, record: state.record, korean: state.korean, group: state.group, basis: state.basis,
      recCat: state.recCat, findCat: state.findCat, favorites: [...state.favorites], slots: state.slots, settings: state.settings, raw: state.raw, convTab: state.convTab, transformUni: state.transformUni,
    }));
  } catch { /* storage unavailable */ }
}

/* ───────── Helpers ───────── */

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style') n.setAttribute('style', v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
const fin = (x) => typeof x === 'number' && Number.isFinite(x);
const fmt = (x, d = 0) => (fin(x) ? x.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
function fmtPct(p) {
  if (!fin(p)) return '—';
  if (p < 0.1) return p.toFixed(3) + '%';
  if (p < 1) return p.toFixed(2) + '%';
  if (p < 10) return p.toFixed(2) + '%';
  return p.toFixed(1) + '%';
}
const fmtRank = (r) => (fin(r) ? Math.max(1, Math.round(r)).toLocaleString('ko-KR') + '등' : '—');
const signed = (x, d = 1) => (fin(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(d) : '—');
const median = (a) => { const v = a.filter(fin).sort((x, y) => x - y); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const edName = () => EDITIONS[state.edition];
const data = () => state.data[state.edition];
const unitKey = (u) => u.u + '|' + u.m;
const isGradeSubject = (s) => s === '영어' || s === '한국사';
const subjectName = (s) => (s.startsWith('수학(') ? '수학' : s.startsWith('국어(') ? '국어' : s);

function tierOf(g) {
  if (!fin(g)) return { key: 'none', label: '판정 불가' };
  if (g >= 90) return { key: 'safe', label: '여유' };
  if (g >= 80) return { key: 'safe', label: '안정' };
  if (g >= 60) return { key: 'fit', label: '적정' };
  if (g >= 50) return { key: 'fit', label: '경계' };
  if (g >= 30) return { key: 'reach', label: '소신' };
  if (g >= 15) return { key: 'up', label: '상향' };
  return { key: 'hard', label: '어려움' };
}

// backend index_value 과 같은 식 (적정·예상·소신 = 80·50·20 기준선 보간, 5–95 제한)
function lineIndex(score, th) {
  if (!fin(score) || !th || th.some((x) => !fin(x))) return null;
  const [a, e, r] = th;
  if (!(a > e && e > r)) return null;
  let p;
  if (score < r) { const slope = (0.3 / (e - r)) / 0.16; p = 1 / (1 + Math.exp(-Math.max(-100, Math.min(100, Math.log(0.25) + (score - r) * slope)))); }
  else if (score < e) p = 0.2 + 0.3 * (score - r) / (e - r);
  else if (score < a) p = 0.5 + 0.3 * (score - e) / (a - e);
  else { const slope = (0.3 / (a - e)) / 0.16; p = 1 / (1 + Math.exp(-Math.max(-100, Math.min(100, Math.log(4) + (score - a) * slope)))); }
  return Math.min(95, Math.max(5, p * 100));
}

function gauge(g, { large = false, ghost = null } = {}) {
  const t = tierOf(g);
  const box = el('div', { class: 'gauge' + (large ? ' is-lg' : ''), role: 'img', 'aria-label': t.label });
  for (const x of [20, 50, 80]) box.append(el('i', { style: `left:${x}%` }));
  if (fin(ghost)) box.append(el('b', { class: 'is-ghost', style: `left:${ghost}%` }));
  if (fin(g)) box.append(el('b', { 'data-tier': t.key, style: `left:${g}%` }));
  return box;
}
function fitLine(g) {
  const t = tierOf(g);
  return el('div', { class: 'fit' }, gauge(g), el('span', { class: 'tier', 'data-tier': t.key, text: t.label }));
}
function mono(university, faculty = null) {
  const d = data();
  if (faculty) return el('span', { class: 'mono is-faculty', text: FACULTY_MONO[faculty] });
  const info = d.universities[university] || { mo: university.slice(0, 2) };
  const color = state.common.colors[university] || state.common.fallback_color;
  return el('span', { class: 'mono', style: `--mono:${color}`, text: info.mo });
}
function shortUni(u) { return u.replace(/\((.+?)\)/, ' $1'); }
function favButton(u) {
  const key = unitKey(u);
  const b = el('button', { class: 'fav', type: 'button', 'aria-label': '관심', 'aria-pressed': state.favorites.has(key) ? 'true' : 'false', html: HEART });
  b.addEventListener('click', (ev) => { ev.stopPropagation(); toggleFav(u); b.setAttribute('aria-pressed', state.favorites.has(key) ? 'true' : 'false'); });
  return b;
}
function toggleFav(u) {
  const key = unitKey(u);
  if (state.favorites.has(key)) { state.favorites.delete(key); if (state.slots[u.r] === key) delete state.slots[u.r]; }
  else state.favorites.add(key);
  persist();
  if (state.view === 'list') renderList();
}
function toast(text) {
  let t = document.querySelector('.tw-toast');
  if (!t) { t = el('div', { class: 'tw-toast', role: 'status' }); document.body.append(t); }
  t.textContent = text;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.textContent = ''; }, 2600);
}
function chosung(s) {
  let out = '';
  for (const ch of s) { const c = ch.charCodeAt(0) - 0xac00; out += c >= 0 && c < 11172 ? INITIALS[Math.floor(c / 588)] : ch; }
  return out;
}

/* ───────── Data ───────── */

async function fetchJSON(url, body) {
  if (url.startsWith('/api/')) return pagesRequest(url, body);
  if (url.startsWith('/data/')) url = '.' + url;
  const res = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || '요청을 처리하지 못했습니다.');
  return json;
}
async function ensureEdition(ed) {
  if (!state.data[ed]) {
    const d = await fetchJSON(`/data/ux7_${ed}.json`);
    d.byId = new Map(d.units.map((u) => [u.i, u]));
    d.byKey = new Map(d.units.map((u) => [unitKey(u), u]));
    d.rankIndex = { H: new Map(d.rank.H.map((n, i) => [n, i])), S: new Map(d.rank.S.map((n, i) => [n, i])) };
    d.scoreList = {};
    for (const [s, table] of Object.entries(d.report)) d.scoreList[s] = Object.keys(table).map(Number).sort((a, b) => b - a);
    state.data[ed] = d;
  }
  return state.data[ed];
}

function streamOf(record) {
  if (!record) return 'H';
  const math = Object.keys(record).find((k) => k.startsWith('수학('));
  const inquiry = Object.keys(record).filter((k) => SCIENCE.includes(k));
  return (math === '수학(미적)' || math === '수학(기하)') && inquiry.length === 2 ? 'S' : 'H';
}
const myStream = () => streamOf(state.record);
const displayGroup = () => state.group || myStream();

async function evaluate() {
  if (!state.record) return;
  setBusy(true);
  if (!state.result) renderAll();
  try {
    const res = await fetchJSON('/api/evaluate', { edition: state.edition, group: 'all', record: state.record, compact: true });
    state.result = res;
    state.rows = new Map(res.rows.map((r) => [r.id, r]));
    state.schemes = new Map(res.schemes.map((s) => [s.name, s]));
    state.breakdowns.clear();
    $('error').hidden = true;
  } catch (err) {
    state.result = null;
    $('error').hidden = false;
    $('error').textContent = err.message;
  } finally { setBusy(false); }
}
function setBusy(on) { state.busy = on; document.body.classList.toggle('is-busy', on); }

/* ───────── Unit helpers ───────── */

function gaugeOf(u) { const r = state.rows.get(u.i); return r ? r.line_index : null; }
function myPct(u, g = displayGroup()) { const s = state.schemes.get(u.k); return s ? s.percentiles[GKEY[g]] : null; }
function expPct(u, g = displayGroup()) { return u.tp[g] ? u.tp[g][1] : null; }
function pop(g) { const p = data().populations; return g === 'S' ? p.science : g === 'H' ? p.humanities : p.all; }

const EXCLUDED_UNIS = new Set(['감리교신학대학교', '강서대학교', '성공회대학교', '장로회신학대학교', '총신대학교', '한국성서대학교']);
function inScope(u) {
  if (!u.sc || EXCLUDED_UNIS.has(u.u)) return false;
  if (u.sc.startsWith('metro:')) return state.settings.metro[u.sc.slice(6)] !== false;
  return true;
}
function visible(u, category = null) {
  const row = state.rows.get(u.i);
  if (!row || row.eligibility.state === 'excluded') return false;
  if (!inScope(u) || /\[만학\]/.test(u.m)) return false;
  if (u.rg && u.rg !== state.settings.region) return false;
  if (u.c === '예체능' && category !== '예체능' && category !== 'search') return false;
  if (u.pr && category !== '예체능') return false;
  if (!state.settings.cross) {
    const s = myStream();
    if (s === 'H' && ['과학기술', '의치한약수', '계약학과'].includes(u.c)) return false;
    if (s === 'S' && u.c === '인문사회') return false;
  }
  return true;
}
function rankGroupFor(category) { return ['인문사회', '초등교육', '예체능'].includes(category) ? 'H' : category ? 'S' : myStream(); }
function rankIdx(u, rg) { const i = data().rankIndex[rg].get(u.u); return i === undefined ? 500 : i; }
function sortKey(u, category) {
  const e = expPct(u, rankGroupFor(category) === 'S' ? 'S' : 'H') ?? 99;
  if (u.c === '의치한약수') return [SUB_ORDER[u.t] ?? 5, e];
  if (u.c === '초등교육') return [0, e];
  return [rankIdx(u, rankGroupFor(category)), e];
}
const cmpKey = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

/* ───────── Score strip / report ───────── */

function recordParts(rec) {
  const math = Object.keys(rec).find((k) => k.startsWith('수학('));
  const inq = Object.keys(rec).filter((k) => SOCIAL.includes(k) || SCIENCE.includes(k));
  return { math, inq };
}
function gradeOf(subject, score) {
  if (isGradeSubject(subject)) return score;
  const t = data().report[subject]; const v = t && t[String(score)];
  return v ? v[1] : null;
}
function pctOf(subject, score) { const t = data().report[subject]; const v = t && t[String(score)]; return v ? v[0] : null; }

function renderStrip() {
  const box = $('score-strip');
  box.replaceChildren();
  const rec = state.record;
  if (!rec) return;
  const { math, inq } = recordParts(rec);
  const cells = [['국어', rec['국어'], gradeOf('국어', rec['국어'])], [SHORT[math], rec[math], gradeOf(math, rec[math])],
    ['영어', null, rec['영어']], ...inq.map((s) => [SHORT[s] || s, rec[s], gradeOf(s, rec[s])]), ['한국사', null, rec['한국사']]];
  for (const [label, score, grade] of cells) {
    const b = el('b');
    if (score !== null) { b.append(String(score)); b.append(el('em', { text: grade + '등급' })); }
    else b.append(grade + '등급');
    box.append(el('span', { class: 'ss-cell' }, el('small', { text: label }), b));
  }
  box.append(el('span', { class: 'ss-edit', text: '수정' }));
}

function renderReport() {
  const rec = state.record;
  const { math, inq } = recordParts(rec);
  const inqHead = inq.every((s) => SCIENCE.includes(s)) ? '과학탐구' : inq.every((s) => SOCIAL.includes(s)) ? '사회탐구' : '탐구';
  const cols = [
    { head: '한국사', sub: '', subject: '한국사' },
    { head: '국어', sub: KOREAN.find((k) => k[0] === state.korean)?.[1] || '', subject: '국어' },
    { head: '수학', sub: MATH.find((m) => m[0] === math)?.[1] || '', subject: math },
    { head: '영어', sub: '', subject: '영어' },
    ...inq.map((s) => ({ head: inqHead, sub: s, subject: s })),
  ];
  const na = () => el('td', { class: 'na', 'aria-label': '해당 없음' });
  const num = (v) => el('td', { class: 'num', text: v ?? '—' });
  const cellStd = (c) => (isGradeSubject(c.subject) ? na() : num(rec[c.subject]));
  const cellPct = (c) => (isGradeSubject(c.subject) ? na() : num(pctOf(c.subject, rec[c.subject])));
  const cellGrade = (c) => num(gradeOf(c.subject, rec[c.subject]));
  const rows = [['선택과목', (c) => el('td', { class: 'sub', text: c.sub })], ['표준점수', cellStd], ['백분위', cellPct], ['등급', cellGrade]];
  const wide = el('table', { class: 'report is-wide' },
    el('thead', {}, el('tr', {}, el('th', { text: '구분' }), el('th', { text: '한국사 영역' }), el('th', { text: '국어 영역' }), el('th', { text: '수학 영역' }), el('th', { text: '영어 영역' }), el('th', { colspan: inq.length, text: inqHead + ' 영역' }))),
    el('tbody', {}, ...rows.map(([label, fn]) => el('tr', {}, el('th', { text: label }), ...cols.map(fn)))));
  const tallRows = rows.slice(1);
  const tall = el('table', { class: 'report is-tall' },
    el('thead', {}, el('tr', {}, el('th', { text: '구분' }), ...tallRows.map(([label]) => el('th', { text: label })))),
    el('tbody', {}, ...cols.map((c) => el('tr', {}, el('th', {}, el('span', { class: 'rt-area', text: c.head === inqHead ? '탐구' : c.head }), c.sub ? el('small', { class: 'rt-sub', text: c.sub }) : ''), ...tallRows.map(([, fn]) => fn(c))))));
  $('report').replaceChildren(wide, tall);

  const g = myStream();
  const std = state.schemes.get('★표점합');
  const pct = state.schemes.get('★백분위합');
  const top = (s) => (s && fin(s.percentiles[GKEY[g]]) ? GNAME[g] + ' 상위 ' + fmtPct(s.percentiles[GKEY[g]]) : '');
  const meta = [['시험', EXAM_NAMES[state.edition], ''], ['계열', GNAME[g], ''], ['표준점수 합', std ? fmt(std.score, 0) : '—', top(std)], ['백분위 합', pct ? fmt(pct.score, 0) : '—', top(pct)]];
  $('report-info').replaceChildren(...meta.map(([k, v, sub], i) => el('div', { class: 'meta-cell' + (i ? '' : ' is-exam') }, el('small', { text: k }), el('b', {}, v, sub ? el('em', { text: sub }) : ''))));
}

/* ───────── University scores ───────── */

function convEntries(tab) {
  const d = data();
  const g = displayGroup();
  const cat = CONV_CATS[tab];
  const groups = new Map();
  for (const u of d.units) {
    if (u.c !== cat || !visible(u, cat)) continue;
    const key = tab === 'med' ? u.u + '|' + u.t : u.u + '|' + u.k;
    let e = groups.get(key);
    if (!e) groups.set(key, (e = { key, uni: u.u, units: [] }));
    e.units.push(u);
  }
  let list = [];
  for (const e of groups.values()) {
    const units = e.units.filter((u) => fin(expPct(u, g))).sort((a, b) => expPct(a, g) - expPct(b, g));
    if (!units.length) continue;
    const rep = units[units.length >> 1];
    const row = state.rows.get(rep.i);
    const my = myPct(rep, g);
    if (!row || !fin(my)) continue;
    const label = tab === 'med' ? MED_NAMES[rep.t] || '' : rep.k.slice(2).replace(/[백표]$/, '');
    list.push({ ...e, rep, n: units.length, exp: expPct(rep, g), my, score: row.score, label });
  }
  if (tab !== 'med') {
    const best = new Map();
    const pref = tab === 'H' ? /인문|사회|통합/ : /자연|공학|통합/;
    const w = (e) => e.n + (pref.test(e.label) ? 0.5 : 0) - (/간호|예술|체육/.test(e.label) ? 100 : 0);
    for (const e of list) if (!best.has(e.uni) || w(best.get(e.uni)) < w(e)) best.set(e.uni, e);
    list = [...best.values()];
  }
  list.sort((a, b) => a.exp - b.exp);
  const first = list.findIndex((e) => e.exp >= e.my);
  const at = first < 0 ? list.length : first;
  const start = Math.max(0, Math.min(at - 5, list.length - 12));
  return list.slice(start, start + 12);
}
function renderConv() {
  const tab = state.convTab || (myStream() === 'S' ? 'S' : 'H');
  for (const b of $('conv-tab').children) b.classList.toggle('is-active', b.dataset.tab === tab);
  const n = pop(displayGroup());
  const list = convEntries(tab);
  const box = $('conv-list');
  box.replaceChildren();
  if (!list.length) { box.append(el('div', { class: 'round-empty', text: '표시할 대학이 없습니다.' })); return; }
  const max = Math.max(...list.map((e) => Math.max(e.my, e.exp))) * 1.08 / 100 * n;
  for (const e of list) {
    const mine = e.my / 100 * n;
    const line = e.exp / 100 * n;
    const t = tierOf(gaugeOf(e.rep));
    const row = el('button', { class: 'conv-row', type: 'button' },
      mono(e.uni),
      el('span', { class: 'conv-name' }, el('strong', { text: shortUni(e.uni) }), el('small', { text: e.label })),
      el('span', { class: 'conv-score' }, el('b', { text: fmt(e.score, 2) })),
      el('span', { class: 'conv-bar' },
        el('span', { class: 'conv-fill', 'data-tier': t.key, style: `width:${Math.min(100, 100 * mine / max).toFixed(1)}%` }),
        el('i', { style: `left:${Math.min(100, 100 * line / max).toFixed(1)}%`, title: '합격선 ' + fmtRank(line) })),
      el('span', { class: 'conv-rank', text: fmtRank(mine) }));
    row.addEventListener('click', () => openDetail(e.rep));
    box.append(row);
  }
}

/* ───────── Position chart ───────── */

function curveOf(basis, g) {
  const c = data().curves;
  const grid = c.grid;
  if (g !== 'A') return { grid, q: c[basis][g] };
  const key = basis + ':A';
  if (!c[key]) {
    const qs = c[basis].S; const qh = c[basis].H;
    const ns = c.pop.S; const nh = c.pop.H;
    const hi = Math.max(qs[0], qh[0]); const lo = Math.max(qs[qs.length - 1], qh[qh.length - 1]);
    const scores = []; const pcts = [];
    const steps = 900;
    for (let i = 0; i <= steps; i++) {
      const s = hi - (hi - lo) * i / steps;
      scores.push(s);
      pcts.push((ns * pctAtRaw(grid, qs, s) + nh * pctAtRaw(grid, qh, s)) / (ns + nh));
    }
    c[key] = { grid: pcts, q: scores };
  }
  return c[key];
}
function pctAtRaw(grid, q, s) {
  // q: descending scores at ascending percentile grid
  if (s >= q[0]) return grid[0];
  if (s <= q[q.length - 1]) return grid[grid.length - 1];
  let lo = 0; let hi = q.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (q[m] >= s) lo = m; else hi = m; }
  const t = (q[lo] - s) / ((q[lo] - q[hi]) || 1);
  return grid[lo] + t * (grid[hi] - grid[lo]);
}
function scoreAtRaw(grid, q, p) {
  if (p <= grid[0]) return q[0];
  if (p >= grid[grid.length - 1]) return q[q.length - 1];
  let lo = 0; let hi = grid.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (grid[m] <= p) lo = m; else hi = m; }
  const t = (p - grid[lo]) / ((grid[hi] - grid[lo]) || 1);
  return q[lo] + t * (q[hi] - q[lo]);
}

function markers(g) {
  const d = data();
  const out = [];
  const uniMedian = new Map();
  for (const u of d.units) {
    if (!inScope(u) || u.rg || u.pr || /\[만학\]/.test(u.m)) continue;
    if (!['인문사회', '과학기술'].includes(u.c)) continue;
    if (g === 'H' && u.c !== '인문사회') continue;
    if (g === 'S' && u.c !== '과학기술') continue;
    const v = u.tp[g] && u.tp[g][1];
    if (!fin(v)) continue;
    if (!uniMedian.has(u.u)) uniMedian.set(u.u, []);
    uniMedian.get(u.u).push(v);
  }
  RANK_LABELS.forEach((label, gi) => {
    const vals = [];
    for (const [uni, arr] of uniMedian) if (d.rank_group[uni] === gi) vals.push(median(arr));
    const m = median(vals);
    if (fin(m)) out.push({ label, pct: m, med: false });
  });
  if (g !== 'H') {
    for (const sub of ['의', '치', '한', '약', '수']) {
      const vals = d.units.filter((u) => u.c === '의치한약수' && u.t === sub && !u.rg && !/\[만학\]/.test(u.m)).map((u) => u.tp[g] && u.tp[g][1]);
      const m = median(vals);
      if (fin(m)) out.push({ label: MED_LABELS[sub], pct: m, med: true });
    }
  }
  return out;
}

function renderPosition() {
  const g = displayGroup();
  const basis = state.basis;
  const scheme = state.schemes.get(basis === 'std' ? '★표점합' : '★백분위합');
  for (const b of $('group-switch').children) b.classList.toggle('is-active', b.dataset.group === g);
  for (const b of $('basis-switch').children) b.classList.toggle('is-active', b.dataset.basis === basis);
  const pct = scheme ? scheme.percentiles[GKEY[g]] : null;
  $('pos-label').textContent = GNAME[g] + ' 상위';
  $('pos-pct').textContent = fmtPct(pct);
  $('pos-rank').textContent = fin(pct) ? fmtRank(pct / 100 * pop(g)) : '—';
  $('pos-score-label').textContent = basis === 'std' ? '표준점수 합' : '백분위 합';
  $('pos-score').textContent = scheme ? fmt(scheme.score, 0) : '—';
  drawChart(g, basis, scheme ? scheme.score : null);
}

function drawChart(g, basis, myScore) {
  const box = $('position-chart');
  const W = Math.max(300, box.clientWidth || 800);
  const narrow = W < 560;
  const H = narrow ? 230 : 250;
  const top = narrow ? 86 : 70;
  const bottom = 28;
  const { grid, q } = curveOf(basis, g);
  let hiScore = scoreAtRaw(grid, q, 0.005);
  let loScore = scoreAtRaw(grid, q, 40);
  if (fin(myScore)) { hiScore = Math.max(hiScore, myScore + 2); loScore = Math.min(loScore, myScore - 4); }
  const x = (s) => 8 + (W - 16) * (s - loScore) / (hiScore - loScore);
  const N = 180;
  const h = (hiScore - loScore) / N * 4;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const s = loScore + (hiScore - loScore) * i / N;
    const dens = Math.max(0, (pctAtRaw(grid, q, s - h) - pctAtRaw(grid, q, s + h)) / (2 * h));
    pts.push([s, dens]);
  }
  const sm = pts.map((p, i) => { let a = 0; let w = 0; for (let k = -8; k <= 8; k++) { const j = i + k; if (j < 0 || j > N) continue; const wt = 9 - Math.abs(k); a += pts[j][1] * wt; w += wt; } return [p[0], a / w]; });
  const maxD = Math.max(...sm.map((p) => p[1])) || 1;
  const y = (d) => H - bottom - (H - bottom - top) * d / maxD;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '분포와 내 위치');
  const add = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.append(n); return n; };
  const path = sm.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
  add('path', { d: `${path}L${x(hiScore).toFixed(1)},${H - bottom}L${x(loScore).toFixed(1)},${H - bottom}Z`, class: 'pc-area' });
  if (fin(myScore)) {
    const above = sm.filter((p) => p[0] >= myScore);
    if (above.length > 1) {
      const pa = above.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
      add('path', { d: `M${x(myScore).toFixed(1)},${H - bottom}L${x(myScore).toFixed(1)},${y(above[0][1]).toFixed(1)}${pa.replace(/^M/, 'L')}L${x(hiScore).toFixed(1)},${H - bottom}Z`, class: 'pc-above' });
    }
  }
  add('path', { d: path, class: 'pc-line' });
  add('line', { x1: 8, x2: W - 8, y1: H - bottom, y2: H - bottom, class: 'pc-base' });
  // 상위 % 눈금
  const ticks = [30, 10, 5, 1, 0.1, 0.01];
  let lastX = -99;
  for (const t of ticks) {
    const s = scoreAtRaw(grid, q, t);
    if (s < loScore || s > hiScore) continue;
    const tx = x(s);
    if (tx - lastX < 42) continue;
    lastX = tx;
    const gTick = add('g', { class: 'pc-tick' });
    add('line', { x1: tx, x2: tx, y1: H - bottom, y2: H - bottom + 4 }, gTick);
    const tt = add('text', { x: tx, y: H - 8, 'text-anchor': 'middle' }, gTick);
    tt.textContent = t + '%';
  }
  // 대학·의대 라인 표식
  let marks = markers(g).map((m) => ({ ...m, s: scoreAtRaw(grid, q, m.pct) })).filter((m) => m.s >= loScore && m.s <= hiScore);
  if (narrow && fin(myScore)) {
    const myP = pctAtRaw(grid, q, myScore);
    marks = marks.sort((a, b) => Math.abs(Math.log10(a.pct / myP)) - Math.abs(Math.log10(b.pct / myP))).slice(0, 5);
  }
  marks.sort((a, b) => a.s - b.s);
  const lanes = narrow ? [top - 64, top - 48, top - 32, top - 16] : [top - 50, top - 32, top - 14];
  const laneEnd = lanes.map(() => -99);
  for (const m of marks) {
    const mx = x(m.s);
    const w = m.label.length * (narrow ? 10 : 11) + 8;
    const lane = laneEnd.findIndex((end) => mx - w / 2 > end + 3);
    if (lane < 0) continue;
    laneEnd[lane] = mx + w / 2;
    const gm = add('g', { class: 'pc-mark' + (m.med ? ' is-med' : '') });
    const ly = lanes[lane];
    add('line', { x1: mx, x2: mx, y1: ly + 4, y2: y(sm.reduce((best, p) => (Math.abs(p[0] - m.s) < Math.abs(best[0] - m.s) ? p : best))[1]) }, gm);
    add('circle', { cx: mx, cy: ly + 4, r: 2.5 }, gm);
    const t = add('text', { x: mx, y: ly, 'text-anchor': 'middle' }, gm);
    t.textContent = m.label;
  }
  if (fin(myScore)) {
    const mx = x(myScore);
    const gm = add('g', { class: 'pc-me' });
    add('line', { x1: mx, x2: mx, y1: top - 4, y2: H - bottom }, gm);
    add('circle', { cx: mx, cy: H - bottom, r: 4 }, gm);
    const t = add('text', { x: mx + (mx > W - 40 ? -8 : 8), y: top + 8, 'text-anchor': mx > W - 40 ? 'end' : 'start' }, gm);
    t.textContent = '나';
  }
  box.replaceChildren(svg);
}

/* ───────── Recommendations ───────── */

function defaultCategory() { return myStream() === 'S' ? '과학기술' : '인문사회'; }
function renderRecCategory() {
  const cur = state.recCat || defaultCategory();
  $('rec-category').replaceChildren(...CATEGORIES.map((c) => el('button', {
    class: 'tw-chip' + (c === cur ? ' is-active' : ''), type: 'button', text: c,
    onclick: () => { state.recCat = c; persist(); renderRecCategory(); renderRecs(); },
  })));
}
function pickCard(u, { challenge = false, slot = null } = {}) {
  const faculty = u.c === '의치한약수' ? u.t : u.c === '초등교육' ? '교' : null;
  const card = el('div', { class: 'pick' + (challenge ? ' is-challenge' : '') + (slot ? ' is-slot' : ''), role: 'button', tabindex: 0 });
  card.append(mono(u.u), el('span', { class: 'pick-name' }, el('small', {}, shortUni(u.u), challenge ? el('span', { class: 'pick-tag', text: '도전' }) : ''), el('strong', { text: u.m })), favButton(u), fitLine(gaugeOf(u)));
  card.addEventListener('click', () => openDetail(u));
  card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') openDetail(u); });
  void faculty;
  return card;
}
function recGroups(category, round) {
  const pool = data().units.filter((u) => u.c === category && u.r === round && visible(u, category) && fin(gaugeOf(u)));
  const med = category === '의치한약수';
  const rg = rankGroupFor(category) === 'S' ? 'S' : 'H';
  const map = new Map();
  for (const u of pool) {
    const key = med ? u.u + '|' + u.t : u.u;
    let e = map.get(key);
    if (!e) map.set(key, (e = { key: 'rec:' + round + ':' + key, uni: u.u, name: shortUni(u.u), tag: med ? MED_NAMES[u.t] || '' : '', all: [] }));
    e.all.push(u);
  }
  const groups = [];
  for (const e of map.values()) {
    const ranked = e.all.filter((u) => gaugeOf(u) >= 20).sort((a, b) => (expPct(a, rg) ?? 99) - (expPct(b, rg) ?? 99));
    let safe = 0;
    e.units = ranked.filter((u) => gaugeOf(u) < 90 || safe++ < 3);
    if (!e.units.length) continue;
    e.best = Math.max(...e.units.map(gaugeOf));
    const line = median(e.units.map((u) => expPct(u, rg)));
    e.sort = med ? [SUB_ORDER[e.all[0].t] ?? 5, line ?? 99] : category === '초등교육' ? [0, line ?? 99] : [rankIdx(e.all[0], rg), line ?? 99];
    groups.push(e);
  }
  groups.sort((a, b) => cmpKey(a.sort, b.sort));
  let main = groups.filter((e) => e.best >= 50).slice(0, 5);
  if (main.length < 3) main = groups.filter((e) => e.best >= 35).slice(0, 5);
  const first = main.length ? groups.indexOf(main[0]) : groups.length;
  const challenge = groups.slice(0, first).find((e) => e.best < 50) || null;
  return { main, challenge };
}
function renderRecs() {
  const category = state.recCat || defaultCategory();
  const box = $('recs');
  box.replaceChildren();
  const rerender = () => renderRecs();
  for (const round of ['가', '나', '다']) {
    const { main, challenge } = recGroups(category, round);
    const col = el('div', { class: 'round' }, el('div', { class: 'round-head' }, el('h3', { text: round + '군' })));
    if (!main.length && !challenge) col.append(el('div', { class: 'round-empty', text: '추천할 대학이 없습니다.' }));
    if (challenge) col.append(lineGroup(challenge, false, { rerender, hideRound: true, challenge: true }));
    for (const e of main) col.append(lineGroup(e, false, { rerender, hideRound: true }));
    box.append(col);
  }
}

/* ───────── Find ───────── */

function renderFindCategory() {
  const all = ['', ...CATEGORIES];
  $('find-category').replaceChildren(...all.map((c) => el('button', {
    class: 'tw-chip' + (c === state.findCat ? ' is-active' : ''), type: 'button', text: c || '전체',
    onclick: () => { state.findCat = c; state.open.clear(); persist(); renderFindCategory(); renderFind(); },
  })));
  for (const b of $('find-round').children) b.classList.toggle('is-active', b.dataset.round === state.findRound);
}
function matchQuery(u, q) {
  if (!q) return true;
  const target = ALIAS[q];
  if (target && u.u === target) return true;
  const major = MAJOR_ALIAS[q];
  if (major && u.m.includes(major)) return true;
  const hay = (u.u + ' ' + ((data().universities[u.u] || {}).n || '') + ' ' + u.m).replace(/\s/g, '');
  if (hay.includes(q)) return true;
  if (/^[ㄱ-ㅎ]+$/.test(q)) return chosung(u.u).startsWith(q) || chosung((data().universities[u.u] || {}).n || '').startsWith(q) || chosung(u.m).includes(q);
  return false;
}
function renderFind() {
  const d = data();
  const cat = state.findCat;
  const q = state.query.replace(/\s/g, '');
  const g = displayGroup();
  const units = d.units.filter((u) => (cat ? u.c === cat : u.c !== '예체능') && visible(u, q ? 'search' : cat) && (!state.findRound || u.r === state.findRound) && matchQuery(u, q));
  const entries = new Map();
  for (const u of units) {
    const faculty = u.c === '의치한약수' ? u.t : u.c === '초등교육' ? '교' : null;
    const key = faculty ? 'f:' + faculty : 'u:' + u.u;
    if (!entries.has(key)) entries.set(key, { key, faculty, name: faculty ? FACULTY[faculty] : shortUni(u.u), uni: faculty ? null : u.u, units: [] });
    entries.get(key).units.push(u);
  }
  const rg = rankGroupFor(cat);
  const list = [...entries.values()];
  for (const e of list) {
    e.rep = median(e.units.filter((u) => !u.rg).map((u) => expPct(u, g)));
    e.rank = e.faculty ? null : (d.rankIndex[rg].get(e.uni) ?? 500 + (e.rep ?? 99));
  }
  const unis = list.filter((e) => !e.faculty).sort((a, b) => a.rank - b.rank || (a.rep ?? 99) - (b.rep ?? 99));
  const facs = list.filter((e) => e.faculty).sort((a, b) => (SUB_ORDER[a.faculty] ?? 9) - (SUB_ORDER[b.faculty] ?? 9));
  const ordered = [...unis];
  for (const f of facs) {
    const idx = f.faculty === '교' ? ordered.findIndex((e) => !e.faculty && fin(e.rep) && fin(f.rep) && e.rep > f.rep) : ordered.findIndex((e) => !e.faculty);
    ordered.splice(idx < 0 ? ordered.length : idx, 0, f);
  }
  const box = $('find-list');
  box.replaceChildren();
  if (!ordered.length) { box.append(el('div', { class: 'tw-empty', text: '검색 결과가 없습니다.' })); return; }
  const mine = state.schemes.get('★표점합')?.percentiles[GKEY[g]];
  let dividerDone = !fin(mine) || !!q;
  let shown = 0;
  for (const e of ordered) {
    if (!dividerDone && fin(e.rep) && e.rep > mine) { box.append(el('div', { class: 'me-line' }, el('span', { text: '내 위치' }))); dividerDone = true; }
    const auto = q && e.units.some((u) => u.m.replace(/\s/g, '').includes(q) || (MAJOR_ALIAS[q] && u.m.includes(MAJOR_ALIAS[q])));
    box.append(lineGroup(e, auto && shown < 6));
    if (auto) shown++;
  }
  if (!dividerDone) box.append(el('div', { class: 'me-line' }, el('span', { text: '내 위치' })));
}
function lineGroup(e, autoOpen, opts = {}) {
  const open = state.open.has(e.key) || autoOpen;
  const rerender = opts.rerender || renderFind;
  const wrap = el('div', { class: 'line-group' + (open ? ' is-open' : '') + (opts.challenge ? ' is-challenge' : '') });
  const counts = { safe: 0, fit: 0, reach: 0 };
  for (const u of e.units) { const g = gaugeOf(u); if (g >= 80) counts.safe++; else if (g >= 50) counts.fit++; else if (g >= 20) counts.reach++; }
  const dots = el('span', { class: 'line-dots' });
  for (const [k, label] of [['safe', '안정'], ['fit', '적정'], ['reach', '소신']]) if (counts[k]) dots.append(el('span', { 'data-tier': k, title: label, text: counts[k] }));
  const row = el('button', { class: 'line-row', type: 'button', 'aria-expanded': open ? 'true' : 'false' },
    e.faculty ? mono(null, e.faculty) : mono(e.uni),
    el('span', { class: 'line-name' }, el('strong', { text: e.name }), el('small', {}, [e.tag, opts.challenge ? '도전' : '', (opts.hideRound ? '학과 ' : '모집단위 ') + e.units.length + '개'].filter(Boolean).join('  '))),
    dots, el('span', { class: 'line-chevron' }));
  row.addEventListener('click', () => { if (state.open.has(e.key)) state.open.delete(e.key); else state.open.add(e.key); rerender(); });
  wrap.append(row);
  if (open) {
    const list = el('div', { class: 'unit-list' });
    const units = opts.hideRound ? e.units : [...e.units].sort((a, b) => (gaugeOf(b) ?? -1) - (gaugeOf(a) ?? -1));
    for (const u of units) {
      const name = e.faculty ? [shortUni(u.u), ...variantOf(u.m)].join(' ') : u.m;
      const r = el('button', { class: 'unit-row', type: 'button' }, el('strong', { text: name }), opts.hideRound ? '' : el('span', { class: 'round-tag', text: u.r }), fitLine(gaugeOf(u)));
      r.addEventListener('click', () => openDetail(u));
      list.append(r);
    }
    wrap.append(list);
  }
  return wrap;
}

function variantOf(m) {
  const out = [];
  const slash = m.match(/\/(인문|자연)/); if (slash) out.push(slash[1]);
  if (m.includes('학석사')) out.push('학석사');
  if (m.includes('[교과]')) out.push('교과');
  if (m.includes('[지역]')) out.push('지역');
  if (/\((미래산업약학|약학)\)/.test(m)) out.push(m.match(/\((미래산업약학|약학)\)/)[1]);
  return out;
}

/* ───────── List ───────── */

function renderList() {
  const d = data();
  const favs = [...state.favorites].map((k) => d.byKey.get(k)).filter(Boolean);
  const summary = $('list-summary');
  const rounds = $('list-rounds');
  summary.replaceChildren();
  rounds.replaceChildren();
  if (!favs.length) {
    summary.hidden = true;
    rounds.append(el('div', { class: 'tw-empty', style: 'grid-column:1/-1' }, el('span', { text: '관심 학과가 없습니다.' })));
    return;
  }
  summary.hidden = false;
  const chosen = [];
  for (const round of ['가', '나', '다']) {
    const key = state.slots[round];
    const u = key && d.byKey.get(key);
    const slot = el('div', { class: 'combo-slot' }, el('small', { text: round + '군' }));
    if (u && state.favorites.has(key)) { chosen.push(u); slot.append(el('strong', { text: shortUni(u.u) + ' ' + u.m }), fitLine(gaugeOf(u))); }
    else { const n = favs.filter((f) => f.r === round).length; slot.append(el('span', { class: 'empty', text: n ? '관심 ' + n + '개' : '—' })); }
    summary.append(slot);
  }
  const probs = chosen.map((u) => gaugeOf(u)).filter(fin);
  const any = probs.length ? 100 * (1 - probs.reduce((acc, p) => acc * (1 - p / 100), 1)) : null;
  summary.append(el('div', { class: 'combo-total' }, el('small', { text: '한 곳 이상 합격' }), probs.length ? fitLine(Math.min(95, any)) : el('span', { class: 'empty', text: '—' })));
  for (const round of ['가', '나', '다']) {
    const col = el('div', { class: 'round' }, el('div', { class: 'round-head' }, el('h3', { text: round + '군' })));
    const items = favs.filter((u) => u.r === round).sort((a, b) => (gaugeOf(b) ?? -1) - (gaugeOf(a) ?? -1));
    if (!items.length) col.append(el('div', { class: 'round-empty', text: '관심 학과가 없습니다.' }));
    for (const u of items) {
      const isSlot = state.slots[round] === unitKey(u);
      const card = pickCard(u, { slot: isSlot });
      const check = el('input', { type: 'checkbox', class: 'tw-check', checked: isSlot ? true : null, 'aria-label': '지원' });
      const pickBtn = el('label', { class: 'slot-toggle' }, check, '지원');
      pickBtn.addEventListener('click', (ev) => ev.stopPropagation());
      check.addEventListener('change', () => { if (isSlot) delete state.slots[round]; else state.slots[round] = unitKey(u); persist(); renderList(); });
      card.append(pickBtn);
      col.append(card);
    }
    rounds.append(col);
  }
}

/* ───────── Detail ───────── */

async function openDetail(u) {
  state.detail = { unit: u, tweak: {} };
  const d = data();
  const m = mono(u.u); m.id = 'detail-mono'; m.classList.add('is-lg');
  $('detail-mono').replaceWith(m);
  $('detail-uni').textContent = d.universities[u.u] ? u.u : u.u;
  $('detail-title').textContent = u.m;
  const fav = $('detail-fav');
  fav.innerHTML = HEART;
  fav.setAttribute('aria-pressed', state.favorites.has(unitKey(u)) ? 'true' : 'false');
  fav.onclick = () => { toggleFav(u); fav.setAttribute('aria-pressed', state.favorites.has(unitKey(u)) ? 'true' : 'false'); };
  showSheet('sheet-detail');
  renderDetail();
  try {
    const bd = await breakdown(state.record, u.k);
    if (state.detail && state.detail.unit === u) { state.detail.bd = bd; renderDetail(); }
  } catch (err) { toast(err.message); }
}
async function breakdown(record, scheme) {
  const key = state.edition + '|' + scheme + '|' + JSON.stringify(record);
  if (!state.breakdowns.has(key)) state.breakdowns.set(key, fetchJSON('/api/breakdown', { edition: state.edition, record, scheme }));
  try { return await state.breakdowns.get(key); } catch (err) { state.breakdowns.delete(key); throw err; }
}

function renderDetail() {
  const { unit: u, bd } = state.detail;
  const d = data();
  const g = displayGroup();
  const row = state.rows.get(u.i);
  const gi = gaugeOf(u);
  const t = tierOf(gi);
  const body = $('detail-body');
  body.replaceChildren();

  // 요약 게이지
  const tags = el('div', { class: 'tags' }, el('span', { class: 'tw-badge', text: u.r + '군' }), el('span', { class: 'tw-badge', text: u.c }));
  if (u.rg) tags.append(el('span', { class: 'tw-badge', text: '지역인재' }));
  if (row && row.eligibility.state === 'unchecked') tags.append(el('span', { class: 'tw-badge is-outline', text: '자격 확인' }));
  const scale = el('div', { class: 'gauge-scale' }, ...[['소신', 20], ['예상', 50], ['적정', 80]].map(([l, x]) => el('span', { style: `left:${x}%`, text: l })));
  body.append(el('div', { class: 'meter' },
    el('div', { class: 'meter-top' }, el('span', { class: 'tier', 'data-tier': t.key, text: t.label }), tags),
    el('div', {}, gauge(gi, { large: true }), scale)));

  // 핵심 숫자
  const my = row ? row.score : null;
  const exp = u.th[1];
  const mp = myPct(u, g); const ep = expPct(u, g);
  const diff = fin(my) && fin(exp) ? my - exp : null;
  const stat = (label, value, extra) => el('div', { class: 'stat' }, el('small', { text: label }), el('b', {}, value, extra || ''));
  const diffSpan = el('em', { class: '' }, el('span', { class: diff >= 0 ? 'up' : 'down', text: signed(diff, 2) }));
  body.append(el('div', { class: 'stats' },
    stat('내 점수', fmt(my, 2), diffSpan),
    stat('합격선', fmt(exp, 2)),
    stat(`내 ${GNAME[g]} 누백`, fmtPct(mp), el('em', { text: fin(mp) ? fmtRank(mp / 100 * pop(g)) : '' })),
    stat(`합격선 ${GNAME[g]} 누백`, fmtPct(ep), el('em', { text: fin(ep) ? fmtRank(ep / 100 * pop(g)) : '' }))));

  // 점수 계산
  const calc = el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '점수 계산' }), el('span', { text: bd ? ruleText(bd.rules) : '' })));
  calc.append(bd ? calcView(bd) : el('div', { class: 'round-empty', text: '계산하고 있습니다.' }));
  body.append(calc);

  // 점수 바꿔보기
  body.append(tweakView());

  // 기준선
  const yr = d.quota_years.current;
  const lines = el('table', { class: 'mini-table' },
    el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: '점수' }), el('th', { text: GNAME[g] + ' 누백' }), el('th', { text: '등수' }))),
    el('tbody', {}, ...[['적정', 0], ['예상', 1], ['소신', 2]].map(([label, i]) => {
      const p = u.tp[g] ? u.tp[g][i] : null;
      return el('tr', { class: i === 1 ? 'is-now' : '' }, el('td', { text: label }), el('td', { text: fmt(u.th[i], 2) }), el('td', { text: fmtPct(p) }), el('td', { text: fin(p) ? fmtRank(p / 100 * pop(g)) : '—' }));
    })));
  body.append(el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '합격선' }), el('span', { text: `${yr}학년도 ${edName()}` })), lines));

  // 입결
  const hp = state.common.history_populations;
  const histRows = [];
  (d.history_years || []).forEach((exam, i) => {
    const v = u.h[g] ? u.h[g][i] : null;
    if (!fin(v)) return;
    const year = 2000 + Math.floor(exam / 100) + 1;
    const popY = hp[String(exam)] ? (g === 'A' ? hp[String(exam)].S + hp[String(exam)].H : hp[String(exam)][g]) : null;
    histRows.push(el('tr', {}, el('td', { text: year + '학년도' }), el('td', { text: fmtPct(v) }), el('td', { text: fin(popY) ? fmtRank(v / 100 * popY) : '—' })));
  });
  if (histRows.length) {
    body.append(el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '입결' })),
      el('table', { class: 'mini-table' }, el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: GNAME[g] + ' 누백' }), el('th', { text: '등수' }))),
        el('tbody', {}, el('tr', { class: 'is-now' }, el('td', { text: yr + '학년도 예상' }), el('td', { text: fmtPct(ep) }), el('td', { text: fin(ep) ? fmtRank(ep / 100 * pop(g)) : '—' })), ...histRows))));
  }

  // 모집
  if (u.q) {
    const cell = (v) => el('td', { class: fin(v) ? '' : 'none', text: fin(v) ? fmt(v) : '—' });
    body.append(el('section', { class: 'sec' }, el('h3', { text: '모집 인원' }),
      el('table', { class: 'mini-table' },
        el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: '모집' }), el('th', { text: '이월' }), el('th', { text: '추가합격' }))),
        el('tbody', {},
          el('tr', {}, el('td', { text: yr + '학년도' }), cell(u.q.c), cell(null), cell(null)),
          el('tr', {}, el('td', { text: (yr - 1) + '학년도' }), cell(u.q.pc), cell(u.q.pco), cell(u.q.pw))))));
  }
}

function areaCount(spec) { return (spec.replace(/탐\((\d)\)/g, (_, n) => '탐'.repeat(Number(n))).match(/[국수영탐한외]/g) || []).length; }
const areaSpec = (spec) => spec;
function choiceText(part, weighted) {
  const m = part.match(/^(.*)中(가중)?택(\d)$/);
  if (!m) return areaSpec(part);
  const k = Number(m[3]);
  if (weighted) return areaCount(m[1]) === k ? `${areaSpec(m[1])} 성적순 가중` : `${areaSpec(m[1])} 중 상위 ${k}개 가중`;
  return `${areaSpec(m[1])} 중 상위 ${k}개`;
}
function optRuleText(rules) {
  const parts = [];
  for (const [key, weighted] of [['선택', false], ['가중택', true]]) if (rules[key]) for (const p of rules[key].split('+')) parts.push(choiceText(p, weighted));
  return parts.join(' + ');
}
function ruleText(rules) {
  const parts = [];
  if (rules['필수']) parts.push(areaSpec(rules['필수']));
  const opt = optRuleText(rules);
  if (opt) parts.push(opt);
  return parts.join(' + ');
}
function calcView(bd) {
  const wrap = el('div', { class: 'calc' });
  const req = bd.rules['필수'] || '';
  const optText = (bd.rules['선택'] || '') + (bd.rules['가중택'] || '');
  const areaLetters = [['국어', '국'], ['수학', '수'], ['영어', '영'], ['탐구', '탐'], ['한국사', '한'], ['제2외국어', '외']];
  const rows = [];
  for (const [name, letter] of areaLetters) {
    const inReq = name === '한국사' ? !optText.includes('한') && !(bd.rules['한국사대체'] || '') : req.includes(letter);
    const inOpt = optText.includes(letter);
    const v = bd.areas[name]; const top = bd.top.areas[name];
    if (!fin(v) || (!inReq && !inOpt) || (Math.abs(v) < 1e-9 && Math.abs(top || 0) < 1e-9)) continue;
    rows.push({ name, v, top, part: inReq ? '필수' : '선택' });
  }
  const comps = bd.components;
  const segs = [];
  let i = 0;
  const reqRows = rows.filter((r) => r.part === '필수');
  for (const r of reqRows) segs.push({ label: r.name, v: r.v, color: CALC_SHADES[i++ % CALC_SHADES.length] });
  const optValue = (comps['선택'] || 0) + (comps['가중택'] || 0);
  if (Math.abs(optValue) > 1e-9) segs.push({ label: '선택 반영', v: optValue, color: CALC_SHADES[i++ % CALC_SHADES.length] });
  const extras = [['기본점수', comps['기본'] || 0], ['가감점', comps['가감'] || 0], ['내신', bd.extra || 0]].filter(([, v]) => Math.abs(v) > 1e-9);
  for (const [label, v] of extras) segs.push({ label, v, color: CALC_SHADES[5] });
  const total = bd.total ?? bd.csat;
  const stack = el('div', { class: 'calc-stack' });
  const pos = segs.filter((s) => s.v > 0);
  const sum = pos.reduce((a, s) => a + s.v, 0) || 1;
  for (const s of pos) stack.append(el('span', { style: `width:${(100 * s.v / sum).toFixed(2)}%;background:${s.color}`, title: s.label }));
  wrap.append(stack);
  const line = (label, v, top, color, off = false) => el('div', { class: 'calc-row' + (off ? ' is-off' : '') },
    el('span', { class: 'calc-name' }, el('i', { style: `background:${color || 'transparent'}` }), label),
    el('span', { class: 'calc-bar' }, el('span', { style: `width:${fin(top) && top > 0 ? Math.min(100, 100 * v / top).toFixed(1) : 0}%` })),
    el('b', {}, fmt(v, 2), el('small', { text: fin(top) ? '/ ' + fmt(top, 1) : '' })));
  let k = 0;
  for (const r of reqRows) wrap.append(line(r.name, r.v, r.top, CALC_SHADES[k++ % CALC_SHADES.length]));
  const optRows = rows.filter((r) => r.part === '선택');
  if (optRows.length) {
    wrap.append(el('div', { class: 'calc-group', text: optRuleText(bd.rules) }));
    for (const r of optRows) wrap.append(line(r.name, r.v, r.top, null));
    if (Math.abs(optValue) > 1e-9) wrap.append(line('선택 반영', optValue, (bd.top.components['선택'] || 0) + (bd.top.components['가중택'] || 0), CALC_SHADES[k % CALC_SHADES.length]));
  }
  for (const [label, v] of extras) wrap.append(line(label, v, null, CALC_SHADES[5]));
  wrap.append(el('div', { class: 'calc-total' }, el('span', { text: '합계' }), el('b', { text: fmt(total, 2) })));
  return wrap;
}

function tweakView() {
  const det = state.detail;
  const u = det.unit;
  const rec = state.record;
  const sec = el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '점수 조정' }),
    el('button', { class: 'tw-button is-ghost is-sm', type: 'button', text: '되돌리기', onclick: () => { det.tweak = {}; det.tweakResult = null; renderDetail(); } })));
  const box = el('div', { class: 'tweak' });
  const { math, inq } = recordParts(rec);
  const subjects = [['국어', '국어'], [math, MATH.find((m) => m[0] === math)?.[1] || '수학'], ...inq.map((s) => [s, s]), ['영어', '영어'], ['한국사', '한국사']];
  for (const [subject, label] of subjects) {
    const base = rec[subject];
    const cur = det.tweak[subject] ?? base;
    const grade = isGradeSubject(subject);
    const val = el('b', { class: cur !== base ? 'changed' : '', text: grade ? cur + '등급' : String(cur) });
    const steps = grade ? [[-1, '−1'], [1, '+1']] : [[-3, '−3'], [-1, '−1'], [1, '+1'], [3, '+3']];
    const stepper = el('span', { class: 'stepper' }, ...steps.map(([delta, text]) => el('button', { type: 'button', text: grade ? (delta < 0 ? '올리기' : '내리기') : text, onclick: () => stepScore(subject, grade ? delta : delta) })));
    box.append(el('div', { class: 'tweak-row' }, el('span', {}, label, val), stepper));
  }
  sec.append(box);
  if (Object.keys(det.tweak).some((s) => det.tweak[s] !== rec[s])) {
    const res = el('div', { class: 'tweak-result' });
    const r = det.tweakResult;
    if (!r) res.append(el('span', { class: 'tweak-cap', text: '계산하고 있습니다.' }));
    else {
      const before = gaugeOf(u);
      const after = lineIndex(r.total, u.th);
      const tb = tierOf(before); const ta = tierOf(after);
      res.append(el('div', { class: 'tweak-cap' }, el('span', { text: '현재 ' + tb.label }), el('span', { text: '조정 후 ' + ta.label + '  ' + signed(r.total - (state.rows.get(u.i)?.score ?? r.total), 2) + '점' })));
      res.append(gauge(after, { ghost: before }));
    }
    sec.append(res);
  }
  return sec;
}
function stepScore(subject, delta) {
  const det = state.detail;
  const d = data();
  const rec = state.record;
  const cur = det.tweak[subject] ?? rec[subject];
  let next;
  if (isGradeSubject(subject)) next = Math.min(9, Math.max(1, cur + delta));
  else {
    const list = d.scoreList[subject] || [];
    const target = cur + delta;
    next = list.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), cur);
    if (next === cur && delta !== 0) {
      const beyond = list.filter((s) => (delta > 0 ? s > cur : s < cur));
      if (beyond.length) next = delta > 0 ? Math.min(...beyond) : Math.max(...beyond);
    }
  }
  det.tweak[subject] = next;
  det.tweakResult = null;
  renderDetail();
  const record = { ...rec, ...det.tweak };
  const unit = det.unit;
  breakdown(record, unit.k).then((bd) => { if (state.detail === det && JSON.stringify({ ...rec, ...det.tweak }) === JSON.stringify(record)) { det.tweakResult = bd; renderDetail(); } })
    .catch((err) => toast(err.message));
}

/* ───────── Input sheet ───────── */

const draft = { mode: 'std', record: null, korean: '국어(화작)', raw: {}, randomGroup: 'H' };

function openInput(mode = null) {
  const d = data();
  draft.record = state.record ? { ...state.record } : defaultRecord('H');
  draft.korean = state.korean;
  draft.mode = mode || (draft.mode === 'raw' && state.edition !== 'september_20260903' ? 'std' : draft.mode === 'random' ? 'std' : draft.mode);
  draft.raw = {};
  void d;
  renderInput();
  showSheet('sheet-input');
}
function defaultRecord(group) {
  return group === 'S'
    ? { 국어: 125, '수학(미적)': 128, '생명과학 Ⅰ': 63, '지구과학 Ⅰ': 63, 영어: 2, 한국사: 2 }
    : { 국어: 125, '수학(확통)': 128, '생활과 윤리': 63, '사회·문화': 63, 영어: 2, 한국사: 2 };
}
function snapScore(subject, v) {
  const list = data().scoreList[subject] || [];
  if (!list.length || !fin(v)) return v;
  return list.reduce((best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best), list[0]);
}
function renderInput() {
  const d = data();
  const rawOk = !!state.common.raw[state.edition];
  for (const b of $('input-mode').children) {
    b.classList.toggle('is-active', b.dataset.mode === draft.mode);
    if (b.dataset.mode === 'raw') b.hidden = !rawOk;
  }
  $('input-random').hidden = draft.mode !== 'random';
  for (const b of $('random-group').children) b.classList.toggle('is-active', b.dataset.group === draft.randomGroup);
  updateRandomLabel();
  const form = $('input-form');
  form.replaceChildren();
  const rec = draft.record;
  const { math, inq } = recordParts(rec);
  const raw = draft.mode === 'raw';

  const subjectBlock = (title, subject, extraControl) => {
    const block = el('div', { class: 'subject' });
    const out = el('output', { text: infoText(subject, rec[subject]) });
    block.append(el('div', { class: 'subject-head' }, el('h3', { text: title }), out));
    if (extraControl) block.append(extraControl);
    const inputs = el('div', { class: 'subject-inputs' });
    if (isGradeSubject(subject)) {
      inputs.append(gradeChips(subject, rec[subject], (grade) => { rec[subject] = grade; renderInput(); }));
    } else if (raw) {
      inputs.append(...rawInputs(subject, (ss) => { if (fin(ss)) rec[subject] = ss; out.textContent = infoText(subject, rec[subject]); }));
    } else {
      const input = el('input', { class: 'tw-input', type: 'number', inputmode: 'numeric', value: rec[subject] ?? '', 'aria-label': title + ' 표준점수' });
      input.addEventListener('change', () => { const v = snapScore(subject, Number(input.value)); rec[subject] = v; input.value = v; out.textContent = infoText(subject, v); gradeBox.replaceWith(gradeBox = gradeFill(subject)); });
      let gradeBox = gradeFill(subject);
      inputs.append(el('label', {}, '표준점수', input), el('span', { class: 'chips-label', text: '등급' }), gradeBox);
    }
    block.append(inputs);
    return block;
  };
  const gradeFill = (subject) => gradeChips(subject, gradeOf(subject, rec[subject]), (grade) => {
    const v = d.grade_fill[subject] && d.grade_fill[subject][String(grade)] && d.grade_fill[subject][String(grade)]['중'];
    if (fin(v)) { rec[subject] = v; renderInput(); }
  });

  const korean = el('div', { class: 'tw-segmented' }, ...KOREAN.map(([k, label]) => el('button', { type: 'button', class: draft.korean === k ? 'is-active' : '', text: label, onclick: () => { draft.korean = k; renderInput(); } })));
  form.append(subjectBlock('국어', '국어', korean));
  const mathSeg = el('div', { class: 'tw-segmented' }, ...MATH.map(([k, label]) => el('button', { type: 'button', class: math === k ? 'is-active' : '', text: label, onclick: () => {
    if (k === math) return;
    const v = rec[math]; delete rec[math]; rec[k] = snapScore(k, v); renderInput();
  } })));
  form.append(subjectBlock('수학', math, mathSeg));
  form.append(subjectBlock('영어', '영어'));
  inq.forEach((s, idx) => {
    const sel = el('select', { class: 'tw-select is-sm', 'aria-label': '탐구 ' + (idx + 1) });
    for (const [group, list] of [['사회탐구', SOCIAL], ['과학탐구', SCIENCE]]) {
      const og = el('optgroup', { label: group });
      for (const name of list) og.append(el('option', { value: name, text: name, selected: name === s ? true : null, disabled: inq.includes(name) && name !== s ? true : null }));
      sel.append(og);
    }
    sel.addEventListener('change', () => {
      const v = rec[s]; delete rec[s];
      const keys = Object.keys(rec);
      const ordered = {};
      for (const k of keys) ordered[k] = rec[k];
      ordered[sel.value] = snapScore(sel.value, v);
      draft.record = ordered; renderInput();
    });
    form.append(subjectBlock('탐구 ' + (idx + 1), s, sel));
  });
  form.append(subjectBlock('한국사', '한국사'));

  const region = $('input-region');
  region.replaceChildren(el('option', { value: '', text: '해당 없음' }), ...state.common.regions.map((r) => el('option', { value: r, text: r, selected: state.settings.region === r ? true : null })));
  $('input-status').textContent = GNAME[streamOf(rec)];
}
function infoText(subject, v) {
  if (!fin(v)) return '';
  if (isGradeSubject(subject)) return v + '등급';
  const p = pctOf(subject, v); const gr = gradeOf(subject, v);
  return `표준점수 ${v}  백분위 ${p ?? '—'}  ${gr ?? '—'}등급`;
}
function gradeChips(subject, active, onPick) {
  const box = el('div', { class: 'grade-chips', role: 'group', 'aria-label': subject + ' 등급' });
  for (let gr = 1; gr <= 9; gr++) box.append(el('button', { type: 'button', class: gr === active ? 'is-active' : '', text: gr, 'aria-label': gr + '등급', onclick: () => onPick(gr) }));
  return box;
}
function rawInputs(subject, onChange) {
  const table = state.common.raw[state.edition] || {};
  const make = (label, key, max) => {
    const input = el('input', { class: 'tw-input', type: 'number', min: 0, max, value: draft.raw[key] ?? '', 'aria-label': label });
    input.addEventListener('input', () => { draft.raw[key] = input.value; onChange(compute()); });
    return el('label', {}, label, input);
  };
  const compute = () => {
    if (subject === '국어') { const t = table[draft.korean]; const c = draft.raw['k1']; const s = draft.raw['k2']; return t && c !== '' && s !== '' ? t[`${Number(c)}:${Number(s)}`] : null; }
    if (subject.startsWith('수학(')) { const t = table[subject]; const c = draft.raw['m1']; const s = draft.raw['m2']; return t && c !== '' && s !== '' ? t[`${Number(c)}:${Number(s)}`] : null; }
    const t = table[subject]; const r = draft.raw['t:' + subject]; return t && r !== '' ? t[String(Number(r))] : null;
  };
  if (subject === '국어') return [make('공통과목', 'k1', 76), make('선택과목', 'k2', 24)];
  if (subject.startsWith('수학(')) return [make('공통과목', 'm1', 74), make('선택과목', 'm2', 26)];
  return [make('원점수', 't:' + subject, 50)];
}

const RANDOM_MIN = Math.log10(0.05);
const RANDOM_MAX = Math.log10(30);
function randomTarget() { return 10 ** (RANDOM_MIN + (RANDOM_MAX - RANDOM_MIN) * Number($('random-target').value) / 1000); }
function updateRandomLabel() { $('random-target-value').textContent = fmtPct(randomTarget()); }
function makeRandom() {
  const d = data();
  const pool = d.random[draft.randomGroup] || [];
  const target = Math.log10(randomTarget());
  const near = pool.filter(([p]) => Math.abs(Math.log10(Math.max(p, 0.001)) - target) < 0.06);
  const choice = near.length ? near[Math.floor(Math.random() * near.length)] : pool.reduce((best, x) => (Math.abs(Math.log10(Math.max(x[0], 0.001)) - target) < Math.abs(Math.log10(Math.max(best[0], 0.001)) - target) ? x : best), pool[0]);
  if (!choice) return;
  const rec = {};
  const src = choice[1];
  const order = ['국어', ...Object.keys(src).filter((k) => k.startsWith('수학(')), '영어', ...Object.keys(src).filter((k) => SOCIAL.includes(k) || SCIENCE.includes(k)), '한국사'];
  for (const k of order) if (src[k] !== undefined) rec[k] = src[k];
  draft.record = rec;
  draft.korean = Math.random() < 0.4 ? '국어(언매)' : '국어(화작)';
  draft.mode = 'random';
  renderInput();
  $('input-status').textContent = GNAME[streamOf(rec)] + ' 상위 ' + fmtPct(choice[0]);
}

async function applyInput() {
  const rec = draft.record;
  const { math, inq } = recordParts(rec);
  if (!math || inq.length !== 2) { toast('수학 선택과목과 탐구 두 과목을 골라 주세요.'); return; }
  for (const [k, v] of Object.entries(rec)) if (!fin(v)) { toast(subjectName(k) + ' 점수를 입력해 주세요.'); return; }
  if (draft.mode === 'raw') {
    const r = draft.raw; const num = (k) => (r[k] !== undefined && r[k] !== '' ? Number(r[k]) : null);
    const pair = (a, b) => (fin(num(a)) && fin(num(b)) ? num(a) + num(b) : null);
    state.raw = { 국어: pair('k1', 'k2'), [math]: pair('m1', 'm2') };
    for (const t of inq) state.raw[t] = num('t:' + t);
  } else if (JSON.stringify(rec) !== JSON.stringify(state.record)) state.raw = null;
  state.record = { ...rec };
  state.korean = draft.korean;
  state.settings.region = $('input-region').value;
  state.group = null;
  persist();
  hideSheets();
  await refresh();
}

/* ───────── Start ───────── */

const QUICK_DEFAULTS = {
  H: { korean: '국어(화작)', math: '수학(확통)', inq: ['생활과 윤리', '사회·문화'] },
  S: { korean: '국어(언매)', math: '수학(미적)', inq: ['생명과학 Ⅰ', '지구과학 Ⅰ'] },
};
const quick = { group: 'H', korean: null, math: null, inq: null, values: {} };
function quickReset(group) {
  const d = QUICK_DEFAULTS[group];
  quick.group = group;
  quick.korean = d.korean;
  quick.math = d.math;
  quick.inq = [...d.inq];
}
function renderQuick() {
  if (!quick.korean) quickReset('H');
  for (const b of $('quick-group').children) b.classList.toggle('is-active', b.dataset.group === quick.group);
  const box = $('quick-fields');
  box.replaceChildren();
  const pick = (options, value, onChange, label) => {
    const sel = el('select', { class: 'cf-pick', 'aria-label': label });
    for (const [v, t, disabled] of options) sel.append(el('option', { value: v, text: t, selected: v === value ? true : null, disabled: disabled ? true : null }));
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  };
  const numberCell = (key, head) => {
    const input = el('input', { class: 'cf-value', type: 'number', inputmode: 'numeric', placeholder: '—', value: quick.values[key] ?? '', 'aria-label': key + ' 표준점수' });
    input.addEventListener('input', () => { quick.values[key] = input.value; });
    return el('label', { class: 'cf' }, head, input);
  };
  const gradeCell = (key) => {
    const sel = el('select', { class: 'cf-value cf-grade', 'aria-label': key + ' 등급' });
    sel.append(el('option', { value: '', text: '—' }));
    for (let g = 1; g <= 9; g++) sel.append(el('option', { value: g, text: g + '등급', selected: String(quick.values[key]) === String(g) ? true : null }));
    sel.addEventListener('change', () => { quick.values[key] = sel.value; });
    return el('label', { class: 'cf' }, el('span', { class: 'cf-name', text: key }), sel);
  };
  const inqOptions = (idx) => [...SOCIAL, ...SCIENCE].map((n) => [n, n, quick.inq.includes(n) && quick.inq[idx] !== n]);
  box.append(
    numberCell('국어', pick(KOREAN.map(([k, t]) => [k, t]), quick.korean, (v) => { quick.korean = v; }, '국어 선택과목')),
    numberCell('수학', pick(MATH.map(([k, t]) => [k, t]), quick.math, (v) => { quick.math = v; }, '수학 선택과목')),
    gradeCell('영어'),
    numberCell('탐구1', pick(inqOptions(0), quick.inq[0], (v) => { quick.inq[0] = v; renderQuick(); }, '탐구 1')),
    numberCell('탐구2', pick(inqOptions(1), quick.inq[1], (v) => { quick.inq[1] = v; renderQuick(); }, '탐구 2')),
    gradeCell('한국사'),
  );
  $('start-raw').hidden = !state.common.raw[state.edition];
}
async function submitQuick(ev) {
  ev.preventDefault();
  const v = quick.values;
  const rec = {};
  const std = (subject, key) => {
    const n = Number(v[key]);
    if (v[key] === undefined || v[key] === '' || !fin(n)) return null;
    return snapScore(subject, n);
  };
  const grade = (key) => { const n = Number(v[key]); return n >= 1 && n <= 9 ? n : null; };
  rec['국어'] = std('국어', '국어');
  rec[quick.math] = std(quick.math, '수학');
  rec['영어'] = grade('영어');
  rec[quick.inq[0]] = std(quick.inq[0], '탐구1');
  rec[quick.inq[1]] = std(quick.inq[1], '탐구2');
  rec['한국사'] = grade('한국사');
  const missing = Object.entries(rec).find(([, x]) => !fin(x));
  if (missing) { toast(subjectName(missing[0]) + ' 점수를 입력해 주세요.'); return; }
  await startWith(rec, quick.korean);
}
async function startWith(rec, korean) {
  state.record = rec;
  state.korean = korean;
  state.raw = null;
  state.group = null;
  state.result = null;
  persist();
  await refresh();
}
function fillExample(group) {
  const pool = data().random[group] || [];
  if (!pool.length) return;
  const target = Math.log10(0.3) + Math.random() * (Math.log10(15) - Math.log10(0.3));
  const near = pool.filter(([p]) => Math.abs(Math.log10(Math.max(p, 0.001)) - target) < 0.06);
  const choice = near.length ? near[Math.floor(Math.random() * near.length)] : pool[Math.floor(Math.random() * pool.length)];
  quickFrom(choice[1], Math.random() < 0.4 ? '국어(언매)' : '국어(화작)');
  renderQuick();
}
function quickFrom(rec, korean) {
  const keys = Object.keys(rec);
  const math = keys.find((k) => k.startsWith('수학('));
  const inq = keys.filter((k) => SOCIAL.includes(k) || SCIENCE.includes(k));
  if (!math || inq.length !== 2) return;
  quick.korean = korean || quick.korean || '국어(화작)';
  quick.math = math;
  quick.inq = inq;
  quick.values = { 국어: rec['국어'], 수학: rec[math], 영어: rec['영어'], 탐구1: rec[inq[0]], 탐구2: rec[inq[1]], 한국사: rec['한국사'] };
}
function resetToStart() {
  if (state.record) {
    quick.group = streamOf(state.record);
    quickFrom(state.record, state.korean);
  }
  state.record = null;
  state.result = null;
  state.raw = null;
  state.group = null;
  persist();
  hideSheets();
  renderAll();
  window.scrollTo({ top: 0 });
}
function setProgress(text, ratio) {
  if (text) { $('loading-text').textContent = text; if (!state.record) $('quick-status').textContent = text; }
  if (fin(ratio)) { $('loading-fill').parentElement.classList.add('is-det'); $('loading-fill').style.width = Math.round(100 * Math.min(1, ratio)) + '%'; }
}
window.addEventListener('calc-progress', (ev) => {
  const { text, ratio, done } = ev.detail || {};
  if (done) { $('quick-status').textContent = '표준점수'; setProgress(null, 1); return; }
  setProgress(text, ratio);
});

/* ───────── Settings ───────── */

function openSettings() {
  const body = $('settings-body');
  body.replaceChildren();
  const ed = el('div', { class: 'tw-segmented' }, ...Object.entries(EDITIONS).map(([k, label]) => el('button', { type: 'button', class: k === state.edition ? 'is-active' : '', text: label, onclick: async () => {
    if (k === state.edition) return;
    state.edition = k; persist(); await ensureEdition(k);
    if (state.record) { for (const [s, v] of Object.entries(state.record)) if (!isGradeSubject(s)) state.record[s] = snapScore(s, v); }
    openSettings(); await refresh();
  } })));
  body.append(el('section', { class: 'sec' }, el('h3', { text: '기준 시험' }), ed));
  const cross = el('input', { type: 'checkbox', class: 'tw-check', checked: state.settings.cross ? true : null });
  cross.addEventListener('change', () => { state.settings.cross = cross.checked; persist(); renderAll(); });
  body.append(el('section', { class: 'sec' }, el('h3', { text: '지원 범위' }), el('div', { class: 'set-list' }, el('label', { class: 'set-row' }, '교차지원', cross))));
  const grid = el('div', { class: 'set-grid' });
  for (const m of state.common.metro || []) {
    const c = el('input', { type: 'checkbox', class: 'tw-check', checked: state.settings.metro[m.key] !== false ? true : null });
    c.addEventListener('change', () => { state.settings.metro[m.key] = c.checked; persist(); renderAll(); });
    grid.append(el('label', {}, c, m.university.replace(/\(.+?\)/, '') + (m.label.includes(' ') ? ' ' + m.label.split(' ').slice(1).join(' ') : '')));
  }
  body.append(el('section', { class: 'sec' }, el('h3', { text: '수도권 대학' }), grid));
  showSheet('sheet-settings');
}

/* ───────── Sheets / views ───────── */

function showSheet(id) {
  for (const s of document.querySelectorAll('.sheet')) s.hidden = s.id !== id;
  $('scrim').hidden = false;
  document.body.style.overflow = 'hidden';
}
function hideSheets() {
  for (const s of document.querySelectorAll('.sheet')) s.hidden = true;
  $('scrim').hidden = true;
  document.body.style.overflow = '';
  if (state.detail) { state.detail = null; if (state.view === 'list') renderList(); }
}
function setView(v) {
  state.view = v;
  for (const b of document.querySelectorAll('[data-view]')) b.classList.toggle('is-active', b.dataset.view === v);
  renderAll();
  window.scrollTo({ top: 0 });
}

function renderAll() {
  const has = !!(state.record && state.result);
  const loading = !!state.record && !state.result && !!state.busy;
  const start = !state.record || (!state.result && !state.busy);
  document.body.dataset.state = has ? 'app' : loading ? 'loading' : 'start';
  $('empty').hidden = !start;
  $('loading').hidden = !loading;
  if (start) renderQuick();
  $('edition-badge').textContent = edName();
  renderStrip();
  for (const v of ['overview', 'find', 'list']) $('view-' + v).hidden = !has || state.view !== v;
  if (!has) return;
  if (state.view === 'overview') { renderReport(); renderConv(); renderPosition(); renderRecCategory(); renderRecs(); }
  if (state.view === 'find') { renderFindCategory(); renderFind(); }
  if (state.view === 'list') renderList();
}
async function refresh() { await evaluate(); renderAll(); }

/* ───────── Boot ───────── */

async function boot() {
  if (document.body.dataset.offline === 'true') { $('offline').hidden = false; return; }
  try {
    state.common = await fetchJSON('/data/ux7_common.json');
    await ensureEdition(state.edition);
  } catch (err) {
    $('offline').hidden = false;
    return;
  }
  if (state.record) {
    const d = data();
    for (const [s, v] of Object.entries(state.record)) if (!isGradeSubject(s) && d.scoreList[s] && !d.scoreList[s].includes(v)) state.record[s] = snapScore(s, v);
  }
  bind();
  await refresh();
}

function bind() {
  for (const b of document.querySelectorAll('[data-view]')) b.addEventListener('click', () => setView(b.dataset.view));
  $('score-strip').addEventListener('click', () => openInput());
  $('edit-score').addEventListener('click', () => openInput());
  $('quick').addEventListener('submit', submitQuick);
  for (const b of $('quick-group').children) b.addEventListener('click', () => { if (quick.group !== b.dataset.group) { quickReset(b.dataset.group); renderQuick(); } });
  $('quick-dice').addEventListener('click', () => fillExample(quick.group));
  $('input-reset').addEventListener('click', resetToStart);
  $('start-raw').addEventListener('click', () => openInput('raw'));
  $('open-settings').addEventListener('click', openSettings);
  $('scrim').addEventListener('click', hideSheets);
  for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', hideSheets);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideSheets(); });
  for (const b of $('group-switch').children) b.addEventListener('click', () => { state.group = b.dataset.group; persist(); renderAll(); });
  for (const b of $('conv-tab').children) b.addEventListener('click', () => { state.convTab = b.dataset.tab; persist(); renderConv(); });
  for (const b of $('basis-switch').children) b.addEventListener('click', () => { state.basis = b.dataset.basis; persist(); renderPosition(); });
  for (const b of $('input-mode').children) b.addEventListener('click', () => { draft.mode = b.dataset.mode; renderInput(); });
  for (const b of $('random-group').children) b.addEventListener('click', () => { draft.randomGroup = b.dataset.group; renderInput(); });
  $('random-target').addEventListener('input', updateRandomLabel);
  $('random-make').addEventListener('click', makeRandom);
  $('input-apply').addEventListener('click', applyInput);
  let timer;
  $('find-query').addEventListener('input', (ev) => { clearTimeout(timer); timer = setTimeout(() => { state.query = ev.target.value.trim(); renderFind(); }, 120); });
  for (const b of $('find-round').children) b.addEventListener('click', () => { state.findRound = b.dataset.round; renderFindCategory(); renderFind(); });
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (state.view === 'overview' && state.result) renderPosition(); }, 150); });
}

document.addEventListener('DOMContentLoaded', boot);
