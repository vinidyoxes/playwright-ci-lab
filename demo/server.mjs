import { createServer } from 'node:http';

const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><title>QA CI Lab</title></head>
<body><main>
  <h1>QA CI Lab</h1>
  <button type="button" id="check">Check API</button>
  <p role="status" aria-live="polite"></p>
  <a href="/legacy">Legacy link</a>
</main><script>
document.querySelector('#check').addEventListener('click', async () => {
  const status = document.querySelector('[role="status"]');
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    status.textContent = data.status === 'ok' ? 'API connected' : 'API unavailable';
  } catch { status.textContent = 'API unavailable'; }
});
</script></body></html>`;

const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'qa-ci-lab' }));
  } else if (path === '/legacy') {
    res.writeHead(302, { Location: '/' }).end();
  } else if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
  } else { res.writeHead(404).end('Not found'); }
});

server.listen(4173, '127.0.0.1', () => console.log('QA CI Lab: http://127.0.0.1:4173'));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
