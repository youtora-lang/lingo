// chiilingojp専用 Service Worker — Stale-While-Revalidate
// v2: 共通コア分離（lingo-core.js / lingo.css）に伴い、コアもキャッシュ対象に追加
const CACHE = 'chiilingojp-v2';
const ASSETS = ['./chiilingojp.html', './lingo-core.js', './lingo.css'];

// インストール: 本体とコアをプリキャッシュ（失敗しても SW 自体は継続）
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
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

// フェッチ: ASSETS のみ対象
// stale-while-revalidate: キャッシュを即返しつつ裏でネットワーク取得・更新
self.addEventListener('fetch', e => {
  if (!ASSETS.some(a => e.request.url.includes(a.slice(2)))) return;
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
