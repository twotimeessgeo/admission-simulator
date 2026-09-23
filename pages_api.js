/* The Pages build uses a worker instead of the local Python HTTP API. */
const pagesWorker = new Worker('./pages_worker.js');
const pagesPending = new Map();
let pagesSequence = 0;
pagesWorker.onmessage = ({ data }) => {
  if (data.progress) { window.dispatchEvent(new CustomEvent('calc-progress', { detail: data.progress })); return; }
  const task = pagesPending.get(data.id);
  if (!task) return;
  pagesPending.delete(data.id);
  if (data.error) task.reject(new Error(data.error));
  else task.resolve(data.result);
};
pagesWorker.onerror = (event) => {
  for (const task of pagesPending.values()) task.reject(new Error(event.message || '계산기를 불러오지 못했습니다.'));
  pagesPending.clear();
};
function pagesRequest(route, body) {
  const id = ++pagesSequence;
  return new Promise((resolve, reject) => {
    pagesPending.set(id, { resolve, reject });
    pagesWorker.postMessage({ id, route, body });
  });
}
/* Start loading the calculator while the start screen is open. */
pagesRequest('/warm', {}).catch(() => {});
