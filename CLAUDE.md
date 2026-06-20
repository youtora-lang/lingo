# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of self-contained, single-file HTML language-learning apps deployed on GitHub Pages. There is no build step, no package manager, no framework, and no external dependencies. Each app is one `.html` file with all CSS and JS inlined.

## Apps

| File | Language | TTS locale | localStorage prefix |
|---|---|---|---|
| `chiilingo.html` | English | `en-US` | `chiilingo_` |
| `michilingo.html` | French | `fr-FR` | `michilingo_` |
| `taelingo.html` | Korean | `ko-KR` | `taelingo_` |
| `chiilingojp.html` | Japanese | `ja-JP` | `chiilingojp_` |
| `aep_guide.html` | Guide page | — | — |

> **Note:** `yay-job.html` is an unrelated app that does not belong to the lingo series. It is temporarily hosted here pending migration to its own repository. Do not mention or modify `yay-job.html` when working on lingo series tasks.

## Development

Open any `.html` file directly in a browser — no server needed for local development. There are no tests, no linting tools, and no CI configuration.

To preview the deployed result, open the file in a browser or use a local file server (e.g., `python3 -m http.server`).

## Architecture of each lingo app

Each file is structured as:

1. `<head>` — meta, inlined CSS (`<style>`), inlined favicon as base64
2. `<body>` — screen `<div>`s (one per view), modal overlays
3. `<script>` — all application logic

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

Each app stores five keys, all prefixed with the app name:
- `{prefix}_words` — JSON array of word objects
- `{prefix}_progress` — JSON object keyed by word id
- `{prefix}_history` — JSON array of study events (capped at 400)
- `{prefix}_settings` — JSON object of user preferences
- `{prefix}_tickets` — vacation ticket state

### Word object schema

```js
{ id, w, jp, num, ph, ex, exJp }
// id: derived from w via makeId()
// w: target language text
// jp: Japanese translation
// num: sort order (1-based, append-only)
// ph: phonetic reading (optional)
// ex: example sentence in target language (optional)
// exJp: example sentence in Japanese (optional)
```

Words are imported as a JSON array via the settings screen textarea. Duplicate detection is by `w` field (exact match).

### Progress / mastery model

- Mastery = `progress[id].correct` count
- `new`: mastery 0
- `learning (early)`: mastery 1–2
- `learning (late)`: mastery 3–4
- `master`: mastery ≥ 5
- Session deck composition: 50% new, 30% early, 10% late, 10% master
- Wrong answer on a master word resets mastery to 3

### Streak & vacation tickets

- Streak counts consecutive days with at least one study event in `history`
- 1 ticket earned per 3 total study days; tickets auto-fill missed days to keep streak alive
- Ticket state is stored separately in `{prefix}_tickets`

### TTS

Uses Web Speech API (`speechSynthesis`). The function is named `speakEn(text)` across all apps regardless of the target language. There is an Android-specific workaround: `cancel()` is called before `speak()` with a short `setTimeout` delay.

### Font sizes

Font sizes are controlled via CSS custom properties (`--fs-*`) applied to `<html>`. Values are stored in `settings.fontSizes` and applied on load via `applyFontSizes()`.

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

## アプリ間の構造方針と sync check（2026-06 確定）

### 正本と複製の関係

- **chiilingo.html が正本（マスター）**。機能追加・修正は原則 chiilingo に対して行う。
- michilingo.html / taelingo.html / chiilingojp.html / codingo.html（将来追加）は、
  chiilingo の機能をそのまま継承する複製。違いは学習対象言語（または codingo の学習領域）のみ。
- **chiilingojp は基準言語が逆転している点に注意**:
  - chiilingo / michilingo / taelingo: UI言語=日本語、学習対象=英語/フランス語/韓国語
  - chiilingojp: UI言語=英語、学習対象=日本語
  - 反映時は単純な文字列置換ではなく、この構造差を踏まえて対応させる。
- codingo は chiilingo の全機能を継承した上で、固有の自動追記機能を上乗せする5本目。

### SYNC_BASE マーカーと sync check

- 各HTMLファイルの冒頭付近に、以下の形式で最終同期時刻のコメントを置く:
  `<!-- SYNC_BASE: YYYY-MM-DD HH:MM -->`（24時間表記、分まで）
- chiilingo を更新したら、chiilingo の SYNC_BASE をその更新時刻に書き換える。
- 他アプリへ反映したら、そのアプリの SYNC_BASE を chiilingo と同じ値に揃える。
- **合言葉「sync check」**: CAがこの言葉を打ったら、Claude Code は対象アプリ
  （chiilingo / michilingo / taelingo / chiilingojp / codingo）の SYNC_BASE を比較し、
  chiilingo より古い（=反映漏れの）アプリを一覧で報告する。
  - sync check は「漏れに気づくためのトリガー」であり、検出のみを行う。
  - 実際の反映（コード書き換え）は、CAが別途指示してから実行する。

### 既存の機能差（正本方針の確定前に生じたズレ。今後解消する対象）

- チケットシステム: taelingo / chiilingojp が旧実装（`{used, lastUsedDate}`）のまま。
  chiilingo / michilingo は新実装（`{used, lastUsedDate, usedDates[]}`）。
- autoSpeak機能: chiilingo / michilingo にはあり、taelingo / chiilingojp にはない。
- chiilingojp の fcProgRemain 表示バグ（「残り N枚」が「Left: N ticket(s)」になっている）。

## Making changes across multiple apps

The four lingo apps (`chiilingo`, `michilingo`, `taelingo`, `chiilingojp`) share identical structure and logic — only the TTS locale, localStorage prefix, and default word list differ. When fixing a bug or adding a feature in one app, apply the same change to all four.
