# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of language-learning web apps deployed on GitHub Pages. There is no build step, no package manager, no framework, and no external dependencies — everything is plain static files edited directly.

Since 2026-07 the four lingo apps share a common core ("共通コア + 言語別設定" 構成):

- **`lingo-core.js`** — all application logic, the full screen HTML (generated into `<body>` at load), and the UI string tables (`ja` / `en`). Edit this file to change behavior, screens, or wording — the change applies to **all four apps at once**.
- **`lingo.css`** — all styles, shared by the four apps.
- **`{app}.html`** (one per app) — a thin file holding only: the `<head>` (`<link rel="manifest">` / `<link rel="apple-touch-icon">` pointing to the app's external manifest/icon files), a `window.LINGO_CONFIG` object (~10 lines of per-language settings), and a `<script src="./lingo-core.js">` tag. These files rarely need editing.
- **`{app}.manifest.json`** (one per app) — the PWA manifest as a standalone JSON file (not embedded in the HTML).
- **`{app}-icon-1024.png` / `{app}-icon-512.png`** (one pair per app) — the app icon as standalone PNG files (not embedded as a data URI).
- **`sw-{app}.js`** (one per app) — service worker; precaches the app's HTML plus `lingo-core.js` and `lingo.css` (cache name `{app}-v2`).

## 重要: lingo-core.js を編集したら必ず CORE_VERSION を更新する

**lingo-core.js に変更を加えた場合は、同ファイル冒頭の `CORE_VERSION` を編集時点の日時（JST）に必ず更新すること。** これは全アプリ共通のバージョン表示（設定画面フッターの「Last updated」）に使われる。更新を忘れると4アプリ全てで古い日時が表示され続ける。

```js
const CORE_VERSION='2026-07-02 23:26'; // 例: この行を編集時点のJST日時に更新
```

## Apps

| File | Language | UI lang | TTS locale | localStorage prefix |
|---|---|---|---|---|
| `chiilingo.html` | English | ja | `en-US` | `chiilingo_` |
| `michilingo.html` | French | ja | `fr-FR` | `michilingo_` |
| `taelingo.html` | Korean | ja | `ko-KR` | `taelingo_` |
| `chiilingojp.html` | Japanese | en | `ja-JP` | `chiilingojp_` |
| `aep_guide.html` / `aepmini_guide.html` | Guide pages (standalone) | — | — | — |

> **Note:** `yay-job.html` is an unrelated app temporarily hosted here. `codingo.html` (+ `sw-codingo.js`, png files) is scheduled for deletion and was intentionally **not** migrated to the common core. `EBC2026/` is unrelated. Do not modify these when working on lingo series tasks.

## LINGO_CONFIG (per-app settings)

Each app HTML defines exactly this object; it is the **only** thing that differs between apps:

```js
window.LINGO_CONFIG={
  prefix:'chiilingo',      // localStorageキー・SWファイル名の元。変更禁止（保存データが読めなくなる）
  appNameDefault:'chii',   // アプリ名のデフォルト（appNameDefault+suffix=表示タイトル）
  suffix:'lingo',          // タイトルの末尾（lingo / lingojp）
  uiLang:'ja',             // UI言語（lingo-core.js の STRINGS テーブルを選択）
  targetName:'英語',        // 学習対象言語の表示名（UI言語で書く）
  nativeName:'日本語',      // 訳語側の言語の表示名
  ttsLang:'en-US',         // 読み上げ（Web Speech API）のロケール
  ttsVoice:'Samantha',     // 優先ボイス名（部分一致・省略可）
  dateLocale:'ja-JP',      // 学習報告の日付表示ロケール
};
```

Adding a fifth language = copy one thin HTML, adjust `LINGO_CONFIG`, copy/adjust the app's `{app}.manifest.json` and `{app}-icon-1024.png` / `{app}-icon-512.png`, and add a `sw-{app}.js` (copy an existing one and change the app name).

## Structure of lingo-core.js

1. **設定と文字列** — `CFG` (= `LINGO_CONFIG`), `CORE_VERSION`, `STRINGS.ja` / `STRINGS.en` → `T`. All user-visible text lives in these tables; logic refers to `T.xxx`. Dynamic strings are small arrow functions (e.g. ``remainCards:x=>`残り${x}枚` ``).
2. **画面HTML** — `renderBodyHTML()` returns the entire body as a template literal (screens, modals); it is injected via `document.body.innerHTML` on load. Language-dependent spots use `${T.xxx}` / `${CFG.xxx}`.
3. **アプリロジック** — the original chiilingo script, unchanged except that app-specific literals were replaced with `CFG`/`T` references.

`CORE_VERSION` (a JST datetime near the top of `lingo-core.js`) is shown in the settings footer as "Last updated". **Update it whenever you edit lingo-core.js.**

## Development

Open any `.html` file directly in a browser — no server needed (`lingo-core.js` / `lingo.css` load via relative paths; service worker registration fails on `file://` but is caught and ignored). There are no tests, no linting tools, and no CI configuration.

To preview the deployed result, open the file in a browser or use a local file server (e.g., `python3 -m http.server`).

### Verifying changes

When changing lingo-core.js, a quick way to verify all four apps still render and run is a headless Chromium dump (a Playwright-cached binary exists on this machine):

```bash
~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell \
  --headless --no-sandbox --user-data-dir=/tmp/prof --virtual-time-budget=3000 \
  --dump-dom "file://$PWD/chiilingo.html" | less
```

plus `node --check lingo-core.js` for syntax.

## App behavior reference

### Screens

Each app has these screens (toggled by adding/removing `.active` class):
- `dashScreen` — home with streak, phrase of the day, start session
- `fcScreen` — flashcard mode (flip animation)
- `quizScreen` — 4-choice quiz
- `spellScreen` — typing/spelling mode
- `sessResultScreen` — post-session summary
- `reportScreen` — weekly bar chart
- `wordlistScreen` — searchable/filterable word list
- `settingsScreen` — all user preferences

### localStorage keys

Each app stores five keys, all prefixed with `CFG.prefix`:
- `{prefix}_words` — JSON array of word objects
- `{prefix}_progress` — JSON object keyed by word id
- `{prefix}_history` — JSON array of study events (capped at 400)
- `{prefix}_settings` — JSON object of user preferences
- `{prefix}_tickets` — vacation ticket state (`{used, lastUsedDate, usedDates[]}`)

**Backward compatibility with these keys is a hard requirement** — existing users' data must keep loading after any refactor.

### Word object schema

```js
{ id, w, jp, num, ph, ex, exJp }
// id: derived from w via makeId()
// w: target language text
// jp: Japanese translation (chiilingojp: English translation)
// num: sort order (1-based, append-only)
// ph: phonetic reading (optional)
// ex: example sentence in target language (optional)
// exJp: example sentence in jp-side language (optional)
```

Words are imported as a JSON array via the settings screen textarea. Duplicate detection is by `w` field (exact match).

### Progress / mastery model

- Mastery = `progress[id].correct` count
- `new`: mastery 0 / `learning (early)`: 1–2 / `learning (late)`: 3–4 / `master`: ≥ 5
- Session deck composition: 50% new, 30% early, 10% late, 10% master
- Wrong answer on a master word resets mastery to 3

### Streak & vacation tickets

- Streak counts consecutive days with at least one study event in `history`
- 1 ticket earned per 3 total study days; tickets auto-fill missed days to keep streak alive
- Ticket state is stored separately in `{prefix}_tickets`

### TTS

Uses Web Speech API (`speechSynthesis`). The function is named `speakEn(text)` regardless of the target language; locale and preferred voice come from `CFG.ttsLang` / `CFG.ttsVoice`. There is an Android-specific workaround: `cancel()` is called before `speak()` with a short `setTimeout` delay.

### Font sizes

Font sizes are controlled via CSS custom properties (`--fs-*`). Values are stored in `settings.fontSizes` and applied on load via `applyFontSizes()` (class toggles on `<body>`).

### Known quirks (intentionally preserved)

- `chiilingojp` の一部文言は旧版から日本語のまま（単語一覧の空メッセージ、除外トースト2種）。`STRINGS.en` 内にコメントで明記。直すならそこを書き換えるだけ。
- 設定画面の「カード表示時に読み上げ」の説明文は ja 版では常に「英→日の…」（フランス語・韓国語でも同文）。旧版からの仕様。

## 旧 SYNC_BASE / sync check について（2026-07 廃止）

かつては chiilingo.html を正本とし、他アプリへ手動で変更を反映して
`<!-- SYNC_BASE -->` コメントで同期時刻を管理していた（合言葉「sync check」）。
共通コア化により**この運用は廃止**。ロジック・画面・文言の変更は
lingo-core.js を1回編集すれば全アプリに反映される。sync check は不要。

## Git rules

### Commit message format

Use a 2-part structure: a title line followed by a blank line and a body.

- **Title (line 1):** 40 characters or fewer. Abbreviations, symbols, and shorthand are fine — keep it concise.
- **Body:** No length limit. Explain *what* was changed and *why* in as much detail as needed.

Example:
```
fix quiz dummy candidates bug

クイズの不正解選択肢がsessionDeckからのみ補充されていたため、
語彙数が少ない場合に候補が重複する問題を修正。
WORDS全体→sessionDeckの順にフォールバックするよう変更した。
```

### Commit author identity

Always use the following git identity — never use a real name or local email address:

```
user.name  = youtora-lang
user.email = 280938766+youtora-lang@users.noreply.github.com
```

Pass these explicitly when committing if the local git config differs:

```bash
git -c user.name="youtora-lang" -c user.email="280938766+youtora-lang@users.noreply.github.com" commit -m "..."
```

### Destructive operations

Before executing any hard-to-reverse operation — including file deletion, `git reset --hard`, `git rebase`, force-push, or any rewrite of git history — present exactly what will be done and ask for explicit confirmation.
