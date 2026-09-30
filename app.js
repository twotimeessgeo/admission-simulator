'use strict';
/* twotimess calculator — UX7 (단일 파일). 계산은 서버 /api/evaluate·/api/breakdown, 표시 데이터는 /data/ux7_*.json. */

const $ = (id) => document.getElementById(id);
const EDITIONS = { 'public_september_20260929': '9월 모의평가' };
const EXAM_NAMES = { 'public_september_20260929': '2027학년도 9월 모의평가' };
const MED_NAMES = { 의: '의예', 치: '치의예', 한: '한의예', 약: '약학', 수: '수의예' };
const CONV_CATS = { med: '의치한약수', S: '과학기술', H: '인문사회' };
const SOCIAL = ['생활과 윤리', '사회·문화', '윤리와 사상', '한국지리', '세계지리', '동아시아사', '세계사', '정치와 법', '경제'];
const SCIENCE = ['생명과학 Ⅰ', '지구과학 Ⅰ', '물리학 Ⅰ', '화학 Ⅰ', '생명과학 Ⅱ', '지구과학 Ⅱ', '물리학 Ⅱ', '화학 Ⅱ'];
const MATH = [['수학(확통)', '확률과 통계'], ['수학(미적)', '미적분'], ['수학(기하)', '기하']];
const KOREAN = [['국어(화작)', '화법과 작문'], ['국어(언매)', '언어와 매체']];
const SECOND = ['독일어 Ⅰ', '프랑스어 Ⅰ', '스페인어 Ⅰ', '중국어 Ⅰ', '일본어 Ⅰ', '러시아어 Ⅰ', '아랍어 Ⅰ', '베트남어 Ⅰ', '한문 Ⅰ'];
const SHORT = {
  '생활과 윤리': '생윤', '윤리와 사상': '윤사', '한국지리': '한지', '세계지리': '세지', '동아시아사': '동사', '세계사': '세계사',
  '정치와 법': '정법', '사회·문화': '사문', '경제': '경제', '물리학 Ⅰ': '물리1', '화학 Ⅰ': '화학1', '생명과학 Ⅰ': '생명1',
  '지구과학 Ⅰ': '지구1', '물리학 Ⅱ': '물리2', '화학 Ⅱ': '화학2', '생명과학 Ⅱ': '생명2', '지구과학 Ⅱ': '지구2',
  '수학(확통)': '확통', '수학(미적)': '미적', '수학(기하)': '기하',
};
// 학과 분야: 데이터의 큰 분류(u.c)는 그대로 두고, 학과명으로 한 단계 더 나눈다. 계열 판정·노출 규칙은 u.c를 쓴다.
const FIELDS = ['인문', '사회', '상경', '교육', '자연', '공학', '보건', '의치한약수', '자유전공', '예체능'];
const FIELD_GROUP = { 인문: 'H', 사회: 'H', 상경: 'H', 자연: 'S', 공학: 'S', 보건: 'S', 의치한약수: 'S', 예체능: 'H' };
const FIELD_RE = {
  free: /자율(?!주행)|자유|무전공|광역|리버럴|창의융합학부|미래융합/,
  edu: /교육|사범/,
  health: /간호|건강|물리치료|작업치료|임상병리|방사선|치위생|치기공|안경|응급|언어치료|언어청각|청각|재활|보건|의료(?!.*공학)|요양|병원|한약/,
  biz: /경영|경제|경상|(?<!사)회계|세무|무역|통상|금융|보험|재무|상경|유통|물류|관광|호텔|외식|조리|제과|비즈니스|Business|마케팅|부동산|창업|벤처|중소기업|컨벤션|호스피탈리티|Hospitality|투어리즘|항공서비스|MICE|커머스/,
  soc: /정치|외교|행정|법|경찰|사회|미디어|언론|신문|방송|광고|홍보|커뮤니케이션|심리|복지|아동|청소년|가족|소비자|문헌|도시|지리|국제|공공|안보|국방|군사|상담|비서|보육|의류|주거|가정|콘텐츠|게임|영상|영화|안전|교정|보호|지식융합/,
  eng: /(?<!가)공학|공과|공대|조종|컴퓨터|소프트웨어|전기|전자|반도체|기계|건축|건설|토목|화공|재료|신소재|정보|통신|인공지능|AI|데이터|로봇|자동차|모빌리티|항공|조선|에너지|원자력|디스플레이|시스템|IT|ICT|보안|메카|산업|게임|스마트|드론|철도|소방|방재|디지털|공간|도시|조경|플랜트|기관|전산|사이버|클라우드|인터넷|메타버스|배터리|이차전지|미래차|기술|테크/,
  engH: /(?<!가)공학|조종|컴퓨터|소프트웨어|전기|전자|반도체|기계|인공지능|데이터|로봇|자동차|드론|철도|클라우드|인터넷|배터리|이차전지|테크/,
  sci: /식물|생명|생물|(?<!문)화학|물리|수학|통계|식품|농|원예|산림|동물|축산|해양|수산|환경|지구|천문|우주|바이오|신약|와인|푸드|자연|과학/,
  sciH: /식물|생명|생물|(?<!문)화학|물리|수학|통계|식품|원예|산림|동물|축산|수산|천문|바이오|신약|와인|푸드|과학과/,
};
const FIELD_H = [['상경', FIELD_RE.biz], ['사회', FIELD_RE.soc], ['보건', FIELD_RE.health], ['공학', FIELD_RE.engH], ['자연', FIELD_RE.sciH]];
const FIELD_S = [['보건', FIELD_RE.health], ['상경', /경영(?!.*공학)|금융|(?<!사)회계|마케팅|관광|항공서비스|서비스학과/], ['사회', /행정|경찰|사회학|군사|국방/], ['공학', FIELD_RE.eng], ['자연', FIELD_RE.sci], ['상경', FIELD_RE.biz], ['사회', FIELD_RE.soc]];
function fieldOf(u) {
  if (u._f) return u._f;
  let f = u.c === '의치한약수' || u.c === '예체능' ? u.c : u.c === '초등교육' ? '교육' : u.c === '계약학과' ? '공학' : null;
  if (!f) {
    if (FIELD_RE.free.test(u.m)) f = '자유전공';
    else if (FIELD_RE.edu.test(u.m)) f = '교육';
    else f = ((u.c === '인문사회' ? FIELD_H : FIELD_S).find(([, re]) => re.test(u.m)) || [u.c === '인문사회' ? '인문' : '자연'])[0];
  }
  return (u._f = f);
}
const FACULTY = { 의: '의과대학', 치: '치과대학', 한: '한의과대학', 약: '약학대학', 수: '수의과대학', 교: '초등교육' };
const FACULTY_MONO = { 의: '의', 치: '치', 한: '한', 약: '약', 수: '수', 교: '교대' };
const SUB_ORDER = { 의: 0, 치: 1, 한: 2, 약: 3, 수: 4 };
const RANK_LABELS = ['서울대', '연고', '서성한', '중경외시', '건동홍', '국숭세단', '광명상가'];
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

/* ───────── State ───────── */

const saved = load('sim7') || {};
const state = {
  edition: EDITIONS[saved.edition] ? saved.edition : 'public_september_20260929',
  record: saved.record || null,
  korean: saved.korean || '국어(화작)',
  group: saved.group || null,
  basis: saved.basis === 'pct' ? 'pct' : 'std',
  recCat: FIELDS.includes(saved.recCat) ? saved.recCat : '',
  findCat: FIELDS.includes(saved.findCat) ? saved.findCat : '',
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
const isGradeSubject = (s) => s === '영어' || s === '한국사' || SECOND.includes(s);
const subjectName = (s) => (s.startsWith('수학(') ? '수학' : s.startsWith('국어(') ? '국어' : s);

function tierOf(g, u = null) {
  if (!fin(g)) {
    if (state.edition !== 'public_september_20260929') return { key: 'none', label: '자료 없음' };
    const reason = u && u.th && !fin(u.th[1]) && u.cut_status ? u.cut_status : '입결 없음';
    return { key: 'none', label: reason };
  }
  if (g >= 80) return { key: 'safe', label: '안정' };
  if (g >= 50) return { key: 'fit', label: '적정' };
  if (g >= 20) return { key: 'reach', label: '소신' };
  if (g >= 10) return { key: 'up', label: '상향' };
  return { key: 'hard', label: '어려움' };
}

// backend index_value 과 같은 식 (안정·적정·소신 = 80·50·20 기준선 보간, 5–95 제한)
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
  if (fin(ghost)) box.append(el('b', { class: 'is-ghost', style: `left:${ghost}%` }));
  if (fin(g)) box.append(el('b', { 'data-tier': t.key, style: `left:${g}%` }));
  return box;
}
function fitLine(g, u = null) {
  const t = tierOf(g, u);
  return el('div', { class: 'fit' }, gauge(g), el('span', { class: 'tier', 'data-tier': t.key, text: t.label }));
}
const EXTRA_COLORS = {
  가천대학교: '#1C4E9D', 가톨릭관동대학교: '#004B87', 강원대학교: '#00477F', '강원대학교(강릉)': '#005BAC', 건양대학교: '#0054A6', 경기대학교: '#0A4C9A',
  경북대학교: '#C8102E', 경상국립대학교: '#003A70', 경성대학교: '#0A3D91', 경인교육대학교: '#005BAC', 계명대학교: '#1F3C88', 고신대학교: '#0A4E9B',
  공주교육대학교: '#00559F', 광주교육대학교: '#0067B1', 대구가톨릭대학교: '#8C1D40', 대구교육대학교: '#005BAC', 대구한의대학교: '#00704A', 대전대학교: '#0B5AA6',
  덕성여자대학교: '#7B2D8B', 동덕여자대학교: '#9E1B32', 동신대학교: '#0072BC', 동아대학교: '#00539F', 동의대학교: '#004A99', 목포대학교: '#005BAC',
  부산교육대학교: '#0067AC', 부산대학교: '#005BAA', 삼육대학교: '#0D6E3F', 상지대학교: '#0F5DA8', 서경대학교: '#0E4C92', 서울과학기술대학교: '#13335F',
  서울교육대학교: '#0C4DA2', 서울여자대학교: '#7A1F3D', 성신여자대학교: '#1A6E5B', 세명대학교: '#004F9F', 숙명여자대학교: '#0D3A8A', 순천대학교: '#00579F',
  순천향대학교: '#0C4DA2', 영남대학교: '#003F7D', 우석대학교: '#004E9A', 울산대학교: '#1E5AA8', 원광대학교: '#1B5E3B', 을지대학교: '#1A5DAB',
  이화여자대학교: '#00462A', 인제대학교: '#004A98', 인천대학교: '#0066B3', 전남대학교: '#007A3D', 전북대학교: '#1C4E9D', 전주교육대학교: '#0067B1',
  제주대학교: '#0071BC', 조선대학교: '#0B6E4F', 진주교육대학교: '#0067B1', 차의과학대학교: '#00588E', 청주교육대학교: '#0067B1', 추계예술대학교: '#8A1C2B',
  춘천교육대학교: '#0067B1', 충남대학교: '#0C4E9B', 충북대학교: '#A6192E', 한국공학대학교: '#0055A5', 한국교원대학교: '#005BAC', 한국체육대학교: '#C8102E',
  한국항공대학교: '#0C2F6B', 한림대학교: '#00704A', 한성대학교: '#0D3E8A',
};
const FALLBACK_COLORS = ['#1F4E8C', '#8C2A3C', '#1D6B55', '#5B3E8C', '#0E5E7A', '#7A4B16'];
function uniColor(university) {
  const colors = state.common.colors;
  const base = university.replace(/\(.+?\)/, '');
  if (colors[university]) return colors[university];
  if (EXTRA_COLORS[university]) return EXTRA_COLORS[university];
  if (colors[base]) return colors[base];
  if (EXTRA_COLORS[base]) return EXTRA_COLORS[base];
  let h = 0;
  for (const ch of university) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}
function mono(university, faculty = null) {
  const d = data();
  if (faculty) return el('span', { class: 'mono is-faculty', text: FACULTY_MONO[faculty] });
  const info = d.universities[university] || { mo: university.slice(0, 2) };
  const color = uniColor(university);
  return el('span', { class: 'mono', style: `--mono:${color}`, text: info.mo });
}
function shortUni(u) { return u.replace(/\((.+?)\)/, ' $1'); }
function favButton(u) {
  const key = unitKey(u);
  const b = el('button', { class: 'fav', type: 'button', 'aria-label': '담기', 'aria-pressed': state.favorites.has(key) ? 'true' : 'false', html: HEART });
  b.addEventListener('click', (ev) => { ev.stopPropagation(); toggleFav(u); b.setAttribute('aria-pressed', state.favorites.has(key) ? 'true' : 'false'); b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); });
  return b;
}
function toggleFav(u) {
  const key = unitKey(u);
  if (state.favorites.has(key)) { state.favorites.delete(key); if (state.slots[u.r] === key) delete state.slots[u.r]; }
  else state.favorites.add(key);
  persist();
  renderFavCount();
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
  if (url.startsWith('/data/')) url = '.' + url + '?v=638d2b2cc5';
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
function rankGroupFor(category) { return FIELD_GROUP[category] || myStream(); }
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
    ['영어', null, rec['영어']], ...inq.map((s) => [SHORT[s] || s, rec[s], gradeOf(s, rec[s])]), ['한국사', null, rec['한국사']],
    ...Object.keys(rec).filter((k) => SECOND.includes(k)).map((k) => [k.replace(/\s*Ⅰ$/, ''), null, rec[k]])];
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
    ...Object.keys(rec).filter((k) => SECOND.includes(k)).map((k) => ({ head: '제2외국어/한문', sub: k, subject: k })),
  ];
  const second = cols.find((c) => c.head === '제2외국어/한문');
  const na = () => el('td', { class: 'na', 'aria-label': '해당 없음' });
  const num = (v) => el('td', { class: 'num', text: v ?? '—' });
  const cellStd = (c) => (isGradeSubject(c.subject) ? na() : num(rec[c.subject]));
  const cellPct = (c) => (isGradeSubject(c.subject) ? na() : num(pctOf(c.subject, rec[c.subject])));
  const cellGrade = (c) => num(gradeOf(c.subject, rec[c.subject]));
  const rows = [['선택과목', (c) => el('td', { class: 'sub', text: c.sub })], ['표준점수', cellStd], ['백분위', cellPct], ['등급', cellGrade]];
  const wide = el('table', { class: 'report is-wide' },
    el('thead', {}, el('tr', {}, el('th', { text: '구분' }), el('th', { text: '한국사 영역' }), el('th', { text: '국어 영역' }), el('th', { text: '수학 영역' }), el('th', { text: '영어 영역' }), el('th', { colspan: inq.length, text: inqHead + ' 영역' }), second ? el('th', { text: '제2외국어/한문 영역' }) : '')),
    el('tbody', {}, ...rows.map(([label, fn]) => el('tr', {}, el('th', { text: label }), ...cols.map(fn)))));
  const tallRows = rows.slice(1);
  const tall = el('table', { class: 'report is-tall' },
    el('thead', {}, el('tr', {}, el('th', { text: '구분' }), ...tallRows.map(([label]) => el('th', { text: label })))),
    el('tbody', {}, ...cols.map((c) => el('tr', {}, el('th', {}, el('span', { class: 'rt-area', text: c.head === inqHead ? '탐구' : c.head === '제2외국어/한문' ? '제2외국어' : c.head }), c.sub ? el('small', { class: 'rt-sub', text: c.sub }) : ''), ...tallRows.map(([, fn]) => fn(c))))));
  $('report').replaceChildren(wide, tall);
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
    const code = rep.k;
    const label = tab === 'med' ? MED_NAMES[rep.t] || '' : schemeLabel(code).short;
    const title = tab === 'med' ? '' : schemeLabel(code).full;
    list.push({ ...e, rep, n: units.length, exp: expPct(rep, g), my, score: row.score, label, title, code });
  }
  const byUni = new Map();
  for (const e of list) { if (!byUni.has(e.uni)) byUni.set(e.uni, []); byUni.get(e.uni).push(e); }
  if (tab !== 'med') {
    const best = new Map();
    const pref = tab === 'H' ? /인문|사회|통합/ : /자연|공학|통합/;
    const w = (e) => e.n + (pref.test(e.code) ? 0.5 : 0) - (/간호|예술|체육/.test(e.code) ? 100 : 0);
    for (const e of list) if (!best.has(e.uni) || w(best.get(e.uni)) < w(e)) best.set(e.uni, e);
    list = [...best.values()];
    for (const e of list) e.units = [...groups.values()].filter((x) => x.uni === e.uni).flatMap((x) => x.units);
    for (const e of list) e.alts = byUni.get(e.uni).filter((x) => x !== e && !/간호|예술|체육/.test(x.code));
  }
  for (const e of list) e.schemes = new Set(e.units.filter((u) => visible(u, cat) && fin(gaugeOf(u))).map((u) => u.k)).size;
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
  box.classList.remove('is-all');
  if (!list.length) { box.append(el('div', { class: 'round-empty', text: '표시할 대학이 없습니다.' })); return; }
  // 가운데 = 합격선, 오른쪽 = 합격선보다 앞선 등수. 12행이 같은 눈금을 쓴다.
  const span = Math.max(1, ...list.flatMap((e) => [e, ...(e.alts || [])].map((x) => Math.abs(x.exp - x.my) / 100 * n))) * 1.15;
  const devOf = (x) => Math.max(-1, Math.min(1, (x.exp - x.my) / 100 * n / span)).toFixed(3);
  const at = list.findIndex((e) => e.exp >= e.my);
  const mid = at < 0 ? list.length : at;
  const from = Math.max(0, Math.min(mid - 3, list.length - 6));
  for (const [idx, e] of list.entries()) {
    const mine = e.my / 100 * n;
    const line = e.exp / 100 * n;
    const dev = Math.max(-1, Math.min(1, (line - mine) / span)).toFixed(3);
    const t = tierOf(gaugeOf(e.rep));
    const key = 'conv:' + tab + ':' + e.key;
    const open = state.open.has(key);
    const wrap = el('div', { class: 'conv-item' + (idx < from || idx >= from + 6 ? ' is-extra' : ''), style: '--i:' + idx });
    const row = el('button', { class: 'conv-row', type: 'button', 'aria-expanded': open ? 'true' : 'false' },
      mono(e.uni),
      el('span', { class: 'conv-name' }, el('strong', { text: shortUni(e.uni) }), el('small', {}, el('span', { class: 'conv-score', text: fmt(e.score, 2) + '점' }))),
      el('span', { class: 'conv-bar', style: '--d:' + dev },
        el('span', { class: 'conv-fill', 'data-tier': t.key }),
        el('i', { title: '합격선 ' + fmtRank(line) }),
        ...(e.alts || []).map((a) => el('span', { class: 'conv-me is-alt', style: '--d:' + devOf(a), title: schemeName(a.code, e.uni) }, el('b'))),
        el('span', { class: 'conv-me' }, el('b'))),
      el('span', { class: 'conv-rank', text: fmtRank(mine) }));
    wrap.append(row);
    collapsible(wrap, row, key, () => {
      const g = displayGroup();
      const units = e.units.filter((u) => visible(u, CONV_CATS[tab]) && fin(gaugeOf(u))).sort((a, b) => gaugeOf(b) - gaugeOf(a) || (expPct(a, g) ?? 99) - (expPct(b, g) ?? 99));
      const make = (u) => unitRow(u, { name: u.m, round: true });
      const byK = new Map();
      for (const u of units) { if (!byK.has(u.k)) byK.set(u.k, []); byK.get(u.k).push(u); }
      if (byK.size < 2) return unitList(units, make);
      const keys = [...byK.keys()].sort((a, b) => (b === e.code) - (a === e.code) || byK.get(b).length - byK.get(a).length);
      const box = el('div', { class: 'scheme-groups' });
      for (const k of keys) {
        const us = byK.get(k);
        const r = state.rows.get(us[0].i);
        const lab = schemeLabel(k);
        box.append(el('div', { class: 'scheme-head' + (k === e.code ? ' is-main' : '') },
          schemeChip(k, e.uni),
          el('b', { text: r ? fmt(r.score, 2) + '점' : '—' })), unitList(us, make, 5));
      }
      return box;
    }, open);
    box.append(wrap);
  }
  box.closest('.conv').classList.toggle('has-alts', list.some((e) => e.alts && e.alts.length));
  const extra = box.querySelectorAll('.conv-item.is-extra').length;
  if (extra) {
    const more = el('button', { class: 'unit-more conv-rest', type: 'button', text: '나머지 ' + extra + '개' });
    more.addEventListener('click', () => { box.classList.add('is-all'); more.remove(); });
    box.append(more);
  }
}

function unitList(units, make, limit = 10) {
  const list = el('div', { class: 'unit-list' });
  for (const u of units.slice(0, limit)) list.append(make(u));
  if (units.length > limit) {
    const more = el('button', { class: 'unit-more', type: 'button', text: '나머지 ' + (units.length - limit) + '개' });
    more.addEventListener('click', (ev) => { ev.stopPropagation(); more.replaceWith(...units.slice(limit).map(make)); });
    list.append(more);
  }
  return list;
}
function unitRow(u, { name = u.m, round = true } = {}) {
  const r = el('div', { class: 'unit-row', role: 'button', tabindex: 0 }, el('strong', { text: name }), round ? el('span', { class: 'round-tag', text: u.r }) : el('span'), fitLine(gaugeOf(u), u), favButton(u));
  r.addEventListener('click', () => openDetail(u));
  r.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') openDetail(u); });
  return r;
}

/* ───────── Position ───────── */

function renderPosition() {
  const g = displayGroup();
  const basis = state.basis;
  const scheme = state.schemes.get(basis === 'std' ? '★표점합' : '★백분위합');
  for (const b of $('group-switch').children) b.classList.toggle('is-active', b.dataset.group === g);
  for (const b of $('basis-switch').children) b.classList.toggle('is-active', b.dataset.basis === basis);
  const pct = scheme ? scheme.percentiles[GKEY[g]] : null;
  $('pos-label').textContent = GNAME[g] + ' 상위';
  const rank = fin(pct) ? pct / 100 * pop(g) : null;
  const score = scheme ? scheme.score : null;
  const prev = renderPosition.prev;
  if (document.body.classList.contains('is-entering') && fin(pct)) {
    countTo($('pos-pct'), 50, pct, fmtPct, { log: true });
    countTo($('pos-rank'), pop(g) / 2, rank, fmtRank, { log: true });
    $('pos-score').textContent = fin(score) ? fmt(score, 0) : '—';
  } else if (prev && fin(pct)) {
    countTo($('pos-pct'), prev.pct, pct, fmtPct, { log: true, duration: 520 });
    countTo($('pos-rank'), prev.rank, rank, fmtRank, { log: true, duration: 520 });
    countTo($('pos-score'), prev.score, score, (x) => fmt(x, 0), { duration: 520 });
  } else {
    $('pos-pct').textContent = fmtPct(pct);
    $('pos-rank').textContent = fin(rank) ? fmtRank(rank) : '—';
    $('pos-score').textContent = fin(score) ? fmt(score, 0) : '—';
  }
  renderPosition.prev = fin(pct) ? { pct, rank, score } : null;
  $('pos-score-label').textContent = basis === 'std' ? '표준점수 합' : '백분위 합';
}

/* ───────── Recommendations ───────── */

function defaultCategory() { return ''; }
// 보이는 학과가 하나라도 있는 분야만 칩으로 둔다.
function liveFields() {
  const has = new Set();
  for (const u of data().units) { const f = fieldOf(u); if (!has.has(f) && visible(u, f)) has.add(f); }
  return FIELDS.filter((f) => has.has(f));
}
function renderRecCategory() {
  const fields = liveFields();
  if (state.recCat && !fields.includes(state.recCat)) state.recCat = '';
  const cur = state.recCat || defaultCategory();
  $('rec-category').replaceChildren(...['', ...fields].map((c) => el('button', {
    class: 'tw-chip' + (c === cur ? ' is-active' : ''), type: 'button', text: c || '전체',
    onclick: () => { state.recCat = c; persist(); renderRecCategory(); renderRecs(); swapIn('recs'); },
  })));
}
function pickCard(u, { challenge = false, slot = null } = {}) {
  const faculty = u.c === '의치한약수' ? u.t : u.c === '초등교육' ? '교' : null;
  const card = el('div', { class: 'pick' + (challenge ? ' is-challenge' : '') + (slot ? ' is-slot' : ''), role: 'button', tabindex: 0 });
  card.append(mono(u.u), el('span', { class: 'pick-name' }, el('small', {}, shortUni(u.u)), el('strong', { text: u.m })), favButton(u), fitLine(gaugeOf(u), u));
  card.addEventListener('click', () => openDetail(u));
  card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') openDetail(u); });
  void faculty;
  return card;
}
function recGroups(category, round) {
  // '전체'는 내 계열(문과면 인문사회·초등교육, 이과면 나머지)의 학과만.
  const mine = (u) => (['인문사회', '초등교육'].includes(u.c) ? 'H' : 'S') === myStream();
  const pool = data().units.filter((u) => (category ? fieldOf(u) === category : u.c !== '예체능' && mine(u)) && u.r === round && visible(u, category) && fin(gaugeOf(u)));
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
    e.sort = med ? [SUB_ORDER[e.all[0].t] ?? 5, line ?? 99] : category === '교육' ? [0, line ?? 99] : [rankIdx(e.all[0], rg), line ?? 99];
    groups.push(e);
  }
  groups.sort((a, b) => cmpKey(a.sort, b.sort));
  let main = groups.filter((e) => e.best >= 50).slice(0, 5);
  if (main.length < 3) main = groups.filter((e) => e.best >= 35).slice(0, 5);
  const first = main.length ? groups.indexOf(main[0]) : groups.length;
  const challenge = groups.slice(0, first).find((e) => e.best < 50) || null;
  return { main, challenge, all: groups };
}
// 내 점수대 대학: 군마다 소신 이상인 대학을 대학 순서대로 최대 8곳, 대표 학과와 판정만 표로 보여준다.
function leadOf(e) {
  const rg = displayGroup();
  const ok = e.units.filter((u) => gaugeOf(u) >= 50);
  const pool = ok.length ? ok : e.units;
  return [...pool].sort((a, b) => (expPct(a, rg) ?? 99) - (expPct(b, rg) ?? 99))[0];
}
function lineSlices(category, round) {
  return recGroups(category, round).all.filter((e) => e.best >= 20).slice(0, 8).map((e) => ({ uni: e.uni, u: leadOf(e) })).filter((x) => x.u);
}
function renderRecs() {
  const category = state.recCat || defaultCategory();
  const box = $('recs');
  box.replaceChildren();
  const rerender = () => renderRecs();
  // 대학을 행으로, 펼치면 소신 이상 학과가 뜬다(대표 학과가 맨 위).
  const cols = ['가', '나', '다'].map((round) => [round, recGroups(category, round).all.filter((e) => e.best >= 20).slice(0, 8)]);
  if (cols.every(([, xs]) => !xs.length)) { box.append(el('div', { class: 'round-empty is-all', text: '추천할 대학이 없습니다.' })); return; }
  for (const [round, xs] of cols) {
    const col = el('div', { class: 'round' }, el('div', { class: 'round-head' }, el('h3', { text: round + '군' })));
    if (!xs.length) col.append(el('div', { class: 'round-empty is-compact', text: '없음' }));
    xs.forEach((e, i) => { const g = lineGroup(e, false, { rerender, hideRound: true, table: true }); g.style.setProperty('--i', i); col.append(g); });
    box.append(col);
  }
}

/* ───────── 돌림판 (이스터에그) ─────────
   '내 점수대 대학' 또는 '담은 학과'를 칸으로 두는 서커스 돌림판. 당첨된 칸은 빼고 다시 돌릴 수 있다. */
function wheelSlices(round = state.wheelRound || '가', useOut = true) {
  const d = data();
  let xs;
  if (state.wheelSource === 'fav') xs = [...state.favorites].map((k) => d.byKey.get(k)).filter((u) => u && u.r === round).map((u) => ({ uni: u.u, u }));
  else xs = lineSlices(state.recCat || defaultCategory(), round);
  const out = (useOut && state.wheelOut) || new Set();
  return xs.filter((x) => !out.has(unitKey(x.u))).slice(0, 12);
}
function openWheel() {
  state.wheelOut = new Set();
  state.wheelPick = null;
  state.slotHold = {}; state.slotPick = {};
  renderWheel();
  showSheet('sheet-wheel');
}
function renderWheel() {
  const body = $('wheel-body');
  body.replaceChildren();
  state.wheelBusy = false;
  const round = state.wheelRound || '가';
  const src = state.wheelSource || 'line';
  const seg = (items, cur, onPick) => el('div', { class: 'tw-segmented' }, ...items.map(([v, label]) => el('button', { type: 'button', class: v === cur ? 'is-active' : '', text: label, onclick: () => { if (!state.wheelBusy && v !== cur) onPick(v); } })));
  const reset = () => { state.wheelOut = new Set(); state.wheelPick = null; state.slotHold = {}; state.slotPick = {}; renderWheel(); };
  body.append(el('div', { class: 'wheel-controls' },
    seg([['가', '가군'], ['나', '나군'], ['다', '다군'], ['*', '한 번에']], round, (v) => { state.wheelRound = v; reset(); }),
    seg([['line', '내 점수대'], ['fav', '담은 학과']], src, (v) => { state.wheelSource = v; reset(); })));
  body.classList.toggle('is-slot', round === '*');
  if (round === '*') { renderSlot(body); return; }
  const slices = wheelSlices();
  if (slices.length < 2) {
    body.append(el('div', { class: 'tw-empty' }, el('span', { text: slices.length ? '칸이 두 개 이상 있어야 돌릴 수 있습니다.' : src === 'fav' ? '담은 학과가 없습니다.' : '추천할 대학이 없습니다.' })));
    if (state.wheelOut && state.wheelOut.size) body.append(el('button', { class: 'tw-button is-ghost is-sm wheel-refill', type: 'button', text: '처음부터', onclick: reset }));
    return;
  }
  const N = slices.length;
  const step = 360 / N;
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs = {}, ...kids) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); n.append(...kids); return n; };
  const pt = (deg, r) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];
  // 칸 색: 빨강·크림·파랑·크림 반복, 홀수 칸이면 마지막은 금색(같은 색이 붙지 않게)
  const PALETTE = ['#c8231a', '#f6ead0', '#1f4f9a', '#f6ead0'];
  const colorOf = (i) => (N % 2 && i === N - 1 && N > 2 ? '#e5a823' : PALETTE[i % 4]);
  const uid = 'cw' + Math.random().toString(36).slice(2, 7);
  const ref = (id) => `url(#${uid}-${id})`;
  const stop = (o, c, a = 1) => S('stop', { offset: o, 'stop-color': c, 'stop-opacity': a });
  const defs = S('defs', {},
    S('filter', { id: `${uid}-drop`, x: '-30%', y: '-30%', width: '160%', height: '170%' }, S('feDropShadow', { dx: 0, dy: 7, stdDeviation: 6, 'flood-color': '#1a1206', 'flood-opacity': 0.35 })),
    S('filter', { id: `${uid}-soft`, x: '-40%', y: '-40%', width: '180%', height: '180%' }, S('feDropShadow', { dx: 0, dy: 2, stdDeviation: 1.6, 'flood-color': '#000', 'flood-opacity': 0.4 })),
    S('filter', { id: `${uid}-glow`, x: '-150%', y: '-150%', width: '400%', height: '400%' }, S('feGaussianBlur', { stdDeviation: 2.4, result: 'b' }), S('feMerge', {}, S('feMergeNode', { in: 'b' }), S('feMergeNode', { in: 'SourceGraphic' }))),
    S('linearGradient', { id: `${uid}-brass`, x1: 0, y1: 0, x2: 1, y2: 1 }, stop(0, '#fbe7a1'), stop(0.28, '#d6a53c'), stop(0.55, '#8f6516'), stop(0.78, '#e2b653'), stop(1, '#fae39a')),
    S('linearGradient', { id: `${uid}-brassIn`, x1: 1, y1: 1, x2: 0, y2: 0 }, stop(0, '#fbe7a1'), stop(0.5, '#9c7120'), stop(1, '#5b3d08')),
    S('radialGradient', { id: `${uid}-rimFace`, cx: 0.5, cy: 0.45, r: 0.6 }, stop(0.82, '#2a3558'), stop(1, '#10162c')),
    S('radialGradient', { id: `${uid}-vignette`, cx: 0.5, cy: 0.5, r: 0.5 }, stop(0.55, '#000', 0), stop(0.9, '#000', 0.18), stop(1, '#000', 0.38)),
    S('radialGradient', { id: `${uid}-center`, cx: 0.5, cy: 0.5, r: 0.5 }, stop(0, '#fff', 0.22), stop(0.35, '#fff', 0)),
    S('linearGradient', { id: `${uid}-gloss`, x1: 0, y1: 0, x2: 0, y2: 1 }, stop(0, '#fff', 0.55), stop(0.55, '#fff', 0.08), stop(1, '#fff', 0)),
    S('radialGradient', { id: `${uid}-bulbOn`, cx: 0.4, cy: 0.35, r: 0.65 }, stop(0, '#fffdf2'), stop(0.45, '#ffe07a'), stop(1, '#e09a00')),
    S('radialGradient', { id: `${uid}-bulbOff`, cx: 0.4, cy: 0.35, r: 0.65 }, stop(0, '#f1e3b6'), stop(0.5, '#b89a4e'), stop(1, '#6d5418')),
    S('radialGradient', { id: `${uid}-peg`, cx: 0.35, cy: 0.3, r: 0.7 }, stop(0, '#fffbe8'), stop(0.45, '#e2b653'), stop(1, '#6f4e0c')),
    S('radialGradient', { id: `${uid}-chrome`, cx: 0.38, cy: 0.32, r: 0.75 }, stop(0, '#ffffff'), stop(0.35, '#dfe4ea'), stop(0.75, '#8a95a3'), stop(1, '#4b5563')),
    S('linearGradient', { id: `${uid}-pointer`, x1: 0, y1: 0, x2: 1, y2: 0 }, stop(0, '#ff6a5c'), stop(0.5, '#d42a1d'), stop(1, '#8e150c')),
    S('linearGradient', { id: `${uid}-wood`, x1: 0, y1: 0, x2: 1, y2: 0 }, stop(0, '#5e3417'), stop(0.2, '#9a6436'), stop(0.5, '#b57a45'), stop(0.8, '#8a5629'), stop(1, '#4f2b12')),
    S('linearGradient', { id: `${uid}-woodTop`, x1: 0, y1: 0, x2: 0, y2: 1 }, stop(0, '#c48a52'), stop(1, '#7a4a22')),
    S('radialGradient', { id: `${uid}-floor`, cx: 0.5, cy: 0.5, r: 0.5 }, stop(0, '#000', 0.28), stop(1, '#000', 0)));
  const rot = S('g', { class: 'cw-rot' });
  rot.style.transform = `rotate(${state.wheelRot || 0}deg)`;
  slices.forEach(({ uni, u }, i) => {
    const a0 = i * step; const a1 = a0 + step;
    const [x0, y0] = pt(a0, 100); const [x1, y1] = pt(a1, 100);
    const fill = colorOf(i);
    const light = fill === '#f6ead0' || fill === '#e5a823';
    const name = ((data().universities[uni] || {}).n) || shortUni(uni);
    const text = state.wheelSource === 'fav' ? (name + ' ' + u.m).slice(0, 11) : name;
    rot.append(S('g', { class: 'cw-slice' },
      S('path', { d: `M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A100 100 0 ${step > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`, fill }),
      S('text', { class: light ? 'is-dark' : '', transform: `rotate(${(a0 + step / 2).toFixed(2)}) translate(0 -60) rotate(-90)`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text)));
  });
  // 칸 경계의 금속선과 못
  for (let i = 0; i < N; i++) {
    const [x, y] = pt(i * step, 100);
    rot.append(S('line', { class: 'cw-sep', x1: 0, y1: 0, x2: x.toFixed(2), y2: y.toFixed(2), stroke: ref('brassIn') }));
    const [px, py] = pt(i * step, 95);
    rot.append(S('circle', { cx: px.toFixed(2), cy: py.toFixed(2), r: 3.4, fill: ref('peg'), filter: ref('soft') }));
  }
  const bulbs = S('g', { class: 'cw-bulbs' });
  for (let i = 0; i < 24; i++) {
    const [x, y] = pt(i * 15 + 7.5, 111);
    bulbs.append(S('circle', { class: 'cw-bulb' + (i % 2 ? ' is-odd' : ''), cx: x.toFixed(2), cy: y.toFixed(2), r: 3.8, style: `--on:${ref('bulbOn')};--off:${ref('bulbOff')}`, filter: ref('glow') }));
  }
  const star = 'M0 -9 L2.6 -2.9 L9 -2.8 L3.9 1.3 L5.6 7.7 L0 4.1 L-5.6 7.7 L-3.9 1.3 L-9 -2.8 L-2.6 -2.9Z';
  const pin = S('g', { class: 'cw-pin', filter: ref('drop') },
    S('path', { d: 'M0 -100 C-10 -114 -13 -124 0 -134 C13 -124 10 -114 0 -100Z', fill: ref('pointer'), stroke: '#fff4e0', 'stroke-width': 1.6 }),
    S('circle', { cx: 0, cy: -123, r: 4.2, fill: ref('chrome') }));
  const svg = S('svg', { viewBox: '-140 -146 280 318', class: 'circus-wheel', role: 'img', 'aria-label': '돌림판' }, defs,
    S('ellipse', { cx: 0, cy: 160, rx: 96, ry: 9, fill: ref('floor') }),
    S('path', { d: 'M-22 92 L22 92 L54 150 L-54 150Z', fill: ref('wood') }),
    S('rect', { x: -74, y: 146, width: 148, height: 12, rx: 3, fill: ref('woodTop') }),
    S('g', { filter: ref('drop') },
      S('circle', { r: 124, fill: ref('brass') }),
      S('circle', { r: 118, fill: ref('rimFace') }),
      S('circle', { r: 103, fill: ref('brassIn') })),
    bulbs, rot,
    S('circle', { class: 'cw-overlay', r: 100, fill: ref('vignette') }),
    S('circle', { class: 'cw-overlay', r: 100, fill: ref('center') }),
    S('path', { class: 'cw-overlay', d: 'M-96 -24 A100 100 0 0 1 96 -24 C60 -8 -60 -8 -96 -24Z', fill: ref('gloss') }),
    S('circle', { r: 21, fill: ref('brass'), filter: ref('soft') }),
    S('circle', { r: 16.5, fill: ref('chrome') }),
    S('path', { d: star, class: 'cw-star' }),
    pin);
  const spin = el('button', { class: 'tw-button is-primary wheel-spin', type: 'button', text: '돌리기' });
  const result = el('div', { class: 'wheel-result' });
  const showPick = (k) => {
    const { uni, u } = slices[k];
    const t = tierOf(gaugeOf(u), u);
    const card = el('div', { class: 'wheel-card', role: 'button', tabindex: 0 }, mono(uni), el('span', { class: 'wc-name' }, el('small', { text: shortUni(uni) }), el('strong', { text: u.m })), el('span', { class: 'tier-chip', 'data-tier': t.key, text: t.label }), favButton(u));
    card.addEventListener('click', () => { hideSheets(); setTimeout(() => openDetail(u), 200); });
    const drop = el('button', { class: 'tw-button is-ghost is-sm', type: 'button', text: '이 칸 빼고 다시', onclick: () => { state.wheelOut.add(unitKey(u)); state.wheelPick = null; renderWheel(); } });
    result.replaceChildren(el('span', { class: 'cw-badge', text: '당첨' }), card, drop);
    rot.querySelectorAll('.cw-slice').forEach((g, j) => g.classList.toggle('is-picked', j === k));
  };
  spin.addEventListener('click', () => {
    if (state.wheelBusy) return;
    const k = Math.floor(Math.random() * N);
    const jitter = (Math.random() - 0.5) * step * 0.6;
    const cur = state.wheelRot || 0;
    const want = -((k + 0.5) * step + jitter);
    const target = cur + 360 * 6 + ((((want - cur) % 360) + 360) % 360);
    state.wheelRot = target;
    result.replaceChildren();
    rot.querySelectorAll('.cw-slice').forEach((g) => g.classList.remove('is-picked'));
    if (reduceMotion()) { rot.style.transform = `rotate(${target}deg)`; showPick(k); return; }
    state.wheelBusy = true;
    spin.disabled = true;
    body.classList.add('is-spinning');
    rot.style.transition = 'transform 4800ms cubic-bezier(0.1, 0.7, 0.08, 1)';
    requestAnimationFrame(() => { rot.style.transform = `rotate(${target}deg)`; });
    let last = null;
    const watch = () => {
      if (!state.wheelBusy) return;
      const m = new DOMMatrix(getComputedStyle(rot).transform);
      const ang = ((Math.atan2(m.b, m.a) * 180 / Math.PI) + 360) % 360;
      const under = Math.floor(((360 - ang) % 360) / step);
      if (last !== null && under !== last) { pin.classList.remove('is-tick'); void pin.getBoundingClientRect(); pin.classList.add('is-tick'); }
      last = under;
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    const done = () => {
      rot.removeEventListener('transitionend', done);
      state.wheelBusy = false;
      spin.disabled = false;
      body.classList.remove('is-spinning');
      rot.style.transition = '';
      showPick(k);
      fireworks(stage, 3);
    };
    rot.addEventListener('transitionend', done);
  });
  const stage = el('div', { class: 'wheel-stage' }, svg, spin);
  body.append(stage, result);
}
/* 폭죽: 돌림판·슬롯머신이 멈추면 무대 위에서 터진다. 모션 줄이기에서는 쓰지 않는다. */
function fireworks(host, shells = 4) {
  if (reduceMotion() || !host.isConnected) return;
  host.querySelector(':scope > .fx-canvas')?.remove();
  const cv = el('canvas', { class: 'fx-canvas', 'aria-hidden': 'true' });
  host.append(cv);
  const box = cv.getBoundingClientRect();
  const W = box.width; const H = box.height;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const COLORS = ['#d42a1d', '#e5a823', '#1f4f9a', '#ff6a5c', '#f6c945', '#3f7de0'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rockets = Array.from({ length: shells }, (_, i) => {
    const x = W * (shells === 1 ? 0.5 : 0.12 + 0.76 * [0, 2, 1, 3][i % 4] / (shells - 1)) + rnd(-14, 14);
    return { x0: x + rnd(-30, 30), x, y: H * rnd(0.08, 0.3), t0: i * 190 + rnd(0, 50), dur: rnd(360, 460), color: COLORS[(i * 2) % COLORS.length], burst: false, flash: 0 };
  });
  const parts = [];
  const burst = (r) => {
    r.burst = true; r.flash = performance.now();
    const alt = COLORS[(COLORS.indexOf(r.color) + 1) % COLORS.length];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2 + rnd(-0.05, 0.05); const v = i % 2 ? rnd(3.2, 4.8) : rnd(1.6, 3.4);
      parts.push({ kind: 'spark', x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(850, 1250), age: 0, color: i % 3 ? r.color : alt });
    }
    for (let i = 0; i < 24; i++) {
      const a = rnd(0, Math.PI * 2); const v = rnd(0.8, 2.2);
      parts.push({ kind: 'paper', x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rnd(1500, 1900), age: 0, color: COLORS[i % COLORS.length], rot: rnd(0, 6), vr: rnd(-0.2, 0.2), w: rnd(4, 7), h: rnd(2.5, 4) });
    }
  };
  const start = performance.now();
  let prev = start;
  const frame = (now) => {
    if (!cv.isConnected) return;
    const k = Math.min(3, (now - prev) / 16.67); prev = now;
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    for (const r of rockets) {
      const p = (t - r.t0) / r.dur;
      if (p < 0 || r.burst) continue;
      if (p >= 1) { burst(r); continue; }
      const e = 1 - Math.pow(1 - p, 2);
      const x = r.x0 + (r.x - r.x0) * e; const y = H + (r.y - H) * e;
      const g = ctx.createLinearGradient(x, y, x, y + 26);
      g.addColorStop(0, r.color); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (r.x - r.x0) * 0.04, y + 26); ctx.stroke();
    }
    for (const r of rockets) {
      const f = r.flash ? (now - r.flash) / 220 : 1;
      if (f >= 1) continue;
      const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 34);
      g.addColorStop(0, `rgba(255,250,225,${(1 - f) * 0.95})`); g.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, r.y, 34, 0, Math.PI * 2); ctx.fill();
    }
    for (const q of parts) {
      q.age += 16.67 * k;
      if (q.age > q.life) continue;
      const px = q.x; const py = q.y;
      if (q.kind === 'spark') { q.vx *= Math.pow(0.975, k); q.vy = q.vy * Math.pow(0.975, k) + 0.045 * k; }
      else { q.vx *= Math.pow(0.96, k); q.vy = Math.min(1.4, q.vy + 0.05 * k); q.rot += q.vr * k; }
      q.x += q.vx * k; q.y += q.vy * k;
      const a = 1 - q.age / q.life;
      ctx.globalAlpha = q.kind === 'spark' && a < 0.3 && Math.random() < 0.4 ? a * 0.3 : Math.min(1, a * 1.4);
      if (q.kind === 'spark') {
        ctx.strokeStyle = q.color; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(px - q.vx * 2.4, py - q.vy * 2.4); ctx.lineTo(q.x, q.y); ctx.stroke();
        ctx.fillStyle = '#fff8e0'; ctx.fillRect(q.x - 0.8, q.y - 0.8, 1.6, 1.6);
      } else {
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.scale(1, Math.cos(q.age / 90));
        ctx.fillStyle = q.color; ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    const alive = rockets.some((r) => !r.burst) || parts.some((q) => q.age <= q.life);
    if (alive) requestAnimationFrame(frame); else cv.remove();
  };
  requestAnimationFrame(frame);
}

/* 슬롯머신: 가·나·다군 릴 세 개를 한 번에 돌린다. 릴마다 '고정'하면 다음 판에 그대로 둔다. */
function renderSlot(body) {
  const src = state.wheelSource || 'line';
  const rounds = ['가', '나', '다'];
  const pools = rounds.map((r) => wheelSlices(r, false));
  state.slotHold = state.slotHold || {};
  state.slotPick = state.slotPick || {};
  if (pools.every((p) => !p.length)) {
    body.append(el('div', { class: 'tw-empty' }, el('span', { text: src === 'fav' ? '담은 학과가 없습니다.' : '추천할 대학이 없습니다.' })));
    return;
  }
  const CELL = 60;
  const bulbs = (n) => el('div', { class: 'sl-bulbs' }, ...Array.from({ length: n }, (_, i) => el('i', { class: 'sl-bulb' + (i % 2 ? ' is-odd' : '') })));
  const reels = rounds.map((round, ri) => {
    const items = pools[ri];
    const strip = el('div', { class: 'reel-strip' });
    const win = el('div', { class: 'reel-window' + (items.length ? '' : ' is-empty') }, strip, el('i', { class: 'reel-shade' }));
    const hold = el('button', { class: 'reel-hold', type: 'button', text: '고정', 'aria-pressed': state.slotHold[round] ? 'true' : 'false', disabled: items.length && state.slotPick[round] != null ? null : true, 'data-fk': 'hold:' + round });
    hold.addEventListener('click', () => { state.slotHold[round] = !state.slotHold[round]; hold.setAttribute('aria-pressed', state.slotHold[round] ? 'true' : 'false'); });
    const col = el('div', { class: 'reel' }, el('span', { class: 'reel-plate', text: round + '군' }), win, hold);
    const cell = (x) => el('div', { class: 'reel-cell' }, mono(x.uni), el('span', { text: x.u.m }));
    const reel = { round, items, strip, win, hold, col, pos: 0 };
    // pos번째 칸이 창 가운데. 창 높이 = 2칸.
    reel.place = (pos) => { reel.pos = pos; strip.style.transform = `translateY(${(CELL / 2 - pos * CELL).toFixed(1)}px)`; };
    reel.build = (copies) => { strip.replaceChildren(...Array.from({ length: copies }, () => items.map(cell)).flat()); };
    if (!items.length) strip.append(el('div', { class: 'reel-cell is-none' }, el('span', { text: '없음' })));
    else {
      const k0 = Math.min(state.slotPick[round] ?? 0, items.length - 1);
      reel.build(3); reel.place(k0 + items.length);
    }
    return reel;
  });
  const lever = el('button', { class: 'sl-lever', type: 'button', 'aria-label': '레버 당기기', 'data-fk': 'lever' }, el('i', { class: 'sl-arm' }, el('b', { class: 'sl-knob' })), el('i', { class: 'sl-hub' }));
  const machine = el('div', { class: 'slot' },
    el('div', { class: 'sl-top' }, bulbs(13), el('span', { class: 'sl-star' })),
    el('div', { class: 'sl-face' }, el('i', { class: 'sl-line is-l' }), el('div', { class: 'sl-reels' }, ...reels.map((r) => r.col)), el('i', { class: 'sl-line is-r' })),
    el('div', { class: 'sl-tray' }), lever);
  const spin = el('button', { class: 'tw-button is-primary wheel-spin', type: 'button', text: '돌리기' });
  const result = el('div', { class: 'slot-results' });
  const showResults = () => {
    result.replaceChildren(...reels.map((r) => {
      const k = state.slotPick[r.round];
      if (!r.items.length || k == null) return el('div', { class: 'slot-row is-none' }, el('span', { class: 'sr-round', text: r.round + '군' }), el('span', { class: 'sr-none', text: '없음' }));
      const { uni, u } = r.items[k];
      const t = tierOf(gaugeOf(u), u);
      const row = el('div', { class: 'slot-row', role: 'button', tabindex: 0 }, el('span', { class: 'sr-round', text: r.round + '군' }), mono(uni), el('span', { class: 'wc-name' }, el('small', { text: shortUni(uni) }), el('strong', { text: u.m })), el('span', { class: 'tier-chip', 'data-tier': t.key, text: t.label }), favButton(u));
      row.addEventListener('click', () => { hideSheets(); setTimeout(() => openDetail(u), 200); });
      row.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') row.click(); });
      return row;
    }));
    reels.forEach((r) => { r.hold.disabled = !(r.items.length && state.slotPick[r.round] != null); r.win.classList.toggle('is-won', state.slotPick[r.round] != null); });
  };
  if (Object.keys(state.slotPick).length) showResults();
  const go = () => {
    if (state.wheelBusy) return;
    const live = reels.filter((r) => r.items.length && !(state.slotHold[r.round] && state.slotPick[r.round] != null));
    if (!live.length) return;
    for (const r of live) state.slotPick[r.round] = Math.floor(Math.random() * r.items.length);
    if (reduceMotion()) { for (const r of live) { r.build(3); r.place(state.slotPick[r.round] + r.items.length); } showResults(); return; }
    state.wheelBusy = true;
    spin.disabled = true;
    body.classList.add('is-spinning');
    lever.classList.remove('is-pulled'); void lever.offsetWidth; lever.classList.add('is-pulled');
    result.classList.add('is-waiting');
    let left = live.length;
    live.forEach((r, i) => {
      const n = r.items.length; const k = state.slotPick[r.round];
      // 위에서 아래로 흐르게: 큰 번호 칸에서 작은 번호 칸으로 간다.
      const travel = 22 + i * 9;
      const copies = Math.ceil((travel + n * 2) / n) + 2;
      const cur = r.pos % n;
      r.build(copies + 1);
      const from = cur + n * (copies - 1);
      const to = k + n * Math.floor((from - travel - k) / n);
      r.place(from);
      r.win.classList.remove('is-won');
      r.win.classList.add('is-fast');
      const y = (p) => `translateY(${(CELL / 2 - p * CELL).toFixed(1)}px)`;
      const dur = 1500 + i * 520;
      const anim = r.strip.animate([
        { transform: y(from), easing: 'cubic-bezier(0.3, 0.15, 0.3, 1)' },
        { transform: `translateY(${(CELL / 2 - to * CELL + 12).toFixed(1)}px)`, offset: 0.9, easing: 'ease-in-out' },
        { transform: y(to) },
      ], { duration: dur, fill: 'forwards' });
      setTimeout(() => r.win.classList.remove('is-fast'), dur * 0.6);
      anim.onfinish = () => {
        anim.cancel(); r.build(3); r.place(k + n);
        r.win.classList.add('is-won', 'is-stop');
        setTimeout(() => r.win.classList.remove('is-stop'), 220);
        if (--left) return;
        state.wheelBusy = false; spin.disabled = false;
        body.classList.remove('is-spinning');
        result.classList.remove('is-waiting');
        showResults();
        fireworks(stage, 3);
      };
    });
  };
  spin.addEventListener('click', go);
  lever.addEventListener('click', go);
  const stage = el('div', { class: 'wheel-stage slot-stage' }, machine, spin);
  body.append(stage, result);
}

/* ───────── Find ───────── */

function renderFindCategory() {
  const fields = liveFields();
  if (state.findCat && !fields.includes(state.findCat)) state.findCat = '';
  const all = ['', ...fields];
  $('find-category').replaceChildren(...all.map((c) => el('button', {
    class: 'tw-chip' + (c === state.findCat ? ' is-active' : ''), type: 'button', text: c || '전체',
    onclick: () => { state.findCat = c; state.open.clear(); persist(); renderFindCategory(); renderFind(); swapIn('find-list'); },
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
  const units = d.units.filter((u) => (cat ? fieldOf(u) === cat : u.c !== '예체능') && visible(u, q ? 'search' : cat) && (!state.findRound || u.r === state.findRound) && matchQuery(u, q));
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
  if (q) {
    const uniHit = (e) => !e.faculty && (ALIAS[q] === e.uni || e.uni.replace(/\s/g, '').includes(q) || ((d.universities[e.uni] || {}).n || '').replace(/\s/g, '').includes(q));
    const hits = ordered.filter(uniHit);
    if (hits.length) { ordered.splice(0, ordered.length, ...hits, ...ordered.filter((e) => !hits.includes(e))); if (hits.length === 1) hits[0].hit = true; }
  }
  const box = $('find-list');
  box.replaceChildren();
  if (!ordered.length) { box.append(el('div', { class: 'tw-empty', text: '검색 결과가 없습니다.' })); return; }
  const mine = state.schemes.get('★표점합')?.percentiles[GKEY[g]];
  let dividerDone = !fin(mine) || !!q;
  let shown = 0;
  for (const e of ordered) {
    if (!dividerDone && fin(e.rep) && e.rep > mine) { box.append(el('div', { class: 'me-line' }, el('span', { text: '나' }))); dividerDone = true; }
    const auto = e.hit || q && e.units.some((u) => u.m.replace(/\s/g, '').includes(q) || (MAJOR_ALIAS[q] && u.m.includes(MAJOR_ALIAS[q])));
    box.append(lineGroup(e, auto && shown < 6));
    if (auto) shown++;
  }
  if (!dividerDone) box.append(el('div', { class: 'me-line' }, el('span', { text: '나' })));
}
function lineGroup(e, autoOpen, opts = {}) {
  const open = state.open.has(e.key) || autoOpen;
  const rerender = opts.rerender || renderFind;
  const wrap = el('div', { class: 'line-group' + (opts.challenge ? ' is-challenge' : '') });
  const counts = { safe: 0, fit: 0, reach: 0 };
  for (const u of e.units) { const g = gaugeOf(u); if (g >= 80) counts.safe++; else if (g >= 50) counts.fit++; else if (g >= 20) counts.reach++; }
  const dots = el('span', { class: 'line-dots' });
  for (const [k, label] of [['safe', '안정'], ['fit', '적정'], ['reach', '소신']]) if (counts[k]) dots.append(el('span', { 'data-tier': k, title: label, text: counts[k] }));
  const rg = displayGroup();
  const ok = e.units.filter((u) => gaugeOf(u) >= 50);
  const pool = ok.length ? ok : e.units;
  const best = [...pool].sort((a, b) => (expPct(a, rg) ?? 99) - (expPct(b, rg) ?? 99))[0];
  const lead = best ? best.m + (e.units.length > 1 ? ' 외 ' + (e.units.length - 1) : '') : '';
  const bt = best ? tierOf(gaugeOf(best), best) : null;
  const badge = opts.hideRound && bt ? el('span', { class: 'tier-chip', 'data-tier': bt.key, text: bt.label }) : dots;
  const row = el('button', { class: 'line-row', type: 'button', 'aria-expanded': open ? 'true' : 'false' },
    e.faculty ? mono(null, e.faculty) : mono(e.uni),
    el('span', { class: 'line-name' }, el('strong', { text: e.name }), el('small', {}, [e.tag, opts.table ? '학과 ' + e.units.length + '개' : opts.hideRound ? lead : e.units.length + '개'].filter(Boolean).join('  '))),
    badge, el('span', { class: 'line-chevron' }));
  wrap.append(row);
  void rerender;
  collapsible(wrap, row, e.key, () => {
    // 추천: 칩에 쓴 대표 학과가 맨 위에 오도록 적정 → 안정 → 소신 순, 같은 판정 안에서는 합격선이 높은 학과부터.
    const bucket = (u) => { const k = tierOf(gaugeOf(u)).key; return k === 'fit' ? 0 : k === 'safe' ? 1 : k === 'reach' ? 2 : 3; };
    const units = opts.hideRound
      ? [...e.units].sort((a, b) => (a === best ? -1 : b === best ? 1 : 0) || bucket(a) - bucket(b) || (expPct(a, rg) ?? 99) - (expPct(b, rg) ?? 99))
      : [...e.units].sort((a, b) => (gaugeOf(b) ?? -1) - (gaugeOf(a) ?? -1));
    return unitList(units, (u) => unitRow(u, { name: e.faculty ? [shortUni(u.u), ...variantOf(u.m)].join(' ') : u.m, round: !opts.hideRound }));
  }, open);
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
  const rounds = $('list-rounds');
  rounds.replaceChildren();
  if (!favs.length) {
    rounds.append(el('div', { class: 'tw-empty list-empty', style: 'grid-column:1/-1' }, el('span', { class: 'list-empty-icon', html: HEART }), el('span', { text: '담은 학과가 없습니다.' })));
    return;
  }
  const slotOf = (round) => {
    const key = state.slots[round];
    if (key && state.favorites.has(key)) return key;
    const top = favs.filter((f) => f.r === round).sort((a, b) => (gaugeOf(b) ?? -1) - (gaugeOf(a) ?? -1))[0];
    return top ? unitKey(top) : null;
  };
  for (const round of ['가', '나', '다']) {
    const col = el('div', { class: 'round' }, el('div', { class: 'round-head' }, el('h3', { text: round + '군' })));
    const items = favs.filter((u) => u.r === round).sort((a, b) => (gaugeOf(b) ?? -1) - (gaugeOf(a) ?? -1));
    if (!items.length) col.append(el('div', { class: 'round-empty is-compact', text: '없음' }));
    for (const u of items) {
      const isSlot = slotOf(round) === unitKey(u);
      const card = pickCard(u, { slot: isSlot });
      const check = el('input', { type: 'checkbox', class: 'tw-check', checked: isSlot ? true : null, 'aria-label': '지원' });
      const pickBtn = el('label', { class: 'slot-toggle' }, check, '지원');
      pickBtn.addEventListener('click', (ev) => ev.stopPropagation());
      check.addEventListener('change', () => { if (!isSlot) state.slots[round] = unitKey(u); else check.checked = true; persist(); renderList(); });
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
  $('detail-body').scrollTop = 0;
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

const isTweaked = (det) => Object.keys(det.tweak).some((s) => det.tweak[s] !== state.record[s]);
function renderDetail() {
  const det = state.detail;
  const { unit: u } = det;
  const d = data();
  const g = displayGroup();
  const row = state.rows.get(u.i);
  const gi = gaugeOf(u);
  const body = $('detail-body');
  // 점수 조정 중에도 스크롤 위치와 누른 버튼의 초점을 유지한다.
  const scrollTop = body.scrollTop;
  const focusKey = body.contains(document.activeElement) ? document.activeElement.dataset.fk : null;
  const tweaked = isTweaked(det);
  const pending = tweaked && !det.tweakResult;
  const bd = tweaked && det.tweakResult ? det.tweakResult : det.bd;
  const my = tweaked ? (det.tweakResult ? det.tweakResult.total : det.shownScore ?? null) : row ? row.score : null;
  det.shownScore = my;
  const shown = tweaked ? (det.tweakResult ? lineIndex(det.tweakResult.total, u.th) : det.shownGauge ?? gi) : gi;
  det.shownGauge = shown;
  const t = tierOf(shown, u);

  // 요약 게이지: 같은 노드를 유지해 표식이 이전 위치에서 새 위치로 움직인다.
  let meter = det.meterEl;
  if (!meter) {
    const tags = el('div', { class: 'tags' }, el('span', { class: 'tw-badge', text: u.r + '군' }), el('span', { class: 'tw-badge', text: fieldOf(u) }));
    if (u.rg) tags.append(el('span', { class: 'tw-badge', text: '지역인재' }));
    if (row && row.eligibility.state === 'unchecked') tags.append(el('span', { class: 'tw-badge is-outline', text: '지원 자격 확인' }));
    const scale = el('div', { class: 'gauge-scale' }, ...[['소신', 20], ['적정', 50], ['안정', 80]].map(([l, x]) => el('span', { style: `left:${x}%`, text: l })));
    meter = el('div', { class: 'meter' },
      el('div', { class: 'meter-top' }, el('span', { class: 'tier' }), tags),
      el('div', {}, gauge(gi, { large: true }), scale));
    det.meterEl = meter;
  }
  const tierNode = meter.querySelector('.tier');
  tierNode.dataset.tier = t.key; tierNode.textContent = t.label;
  const track = meter.querySelector('.gauge');
  track.setAttribute('aria-label', t.label);
  let ghost = track.querySelector('b.is-ghost');
  if (tweaked && fin(gi)) { if (!ghost) { ghost = el('b', { class: 'is-ghost' }); track.prepend(ghost); } ghost.style.left = gi + '%'; } else if (ghost) ghost.remove();
  let dot = track.querySelector('b:not(.is-ghost)');
  if (fin(shown)) { if (!dot) { dot = el('b'); track.append(dot); } dot.dataset.tier = tierOf(shown).key; dot.style.left = shown + '%'; } else if (dot) dot.remove();
  meter.classList.toggle('is-pending', pending);
  if (!det.topEl) { det.topEl = el('div', { class: 'detail-part' }); det.tweakEl = buildTweak(); det.bottomEl = el('div', { class: 'detail-part' }); }
  if (det.topEl.parentNode !== body) body.replaceChildren(meter, det.topEl, det.tweakEl, det.bottomEl);
  const top = det.topEl; top.replaceChildren();
  const bottom = det.bottomEl; bottom.replaceChildren();
  const link = u.cut_note && u.cut_note.match(/대학어디가 ‘(.+)’\((.)군\)/);
  if (link) top.append(el('p', { class: 'cut-link' }, el('span', { class: 'tw-badge is-outline', text: '이전 학과' }), el('span', { text: link[1] + (link[2] !== u.r ? ' · ' + link[2] + '군' : '') })));

  // 합격선 사다리: 안정·적정·소신 기준선 사이에 내 점수를 끼워 판정 이유를 보여준다.
  const mp = myPct(u, g);
  const ladder = [['안정', 0], ['적정', 1], ['소신', 2]].map(([label, i]) => ({ label, score: u.th[i], pct: u.tp[g] ? u.tp[g][i] : null, cls: i === 1 ? 'is-cut' : '' }));
  const me = { label: '나', score: my, pct: tweaked ? null : mp, cls: 'is-me' + (pending ? ' is-pending' : '') };
  const at = fin(me.score) ? ladder.findIndex((r) => fin(r.score) && me.score >= r.score) : -1;
  ladder.splice(at < 0 ? ladder.length : at, 0, me);
  const yr = d.quota_years.current;
  top.append(el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '합격선' }), el('span', { text: `${yr}학년도 ${edName()}` })),
    el('table', { class: 'mini-table ladder' },
      el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: '점수' }), el('th', { text: GNAME[g] + ' 누백' }), el('th', { text: '등수' }))),
      el('tbody', {}, ...ladder.map((r) => el('tr', { class: r.cls },
        el('td', { text: r.label }), el('td', { ...(r === me ? numAttrs('me', r.score, 2) : {}), text: fmt(r.score, 2) }), el('td', { text: fmtPct(r.pct) }), el('td', { text: fin(r.pct) ? fmtRank(r.pct / 100 * pop(g)) : '—' })))))));

  // 점수 조정: 슬라이더 노드는 유지하고 값만 맞춘다.
  syncTweak();

  // 점수 계산
  const label = schemeLabel(u.k).full || (bd ? ruleText(bd.rules) : '');
  const parts = label.split(' · ').filter(Boolean);
  const calc = el('section', { class: 'sec' }, el('div', { class: 'sec-head calc-head' }, el('h3', { text: '점수 계산' }), el('span', { class: 'calc-name', text: schemeName(u.k, u.u) + ' 반영식' })));
  const conds = parts.slice(1);
  if (!parseRatio(parts[0] || '') && parts[0]) conds.unshift(humanRule(parts[0]));
  if (conds.length) calc.append(el('div', { class: 'calc-meta' }, ...conds.map((p) => el('span', { class: 'tw-badge', text: p }))));
  const bdRec = tweaked && det.tweakResult ? { ...state.record, ...det.tweak } : state.record;
  calc.append(bd ? calcView(bd, bdRec, u.k) : el('div', { class: 'round-empty', text: '계산하고 있습니다.' }));
  bottom.append(calc);

  // 입결
  const ep = expPct(u, g);
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
    bottom.append(el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '입결' })),
      el('table', { class: 'mini-table' }, el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: GNAME[g] + ' 누백' }), el('th', { text: '등수' }))),
        el('tbody', {}, el('tr', { class: 'is-now' }, el('td', { text: yr + '학년도' }), el('td', { text: fmtPct(ep) }), el('td', { text: fin(ep) ? fmtRank(ep / 100 * pop(g)) : '—' })), ...histRows))));
  }

  // 모집
  if (u.q) {
    const cell = (v) => el('td', { class: fin(v) ? '' : 'none', text: fin(v) ? fmt(v) : '—' });
    bottom.append(el('section', { class: 'sec' }, el('h3', { text: '모집 인원' }),
      el('table', { class: 'mini-table' },
        el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: '모집' }), el('th', { text: '이월' }), el('th', { text: '추가합격' }))),
        el('tbody', {},
          el('tr', {}, el('td', { text: yr + '학년도' }), cell(u.q.c), cell(null), cell(null)),
          el('tr', {}, el('td', { text: (yr - 1) + '학년도' }), cell(u.q.pc), cell(u.q.pco), cell(u.q.pw))))));
  }
  det.nums = tweenNumbers(body, det.nums);
  body.scrollTop = scrollTop;
  if (focusKey) body.querySelector(`[data-fk="${focusKey}"]`)?.focus({ preventScroll: true });
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
const AREA_NAME = { 국: '국어', 수: '수학', 영: '영어', 탐: '탐구', 한: '한국사', 외: '제2외' };
// 반영식 코드(예: 연세인문, 한양상경가군)에서 대학 약칭과 군·점수 종류 꼬리를 떼어 이름만 남긴다.
function schemeName(code, uni) {
  const mo = ((data().universities || {})[uni] || {}).mo || '';
  let n = mo && code.startsWith(mo) ? code.slice(mo.length) : code;
  n = n.replace(/[가나다]군$/, '').replace(/(표|백)$/, '').replace(/교과$/, ' 교과').trim();
  return n || code;
}
function parseRatio(short) {
  if (!/^([국수영탐한외]\d+)(\s+[국수영탐한외]\d+)*$/.test(short || '')) return null;
  return short.split(/\s+/).map((t) => [t[0], Number(t.slice(1))]);
}
function humanRule(short) {
  return (short || '').split(' + ').map((p) => {
    const m = p.trim().match(/^([국수영탐한외]+)(?:\s*택(\d))?(?:\s*(가중))?$/);
    if (!m) return p;
    return [...m[1]].map((c) => AREA_NAME[c]).join(' ') + (m[2] ? ` 중 ${m[2]}개` : '') + (m[3] ? ' 가중' : '');
  }).join(' + ');
}
// 반영식 표시: 이름 + 비율 막대(고정 비율) 또는 풀어 쓴 규칙
function schemeChip(code, uni) {
  const short = schemeLabel(code).short;
  const ratio = parseRatio(short);
  const chip = el('span', { class: 'scheme-chip' }, el('b', { text: schemeName(code, uni) }));
  if (ratio) {
    const sum = ratio.reduce((a, [, v]) => a + v, 0) || 1;
    chip.append(el('span', { class: 'sc-bar', role: 'img', 'aria-label': ratio.map(([a, v]) => `${AREA_NAME[a]} ${Math.round(100 * v / sum)}%`).join(', ') },
      ...ratio.map(([a, v]) => el('i', { style: `flex-grow:${v}`, title: `${AREA_NAME[a]} ${Math.round(100 * v / sum)}%` }, el('span', { text: a + ' ' + Math.round(100 * v / sum) })))));
  } else chip.append(el('small', { text: humanRule(short) }));
  return chip;
}
function schemeLabel(code) {
  const hit = (state.common && state.common.scheme_labels || {})[code];
  return hit || { short: code, full: '' };
}
function ruleText(rules) {
  const parts = [];
  if (rules['필수']) parts.push(areaSpec(rules['필수']));
  const opt = optRuleText(rules);
  if (opt) parts.push(opt);
  return parts.join(' + ');
}
function calcView(bd, rec, code) {
  // 내 표준점수·백분위·등급이 어떤 값으로 바뀌어 반영식에 들어가는지 과목마다 한 줄로 보여준다.
  // 배율은 반영 점수 ÷ 내 점수. 만점 입력에서도 같은 배율이면 곱셈으로, 아니면 표(변표·등급표)로 표시한다.
  const wrap = el('div', { class: 'calc' });
  const d = data();
  const req = bd.rules['필수'] || '';
  const optText = (bd.rules['선택'] || '') + (bd.rules['가중택'] || '');
  const full = schemeLabel(code).full || '';
  const pctScheme = /백분위/.test(full) && !/표준점수/.test(full);
  const vScheme = /변환표준점수|변표/.test(full);
  const topStd = (s) => Math.max(...(d.scoreList[s] || [rec[s]]));
  const near = (a, b) => fin(a) && fin(b) && Math.abs(a - b) <= Math.max(0.0005 * Math.abs(b), 0.00005);
  const { math, inq } = recordParts(rec);
  // 한 과목의 환산: 입력(표준점수·백분위·등급) → 방법(× 배율 / 변표 / 등급표) → 반영 점수
  const inputOf = (subject, basis, std = rec[subject]) => (basis === 'pct' ? pctOf(subject, std) : std);
  const BASIS = { std: '표준점수', pct: '백분위' };
  const order = pctScheme ? ['pct', 'std'] : ['std', 'pct'];
  const conv = (subject, v, top, hint) => {
    if (isGradeSubject(subject)) return { basis: '', input: rec[subject], unit: '등급', how: '등급표' };
    for (const k of hint ? [hint] : order) {
      if (k === 'var') return { basis: BASIS.pct, input: inputOf(subject, 'pct'), how: '변표' };
      if (k === 'table') return { basis: BASIS[pctScheme ? 'pct' : 'std'], input: inputOf(subject, pctScheme ? 'pct' : 'std'), how: '환산표' };
      const x = inputOf(subject, k); const tx = inputOf(subject, k, topStd(subject));
      if (x && tx && fin(top) && near(v / x, top / tx)) return { basis: BASIS[k], input: x, how: '× ' + coef(v / x) };
    }
    if (vScheme && inq.includes(subject)) return { basis: BASIS.pct, input: inputOf(subject, 'pct'), how: '변표' };
    return { basis: BASIS[pctScheme ? 'pct' : 'std'], input: inputOf(subject, pctScheme ? 'pct' : 'std'), how: '환산표' };
  };
  const rows = [];
  const area = (name, letter) => {
    const inReq = name === '한국사' ? !optText.includes('한') && !(bd.rules['한국사대체'] || '') : req.includes(letter);
    const inOpt = optText.includes(letter);
    const v = bd.areas[name]; const top = bd.top.areas[name];
    if (!fin(v) || (!inReq && !inOpt) || (Math.abs(v) < 1e-9 && Math.abs(top || 0) < 1e-9)) return null;
    return { part: inReq ? '필수' : '선택', v, top };
  };
  const push = (a, label, subject, extra = {}) => a && rows.push({ ...a, label, subject, ...conv(subject, a.v, a.top, extra.hint), ...extra });
  push(area('국어', '국'), '국어', '국어');
  push(area('수학', '수'), MATH.find((m) => m[0] === math)?.[1] || '수학', math);
  push(area('영어', '영'), '영어', '영어');
  const ta = area('탐구', '탐');
  if (ta && inq.length) {
    // 탐구1·탐구2는 높은 쪽부터. 표준점수로 들어가면 표준점수 순, 아니면 백분위 순으로 과목을 맞춘다.
    const n = Number(bd.rules['탐구수'] || inq.length) || inq.length;
    const t = [bd.areas['탐구1'], bd.areas['탐구2']]; const tt = [bd.top.areas['탐구1'], bd.top.areas['탐구2']];
    // 과목을 탐구1·2에 맞추기: 반영식이 읽는 점수(표준점수·백분위) 순서. 배율이 맞는 쪽을 쓰고, 둘 다 아니면 변표·환산표.
    const desc = (f) => [...inq].sort((a, b) => (f(b) ?? -1) - (f(a) ?? -1) || rec[b] - rec[a]);
    let pick = null;
    if (!vScheme) for (const k of order) {
      const mine = desc((s) => inputOf(s, k)); const tops = desc((s) => inputOf(s, k, topStd(s)));
      if (mine.slice(0, n).every((s, i) => near(t[i] / inputOf(s, k), tt[tops.indexOf(s)] / inputOf(s, k, topStd(s))))) { pick = { k, mine, tops }; break; }
    }
    const fb = vScheme || pctScheme ? 'pct' : 'std';
    const seq = pick ? pick.mine : desc((s) => inputOf(s, fb));
    seq.forEach((s, i) => {
      if (i < n) push({ part: ta.part, v: t[i], top: pick ? tt[pick.tops.indexOf(s)] : null }, s, s, { hint: pick ? pick.k : vScheme ? 'var' : 'table', inq: true });
      else rows.push({ part: ta.part, label: s, subject: s, v: null, skip: true, inq: true, basis: BASIS[pick ? pick.k : fb], input: inputOf(s, pick ? pick.k : fb) });
    });
    const bonus = ta.v - t.slice(0, n).reduce((a, x) => a + (x || 0), 0);
    if (Math.abs(bonus) > 0.005) rows.push({ part: ta.part, label: '탐구 가산', subject: null, v: bonus, how: '' });
  }
  push(area('한국사', '한'), '한국사', '한국사');
  const second = Object.keys(rec).find((k) => SECOND.includes(k));
  const fa = area('제2외국어', '외');
  if (fa) { if (second) push(fa, second, second); else rows.push({ ...fa, label: '제2외국어', subject: null, how: '' }); }

  const comps = bd.components;
  const optValue = (comps['선택'] || 0) + (comps['가중택'] || 0);
  const extras = [['기본점수', comps['기본'] || 0], ['가감점', comps['가감'] || 0], ['내신', bd.extra || 0]].filter(([, v]) => Math.abs(v) > 1e-9);
  const total = bd.total ?? bd.csat;

  const ratio = parseRatio(schemeLabel(code).short);
  if (ratio) {
    const sum = ratio.reduce((a, [, v]) => a + v, 0) || 1;
    wrap.append(el('div', { class: 'sc-bar calc-ratio', role: 'img', 'aria-label': ratio.map(([a, v]) => `${AREA_NAME[a]} ${Math.round(100 * v / sum)}%`).join(', ') },
      ...ratio.map(([a, v]) => el('i', { style: `flex-grow:${v}` }, el('span', { text: AREA_NAME[a] + ' ' + Math.round(100 * v / sum) + '%' })))));
  }

  const key = (r) => (r.subject || r.label);
  const inCell = (r) => {
    if (!r.subject || !fin(r.input)) return el('td', { class: 'none', text: '' });
    return el('td', { class: 'cv-in' }, r.basis ? el('small', { text: r.basis }) : '', el('span', { ...numAttrs('cin:' + key(r), r.input, 0), text: fmt(r.input, 0) + (r.unit || '') }));
  };
  const tr = (r, cls = '') => el('tr', { class: cls + (r.skip ? ' is-skip' : '') },
    el('td', { text: r.inq ? (SHORT[r.label] || r.label) : r.label }), inCell(r),
    el('td', { class: 'cv-how', text: r.skip ? '반영 안 함' : r.how || '' }),
    el('td', r.skip ? { class: 'none', text: '—' } : { ...numAttrs('calc:' + key(r), r.v, 2), text: fmt(r.v, 2) }));
  const tbody = el('tbody');
  const reqRows = rows.filter((r) => r.part === '필수');
  const optRows = rows.filter((r) => r.part === '선택');
  for (const r of reqRows) tbody.append(tr(r));
  if (optRows.length) {
    tbody.append(el('tr', { class: 'calc-rule' }, el('td', { colspan: 4, text: optRuleText(bd.rules) })));
    for (const r of optRows) tbody.append(tr(r, 'is-sub'));
    if (Math.abs(optValue) > 1e-9) tbody.append(tr({ label: '선택 반영', subject: null, v: optValue, how: '' }));
  }
  for (const [label, v] of extras) tbody.append(tr({ label, subject: null, v, how: '' }));
  wrap.append(el('table', { class: 'mini-table calc-table' },
    el('thead', {}, el('tr', {}, el('th', { text: '' }), el('th', { text: '내 점수' }), el('th', { text: '환산' }), el('th', { text: '반영 점수' }))),
    tbody,
    el('tfoot', {}, el('tr', {}, el('td', { text: '합계' }), el('td', { text: '' }), el('td', { text: '' }), el('td', { ...numAttrs('calc:total', total, 2), text: fmt(total, 2) })))));
  return wrap;
}
// 배율 표기: 소수 넷째 자리까지, 끝의 0은 뺀다.
function coef(c) { return String(Number(c.toFixed(4))); }

// 점수 조정: 과목마다 슬라이더. 오른쪽이 더 좋은 점수(등급은 1등급이 오른쪽). 원래 위치는 눈금으로 남긴다.
function buildTweak() {
  const det = state.detail;
  const rec = state.record;
  const d = data();
  const reset = el('button', { class: 'tw-button is-ghost is-sm', type: 'button', 'data-fk': 'reset', text: '되돌리기', hidden: true,
    onclick: () => { det.tweak = {}; det.tweakResult = null; clearTimeout(det.timer); syncTweak(); renderDetail(); } });
  const sec = el('section', { class: 'sec' }, el('div', { class: 'sec-head' }, el('h3', { text: '점수 조정' }), reset));
  const box = el('div', { class: 'tweak' });
  const { math, inq } = recordParts(rec);
  const subjects = [['국어', '국어'], [math, MATH.find((m) => m[0] === math)?.[1] || '수학'], ...inq.map((x) => [x, x]), ['영어', '영어'], ['한국사', '한국사'], ...Object.keys(rec).filter((k) => SECOND.includes(k)).map((k) => [k, k])];
  det.tiles = [];
  for (const [subject, label] of subjects) {
    const grade = isGradeSubject(subject);
    const base = rec[subject];
    const list = grade ? null : [...(d.scoreList[subject] || [base])].sort((a, b) => a - b);
    const toPos = (v) => (grade ? 10 - v : list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs(list[bi] - v) ? i : bi), 0));
    const fromPos = (p) => (grade ? 10 - p : list[p]);
    const min = grade ? 1 : 0; const max = grade ? 9 : Math.max(1, list.length - 1);
    const pct = (p) => ((p - min) / (max - min)).toFixed(4);
    const input = el('input', { type: 'range', class: 'tt-range', min, max, step: 1, value: toPos(base), 'aria-label': label + (grade ? ' 등급' : ' 표준점수'), 'data-fk': 'range:' + subject });
    const wrap = el('div', { class: 'tt-slider', style: `--bf:${pct(toPos(base))};--pf:${pct(toPos(base))}` }, input);
    const s = el('s'); const val = el('b', { class: 'tt-value' });
    // 원래 값(취소선)을 누르면 이 과목만 되돌린다.
    const baseBtn = el('button', { class: 'tt-base', type: 'button', hidden: true, title: '원래 점수로', 'aria-label': label + ' 원래 점수로', 'data-fk': 'base:' + subject, onclick: () => { setTweak(subject, base); input.focus({ preventScroll: true }); } }, tweakIcon('reset'), s);
    // −/+ 는 한 칸씩. 누르고 있으면 계속 움직인다.
    const basePos = toPos(base);
    const move = (dir) => { const p = Math.max(min, Math.min(max, Number(input.value) + dir)); if (p !== Number(input.value)) { input.value = p; setTweak(subject, fromPos(p)); } };
    const stepBtn = (dir) => {
      const b = el('button', { class: 'tt-step', type: 'button', 'aria-label': label + (dir > 0 ? ' 올리기' : ' 내리기'), 'data-fk': (dir > 0 ? 'up:' : 'down:') + subject }, tweakIcon(dir > 0 ? 'plus' : 'minus'));
      let hold = null;
      const stop = () => { clearTimeout(hold); clearInterval(hold); hold = null; };
      b.addEventListener('pointerdown', (ev) => { if (ev.button) return; ev.preventDefault(); b.setPointerCapture?.(ev.pointerId); move(dir); hold = setTimeout(() => { hold = setInterval(() => move(dir), 70); }, 380); });
      for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, stop);
      b.addEventListener('click', (ev) => { if (ev.detail === 0) move(dir); });
      return b;
    };
    const down = stepBtn(-1); const up = stepBtn(1);
    const tile = el('div', { class: 'tweak-tile' }, el('div', { class: 'tt-head' }, el('span', { text: label }), el('span', { class: 'tt-num' }, baseBtn, val)), el('div', { class: 'tt-row' }, down, wrap, up));
    // 끌 때 원래 위치 가까이(전체 폭의 2.5%)에 오면 원래 위치에 붙는다. 키보드·버튼은 한 칸씩 그대로.
    const snap = grade ? 0 : Math.max(1, Math.round((max - min) * 0.025));
    let dragging = false;
    input.addEventListener('pointerdown', () => { dragging = true; });
    for (const t of ['pointerup', 'pointercancel', 'blur']) input.addEventListener(t, () => { dragging = false; });
    input.addEventListener('input', () => {
      let p = Number(input.value);
      if (dragging && snap && p !== basePos && Math.abs(p - basePos) <= snap) { p = basePos; input.value = p; }
      setTweak(subject, fromPos(p));
    });
    det.tiles.push({ subject, grade, base, input, s, val, tile, wrap, toPos, pct, baseBtn, down, up, min, max });
    box.append(tile);
  }
  sec.append(box);
  det.resetBtn = reset;
  return sec;
}
function tweakIcon(kind) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const d = { plus: 'M12 6v12M6 12h12', minus: 'M6 12h12', reset: 'M5 12a7 7 0 1 0 2.05-4.95M5 4.5v3.5h3.5' }[kind];
  const path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); svg.append(path);
  return svg;
}
function syncTweak() {
  const det = state.detail;
  if (!det || !det.tiles) return;
  for (const t of det.tiles) {
    const cur = det.tweak[t.subject] ?? t.base;
    const show = (v) => (t.grade ? v + '등급' : String(v));
    const changed = cur !== t.base;
    t.tile.classList.toggle('is-changed', changed);
    t.s.textContent = show(t.base);
    t.baseBtn.hidden = !changed;
    if (fin(t.shown) && t.shown !== cur) tweenNum(t.val, t.shown, cur, (x) => show(Math.round(x)), 200); else t.val.textContent = show(cur);
    t.shown = cur;
    const pos = t.toPos(cur);
    if (Number(t.input.value) !== pos) t.input.value = pos;
    t.wrap.style.setProperty('--pf', t.pct(pos));
    t.down.disabled = pos <= t.min; t.up.disabled = pos >= t.max;
  }
  det.resetBtn.hidden = !isTweaked(det);
}
function setTweak(subject, v) {
  const det = state.detail;
  if (!det) return;
  if (v === state.record[subject]) delete det.tweak[subject]; else det.tweak[subject] = v;
  det.tweakResult = null;
  syncTweak();
  clearTimeout(det.timer);
  if (!isTweaked(det)) { renderDetail(); return; }
  // 계산을 기다리는 동안 게이지와 '나' 행을 흐리게. 끌기가 멈추면(140ms) 한 번 계산한다.
  det.meterEl.classList.add('is-pending');
  det.topEl.querySelector('.ladder tr.is-me')?.classList.add('is-pending');
  det.timer = setTimeout(() => {
    const record = { ...state.record, ...det.tweak };
    breakdown(record, det.unit.k).then((bd) => {
      if (state.detail === det && JSON.stringify({ ...state.record, ...det.tweak }) === JSON.stringify(record)) { det.tweakResult = bd; renderDetail(); }
    }).catch((err) => toast(err.message));
  }, 140);
}

/* ───────── Input sheet ───────── */

const draft = { mode: 'std', record: null, korean: '국어(화작)', raw: {} };

function openInput(mode = null) {
  const d = data();
  draft.record = state.record ? { ...state.record } : defaultRecord('H');
  draft.korean = state.korean;
  draft.mode = mode || 'std';
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
  const rawOk = !!state.common.raw[state.edition];
  if (!rawOk && draft.mode === 'raw') draft.mode = 'std';
  for (const b of $('input-mode').children) {
    b.classList.toggle('is-active', b.dataset.mode === draft.mode);
    if (b.dataset.mode === 'raw') b.hidden = !rawOk;
  }
  $('input-mode').hidden = !rawOk;
  const form = $('input-form');
  form.replaceChildren();
  const rec = draft.record;
  const { math, inq } = recordParts(rec);
  const second = Object.keys(rec).find((k) => SECOND.includes(k)) || '';
  const raw = draft.mode === 'raw';

  const menu = (label, options, value, onChange) => {
    const sel = el('select', { class: 'tw-select is-sm', 'aria-label': label });
    for (const o of options) {
      if (o.group) {
        const og = el('optgroup', { label: o.group });
        for (const [v, t, dis] of o.items) og.append(el('option', { value: v, text: t, selected: v === value ? true : null, disabled: dis ? true : null }));
        sel.append(og);
      } else sel.append(el('option', { value: o[0], text: o[1], selected: o[0] === value ? true : null }));
    }
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  };
  const rename = (from, to, value) => {
    const next = {};
    for (const [k, v] of Object.entries(rec)) next[k === from ? to : k] = k === from ? value : v;
    if (!(from in rec)) next[to] = value;
    draft.record = next;
    renderInput();
  };
  const row = (name, head, body) => form.append(el('div', { class: 'score-row' }, el('div', { class: 'score-row-head' }, el('span', { class: 'score-row-name', text: name }), head || ''), body));
  const scoreBody = (subject, label) => {
    const out = el('span', { class: 'score-info' });
    setInfo(out, subject, rec[subject]);
    const box = el('div', { class: 'score-row-body' });
    if (raw) box.append(...rawInputs(subject, (ss) => { if (fin(ss)) rec[subject] = ss; setInfo(out, subject, rec[subject]); }));
    else {
      const input = el('input', { class: 'tw-input', type: 'number', inputmode: 'numeric', placeholder: '—', value: rec[subject] ?? '', 'aria-label': label + ' 표준점수', 'data-key': subject });
      input.addEventListener('change', () => {
        if (input.value === '') { rec[subject] = null; out.replaceChildren(); return; }
        const v = snapScore(subject, Number(input.value)); rec[subject] = v; input.value = v; setInfo(out, subject, v);
      });
      box.append(input);
    }
    box.append(out);
    return box;
  };
  const gradeBody = (subject) => el('div', { class: 'score-row-body' }, gradeChips(subject, rec[subject], (grade) => { rec[subject] = grade; renderInput(); }));

  row('국어', menu('국어 선택과목', KOREAN, draft.korean, (v) => { draft.korean = v; renderInput(); }), scoreBody('국어', '국어'));
  row('수학', menu('수학 선택과목', MATH, math, (v) => rename(math, v, snapScore(v, rec[math]))), scoreBody(math, '수학'));
  row('영어', null, gradeBody('영어'));
  inq.forEach((s, idx) => {
    const items = (list) => list.map((n) => [n, n, inq.includes(n) && n !== s]);
    row('탐구 ' + (idx + 1), menu('탐구 ' + (idx + 1), [{ group: '사회탐구', items: items(SOCIAL) }, { group: '과학탐구', items: items(SCIENCE) }], s, (v) => rename(s, v, snapScore(v, rec[s]))), scoreBody(s, '탐구 ' + (idx + 1)));
  });
  row('한국사', null, gradeBody('한국사'));
  const secondSel = menu('제2외국어/한문', [['', '응시 안 함'], ...SECOND.map((n) => [n, n])], second, (v) => {
    const next = {};
    for (const [k, val] of Object.entries(rec)) if (!SECOND.includes(k)) next[k] = val;
    if (v) next[v] = second ? rec[second] : null;
    draft.record = next;
    renderInput();
  });
  row('제2외국어/한문', secondSel, second ? gradeBody(second) : el('div', { class: 'score-row-body' }));

  const region = $('input-region');
  region.replaceChildren(el('option', { value: '', text: '해당 없음' }), ...state.common.regions.map((r) => el('option', { value: r, text: r, selected: state.settings.region === r ? true : null })));
  for (const sel of document.querySelectorAll('#input-form select, #input-region')) enhanceSelect(sel);
  $('input-status').textContent = GNAME[streamOf(rec)];
}
function fillInputExample() {
  // 국어·수학·탐구1·탐구2 입력칸 순서대로 이전 값을 기억해 두었다가 새 값으로 이어 바꾼다.
  const before = [...$('input-form').querySelectorAll('input[data-key]')].map((n) => (n.value === '' ? null : Number(n.value)));
  const group = streamOf(draft.record);
  const pool = data().random[group] || [];
  if (!pool.length) return;
  const target = Math.log10(0.3) + Math.random() * (Math.log10(15) - Math.log10(0.3));
  const near = pool.filter(([p]) => Math.abs(Math.log10(Math.max(p, 0.001)) - target) < 0.06);
  const choice = near.length ? near[Math.floor(Math.random() * near.length)] : pool[Math.floor(Math.random() * pool.length)];
  const src = choice[1];
  const rec = {};
  const order = ['국어', ...Object.keys(src).filter((k) => k.startsWith('수학(')), '영어', ...Object.keys(src).filter((k) => SOCIAL.includes(k) || SCIENCE.includes(k)), '한국사'];
  for (const k of order) if (src[k] !== undefined) rec[k] = src[k];
  draft.record = rec;
  draft.raw = {};
  draft.mode = 'std';
  draft.korean = Math.random() < 0.4 ? '국어(언매)' : '국어(화작)';
  renderInput();
  [...$('input-form').querySelectorAll('input[data-key]')].forEach((n, i) => {
    const from = before[i]; const to = Number(n.value);
    if (fin(from) && fin(to)) tweenNum(n, from, to, (x) => String(Math.round(x)));
  });
}
function setInfo(out, subject, v) {
  out.replaceChildren();
  if (!fin(v)) return;
  if (isGradeSubject(subject)) { out.append(el('b', { class: 'si-grade', text: v + '등급' })); return; }
  const p = pctOf(subject, v); const gr = gradeOf(subject, v);
  out.append(el('b', { class: 'si-grade', 'data-g': gr ?? '', text: (gr ?? '—') + '등급' }), el('span', { class: 'si-pct' }, el('i', { text: '백분위' }), String(p ?? '—')));
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

async function applyInput() {
  const rec = draft.record;
  const { math, inq } = recordParts(rec);
  if (!math || inq.length !== 2) { toast('수학 선택과목과 탐구 두 과목을 골라 주세요.'); return; }
  for (const [k, v] of Object.entries(rec)) if (!fin(v)) { toast(SECOND.includes(k) ? k + ' 등급을 골라 주세요.' : subjectName(k) + ' 점수를 입력해 주세요.'); return; }
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

/* ───────── Motion ───────── */

const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 접이식 목록: 제자리에서 높이로 열고 닫는다. build는 처음 열 때만 호출한다. */
function collapsible(wrap, row, key, build, openNow) {
  const body = el('div', { class: 'collapse' });
  const inner = el('div', { class: 'collapse-inner' });
  body.append(inner);
  wrap.append(body);
  let built = false;
  const ensure = () => { if (!built) { inner.append(build()); built = true; } };
  if (openNow) { ensure(); wrap.classList.add('is-open'); }
  row.addEventListener('click', () => {
    const open = !wrap.classList.contains('is-open');
    if (open) state.open.add(key); else state.open.delete(key);
    row.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      ensure();
      requestAnimationFrame(() => wrap.classList.add('is-open'));
    } else wrap.classList.remove('is-open');
  });
}

/* 세그먼트 컨트롤: 선택 표시가 미끄러져 이동한다. */
let thumbQueued = false;
function syncThumbs() {
  thumbQueued = false;
  for (const box of document.querySelectorAll('.tw-segmented')) {
    let thumb = box.querySelector(':scope > .seg-thumb');
    if (!thumb) {
      thumb = el('span', { class: 'seg-thumb', 'aria-hidden': 'true' });
      box.prepend(thumb);
      box.classList.add('has-thumb');
    }
    if (!box.offsetWidth) { thumb.dataset.placed = ''; continue; }
    const active = box.querySelector(':scope > .is-active');
    if (!active || active.hidden) { thumb.style.opacity = '0'; continue; }
    const place = () => {
      thumb.style.opacity = '1';
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.height = active.offsetHeight + 'px';
      thumb.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    };
    if (thumb.dataset.placed !== '1' || reduceMotion()) {
      thumb.style.transition = 'none';
      place();
      void thumb.offsetWidth;
      thumb.style.transition = '';
      thumb.dataset.placed = '1';
    } else place();
  }
}
function queueThumbs() {
  if (thumbQueued) return;
  thumbQueued = true;
  requestAnimationFrame(syncThumbs);
}
function initThumbs() {
  new MutationObserver(queueThumbs).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  window.addEventListener('resize', queueThumbs);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const t of document.querySelectorAll('.seg-thumb')) t.dataset.placed = ''; queueThumbs(); });
  queueThumbs();
}

/* 결과 첫 등장 */
let lastBodyState = null;
function markEntering(stateName) {
  if (stateName === 'app' && lastBodyState && lastBodyState !== 'app' && !reduceMotion()) {
    document.body.classList.add('is-entering');
    clearTimeout(markEntering.timer);
    markEntering.timer = setTimeout(() => document.body.classList.remove('is-entering'), 1600);
  }
  lastBodyState = stateName;
}
/* 목록이 바뀔 때 새 항목이 짧게 올라오며 나타난다. */
function swapIn(...ids) {
  if (reduceMotion()) return;
  for (const id of ids) {
    const node = $(id);
    if (!node) continue;
    node.classList.remove('is-swapping');
    void node.offsetWidth;
    node.classList.add('is-swapping');
    clearTimeout(node._swap);
    node._swap = setTimeout(() => node.classList.remove('is-swapping'), 900);
  }
}
function countTo(node, from, to, format, { log = false, duration = 800 } = {}) {
  if (!fin(to) || !fin(from) || reduceMotion()) { node._anim = null; node.textContent = format(to); return; }
  const start = performance.now();
  node._anim = start;
  const a = log ? Math.log(Math.max(from, 1e-6)) : from;
  const b = log ? Math.log(Math.max(to, 1e-6)) : to;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const k = 1 - Math.pow(1 - t, 3);
    const v = a + (b - a) * k;
    if (node._anim !== start) return;
    node.textContent = format(t >= 1 ? to : (log ? Math.exp(v) : v));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function tweenNum(node, from, to, format, duration = 320) {
  const set = (x) => { if (node.tagName === 'INPUT') node.value = x; else node.textContent = x; };
  if (!fin(from) || !fin(to) || from === to || reduceMotion()) { node._anim = null; set(format(to)); return; }
  const start = performance.now();
  node._anim = start;
  const step = (now) => {
    if (node._anim !== start) return;
    const t = Math.min(1, (now - start) / duration);
    const k = 1 - Math.pow(1 - t, 3);
    set(format(t >= 1 ? to : from + (to - from) * k));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// data-nk(키)·data-nv(값)·data-nd(소수 자리)·data-ns(접미사)·data-nf(signed) 가 붙은 숫자를 이전 렌더 값에서 이어 바꾼다.
const numAttrs = (key, v, d = 0, suffix = '', signedFmt = false) => (fin(v) ? { 'data-nk': key, 'data-nv': String(v), 'data-nd': String(d), 'data-ns': suffix, 'data-nf': signedFmt ? 's' : '' } : {});
function tweenNumbers(root, prev) {
  const next = {};
  for (const n of root.querySelectorAll('[data-nk]')) {
    const k = n.dataset.nk; const v = Number(n.dataset.nv); const d = Number(n.dataset.nd || 0); const suf = n.dataset.ns || '';
    next[k] = v;
    if (prev && k in prev && prev[k] !== v) tweenNum(n, prev[k], v, (x) => (n.dataset.nf === 's' ? (Math.abs(x) < 0.005 ? (0).toFixed(d) : signed(x, d)) : fmt(x, d)) + suf);
  }
  return next;
}

/* ───────── Menu select (native select 대체) ───────── */

let openMenu = null;
function closeMenu() {
  if (!openMenu) return;
  openMenu.pop.remove();
  openMenu.trigger.setAttribute('aria-expanded', 'false');
  document.removeEventListener('pointerdown', openMenu.outside, true);
  window.removeEventListener('resize', closeMenu);
  window.removeEventListener('scroll', openMenu.scroll, true);
  const t = openMenu.trigger;
  openMenu = null;
  t.focus({ preventScroll: true });
}
function syncMenu(sel) {
  const t = sel._menu;
  if (!t) return;
  const opt = sel.selectedOptions[0];
  t.firstChild.textContent = opt ? opt.textContent : '';
  t.disabled = sel.disabled;
}
function enhanceSelect(sel) {
  if (sel._menu) { syncMenu(sel); return sel; }
  const trigger = el('button', { type: 'button', class: sel.className + ' menu-trigger', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': sel.getAttribute('aria-label') || '' }, el('span', { class: 'menu-value' }));
  sel._menu = trigger;
  if (sel.disabled) trigger.disabled = true;
  sel.classList.add('menu-native');
  sel.tabIndex = -1;
  sel.setAttribute('aria-hidden', 'true');
  sel.after(trigger);
  sel.addEventListener('change', () => syncMenu(sel));
  trigger.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (openMenu && openMenu.trigger === trigger) { closeMenu(); return; }
    closeMenu();
    showMenu(sel, trigger);
  });
  trigger.addEventListener('keydown', (ev) => {
    if (['ArrowDown', 'ArrowUp'].includes(ev.key) && !openMenu) { ev.preventDefault(); showMenu(sel, trigger); }
  });
  syncMenu(sel);
  return sel;
}
function showMenu(sel, trigger) {
  const pop = el('div', { class: 'menu-pop', role: 'listbox', 'aria-label': sel.getAttribute('aria-label') || '' });
  const items = [];
  const addOption = (o) => {
    const item = el('button', { type: 'button', class: 'menu-item' + (o.selected ? ' is-selected' : ''), role: 'option', 'aria-selected': o.selected ? 'true' : 'false', disabled: o.disabled ? true : null, text: o.textContent });
    item.addEventListener('click', () => {
      if (sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      closeMenu();
    });
    items.push(item);
    return item;
  };
  for (const child of sel.children) {
    if (child.tagName === 'OPTGROUP') {
      pop.append(el('div', { class: 'menu-group', text: child.label }));
      for (const o of child.children) pop.append(addOption(o));
    } else pop.append(addOption(child));
  }
  document.body.append(pop);
  const r = trigger.getBoundingClientRect();
  const width = Math.max(r.width, 180);
  const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
  pop.style.minWidth = width + 'px';
  pop.style.left = left + window.scrollX + 'px';
  const below = window.innerHeight - r.bottom - 12;
  const above = r.top - 12;
  const h = Math.min(pop.scrollHeight, 340);
  if (below < h && above > below) {
    pop.style.maxHeight = Math.min(340, above) + 'px';
    pop.style.top = r.top + window.scrollY - Math.min(h, above) - 6 + 'px';
  } else {
    pop.style.maxHeight = Math.min(340, Math.max(160, below)) + 'px';
    pop.style.top = r.bottom + window.scrollY + 6 + 'px';
  }
  trigger.setAttribute('aria-expanded', 'true');
  const current = items.find((i) => i.classList.contains('is-selected')) || items.find((i) => !i.disabled);
  if (current) { pop.scrollTop = Math.max(0, current.offsetTop - pop.clientHeight / 2); current.focus({ preventScroll: true }); }
  pop.addEventListener('keydown', (ev) => {
    const enabled = items.filter((i) => !i.disabled);
    const idx = enabled.indexOf(document.activeElement);
    if (ev.key === 'ArrowDown') { ev.preventDefault(); enabled[Math.min(enabled.length - 1, idx + 1)]?.focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); enabled[Math.max(0, idx - 1)]?.focus(); }
    else if (ev.key === 'Escape' || ev.key === 'Tab') { ev.preventDefault(); ev.stopPropagation(); closeMenu(); }
  });
  const outside = (ev) => { if (!pop.contains(ev.target) && ev.target !== trigger && !trigger.contains(ev.target)) closeMenu(); };
  const scroll = (ev) => { if (!pop.contains(ev.target)) closeMenu(); };
  openMenu = { pop, trigger, outside, scroll };
  document.addEventListener('pointerdown', outside, true);
  window.addEventListener('resize', closeMenu);
  window.addEventListener('scroll', scroll, true);
}

/* ───────── Start ───────── */

const QUICK_DEFAULTS = {
  H: { korean: '국어(화작)', math: '수학(확통)', inq: ['생활과 윤리', '사회·문화'] },
  S: { korean: '국어(언매)', math: '수학(미적)', inq: ['생명과학 Ⅰ', '지구과학 Ⅰ'] },
};
const quick = { group: 'H', korean: null, math: null, inq: null, second: '', values: {} };
function quickReset(group) {
  const d = QUICK_DEFAULTS[group];
  quick.group = group;
  quick.korean = d.korean;
  quick.math = d.math;
  quick.inq = [...d.inq];
}
function renderQuick() {
  if (!quick.korean) quickReset('H');
  const box = $('quick-fields');
  box.replaceChildren();
  if (!renderQuick.shown) { renderQuick.shown = true; swapIn('quick-fields'); }
  const pick = (options, value, onChange, label) => {
    const sel = el('select', { class: 'cf-pick', 'aria-label': label });
    for (const [v, t, disabled] of options) sel.append(el('option', { value: v, text: t, selected: v === value ? true : null, disabled: disabled ? true : null }));
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  };
  const numberCell = (key, head) => {
    const input = el('input', { class: 'cf-value', type: 'number', inputmode: 'numeric', placeholder: '—', value: quick.values[key] ?? '', 'aria-label': key + ' 표준점수', 'data-key': key });
    input.addEventListener('input', () => { quick.values[key] = input.value; syncQuickReady(); });
    const cell = el('div', { class: 'cf' }, head, input);
    cell.addEventListener('click', (ev) => { if (ev.target === cell) input.focus(); });
    return cell;
  };
  const gradeSelect = (key, disabled = false) => {
    const sel = el('select', { class: 'cf-value cf-grade', 'aria-label': key + ' 등급', disabled: disabled ? true : null, 'data-key': key });
    sel.append(el('option', { value: '', text: '—' }));
    for (let g = 1; g <= 9; g++) sel.append(el('option', { value: g, text: g + '등급', selected: String(quick.values[key]) === String(g) ? true : null }));
    sel.addEventListener('change', () => { quick.values[key] = sel.value; syncQuickReady(); });
    return sel;
  };
  const gradeCell = (key) => el('div', { class: 'cf' }, el('span', { class: 'cf-name', text: key }), gradeSelect(key));
  const secondCell = () => el('div', { class: 'cf cf-second' + (quick.second ? '' : ' is-off') },
    pick([['', '제2외국어'], ...SECOND.map((n) => [n, n])], quick.second, (v) => { quick.second = v; if (!v) delete quick.values['제2외국어']; renderQuick(); }, '제2외국어/한문'),
    gradeSelect('제2외국어', !quick.second));
  const inqOptions = (idx) => [...SOCIAL, ...SCIENCE].map((n) => [n, n, quick.inq.includes(n) && quick.inq[idx] !== n]);
  box.append(
    numberCell('국어', pick(KOREAN.map(([k, t]) => [k, t]), quick.korean, (v) => { quick.korean = v; }, '국어 선택과목')),
    numberCell('수학', pick(MATH.map(([k, t]) => [k, t]), quick.math, (v) => { quick.math = v; }, '수학 선택과목')),
    gradeCell('영어'),
    numberCell('탐구1', pick(inqOptions(0), quick.inq[0], (v) => { quick.inq[0] = v; renderQuick(); }, '탐구 1')),
    numberCell('탐구2', pick(inqOptions(1), quick.inq[1], (v) => { quick.inq[1] = v; renderQuick(); }, '탐구 2')),
    gradeCell('한국사'),
    secondCell(),
  );
  for (const sel of box.querySelectorAll('select')) enhanceSelect(sel);
  $('start-raw').hidden = !state.common.raw[state.edition];
  syncQuickReady();
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
  if (quick.second) rec[quick.second] = grade('제2외국어');
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
// 필요한 칸이 모두 채워지면 전송 버튼을 검정으로. 비활성화는 하지 않는다(누르면 빠진 칸을 알려준다).
function syncQuickReady() {
  const v = quick.values;
  const has = (k) => v[k] !== undefined && v[k] !== '';
  const ready = ['국어', '수학', '탐구1', '탐구2', '영어', '한국사'].every(has) && (!quick.second || has('제2외국어'));
  $('quick-send').classList.toggle('is-ready', ready);
}
// 주사위: 누를 때마다 눈이 바뀌고 90° 돈다.
const DICE_FACES = { 1: ['c'], 2: ['tl', 'br'], 3: ['tl', 'c', 'br'], 4: ['tl', 'tr', 'bl', 'br'], 5: ['tl', 'tr', 'c', 'bl', 'br'], 6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'] };
function rollDice(btn) {
  const prev = Number(btn.dataset.face || 5);
  let face = prev;
  while (face === prev) face = 1 + Math.floor(Math.random() * 6);
  btn.dataset.face = face;
  for (const pip of btn.querySelectorAll('.pip')) pip.classList.toggle('is-on', DICE_FACES[face].includes(pip.dataset.p));
  btn.style.setProperty('--roll', (Number(btn.style.getPropertyValue('--roll').replace('deg', '') || 0) + 90) + 'deg');
}
function fillExample(group) {
  const pool = data().random[group] || [];
  if (!pool.length) return;
  const target = Math.log10(0.3) + Math.random() * (Math.log10(15) - Math.log10(0.3));
  const near = pool.filter(([p]) => Math.abs(Math.log10(Math.max(p, 0.001)) - target) < 0.06);
  const choice = near.length ? near[Math.floor(Math.random() * near.length)] : pool[Math.floor(Math.random() * pool.length)];
  const prev = { ...quick.values };
  quickFrom(choice[1], Math.random() < 0.4 ? '국어(언매)' : '국어(화작)');
  renderQuick();
  const box = $('quick-fields');
  for (const [key, v] of Object.entries(quick.values)) {
    const node = box.querySelector(`[data-key="${key}"]`);
    if (!node) continue;
    const target = node.tagName === 'SELECT' ? node._menu && node._menu.querySelector('.menu-value') : node;
    if (!target) continue;
    const from = Number(prev[key]); const to = Number(v);
    const had = prev[key] !== undefined && prev[key] !== '';
    if (had && fin(from) && fin(to)) tweenNum(target, from, to, (x) => (node.tagName === 'SELECT' ? Math.round(x) + '등급' : String(Math.round(x))));
    else if (!reduceMotion()) { const cell = target.closest('.menu-trigger') || target; cell.classList.remove('is-rising'); void cell.offsetWidth; cell.classList.add('is-rising'); }
  }
}
function quickFrom(rec, korean) {
  const keys = Object.keys(rec);
  const math = keys.find((k) => k.startsWith('수학('));
  const inq = keys.filter((k) => SOCIAL.includes(k) || SCIENCE.includes(k));
  if (!math || inq.length !== 2) return;
  quick.korean = korean || quick.korean || '국어(화작)';
  quick.math = math;
  quick.inq = inq;
  quick.second = keys.find((k) => SECOND.includes(k)) || '';
  quick.values = { 국어: rec['국어'], 수학: rec[math], 영어: rec['영어'], 탐구1: rec[inq[0]], 탐구2: rec[inq[1]], 한국사: rec['한국사'] };
  if (quick.second) quick.values['제2외국어'] = rec[quick.second];
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
  if (text) $('loading-text').textContent = text;
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
  if (Object.keys(EDITIONS).length > 1) body.append(el('section', { class: 'sec' }, el('h3', { text: '기준 시험' }), ed));
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

let sheetTimer = null;
function showSheet(id) {
  clearTimeout(sheetTimer);
  for (const s of document.querySelectorAll('.sheet')) { s.classList.remove('is-closing'); s.hidden = s.id !== id; }
  $('scrim').classList.remove('is-closing');
  $('scrim').hidden = false;
  document.body.style.overflow = 'hidden';
  // 열 때 제목으로 초점을 옮기고, 닫으면 연 요소로 돌려준다.
  const opener = document.activeElement;
  if (opener && !opener.closest('.sheet')) sheetOpener = opener;
  const title = $(id).querySelector('h2');
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}
let sheetOpener = null;
function hideSheets() {
  closeMenu();
  const open = [...document.querySelectorAll('.sheet')].filter((s) => !s.hidden);
  const finish = () => { for (const s of document.querySelectorAll('.sheet')) { s.hidden = true; s.classList.remove('is-closing'); } $('scrim').hidden = true; $('scrim').classList.remove('is-closing'); };
  clearTimeout(sheetTimer);
  if (open.length && !reduceMotion()) {
    for (const s of open) s.classList.add('is-closing');
    $('scrim').classList.add('is-closing');
    sheetTimer = setTimeout(finish, 180);
  } else finish();
  document.body.style.overflow = '';
  if (state.detail) { state.detail = null; if (state.view === 'list') renderList(); }
  if (sheetOpener && sheetOpener.isConnected) sheetOpener.focus({ preventScroll: true });
  sheetOpener = null;
}
function setView(v) {
  state.view = v;
  document.body.dataset.view = v;
  for (const b of document.querySelectorAll('[data-view]')) b.classList.toggle('is-active', b.dataset.view === v);
  renderAll();
  window.scrollTo({ top: 0 });
  if (v === 'find' && window.matchMedia('(hover: hover)').matches) $('find-query').focus({ preventScroll: true });
}
let favShown = null;
function renderFavCount() {
  const n = state.favorites.size;
  const b = $('fav-count');
  b.hidden = !n;
  b.textContent = n > 99 ? '99+' : String(n);
  if (favShown !== null && n > favShown) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  favShown = n;
}

function renderAll() {
  const has = !!(state.record && state.result);
  const loading = !!state.record && !state.result && !!state.busy;
  const start = !state.record || (!state.result && !state.busy);
  document.body.dataset.state = has ? 'app' : loading ? 'loading' : 'start';
  markEntering(document.body.dataset.state);
  $('empty').hidden = !start;
  $('loading').hidden = !loading;
  if (start) renderQuick();
  $('edition-badge').textContent = edName();
  renderStrip();
  renderFavCount();
  document.body.dataset.view = state.view;
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
  initThumbs();
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const yNow = window.scrollY;
    const dy = yNow - lastY;
    if (Math.abs(dy) < 6) return;
    document.body.classList.toggle('subnav-hidden', dy > 0 && yNow > 140);
    lastY = yNow;
  }, { passive: true });
  await refresh();
}

function bind() {
  for (const b of document.querySelectorAll('[data-view]')) b.addEventListener('click', () => setView(b.dataset.view));
  $('score-strip').addEventListener('click', () => openInput());
  $('report-edit').addEventListener('click', () => openInput());
  $('open-wheel').addEventListener('click', openWheel);
  $('quick').addEventListener('submit', submitQuick);
  $('quick-dice').addEventListener('click', (ev) => { rollDice(ev.currentTarget); fillExample(Math.random() < 0.5 ? 'H' : 'S'); });
  $('input-reset').addEventListener('click', resetToStart);
  $('start-raw').addEventListener('click', () => openInput('raw'));
  $('open-settings').addEventListener('click', openSettings);
  $('scrim').addEventListener('click', hideSheets);
  for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', hideSheets);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideSheets();
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (ev.key === '/' && !typing && !ev.metaKey && !ev.ctrlKey && document.body.dataset.state === 'app' && $('scrim').hidden) { ev.preventDefault(); setView('find'); }
  });
  for (const b of $('group-switch').children) b.addEventListener('click', () => { state.group = b.dataset.group; persist(); renderAll(); swapIn('conv-list', 'recs'); });
  for (const b of $('conv-tab').children) b.addEventListener('click', () => { state.convTab = b.dataset.tab; persist(); renderConv(); swapIn('conv-list'); });
  for (const b of $('basis-switch').children) b.addEventListener('click', () => { state.basis = b.dataset.basis; persist(); renderPosition(); });
  for (const b of $('input-mode').children) b.addEventListener('click', () => { draft.mode = b.dataset.mode; renderInput(); });
  $('input-apply').addEventListener('click', applyInput);
  $('input-dice').addEventListener('click', (ev) => { rollDice(ev.currentTarget); fillInputExample(); });
  let timer;
  $('find-query').addEventListener('input', (ev) => { $('find-clear').hidden = !ev.target.value; clearTimeout(timer); timer = setTimeout(() => { state.query = ev.target.value.trim(); renderFind(); }, 120); });
  $('find-clear').addEventListener('click', () => { const q = $('find-query'); q.value = ''; q.dispatchEvent(new Event('input')); q.focus(); });
  for (const b of $('find-round').children) b.addEventListener('click', () => { state.findRound = b.dataset.round; renderFindCategory(); renderFind(); swapIn('find-list'); });
}

document.addEventListener('DOMContentLoaded', boot);
