/* QuizForge 习题工坊 — service worker
   只做一件事：把整页缓存下来，断网也能打开。
   策略是「网络优先，失败回退缓存」，所以联网时永远拿到最新版本。 */
const CACHE = 'quizforge-v1';
const PAGE = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(PAGE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(PAGE, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(PAGE).then((r) => r || caches.match(req)))
  );
});
