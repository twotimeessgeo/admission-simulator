/* Browser-only Python runtime for the Pages build. */
let runtime;
const progress = (text, ratio) => self.postMessage({ progress: { text, ratio } });

async function cachedRuntime() {
  const manifestResponse = await fetch('./runtime-manifest.json', { cache: 'no-store' });
  if (!manifestResponse.ok) throw new Error('계산 자료를 불러오지 못했습니다.');
  const manifest = await manifestResponse.json();
  const key = new URL('./runtime.zip?sha256=' + manifest.sha256, self.location.href).href;
  if ('caches' in self) {
    try {
      const cache = await caches.open('admission-runtime-v1');
      const stored = await cache.match(key);
      if (stored) return stored;
      const response = await fetch('./runtime.zip');
      if (!response.ok) throw new Error('계산 자료를 불러오지 못했습니다.');
      void cache.put(key, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      if (error.message === '계산 자료를 불러오지 못했습니다.') throw error;
    }
  }
  return fetch('./runtime.zip');
}

async function boot() {
  progress('계산기를 내려받고 있습니다.', 0.05);
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');
  const zip = cachedRuntime();
  const pyodide = await loadPyodide();
  progress('계산기를 준비하고 있습니다.', 0.35);
  await pyodide.loadPackage(['numpy']);
  progress('계산 자료를 불러오고 있습니다.', 0.6);
  const response = await zip;
  if (!response.ok) throw new Error('계산 자료를 불러오지 못했습니다.');
  pyodide.unpackArchive(await response.arrayBuffer(), 'zip');
  progress('계산 자료를 읽고 있습니다.', 0.85);
  pyodide.runPython(`
import sys
sys.path.insert(0, '/home/pyodide/runtime/source/official_results')
sys.path.insert(0, '/home/pyodide/runtime/source/scoring_engine')
sys.path.insert(0, '/home/pyodide/runtime/admission_sim')
sys.path.insert(0, '/home/pyodide/runtime/vendor')
import web_runtime
`);
  self.postMessage({ progress: { done: true } });
  return pyodide;
}

self.onmessage = async ({ data }) => {
  const { id, route, body } = data;
  try {
    runtime ||= boot();
    const pyodide = await runtime;
    if (route === '/warm') { self.postMessage({ id, result: true }); return; }
    progress('성적을 계산하고 있습니다.', 0.95);
    pyodide.globals.set('web_route', route);
    pyodide.globals.set('web_body', JSON.stringify(body));
    const raw = pyodide.runPython('web_runtime.invoke(web_route, web_body)');
    self.postMessage({ id, result: JSON.parse(raw) });
    self.postMessage({ progress: { done: true } });
  } catch (error) {
    self.postMessage({ id, error: String(error?.message || error) });
  }
};
