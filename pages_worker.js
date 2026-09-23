/* Browser-only Python runtime for the Pages candidate. */
let runtime;

async function boot() {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');
  const pyodide = await loadPyodide();
  await pyodide.loadPackage(['numpy', 'micropip']);
  const micropip = pyodide.pyimport('micropip');
  await micropip.install('openpyxl==3.1.5');
  const response = await fetch('./runtime.zip');
  if (!response.ok) throw new Error('계산 자료를 불러오지 못했습니다.');
  pyodide.unpackArchive(await response.arrayBuffer(), 'zip');
  pyodide.runPython(`
import sys
sys.path.insert(0, '/home/pyodide/runtime/source/official_results')
sys.path.insert(0, '/home/pyodide/runtime/source/scoring_engine')
sys.path.insert(0, '/home/pyodide/runtime/admission_sim')
import web_runtime
`);
  return pyodide;
}

self.onmessage = async ({ data }) => {
  const { id, route, body } = data;
  try {
    runtime ||= boot();
    const pyodide = await runtime;
    pyodide.globals.set('web_route', route);
    pyodide.globals.set('web_body', JSON.stringify(body));
    const raw = pyodide.runPython('web_runtime.invoke(web_route, web_body)');
    self.postMessage({ id, result: JSON.parse(raw) });
  } catch (error) {
    self.postMessage({ id, error: String(error?.message || error) });
  }
};
