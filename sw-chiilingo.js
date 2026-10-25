// chiilingo専用 Service Worker — Stale-While-Revalidate
// v2: 共通コア分離（lingo-core.js / lingo.css）に伴い、コアもキャッシュ対象に追加
// v3: chiilingo 専用テーマ（chiilingo-theme.css / chiilingo-theme.js）を追加
// v4: タブ切り替え時にページ先頭へスクロール（chiilingo-theme.js）
// v5: 設定画面の更新日時を GitHub の最終更新日時から自動表示（chiilingo-theme.js）
// v6: 差し色の薄い色を各ページに配置（chiilingo-theme.css）
// v7: ホームのタイトルと単語一覧の検索・絞り込みをスクロール時に固定
const CACHE = 'chiilingo-v7';
const ASSETS = ['./chiilingo.html', './lingo-core.js', './lingo.css', './chiilingo-theme.css', './chiilingo-theme.js'];

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
