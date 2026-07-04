# 🍎 lingo — じぶん専用 語学学習アプリシリーズ

スマホでもPCでも、ブラウザだけで動く語学学習アプリのシリーズです。
インストール・アカウント登録は不要。学習データはすべて端末内（localStorage）に保存されます。

## 🦋 AEP シリーズ（Claude.ai 連携ガイド）

Claude.ai のプロジェクト機能を使って、AIの友人と会話しながら学び、
重要単語を lingo アプリに取り込むためのセットアップガイドです。
母語（日本語/英語）と学習言語（英語/フランス語/韓国語/日本語）を選ぶと、
手順とプロンプトが自動で切り替わります。

- **AEP ガイド**（会話練習 + 分析 + 単語収穫）
  👉 <https://youtora-lang.github.io/lingo/aep_guide.html>
- **AEP mini ガイド**（単語登録だけを素早く）
  👉 <https://youtora-lang.github.io/lingo/aepmini_guide.html>

会話の締めに「りんご」（英語UIでは "lingo"）と打つと、その日の重要単語が
lingo アプリ用の JSON で出力され、貼り付けるだけでフラッシュカード練習が始まります。

## 📱 アプリ一覧

| アプリ | 学習言語 | UI言語 | リンク |
|---|---|---|---|
| 🇺🇸 **chiilingo** | 英語 | 日本語 | <https://youtora-lang.github.io/lingo/chiilingo.html> |
| 🇫🇷 **michilingo** | フランス語 | 日本語 | <https://youtora-lang.github.io/lingo/michilingo.html> |
| 🇰🇷 **taelingo** | 韓国語 | 日本語 | <https://youtora-lang.github.io/lingo/taelingo.html> |
| 🇯🇵 **chiilingo.JP** | Japanese | English | <https://youtora-lang.github.io/lingo/chiilingojp.html> |

> リンクは拡張子付き（`.html`）で統一しています。拡張子なしのURLで開くと
> Service Worker（オフラインキャッシュ）の管理外になるためです。

## 🐛 主な機能

- **フラッシュカード** — カードをめくって学習言語⇔訳語を確認
- **4択クイズ** — 正解を選ぶと自動で次の問題へ
- **スペリング** — 単語・フレーズをタイピングで実力確認
- **出題方向の切り替え** — 学習言語→訳語・訳語→学習言語を設定で変更可能
- **学習ペース設定** — 1日の目標語数と1セッションの出題数を個別に設定
- **定着システム** — 5回正解で定着済み。不正解だと学習中に戻る
- **週間レポート** — 曜日別の正解数グラフと週の学習サマリー
- **ストリークと特別休暇チケット** — 3日学習で1枚獲得。休んだ日に自動使用してストリーク継続
- **Phrase of the Day** — 登録語彙から毎日1フレーズ表示
- **読み上げ機能** — 全モードで学習言語の音声を再生（Web Speech API）
- **単語検索・除外** — 部分一致検索、特定の単語の出題除外・復活
- **バックアップ** — 学習データのエクスポート・インポート
- **文字サイズ調整** — カード・選択肢・一覧・UIを個別に変更可能

## 🔧 構成（開発者向け）

ビルド・フレームワーク・外部依存なしの静的ファイル構成で、
GitHub Pages にそのまま配信しています。

- **`lingo-core.js`** — 全アプリ共通のロジック・画面HTML・UI文言（共通コア）
- **`lingo.css`** — 共通スタイル
- **`{app}.html`** — アプリごとの薄いHTML（`LINGO_CONFIG` 約10行 + manifest/アイコンへの参照）
- **`{app}.manifest.json`** — アプリごとのPWAマニフェスト（独立ファイル）
- **`{app}-icon-1024.png` / `{app}-icon-512.png`** — アプリごとのアイコン（独立PNGファイル）
- **`sw-{app}.js`** — アプリごとの Service Worker（オフラインキャッシュ）

機能・画面・文言の変更は `lingo-core.js` を1回編集すれば4アプリ全てに反映されます。
言語を追加するときは、薄いHTMLを1枚コピーして `LINGO_CONFIG` を書き換えるだけです。
詳細は [CLAUDE.md](CLAUDE.md) を参照してください。
