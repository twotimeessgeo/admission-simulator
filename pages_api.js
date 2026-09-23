/* The Pages candidate uses a worker instead of the local Python HTTP API. */
const pagesWorker = new Worker('./pages_worker.js');
const pagesPending = new Map();
let pagesSequence = 0;
pagesWorker.onmessage = ({ data }) => {
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
