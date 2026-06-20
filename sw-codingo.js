// codingo専用 Service Worker — Stale-While-Revalidate
const CACHE = 'codingo-v1';

// インストール: codingo.html をプリキャッシュ（失敗しても SW 自体は継続）
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('./codingo.html')).catch(() => {})
  );
});

// アクティベート: 旧バージョンのキャッシュを削除して即座にクライアントを制御
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// フェッチ: codingo.html のみ対象
// stale-while-revalidate: キャッシュを即返しつつ裏でネットワーク取得・更新
self.addEventListener('fetch', e => {
  if (!e.request.url.includes('codingo.html')) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        });
        return cached || networkFetch;
      })
    )
  );
});
