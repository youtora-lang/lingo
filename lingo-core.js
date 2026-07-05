// ============================================================
// lingo-core.js — lingoシリーズ共通コア
//
// 各アプリのHTMLは「LINGO_CONFIG の定義 + このファイルの読み込み」だけを持つ。
// アプリ固有の違い（言語名・TTSロケール・localStorageプレフィックス等）は
// すべて LINGO_CONFIG で注入される。ロジック・画面・文言はここに集約。
//
// ファイル構成:
//   1. 設定（CFG）と UI文字列テーブル（STRINGS → T）
//   2. 画面HTMLの生成（renderBodyHTML → document.body へ注入）
//   3. アプリロジック（元 chiilingo.html のスクリプトを文字列だけ差し替えたもの）
//
// 注意: CFG.prefix は localStorage キーの元。既存ユーザーのデータが
// 消えるため、絶対に変更しないこと。
// ============================================================

const CFG=window.LINGO_CONFIG;
const CORE_VERSION='2026-07-05 18:57';
// 表示名から suffix（lingo / lingojp）を取り除くための正規表現
const SUFFIX_RE=new RegExp(CFG.suffix+'$','i');

// ── UI文字列テーブル ──
// ja: chiilingo / michilingo / taelingo（UI=日本語、学習対象=cfg.targetName）
// en: chiilingojp（UI=英語、学習対象=日本語）
// 文言は旧・各HTMLの文言をそのまま移植したもの。
const STRINGS={
ja:cfg=>{const t=cfg.targetName,n=cfg.nativeName;return{
  // ナビ
  navHome:'ホーム',navReport:'レポート',navWords:'単語一覧',navSettings:'設定',
  // ダッシュボード
  ticketBannerTitleShort:'特別休暇チケット使用！',
  ticketBannerTitle:'🎟️ 特別休暇チケット使用！ストリーク継続中',
  ticketBannerSub:x=>`残り${x}枚 ／ 再開することに意義がある 🌱`,
  ticketCount:x=>`${x}枚`,
  ticketUnknown:'？枚',
  statUnitMastered:'語 定着済み',statUnitStreak:'日連続',
  sectionProgress:'全体進捗',
  progKeyMaster:'✓ 定着済み',progKeyLearning:'🟡 学習中',progKeyNew:'🔵 未学習',
  modeFlash:'フラッシュ',modeQuiz:'4択クイズ',modeSpell:'スペリング',
  startSession:'セッションを始める →',
  toastAddWords:'⚠️ 語彙を追加してください',
  // セッション共通
  tagT2N:`${t} → ${n}`,tagN2T:`${n} → ${t}`,
  titleFlash:x=>`• FLASH CARDS（${x}枚）•`,
  titleQuiz:x=>`• QUIZ（${x}問）•`,
  titleSpell:x=>`• SPELLING（${x}問）•`,
  titleRetryFlash:x=>`• RETRY（${x}枚）•`,
  titleRetryQuiz:x=>`• RETRY QUIZ（${x}問）•`,
  titleRetrySpell:x=>`• RETRY SPELLING（${x}問）•`,
  remainCards:x=>`残り${x}枚`,remainQs:x=>`残り${x}問`,
  btnAgain:'もう一度',btnGotIt:'覚えた！',
  flipBtn:'タップして答えを見る',
  masteryMastered:'✅ 定着済み',
  masteryLearning:m=>`学習中（${m}回正解）`,
  masteryNew:'初めて見る単語',
  confirmEnd:'セッションを終了しますか？',
  // スペリング
  spellPlaceholder:`${t}でスペルを入力...`,
  spellNext:'次へ →',
  spellCorrect:'✓ 正解！',
  spellWrongAnswer:w=>`✕ 正解：${w}`,
  // 結果
  resultHigh:{title:'すばらしい！',sub:'定着が進んできた。この調子で続けよう。'},
  resultMid:{title:'いい調子！',sub:'✕の単語を重点的に回していくと一気に伸びる。'},
  resultLow:{title:'お疲れさま！',sub:'知らない単語に出会えた分だけ前進してる。毎日少しずつ！'},
  missedTitle:'📌 要復習の単語',
  copyBtn:'📋 結果をClaudeに貼り付け用コピー',
  retryBtnInit:'✕ の単語だけもう一度',
  retryBtn:x=>`✕ の${x}語をもう一度`,
  backToDash:'ダッシュボードへ戻る',
  copyReport:a=>`【${a.appName} 学習報告】${a.date}\n─────────────────\nセッション結果：${a.ok}/${a.deckLen}（正答率${a.pct}%）\n○ わかった：${a.ok}語　✕ もう一度：${a.ng}語\n─────────────────\n全体進捗：${a.mc}/${a.total}語 定着済み（${a.mcPct}%）\n連続学習：${a.streak}日🔥\n${a.missedCount?'\n要復習の単語：\n'+a.missed:'\n全問正解！完璧です🎉'}`,
  toastCopied:'📋 コピーしました！',
  // レポート
  dayLabels:['月','火','水','木','金','土','日'],
  thisWeek:'今週',lastWeek:'先週',weekRangeSep:' 〜 ',
  prevWeek:'← 前週',nextWeek:'次週 →',
  statDays:'日 学習',statSessions:'セッション',statCorrect:'語 正解',statMastered:'語 定着済み（累計）',
  graphTitle:'正解数 / 曜日',
  noDataWeek:'この週の学習データはありません',
  // 単語一覧
  wlSearchPlaceholder:`${t}・${n}で検索...`,
  wlFilterAll:'すべて',wlFilterMaster:'定着済み',wlFilterLearning:'学習中',wlFilterNew:'未学習',wlFilterExcluded:'除外',
  sortNumAsc:'登録順',sortNumDesc:'新しい順',sortStatusMaster:'定着→未学習',sortStatusNew:'未学習→定着',
  wlEmptySearch:q=>`「${q}」に一致する単語はありません`,
  wlEmpty:'単語がありません',
  wiMetaMastered:'定着済み',wiMetaLearning:m=>`${m}回正解`,wiMetaNew:'未学習',
  toastExcluded:'除外しました',toastUnexcluded:'除外を解除しました',
  // 設定
  secApp:'アプリ設定',
  appNameLabel:'アプリ名',appNameSub:`「〇〇${cfg.suffix}」の〇〇部分を入力`,
  fontSizeLabel:'文字サイズ',fontSizeSub:'スコープごとに個別設定。「アプリ全体」を選ぶと他は無効になります。',
  fsScopeGlobal:'アプリ全体',fsScopeCard:'カード内',fsScopeChoice:'4択選択肢',fsScopeWl:'単語一覧',fsScopeOther:'その他',
  fsS:'小',fsM:'中',fsL:'大',fsCustom:'個別',
  secStudy:'学習設定',
  directionLabel:'出題方向',directionSub:'表面に出す言語',
  dailyGoalLabel:'1日の目標語数',dailyGoalSub:'ダッシュボードのスタートボタンに表示',
  sessionSizeLabel:'1セッションの出題数',sessionSizeSub:'1回に出題される語数',
  autoSpeakLabel:'カード表示時に読み上げ',autoSpeakSub:'英→日のフラッシュ・4択のみ',
  optOff:'オフ',optOn:'オン',
  secAddWords:'語彙を追加',
  addWordsNote:'AEPの出力JSONをそのまま貼り付けてください。<br><span style="color:var(--ink-lt);">id・numは自動生成。同じ単語は上書きされます。</span>',
  addWordsPlaceholder:'[{"w":"catch a cold","jp":"風邪をひく",...}]',
  btnAddWords:'➕ 追加する',btnReplaceAll:'全置換',
  wordsCount:x=>`現在 ${x}語 登録中`,
  wordsNone:'（語彙未登録）',
  importResultLabel:(total,added,updated)=>`✓ 合計${total}語（追加${added}語/更新${updated}語）`,
  toastImported:(added,updated)=>`✅ ${added?added+'語追加 ':''}${updated?updated+'語更新':''}`,
  toastEmptyText:'⚠️ テキストが空です',
  toastBadJson:'⚠️ JSONの形式が正しくありません',
  toastNeedArray:'⚠️ 配列形式で入力してください',
  secTickets:'🎟️ 特別休暇チケット',
  ticketInfoHtml:`<strong>3日続けると「特別休暇チケット」が1枚もらえます。</strong><br>
        チケットは持ち越せるので、連休も取れます。<br><br>
        チケットがあれば、休んだ翌日に自動で使われてストリークが維持されます。<br>
        <span style="color:var(--ink-lt);">休むまで何枚あるかはわかりません。休んだ日に初めてわかります。</span><br><br>
        <strong>三日坊主、大歓迎。</strong><br>
        休んでも「また始める」ことに意義がある。`,
  ticketCountLabel:'現在のチケット数',ticketCountSub:'休んだ日に自動使用されます',
  secBackup:'バックアップ',
  backupNote:'① 「書き出す」→ ファイルを保存<br>② 復元は「読み込む」→ テキストを貼り付け',
  exportLabel:'エクスポート',btnExport:'書き出す',
  importLabel:'インポート',btnImport:'読み込む',
  toastBackupSaved:'📦 バックアップを保存しました',
  toastExportFailed:'⚠️ エクスポートに失敗しました',
  toastRestored:'✅ データを復元しました！',
  toastRestoreFailed:'⚠️ データの読み込みに失敗しました',
  secReset:'リセット',
  btnResetAll:'⚠️ 全学習データをリセット',
  toastReset:'リセットしました',
  // モーダル
  btnCancel:'キャンセル',
  mReplaceTitle:'⚠️ 語彙を全置換',
  mReplaceSub:'現在の全語彙（学習進捗を除く）が削除され、新しいデータに置き換えられます。この操作は取り消せません。',
  mReplaceOk:'全置換する',
  mImportTitle:'データを読み込む',
  mImportSub:'バックアップのテキストを貼り付けてください',
  mImportPlaceholder:'ここに貼り付け...',
  mImportOk:'読み込む',
  mImportOrLabel:'または',
  btnImportFile:'📁 ファイルを選択',
  mResetTitle:'⚠️ 全データをリセット',
  mResetSub:'全ての学習データが削除されます。この操作は取り消せません。',
  mResetOk:'リセットする',
};},
en:cfg=>{const t=cfg.targetName,n=cfg.nativeName;return{
  // nav
  navHome:'Home',navReport:'Report',navWords:'Words',navSettings:'Settings',
  // dashboard
  ticketBannerTitleShort:'Rest Ticket used!',
  ticketBannerTitle:'🎟️ Rest Ticket used! Streak alive',
  ticketBannerSub:x=>`Left: ${x} ticket(s) ／ Starting again is what counts 🌱`,
  ticketCount:x=>`${x} ticket(s)`,
  ticketUnknown:'? ticket(s)',
  statUnitMastered:'words mastered',statUnitStreak:'day streak',
  sectionProgress:'Progress',
  progKeyMaster:'✓ Mastered',progKeyLearning:'🟡 Learning',progKeyNew:'🔵 New',
  modeFlash:'Flash',modeQuiz:'Quiz',modeSpell:'Spelling',
  startSession:'Start Session →',
  toastAddWords:'⚠️ Please add words first',
  // session common
  tagT2N:`${t} → ${n}`,tagN2T:`${n} → ${t}`,
  titleFlash:x=>`• FLASH CARDS (${x}) •`,
  titleQuiz:x=>`• QUIZ (${x}) •`,
  titleSpell:x=>`• SPELLING (${x}) •`,
  titleRetryFlash:x=>`• RETRY (${x}) •`,
  titleRetryQuiz:x=>`• RETRY QUIZ (${x}) •`,
  titleRetrySpell:x=>`• RETRY SPELLING (${x}) •`,
  remainCards:x=>`Left: ${x}`,remainQs:x=>`Left: ${x}`,
  btnAgain:'Again',btnGotIt:'Got it!',
  flipBtn:'Tap to reveal',
  masteryMastered:'✅ Mastered',
  masteryLearning:m=>`Learning (${m} correct)`,
  masteryNew:'New word',
  confirmEnd:'End this session?',
  // spelling
  spellPlaceholder:`Type the ${t}...`,
  spellNext:'Next →',
  spellCorrect:'✓ Correct!',
  spellWrongAnswer:w=>`✕ Correct: ${w}`,
  // result
  resultHigh:{title:'Excellent!',sub:'Vocabulary is sticking. Keep it up!'},
  resultMid:{title:'Good job!',sub:'Keep cycling through missed words and you\'ll improve fast.'},
  resultLow:{title:'Keep going!',sub:'Every new word is progress. Little by little every day!'},
  missedTitle:'📌 Review these',
  copyBtn:'📋 Copy for Claude',
  retryBtnInit:'Retry missed words',
  retryBtn:x=>`Retry ${x} missed word(s)`,
  backToDash:'Back to Dashboard',
  copyReport:a=>`[${a.appName} Study Report] ${a.date}\n─────────────────\nSession: ${a.ok}/${a.deckLen} (${a.pct}% correct)\n✓ Got it: ${a.ok}  ✕ Again: ${a.ng}\n─────────────────\nOverall: ${a.mc}/${a.total} mastered (${a.mcPct}%)\nStreak: ${a.streak} days 🔥\n${a.missedCount?'\nReview these:\n'+a.missed:'\nPerfect session! 🎉'}`,
  toastCopied:'📋 Copied!',
  // report
  dayLabels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  thisWeek:'This Week',lastWeek:'Last Week',weekRangeSep:' – ',
  prevWeek:'← Prev',nextWeek:'Next →',
  statDays:'days',statSessions:'sessions',statCorrect:'correct',statMastered:'mastered (total)',
  graphTitle:'Correct / Day',
  noDataWeek:'No data for this week',
  // word list
  wlSearchPlaceholder:'Search words...',
  wlFilterAll:'All',wlFilterMaster:'Mastered',wlFilterLearning:'Learning',wlFilterNew:'New',wlFilterExcluded:'Skip',
  sortNumAsc:'Added order',sortNumDesc:'Newest first',sortStatusMaster:'Mastered→New',sortStatusNew:'New→Mastered',
  // ※以下2つと除外トーストは旧chiilingojpで未翻訳（日本語のまま）だった。
  //   挙動維持のため意図的にそのままにしている。英訳するならここを直すだけ。
  wlEmptySearch:q=>`「${q}」に一致する単語はありません`,
  wlEmpty:'単語がありません',
  wiMetaMastered:'Mastered',wiMetaLearning:m=>`${m} correct`,wiMetaNew:'New',
  toastExcluded:'除外しました',toastUnexcluded:'除外を解除しました',
  // settings
  secApp:'App Settings',
  appNameLabel:'App Name',appNameSub:`Prefix for "〇〇${cfg.suffix}"`,
  fontSizeLabel:'Font Size',fontSizeSub:'Per-scope settings. "All" overrides others.',
  fsScopeGlobal:'All',fsScopeCard:'Card',fsScopeChoice:'Choice',fsScopeWl:'Words',fsScopeOther:'Other',
  fsS:'S',fsM:'M',fsL:'L',fsCustom:'Custom',
  secStudy:'Study Settings',
  directionLabel:'Direction',directionSub:'Language shown on front',
  dailyGoalLabel:'Daily Goal',dailyGoalSub:'Shown on the start button',
  sessionSizeLabel:'Session Size',sessionSizeSub:'Words per session',
  autoSpeakLabel:'Auto-speak',autoSpeakSub:'Flash & Quiz (target→native only)',
  optOff:'Off',optOn:'On',
  secAddWords:'Add Words',
  addWordsNote:'Paste JSON data here.<br><span style="color:var(--ink-lt);">IDs are auto-generated. Duplicates will be overwritten.</span>',
  addWordsPlaceholder:'[{"w":"こんにちは","jp":"Hello",...}]',
  btnAddWords:'➕ Add',btnReplaceAll:'Replace All',
  wordsCount:x=>`Total: ${x} words`,
  wordsNone:'(no words yet)',
  importResultLabel:(total,added,updated)=>`✓ Total: ${total} words (added: ${added} / updated: ${updated})`,
  toastImported:(added,updated)=>`✅ ${added?added+' words added ':''}${updated?updated+' words updated':''}`,
  toastEmptyText:'⚠️ Nothing to import',
  toastBadJson:'⚠️ Invalid JSON format',
  toastNeedArray:'⚠️ Please enter an array',
  secTickets:'🎟️ Rest Tickets',
  ticketInfoHtml:`<strong>Study 3 days in a row to earn 1 Rest Ticket.</strong><br>
        Tickets carry over, so you can take multiple days off.<br><br>
        If you have a ticket, it's used automatically the day after you skip, keeping your streak alive.<br>
        <span style="color:var(--ink-lt);">You won't see how many you have until you take a day off.</span><br><br>
        <strong>Three-day quitter? Welcome.</strong><br>
        Starting again is what counts.`,
  ticketCountLabel:'Current Tickets',ticketCountSub:'Used automatically on rest days',
  secBackup:'Backup',
  backupNote:'① Export → Save the file<br>② Restore → Import → Paste text',
  exportLabel:'Export',btnExport:'Export',
  importLabel:'Import',btnImport:'Import',
  toastBackupSaved:'📦 Backup saved',
  toastExportFailed:'⚠️ Export failed',
  toastRestored:'✅ Data restored!',
  toastRestoreFailed:'⚠️ Failed to load data',
  secReset:'Reset',
  btnResetAll:'⚠️ Reset All Learning Data',
  toastReset:'Reset complete',
  // modals
  btnCancel:'Cancel',
  mReplaceTitle:'⚠️ Replace All Words',
  mReplaceSub:'All current words (except progress) will be removed and replaced. This cannot be undone.',
  mReplaceOk:'Replace All',
  mImportTitle:'Import',
  mImportSub:'Paste your backup text here',
  mImportPlaceholder:'Paste here...',
  mImportOk:'Import',
  mImportOrLabel:'or',
  btnImportFile:'📁 Choose File',
  mResetTitle:'⚠️ Reset All Data',
  mResetSub:'All learning data will be permanently deleted. This cannot be undone.',
  mResetOk:'Reset',
};},
};
const T=STRINGS[CFG.uiLang](CFG);

// ============================================================
// 2. 画面HTML（旧 chiilingo.html の <body> をテンプレート化したもの）
// ============================================================
function renderBodyHTML(){return `
<!-- DASHBOARD -->
<div id="dashScreen" class="screen active">
  <div class="nav">
    <button class="nav-btn active" onclick="showTab('dash',this)"><span class="nav-icon">🍎</span>${T.navHome}</button>
    <button class="nav-btn" onclick="showTab('report',this)"><span class="nav-icon">📈</span>${T.navReport}</button>
    <button class="nav-btn" onclick="showTab('wordlist',this)"><span class="nav-icon">📖</span>${T.navWords}</button>
    <button class="nav-btn" onclick="showTab('settings',this)"><span class="nav-icon">⚙️</span>${T.navSettings}</button>
  </div>
  <div class="dash-body">
    <div class="app-title-wrap">
      <div class="title-dot"></div>
      <div class="app-title" id="appTitleLabel">${CFG.prefix}</div>
      <div class="title-dot"></div>
    </div>

    <div class="phrase-card">
      <div class="phrase-header">
        <span class="phrase-label">Phrase of the Day</span>
        <div class="phrase-actions">
          <button class="phrase-icon-btn" id="phraseSpeakBtn" onclick="speakPhrase()">🔊</button>
          <button class="phrase-icon-btn" onclick="renderPhraseOfDay(true)">↺</button>
        </div>
      </div>
      <div class="phrase-word" id="phraseWord">—</div>
      <div class="phrase-jp-word" id="phraseJpWord"></div>
      <div class="phrase-divider"></div>
      <div class="phrase-ex" id="phraseEx"></div>
      <div class="phrase-ex-jp" id="phraseExJp"></div>
    </div>

    <div class="ticket-banner" id="ticketBanner" style="display:none">
      <div class="ticket-emoji">🎟️</div>
      <div class="ticket-text">
        <div class="ticket-title" id="ticketTitle">${T.ticketBannerTitleShort}</div>
        <div class="ticket-sub" id="ticketSub">${T.ticketBannerSub(0)}</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card hl">
        <div class="stat-label">MASTERED ✓</div>
        <div class="stat-val" id="masteredCount">0</div>
        <div class="stat-unit">${T.statUnitMastered}</div>
      </div>
      <div class="stat-card hl-gold">
        <div class="stat-label">STREAK 🔥</div>
        <div class="stat-val" id="streakCount">0</div>
        <div class="stat-unit">${T.statUnitStreak}</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">${T.sectionProgress}</div>
      <div class="prog-row">
        <div class="prog-header"><span class="prog-key">${T.progKeyMaster}</span><span class="prog-num" id="progMasterNum">0/0</span></div>
        <div class="prog-bar"><div class="prog-fill fill-master" id="progMasterFill" style="width:0%"></div></div>
      </div>
      <div class="prog-row" style="margin-top:10px">
        <div class="prog-header"><span class="prog-key">${T.progKeyLearning}</span><span class="prog-num" id="progLearningNum">0/0</span></div>
        <div class="prog-bar"><div class="prog-fill fill-learning" id="progLearningFill" style="width:0%"></div></div>
      </div>
      <div class="prog-row" style="margin-top:10px">
        <div class="prog-header"><span class="prog-key">${T.progKeyNew}</span><span class="prog-num" id="progNewNum">0/0</span></div>
        <div class="prog-bar"><div class="prog-fill fill-new" id="progNewFill" style="width:100%"></div></div>
      </div>
    </div>

    <div class="mode-row">
      <button class="mode-btn selected" id="modeFlash" onclick="selectMode('flash',this)"><span class="mode-icon">📇</span>${T.modeFlash}</button>
      <button class="mode-btn" id="modeQuiz" onclick="selectMode('quiz',this)"><span class="mode-icon">🔤</span>${T.modeQuiz}</button>
      <button class="mode-btn" id="modeSpell" onclick="selectMode('spell',this)"><span class="mode-icon">✏️</span>${T.modeSpell}</button>
    </div>
    <button class="start-btn" id="startSessionBtn" onclick="startSession()">${T.startSession}</button>
  </div>
</div>

<!-- FLASHCARD -->
<div id="fcScreen" class="screen">
  <div class="fc-header">
    <div class="fc-title" id="fcTitle">• FLASH CARDS •</div>
    <button class="fc-close" onclick="endSession()">✕</button>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar-thin"><div class="prog-bar-fill" id="fcProgFill" style="width:0%"></div></div>
    <div class="prog-nums"><span id="fcProgLabel">1/20</span><span id="fcProgRemain">${T.remainCards(20)}</span></div>
  </div>
  <div class="card-area">
    <div class="flashcard" onclick="flipCard()">
      <div class="flashcard-inner" id="cardInner">
        <div class="fc-face fc-front">
          <button class="speak-btn" id="speakBtn" onclick="speakWord(event)">🔊</button>
          <div class="gold-tag" id="fcTag">${T.tagT2N}</div>
          <div class="pip-row" id="masteryPips" style="margin-top:8px;margin-bottom:0;"></div>
          <div class="fc-word-block">
            <div class="word-en" id="wordEn">—</div>
            <div class="word-ph" id="wordPh"></div>
          </div>
          <div class="ex-area-front" id="exAreaFront"><div class="ex-text" id="wordEx"></div></div>
        </div>
        <div class="fc-face fc-back">
          <button class="speak-btn" id="speakBtnBack" onclick="speakWordBack(event)" style="display:none;border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.15);color:white;">🔊</button>
          <div class="gold-tag" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.8);font-size:11px;" id="fcTagBack">${T.tagN2T}</div>
          <div class="pip-row" id="masteryPipsBack" style="margin-top:8px;margin-bottom:0;"></div>
          <div class="fc-back-top">
            <div class="word-jp" id="wordJp">—</div>
            <div class="word-ph" id="wordPhBack" style="color:var(--accent-green);opacity:0.85;"></div>
          </div>
          <div class="ex-area-back">
            <div class="ex-text-back" id="wordExBack"></div>
            <div class="ex-jp-back" id="wordExJpBack"></div>
          </div>
          <div class="mastery-label" id="masteryLabel"></div>
        </div>
      </div>
    </div>
    <div class="btn-stack">
      <button class="flip-btn" id="flipBtn" onclick="flipCard()">${T.flipBtn}</button>
      <div class="action-row" id="actionRow">
        <button class="action-btn btn-ng" onclick="judge(false)">${T.btnAgain}</button>
        <button class="action-btn btn-ok" onclick="judge(true)">${T.btnGotIt}</button>
      </div>
    </div>
    <div class="counter-row">
      <div class="counter"><div class="c-dot c-ok"></div><span id="fcOkCount">0</span> OK</div>
      <div class="counter"><div class="c-dot c-ng"></div><span id="fcNgCount">0</span> ${T.btnAgain}</div>
    </div>
  </div>
</div>

<!-- 4択クイズ -->
<div id="quizScreen" class="screen">
  <div class="fc-header">
    <div class="fc-title" id="quizTitle">• QUIZ •</div>
    <button class="fc-close" onclick="endSession()">✕</button>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar-thin"><div class="prog-bar-fill" id="quizProgFill" style="width:0%"></div></div>
    <div class="prog-nums"><span id="quizProgLabel">1/20</span><span id="quizProgRemain">${T.remainQs(20)}</span></div>
  </div>
  <div class="card-area">
    <div class="quiz-question" style="position:relative;">
      <button class="speak-btn" id="quizSpeakBtn" onclick="speakQuizWord()" style="position:absolute;top:10px;right:10px;">🔊</button>
      <div class="gold-tag" id="quizTag">${T.tagT2N}</div>
      <div class="pip-row" id="quizMasteryPips" style="justify-content:center;margin-top:8px;margin-bottom:0;"></div>
      <div class="fc-word-block">
        <div class="word-en" id="quizWordEn">—</div>
        <div class="word-ph" id="quizWordPh"></div>
      </div>
      <div class="ex-area-front" id="quizExArea" style="display:none;width:100%;height:76px;justify-content:center;"><div class="ex-text" id="quizWordEx"></div></div>
    </div>
    <div class="quiz-choices" id="quizChoices"></div>
    <div class="counter-row">
      <div class="counter"><div class="c-dot c-ok"></div><span id="quizOkCount">0</span> OK</div>
      <div class="counter"><div class="c-dot c-ng"></div><span id="quizNgCount">0</span> ${T.btnAgain}</div>
    </div>
  </div>
</div>

<!-- スペリング -->
<div id="spellScreen" class="screen">
  <div class="fc-header">
    <div class="fc-title" id="spellTitle">• SPELLING •</div>
    <button class="fc-close" onclick="endSession()">✕</button>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar-thin"><div class="prog-bar-fill" id="spellProgFill" style="width:0%"></div></div>
    <div class="prog-nums"><span id="spellProgLabel">1/20</span><span id="spellProgRemain">${T.remainQs(20)}</span></div>
  </div>
  <div class="card-area">
    <div class="quiz-question" style="position:relative;height:300px;">
      <button class="speak-btn" id="spellSpeakBtn" onclick="speakSpell()" style="position:absolute;top:10px;right:10px;">🔊</button>
      <div class="gold-tag">${T.tagN2T}</div>
      <div class="fc-word-block" style="width:100%">
        <div class="pip-row" id="spellMasteryPips" style="justify-content:center;margin-top:8px;margin-bottom:0;"></div>
        <div class="word-jp" id="spellWordJp" style="color:var(--ink);font-size:var(--fs-word-jp);">—</div>
      </div>
      <div class="ex-area-front" id="spellExArea" style="display:none;width:100%;height:76px;justify-content:center;">
        <div class="ex-text" id="spellWordExJp"></div>
      </div>
    </div>

    <!-- 入力欄 -->
    <div style="width:100%;max-width:360px;flex-shrink:0;">
      <div id="spellFeedback" style="min-height:24px;text-align:center;font-size:calc(var(--fs-other) - 1px);font-weight:800;margin-bottom:6px;"></div>
      <div style="display:flex;gap:8px;">
        <input id="spellInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          placeholder="${T.spellPlaceholder}"
          style="flex:1;padding:12px 14px;border:2px solid var(--border);border-radius:14px;font-family:inherit;font-size:var(--fs-other);background:var(--card);color:var(--ink);outline:none;"
          onkeydown="if(event.key==='Enter')submitSpelling()">
        <button onclick="submitSpelling()"
          style="padding:12px 16px;background:var(--gold-lt);border:2px solid var(--border);border-radius:14px;font-family:inherit;font-size:var(--fs-other);font-weight:900;cursor:pointer;">
          →
        </button>
      </div>
      <button id="spellSkipBtn" onclick="skipSpelling()"
        style="display:none;width:100%;margin-top:8px;padding:10px;background:var(--card);border:2px solid var(--border);border-radius:14px;font-family:inherit;font-size:calc(var(--fs-other) - 1px);font-weight:800;color:var(--ink-mid);cursor:pointer;">
        ${T.spellNext}
      </button>
    </div>

    <div class="counter-row">
      <div class="counter"><div class="c-dot c-ok"></div><span id="spellOkCount">0</span> OK</div>
      <div class="counter"><div class="c-dot c-ng"></div><span id="spellNgCount">0</span> ${T.btnAgain}</div>
    </div>
  </div>
</div>

<!-- 結果 -->
<div id="sessResultScreen" class="screen">
  <div class="sess-result">
    <div class="sess-emoji" id="sessEmoji">🎉</div>
    <div class="sess-title" id="sessTitle"></div>
    <div class="sess-score"><span id="sessScoreNum">0</span><span> / <span id="sessScoreTot">0</span></span></div>
    <div class="sess-sub" id="sessSub"></div>
    <div class="missed-box" id="missedBox">
      <div class="missed-section-title">${T.missedTitle}</div>
      <div id="missedList"></div>
    </div>
    <button class="copy-btn" onclick="copyResult()">${T.copyBtn}</button>
    <div class="sess-btns">
      <button class="s-btn s-btn-retry" id="retryBtn" onclick="retryMissed()">${T.retryBtnInit}</button>
      <button class="s-btn s-btn-dash" onclick="goToDash()">${T.backToDash}</button>
    </div>
  </div>
</div>

<!-- 単語一覧 -->
<!-- レポート -->
<div id="reportScreen" class="screen">
  <div class="nav">
    <button class="nav-btn" onclick="showTab('dash',this)"><span class="nav-icon">🍎</span>${T.navHome}</button>
    <button class="nav-btn active" onclick="showTab('report',this)"><span class="nav-icon">📈</span>${T.navReport}</button>
    <button class="nav-btn" onclick="showTab('wordlist',this)"><span class="nav-icon">📖</span>${T.navWords}</button>
    <button class="nav-btn" onclick="showTab('settings',this)"><span class="nav-icon">⚙️</span>${T.navSettings}</button>
  </div>
  <div class="dash-body" id="reportBody"></div>
</div>

<!-- 単語一覧 -->
<div id="wordlistScreen" class="screen">
  <div class="nav">
    <button class="nav-btn" onclick="showTab('dash',this)"><span class="nav-icon">🍎</span>${T.navHome}</button>
    <button class="nav-btn" onclick="showTab('report',this)"><span class="nav-icon">📈</span>${T.navReport}</button>
    <button class="nav-btn active" onclick="showTab('wordlist',this)"><span class="nav-icon">📖</span>${T.navWords}</button>
    <button class="nav-btn" onclick="showTab('settings',this)"><span class="nav-icon">⚙️</span>${T.navSettings}</button>
  </div>
  <div class="wl-body">
    <!-- 検索窓 -->
    <div style="position:relative;margin-bottom:10px;">
      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--ink-lt);pointer-events:none;">🔍</span>
      <input id="wlSearchInput" type="text" placeholder="${T.wlSearchPlaceholder}"
        autocomplete="off" autocorrect="off" autocapitalize="off"
        style="width:100%;padding:10px 12px 10px 36px;border:2px solid var(--border);border-radius:12px;font-family:inherit;font-size:var(--fs-other);background:var(--card);color:var(--ink);outline:none;box-sizing:border-box;"
        oninput="renderWordList()"
        onfocus="this.style.borderColor='var(--card-flip)'"
        onblur="this.style.borderColor='var(--border)'">
      <button id="wlSearchClear" onclick="clearSearch()" style="display:none;position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:none;font-size:16px;cursor:pointer;color:var(--ink-lt);padding:4px;">✕</button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;">
      <div class="wl-filters" style="margin-bottom:0;flex:1;">
        <button class="wl-filter active" data-filter="all" onclick="filterWords(this)">${T.wlFilterAll}</button>
        <button class="wl-filter" data-filter="master" onclick="filterWords(this)"><span class="wf-dot wf-master"></span>${T.wlFilterMaster}</button>
        <button class="wl-filter" data-filter="learning" onclick="filterWords(this)"><span class="wf-dot wf-learning"></span>${T.wlFilterLearning}</button>
        <button class="wl-filter" data-filter="new" onclick="filterWords(this)"><span class="wf-dot wf-new"></span>${T.wlFilterNew}</button>
        <button class="wl-filter" data-filter="excluded" onclick="filterWords(this)">${T.wlFilterExcluded}</button>
      </div>
      <select id="wlSortSelect" onchange="renderWordList()"
        style="flex-shrink:0;padding:5px 8px;border:2px solid var(--border);border-radius:10px;font-family:inherit;font-size:calc(var(--fs-other) - 2px);font-weight:800;background:var(--card);color:var(--ink);cursor:pointer;">
        <option value="num-asc">${T.sortNumAsc}</option>
        <option value="num-desc">${T.sortNumDesc}</option>
        <option value="status-master">${T.sortStatusMaster}</option>
        <option value="status-new">${T.sortStatusNew}</option>
      </select>
    </div>
    <div id="wordListItems"></div>
  </div>
</div>

<!-- 設定 -->
<div id="settingsScreen" class="screen">
  <div class="nav">
    <button class="nav-btn" onclick="showTab('dash',this)"><span class="nav-icon">🍎</span>${T.navHome}</button>
    <button class="nav-btn" onclick="showTab('report',this)"><span class="nav-icon">📈</span>${T.navReport}</button>
    <button class="nav-btn" onclick="showTab('wordlist',this)"><span class="nav-icon">📖</span>${T.navWords}</button>
    <button class="nav-btn active" onclick="showTab('settings',this)"><span class="nav-icon">⚙️</span>${T.navSettings}</button>
  </div>
  <div class="set-body">

    <div class="set-section-title" style="margin-bottom:10px">${T.secApp}</div>
    <div class="set-card">
      <div class="set-row">
        <div><div class="set-label">${T.appNameLabel}</div><div class="set-sub">${T.appNameSub}</div></div>
        <div style="display:flex;align-items:center;gap:2px;">
          <input class="set-input" type="text" id="appNameInput" placeholder="${CFG.appNameDefault}" style="min-width:120px;max-width:160px;text-align:right;" onchange="saveAppName(this.value)">
          <span style="font-size:14px;font-weight:900;color:var(--ink-mid);">${CFG.suffix}</span>
        </div>
      </div>
      <div class="set-row" style="flex-direction:column;align-items:stretch;gap:10px;border-bottom:none;padding-bottom:4px;">
        <div><div class="set-label">${T.fontSizeLabel}</div><div class="set-sub">${T.fontSizeSub}</div></div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="fs-scope-row" id="fs-row-global">
            <div class="fs-scope-label">${T.fsScopeGlobal}</div>
            <div class="fs-selector">
              <button class="fs-btn fs-global-btn" data-scope="global" data-fs="small" onclick="setFontSizeScope('global','small',this)">${T.fsS}</button>
              <button class="fs-btn fs-global-btn active" data-scope="global" data-fs="medium" onclick="setFontSizeScope('global','medium',this)">${T.fsM}</button>
              <button class="fs-btn fs-global-btn" data-scope="global" data-fs="large" onclick="setFontSizeScope('global','large',this)">${T.fsL}</button>
              <button class="fs-btn fs-global-btn" data-scope="global" data-fs="off" onclick="setFontSizeScope('global','off',this)">${T.fsCustom}</button>
            </div>
          </div>
          <div class="fs-scope-row fs-scope-btn" id="fs-row-card">
            <div class="fs-scope-label">${T.fsScopeCard}</div>
            <div class="fs-selector">
              <button class="fs-btn" data-scope="card" data-fs="small" onclick="setFontSizeScope('card','small',this)">${T.fsS}</button>
              <button class="fs-btn active" data-scope="card" data-fs="medium" onclick="setFontSizeScope('card','medium',this)">${T.fsM}</button>
              <button class="fs-btn" data-scope="card" data-fs="large" onclick="setFontSizeScope('card','large',this)">${T.fsL}</button>
            </div>
          </div>
          <div class="fs-scope-row fs-scope-btn" id="fs-row-choice">
            <div class="fs-scope-label">${T.fsScopeChoice}</div>
            <div class="fs-selector">
              <button class="fs-btn" data-scope="choice" data-fs="small" onclick="setFontSizeScope('choice','small',this)">${T.fsS}</button>
              <button class="fs-btn active" data-scope="choice" data-fs="medium" onclick="setFontSizeScope('choice','medium',this)">${T.fsM}</button>
              <button class="fs-btn" data-scope="choice" data-fs="large" onclick="setFontSizeScope('choice','large',this)">${T.fsL}</button>
            </div>
          </div>
          <div class="fs-scope-row fs-scope-btn" id="fs-row-wl">
            <div class="fs-scope-label">${T.fsScopeWl}</div>
            <div class="fs-selector">
              <button class="fs-btn" data-scope="wl" data-fs="small" onclick="setFontSizeScope('wl','small',this)">${T.fsS}</button>
              <button class="fs-btn active" data-scope="wl" data-fs="medium" onclick="setFontSizeScope('wl','medium',this)">${T.fsM}</button>
              <button class="fs-btn" data-scope="wl" data-fs="large" onclick="setFontSizeScope('wl','large',this)">${T.fsL}</button>
            </div>
          </div>
          <div class="fs-scope-row fs-scope-btn" id="fs-row-other">
            <div class="fs-scope-label">${T.fsScopeOther}</div>
            <div class="fs-selector">
              <button class="fs-btn" data-scope="other" data-fs="small" onclick="setFontSizeScope('other','small',this)">${T.fsS}</button>
              <button class="fs-btn active" data-scope="other" data-fs="medium" onclick="setFontSizeScope('other','medium',this)">${T.fsM}</button>
              <button class="fs-btn" data-scope="other" data-fs="large" onclick="setFontSizeScope('other','large',this)">${T.fsL}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="set-section-title" style="margin-bottom:10px">${T.secStudy}</div>
    <div class="set-card">
      <div class="set-row">
        <div><div class="set-label">${T.directionLabel}</div><div class="set-sub">${T.directionSub}</div></div>
        <select class="set-input" id="directionInput" style="min-width:140px;max-width:180px;" onchange="saveSetting('direction',this.value)">
          <option value="en2jp">${T.tagT2N}</option>
          <option value="jp2en">${T.tagN2T}</option>
        </select>
      </div>
      <div class="set-row">
        <div><div class="set-label">${T.dailyGoalLabel}</div><div class="set-sub">${T.dailyGoalSub}</div></div>
        <input class="set-input" type="number" id="dailyGoalInput" min="1" max="200" placeholder="10" onchange="saveSetting('dailyGoal',parseInt(this.value)||10)">
      </div>
      <div class="set-row">
        <div><div class="set-label">${T.sessionSizeLabel}</div><div class="set-sub">${T.sessionSizeSub}</div></div>
        <input class="set-input" type="number" id="sessionSizeInput" min="5" max="100" placeholder="20" onchange="saveSetting('sessionSize',this.value)">
      </div>
      <div class="set-row">
        <div><div class="set-label">${T.autoSpeakLabel}</div><div class="set-sub">${T.autoSpeakSub}</div></div>
        <select class="set-input" id="autoSpeakInput" onchange="saveSetting('autoSpeak',this.value)">
          <option value="off">${T.optOff}</option>
          <option value="on">${T.optOn}</option>
        </select>
      </div>
    </div>

    <div class="set-section-title" style="margin-bottom:10px">${T.secAddWords}</div>
    <div class="set-card">
      <div class="set-note">${T.addWordsNote}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
        <textarea class="modal-textarea" id="wordsImportTextarea" placeholder='${T.addWordsPlaceholder}' style="height:90px;margin-bottom:0;"></textarea>
        <div style="display:flex;gap:8px;">
          <button class="modal-btn modal-btn-primary" style="flex:2;" onclick="importWords('add')">${T.btnAddWords}</button>
          <button class="modal-btn modal-btn-cancel" style="flex:1;" onclick="importWords('reset')">${T.btnReplaceAll}</button>
        </div>
        <div style="font-size:11px;color:var(--ink-lt);font-weight:600;text-align:center;" id="wordsCountLabel"></div>
      </div>
    </div>

    <div class="set-section-title" style="margin-bottom:10px">${T.secTickets}</div>
    <div class="set-card">
      <div class="set-note-hl">
        ${T.ticketInfoHtml}
      </div>
      <div class="set-row">
        <div><div class="set-label">${T.ticketCountLabel}</div><div class="set-sub">${T.ticketCountSub}</div></div>
        <div style="font-size:22px;font-weight:900;color:var(--accent-cobalt);" id="ticketCountDisplay">—</div>
      </div>
    </div>

    <div class="set-section-title" style="margin-bottom:10px">${T.secBackup}</div>
    <div class="set-card">
      <div class="set-note" style="padding-bottom:10px;border-bottom:1.5px dashed var(--bg-deep);margin-bottom:4px;">${T.backupNote}</div>
      <div class="set-row">
        <div><div class="set-label">${T.exportLabel}</div></div>
        <button class="set-input" style="width:auto;padding:6px 14px;cursor:pointer;font-weight:800;" onclick="exportData()">${T.btnExport}</button>
      </div>
      <div class="set-row">
        <div><div class="set-label">${T.importLabel}</div></div>
        <button class="set-input" style="width:auto;padding:6px 14px;cursor:pointer;background:var(--bg);border-color:var(--card-flip);color:var(--card-flip);font-weight:800;" onclick="importData()">${T.btnImport}</button>
      </div>
    </div>

    <div class="set-section-title" style="margin-bottom:10px">${T.secReset}</div>
    <div class="set-card">
      <button class="reset-btn" onclick="confirmReset()">${T.btnResetAll}</button>
    </div>

    <div style="text-align:center;padding:16px 0 8px;font-size:11px;color:var(--ink-lt);font-weight:700;letter-spacing:0.06em;">
      <span id="lastUpdatedLabel">Last updated: ${CORE_VERSION} JST</span><br>
      <span style="margin-top:4px;display:inline-block;">© 2026 CHIi. All rights reserved.</span>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
<!-- 全置換確認 -->
<div class="modal-overlay hidden" id="replaceConfirmModal">
  <div class="modal-box">
    <div class="modal-title">${T.mReplaceTitle}</div>
    <div class="modal-sub">${T.mReplaceSub}</div>
    <div class="modal-btns">
      <button class="modal-btn modal-btn-cancel" onclick="closeModal('replaceConfirmModal')">${T.btnCancel}</button>
      <button class="modal-btn modal-btn-danger" onclick="confirmReplace()">${T.mReplaceOk}</button>
    </div>
  </div>
</div>

<!-- インポートモーダル -->
<div class="modal-overlay hidden" id="importModal">
  <div class="modal-box">
    <div class="modal-title">${T.mImportTitle}</div>
    <div class="modal-sub">${T.mImportSub}</div>
    <textarea class="modal-textarea" id="importTextarea" placeholder="${T.mImportPlaceholder}"></textarea>
    <div style="text-align:center;font-size:11px;color:var(--ink-lt);font-weight:700;margin-bottom:10px;">${T.mImportOrLabel}</div>
    <input type="file" id="importFileInput" accept="application/json,.json" style="display:none" onchange="handleImportFile(event)">
    <button class="modal-btn modal-btn-cancel" style="width:100%;margin-bottom:10px;" onclick="document.getElementById('importFileInput').click()">${T.btnImportFile}</button>
    <div class="modal-btns">
      <button class="modal-btn modal-btn-cancel" onclick="closeModal('importModal')">${T.btnCancel}</button>
      <button class="modal-btn modal-btn-primary" onclick="doImport()">${T.mImportOk}</button>
    </div>
  </div>
</div>

<!-- リセット確認 -->
<div class="modal-overlay hidden" id="resetModal">
  <div class="modal-box">
    <div class="modal-title">${T.mResetTitle}</div>
    <div class="modal-sub">${T.mResetSub}</div>
    <div class="modal-btns">
      <button class="modal-btn modal-btn-cancel" onclick="closeModal('resetModal')">${T.btnCancel}</button>
      <button class="modal-btn modal-btn-danger" onclick="doReset()">${T.mResetOk}</button>
    </div>
  </div>
</div>
`;}
document.body.innerHTML=renderBodyHTML();

// ============================================================
// 3. アプリロジック（旧 chiilingo.html のスクリプト。文字列のみ CFG/T 参照化）
// ============================================================

// PWA: manifest & apple-touch-icon injected in <head>

const LS={progress:CFG.prefix+'_progress',settings:CFG.prefix+'_settings',history:CFG.prefix+'_history',words:CFG.prefix+'_words',tickets:CFG.prefix+'_tickets'};

// 語彙
const WORDS_DEFAULT=[];
function loadWords(){try{const s=localStorage.getItem(LS.words);return s?JSON.parse(s):WORDS_DEFAULT;}catch(e){return WORDS_DEFAULT;}}
function saveWords(a){localStorage.setItem(LS.words,JSON.stringify(a));}
function makeId(w){return w.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,40)+'_'+Date.now().toString(36).slice(-4);}
let WORDS=loadWords();

// 設定
function loadSettings(){const d={sessionSize:20,direction:'en2jp',dailyGoal:10,appName:CFG.appNameDefault,fontSizes:{global:'medium'},autoSpeak:'off'};try{return Object.assign({},d,JSON.parse(localStorage.getItem(LS.settings)));}catch(e){return d;}}
function saveSetting(k,v){const s=loadSettings();s[k]=v;localStorage.setItem(LS.settings,JSON.stringify(s));}
function applyAppTitle(name){
  document.getElementById('appTitleLabel').textContent=name;
  document.getElementById('pageTitle').textContent=name;
  const pwa=document.getElementById('pwaTitle');if(pwa)pwa.setAttribute('content',name);
}
function saveAppName(v){
  const prefix=(v.trim()||CFG.appNameDefault).replace(SUFFIX_RE,'');
  saveSetting('appName',prefix);
  applyAppTitle(prefix+CFG.suffix);
}
function setFontSizeScope(scope,fs,btn){
  const s=loadSettings();
  if(!s.fontSizes)s.fontSizes={};
  s.fontSizes[scope]=fs;
  localStorage.setItem(LS.settings,JSON.stringify(s));
  applyFontSizes(s.fontSizes);
  // ボタンのactive更新
  document.querySelectorAll(`[data-scope="${scope}"]`).forEach(b=>b.classList.toggle('active',b.dataset.fs===fs));
}
function applyFontSizes(sizes){
  if(!sizes)sizes={};
  const global=sizes.global||'medium';
  document.body.classList.remove('global-small','global-medium','global-large','global-lock',
    'card-small','card-large','choice-small','choice-large','wl-small','wl-large','other-small','other-large');
  if(global==='small'){document.body.classList.add('global-small','global-lock');}
  else if(global==='large'){document.body.classList.add('global-large','global-lock');}
  else if(global==='medium'){document.body.classList.add('global-medium','global-lock');}
  else{
    if(sizes.card==='small')document.body.classList.add('card-small');
    if(sizes.card==='large')document.body.classList.add('card-large');
    if(sizes.choice==='small')document.body.classList.add('choice-small');
    if(sizes.choice==='large')document.body.classList.add('choice-large');
    if(sizes.wl==='small')document.body.classList.add('wl-small');
    if(sizes.wl==='large')document.body.classList.add('wl-large');
    if(sizes.other==='small')document.body.classList.add('other-small');
    if(sizes.other==='large')document.body.classList.add('other-large');
  }
}

// ユーティリティ
function localDateStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function loadProgress(){try{return JSON.parse(localStorage.getItem(LS.progress))||{};}catch(e){return {};}}
function saveProgress(p){localStorage.setItem(LS.progress,JSON.stringify(p));}
function loadHistory(){try{return JSON.parse(localStorage.getItem(LS.history))||[];}catch(e){return [];}}
function addHistory(e){const h=loadHistory();h.push(e);localStorage.setItem(LS.history,JSON.stringify(h.slice(-400)));}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function getMastery(id,p){return(p[id]&&p[id].correct)||0;}
function getStatus(id,p){const m=getMastery(id,p);if(m>=5)return'master';if(m>=1)return'learning';return'new';}
function calcSessionSize(){return parseInt(loadSettings().sessionSize)||20;}
function recordResult(q,isCorrect,prog){
  if(!prog[q.id])prog[q.id]={correct:0,wrong:0,lastSeen:null};
  if(isCorrect){prog[q.id].correct++;}
  else{if(prog[q.id].correct>=5)prog[q.id].correct=3;prog[q.id].wrong++;}
  prog[q.id].lastSeen=localDateStr();
  saveProgress(prog);
}

// ストリーク
function getStreak(){
  const studyDates=new Set(loadHistory().map(e=>e.date));
  const td=loadTicketData();
  const usedDates=new Set(td.usedDates||[]);
  // 学習日＋チケット使用日の両方を有効な日として扱う
  const allDates=new Set([...studyDates,...usedDates]);
  const today=localDateStr();
  const c=new Date();c.setHours(0,0,0,0);
  // 今日未学習かつ未チケットなら昨日から遡る
  if(!allDates.has(today))c.setDate(c.getDate()-1);
  let s=0;
  for(let i=0;i<366;i++){
    const ds=`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,'0')}-${String(c.getDate()).padStart(2,'0')}`;
    if(allDates.has(ds)){
      if(studyDates.has(ds))s++;
      c.setDate(c.getDate()-1);
    }else break;
  }
  return s;
}

// 特別休暇チケット
function getTotalStudyDays(){return new Set(loadHistory().map(e=>e.date)).size;}
function loadTicketData(){
  try{
    const d=JSON.parse(localStorage.getItem(LS.tickets))||{used:0,lastUsedDate:null,usedDates:[]};
    if(!d.usedDates)d.usedDates=[];
    return d;
  }catch(e){return{used:0,lastUsedDate:null,usedDates:[]};}
}function saveTicketData(d){localStorage.setItem(LS.tickets,JSON.stringify(d));}
function calcTotalTickets(){return Math.floor(getTotalStudyDays()/3);}
function calcRemainingTickets(){return Math.max(0,calcTotalTickets()-loadTicketData().used);}

function checkAndUseTicket(){
  const studyDates=new Set(loadHistory().map(e=>e.date));
  const td=loadTicketData();
  if(!td.usedDates)td.usedDates=[];
  const allDates=new Set([...studyDates,...td.usedDates]);

  const totalTickets=calcTotalTickets();
  let localUsed=td.used;
  let changed=false;
  const c=new Date();c.setHours(0,0,0,0);c.setDate(c.getDate()-1);

  for(let i=0;i<30;i++){
    const ds=`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,'0')}-${String(c.getDate()).padStart(2,'0')}`;

    if(studyDates.has(ds)){
      // 実際に学習した日に到達 → ここで終了（これより前は触らない）
      break;
    }

    if(allDates.has(ds)){
      // チケット使用済みの日 → スキップして前へ
      c.setDate(c.getDate()-1);
      continue;
    }

    // 穴を発見 → チケットで埋める
    const remaining=Math.max(0,totalTickets-localUsed);
    if(remaining>0){
      localUsed++;
      td.used=localUsed;
      if(!td.usedDates.includes(ds))td.usedDates.push(ds);
      allDates.add(ds);
      td.lastUsedDate=ds;
      changed=true;
      c.setDate(c.getDate()-1);
    }else{
      break;
    }
  }
  if(changed)saveTicketData(td);
  return changed;
}

function getTicketDisplay(){
  const today=localDateStr();
  const dates=new Set(loadHistory().map(e=>e.date));
  const td=loadTicketData();
  // 今日チケット使用中（休んでいる）→ 実数表示
  if(td.lastUsedDate===today&&!dates.has(today))return T.ticketCount(calcRemainingTickets());
  // それ以外（学習済み or まだ休んでいない）→ ?枚
  return T.ticketUnknown;
}

function showTicketBanner(){
  const banner=document.getElementById('ticketBanner');
  const td=loadTicketData();
  if(td.lastUsedDate===localDateStr()){
    banner.style.display='flex';
    document.getElementById('ticketTitle').textContent=T.ticketBannerTitle;
    document.getElementById('ticketSub').textContent=T.ticketBannerSub(calcRemainingTickets());
  }else{banner.style.display='none';}
}

// デッキ構築
function buildSessionDeck(prog){
  const goal=calcSessionSize();
  const excl=new Set(Object.keys(prog).filter(id=>prog[id]&&prog[id].excluded));
  const sorted=[...WORDS].filter(w=>!excl.has(w.id)).sort((a,b)=>a.num-b.num);
  const early=sorted.filter(w=>{const m=getMastery(w.id,prog);return m>=1&&m<=2;});
  const late=sorted.filter(w=>{const m=getMastery(w.id,prog);return m>=3&&m<=4;});
  const nw=sorted.filter(w=>getStatus(w.id,prog)==='new');
  const master=sorted.filter(w=>getStatus(w.id,prog)==='master');
  // 割合計算（1枚未満になるカテゴリは省略）
  const nN=Math.round(goal*0.5);
  const nE=Math.round(goal*0.3);
  const nL=Math.round(goal*0.1);
  const nM=Math.round(goal*0.1);
  let deck=[];
  if(nN>=1)deck.push(...nw.slice(0,nN));
  if(nE>=1)deck.push(...early.slice(0,nE));
  if(nL>=1)deck.push(...late.slice(0,nL));
  if(nM>=1)deck.push(...shuffle(master).slice(0,nM));
  // 足りない場合は新語→学習中の順で補充
  if(deck.length<goal){
    const used=new Set(deck.map(w=>w.id));
    const fill=[...nw,...early,...late].filter(w=>!used.has(w.id));
    deck.push(...fill.slice(0,goal-deck.length));
  }
  if(!deck.length)deck=sorted.slice(0,goal);
  return shuffle(deck).slice(0,goal);
}

// Phrase of the Day
function renderPhraseOfDay(random=false){
  if(!WORDS.length){document.getElementById('phraseWord').textContent='add words';document.getElementById('phraseJpWord').textContent='and expressions';['phraseEx','phraseExJp'].forEach(id=>{document.getElementById(id).textContent='';document.getElementById(id).style.display='none';});return;}
  const w=random?WORDS[Math.floor(Math.random()*WORDS.length)]:WORDS[(()=>{const t=new Date();return(t.getFullYear()*10000+(t.getMonth()+1)*100+t.getDate())%WORDS.length;})()];
  document.getElementById('phraseWord').textContent=w.w||'—';
  document.getElementById('phraseJpWord').textContent=w.jp||'';
  document.getElementById('phraseEx').textContent=w.ex||'';
  document.getElementById('phraseEx').style.display=w.ex?'':'none';
  document.getElementById('phraseExJp').textContent=w.exJp||'';
  document.getElementById('phraseExJp').style.display=w.exJp?'':'none';
  document.getElementById('phraseSpeakBtn')._word=w.w;
}
function speakPhrase(){speakEn(document.getElementById('phraseSpeakBtn')._word||'');}

// TTS
let _ttsTimeout=null;
function speakEn(text){
  if(!text||typeof speechSynthesis==='undefined')return;
  if(_ttsTimeout){clearTimeout(_ttsTimeout);}
  speechSynthesis.cancel();
  const doSpeak=()=>{
    // C: 直前のキャンセルが完了していない場合に再キャンセル
    if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=CFG.ttsLang;u.rate=0.85;u.pitch=1;u.volume=1;
    const voices=speechSynthesis.getVoices();
    const v=(CFG.ttsVoice?voices.find(v=>v.lang===CFG.ttsLang&&v.name.includes(CFG.ttsVoice)):null)
      ||voices.find(v=>v.lang===CFG.ttsLang)
      ||voices.find(v=>v.lang.startsWith(CFG.ttsLang.slice(0,2)))
      ||voices[0];
    if(v)u.voice=v;
    speechSynthesis.speak(u);
  };
  // cancel後に少し待ってからspeak（Android対策）
  _ttsTimeout=setTimeout(()=>{
    const voices=speechSynthesis.getVoices();
    if(voices.length>0){doSpeak();}
    else{
      // A: addEventListener を使い、初期化側の onvoiceschanged を上書きしない
      const onVC=()=>{speechSynthesis.removeEventListener('voiceschanged',onVC);doSpeak();};
      speechSynthesis.addEventListener('voiceschanged',onVC);
    }
  },100);
}

// ダッシュボード
function updateDash(){
  const prog=loadProgress();const s=loadSettings();const total=WORDS.length;
  // チケットデータの整合性チェック：学習開始日より前のusedDatesを除去
  const td=loadTicketData();
  if(td.usedDates&&td.usedDates.length>0){
    const studyDates=new Set(loadHistory().map(e=>e.date));
    const minStudyDate=loadHistory().reduce((min,e)=>e.date<min?e.date:min,'9999-99-99');
    const cleaned=td.usedDates.filter(d=>d>=minStudyDate);
    if(cleaned.length!==td.usedDates.length){
      td.usedDates=cleaned;td.used=cleaned.length;
      saveTicketData(td);
    }
  }
  const mc=WORDS.filter(w=>getStatus(w.id,prog)==='master').length;
  const lc=WORDS.filter(w=>getStatus(w.id,prog)==='learning').length;
  const nc=WORDS.filter(w=>getStatus(w.id,prog)==='new').length;
  checkAndUseTicket();
  document.getElementById('masteredCount').textContent=mc;
  document.getElementById('streakCount').textContent=getStreak();
  document.getElementById('progMasterNum').textContent=`${mc}/${total}`;
  document.getElementById('progLearningNum').textContent=`${lc}/${total}`;
  document.getElementById('progNewNum').textContent=`${nc}/${total}`;
  document.getElementById('progMasterFill').style.width=`${total?Math.round(mc/total*100):0}%`;
  document.getElementById('progLearningFill').style.width=`${total?Math.round(lc/total*100):0}%`;
  document.getElementById('progNewFill').style.width=`${total?Math.round(nc/total*100):100}%`;
  document.getElementById('startSessionBtn').textContent=T.startSession;
  applyAppTitle((s.appName||CFG.appNameDefault).replace(SUFFIX_RE,'')+CFG.suffix);
  showTicketBanner();
  renderPhraseOfDay();
}

// セッション
let sessionMode='flash';
function selectMode(mode,btn){sessionMode=mode;document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');}
let sessionDeck=[],sessionCurrent=0,sessionOk=0,sessionNg=0,sessionMissed=[];
let isFlipped=false;
let quizCurrent=0,quizOk=0,quizNg=0,quizMissed=[],quizAnswered=false;

function startSession(){
  if(!WORDS.length){showToast(T.toastAddWords);return;}
  const prog=loadProgress();
  sessionDeck=buildSessionDeck(prog);
  sessionCurrent=0;sessionOk=0;sessionNg=0;sessionMissed=[];
  if(sessionMode==='quiz'){
    quizCurrent=0;quizOk=0;quizNg=0;quizMissed=[];
    document.getElementById('quizTitle').textContent=T.titleQuiz(sessionDeck.length);
    showScreen('quizScreen');renderQuiz();
  }else if(sessionMode==='spell'){
    spellCurrent=0;spellOk=0;spellNg=0;spellMissed=[];spellAnswered=false;
    document.getElementById('spellTitle').textContent=T.titleSpell(sessionDeck.length);
    showScreen('spellScreen');renderSpell();
  }else{
    document.getElementById('fcTitle').textContent=T.titleFlash(sessionDeck.length);
    showScreen('fcScreen');renderFC();
  }
}

function makePips(cid,mastery,isBack){
  const c=document.getElementById(cid);if(!c)return;c.innerHTML='';
  for(let i=0;i<5;i++){const d=document.createElement('div');d.className='pip'+(i<mastery?' filled':'')+(isBack?'':' pip-front');c.appendChild(d);}
}

function renderFC(){
  isFlipped=false;
  document.getElementById('cardInner').classList.remove('flipped');
  document.getElementById('flipBtn').classList.remove('hidden');
  document.getElementById('actionRow').classList.remove('show');
  const q=sessionDeck[sessionCurrent];
  const prog=loadProgress();const mastery=getMastery(q.id,prog);
  makePips('masteryPips',mastery,false);makePips('masteryPipsBack',mastery,true);
  const s=loadSettings();const isJp2En=s.direction==='jp2en';
  // 前面
  document.getElementById('fcTag').textContent=isJp2En?T.tagN2T:T.tagT2N;
  document.getElementById('wordEn').textContent=isJp2En?q.jp:q.w;
  document.getElementById('wordPh').textContent=isJp2En?'':(q.ph||'');
  // en2jpかつautoSpeakオンのとき、前面表示と同時に読み上げ（B: 500ms）
  if(!isJp2En && s.autoSpeak==='on'){
    setTimeout(()=>speakEn(q.w), 500);
  }
  const sb=document.getElementById('speakBtn');
  sb.style.display=isJp2En?'none':'flex';sb.classList.remove('speaking');sb.textContent='🔊';sb._word=q.w;
  const sbBack=document.getElementById('speakBtnBack');
  sbBack.style.display=isJp2En?'flex':'none';sbBack.classList.remove('speaking');sbBack.textContent='🔊';sbBack._word=q.w;
  // 前面例文
  const ft=isJp2En?(q.exJp||''):(q.ex||'');
  document.getElementById('wordEx').textContent=ft;
  document.getElementById('exAreaFront').style.display=ft?'':'none';
  // 裏面
  document.getElementById('wordJp').textContent=isJp2En?q.w:q.jp;
  document.getElementById('wordPhBack').textContent=q.ph||'';
  document.getElementById('wordExBack').textContent=q.ex||'';
  document.getElementById('wordExJpBack').textContent=q.exJp||'';
  document.getElementById('masteryLabel').textContent=mastery>=3?T.masteryMastered:mastery>=1?T.masteryLearning(mastery):T.masteryNew;
  const total=sessionDeck.length;
  document.getElementById('fcProgFill').style.width=`${Math.round(sessionCurrent/total*100)}%`;
  document.getElementById('fcProgLabel').textContent=`${sessionCurrent+1}/${total}`;
  document.getElementById('fcProgRemain').textContent=T.remainCards(total-sessionCurrent);
  document.getElementById('fcOkCount').textContent=sessionOk;
  document.getElementById('fcNgCount').textContent=sessionNg;
}

function speakWordBack(e){
  e.stopPropagation();
  const btn=document.getElementById('speakBtnBack');
  btn.classList.add('speaking');btn.textContent='🔉';
  speakEn(btn._word||'');
  setTimeout(()=>{btn.classList.remove('speaking');btn.textContent='🔊';},1500);
}
function flipCard(){
  if(isFlipped)return;isFlipped=true;
  document.getElementById('cardInner').classList.add('flipped');
  document.getElementById('flipBtn').classList.add('hidden');
  document.getElementById('actionRow').classList.add('show');
  // jp2enかつautoSpeakオンのとき、裏面（英語面）が出たタイミングで読み上げ（B: 500ms）
  const s=loadSettings();
  if(s.direction==='jp2en' && s.autoSpeak==='on'){
    const word=document.getElementById('speakBtnBack')._word||'';
    setTimeout(()=>speakEn(word), 500);
  }
}

function judge(isOk){
  if(!isFlipped)return;
  const q=sessionDeck[sessionCurrent];const prog=loadProgress();
  if(isOk){sessionOk++;}else{sessionNg++;sessionMissed.push(q);}
  recordResult(q,isOk,prog);sessionCurrent++;
  document.getElementById('cardInner').classList.remove('flipped');document.getElementById('actionRow').classList.remove('show');
  if(sessionCurrent>=sessionDeck.length){setTimeout(()=>finishSession(),450);}else{setTimeout(()=>renderFC(),450);}
}

function speakWord(e){
  e.stopPropagation();
  const btn=document.getElementById('speakBtn');
  btn.classList.add('speaking');btn.textContent='🔉';
  speakEn(btn._word||'');
  setTimeout(()=>{btn.classList.remove('speaking');btn.textContent='🔊';},1500);
}

// クイズ
function renderQuiz(){
  quizAnswered=false;
  const container=document.getElementById('quizChoices');
  container.innerHTML='';
  container.style.visibility='visible'; // 必ずvisibleに戻す
  const q=sessionDeck[quizCurrent];const prog=loadProgress();const mastery=getMastery(q.id,prog);
  makePips('quizMasteryPips',mastery,false);
  const s=loadSettings();const isJp2En=s.direction==='jp2en';
  document.getElementById('quizTag').textContent=isJp2En?T.tagN2T:T.tagT2N;
  document.getElementById('quizWordEn').textContent=isJp2En?q.jp:q.w;
  document.getElementById('quizWordPh').textContent=isJp2En?'':(q.ph||'');
  const qsb=document.getElementById('quizSpeakBtn');qsb.style.display=isJp2En?'none':'block';qsb._word=q.w;
  // en2jpかつautoSpeakオンのとき読み上げ（B: 500ms）
  if(!isJp2En && s.autoSpeak==='on'){
    setTimeout(()=>speakEn(q.w), 500);
  }
  const ft=isJp2En?(q.exJp||''):(q.ex||'');
  const qa=document.getElementById('quizExArea');
  if(ft){document.getElementById('quizWordEx').textContent=ft;qa.style.visibility='';qa.style.display='';}
  else{qa.style.display='';qa.style.visibility='hidden';}
  const total=sessionDeck.length;
  document.getElementById('quizProgFill').style.width=`${Math.round(quizCurrent/total*100)}%`;
  document.getElementById('quizProgLabel').textContent=`${quizCurrent+1}/${total}`;
  document.getElementById('quizProgRemain').textContent=T.remainQs(total-quizCurrent);
  document.getElementById('quizOkCount').textContent=quizOk;document.getElementById('quizNgCount').textContent=quizNg;
  // ダミー候補：WORDS → sessionDeck の順で補充
  const pool=[];const usedIds=new Set([q.id]);
  shuffle(WORDS.filter(w=>w.id!==q.id)).forEach(w=>{if(pool.length<3&&!usedIds.has(w.id)){pool.push(w);usedIds.add(w.id);}});
  if(pool.length<3){shuffle(sessionDeck.filter(w=>w.id!==q.id)).forEach(w=>{if(pool.length<3&&!usedIds.has(w.id)){pool.push(w);usedIds.add(w.id);}});}
  const choices=shuffle([q,...pool]);
  choices.forEach((c,i)=>{
    const btn=document.createElement('button');btn.className='quiz-choice';
    btn.innerHTML=`<span class="quiz-num">${i+1}</span>${isJp2En?c.w:c.jp}`;
    btn.onclick=()=>selectQuizAnswer(btn,c.id===q.id,q);container.appendChild(btn);
  });
}

function selectQuizAnswer(btn,isCorrect,q){
  if(quizAnswered)return;quizAnswered=true;
  const prog=loadProgress();const s=loadSettings();
  if(isCorrect){quizOk++;}else{quizNg++;quizMissed.push(q);}
  recordResult(q,isCorrect,prog);
  document.querySelectorAll('.quiz-choice').forEach(b=>b.disabled=true);
  btn.classList.add(isCorrect?'correct':'wrong');
  if(!isCorrect){
    const ans=s.direction==='jp2en'?q.w:q.jp;
    document.querySelectorAll('.quiz-choice').forEach(b=>{if(b.textContent.slice(1).trim()===ans)b.classList.add('correct');});
  }
  document.getElementById('quizOkCount').textContent=quizOk;document.getElementById('quizNgCount').textContent=quizNg;
  // jp2enかつautoSpeakオンのとき、回答後に正解（英語）を読み上げ
  if(s.direction==='jp2en' && s.autoSpeak==='on'){
    setTimeout(()=>speakEn(q.w), 200);
  }
  setTimeout(()=>{
    quizCurrent++;
    if(quizCurrent>=sessionDeck.length){
      addHistory({date:localDateStr(),correct:quizOk,wrong:quizNg,total:sessionDeck.length});
      sessionOk=quizOk;sessionNg=quizNg;sessionMissed=quizMissed;finishSession();
    }else{
      renderQuiz(); // visibility はrenderQuiz冒頭で復元
    }
  },600);
}
function speakQuizWord(){speakEn(document.getElementById('quizSpeakBtn')._word||'');}

// ══ レポート ══
function getWeekDates(weekOffset=0){
  const today=new Date();today.setHours(0,0,0,0);
  const dow=today.getDay();
  const monday=new Date(today);monday.setDate(today.getDate()-(dow===0?6:dow-1)+weekOffset*7);
  const days=[];
  for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(monday.getDate()+i);days.push(d);}
  return days;
}
function dateStr(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function renderReport(weekOffset=0){
  const body=document.getElementById('reportBody');
  const hist=loadHistory();
  const prog=loadProgress();
  const days=getWeekDates(weekOffset);
  const todayStr=localDateStr();
  const weekStrs=new Set(days.map(d=>dateStr(d)));
  const weekHist=hist.filter(e=>weekStrs.has(e.date));
  // 集計
  const studiedDays=new Set(weekHist.map(e=>e.date)).size;
  const totalSessions=weekHist.length;
  const totalCorrect=weekHist.reduce((s,e)=>s+(e.correct||0),0);
  const masteredCount=WORDS.filter(w=>getMastery(w.id,prog)>=5).length;
  // 曜日別正解数
  const DAY_LABELS=T.dayLabels;
  const dayData=days.map(d=>{
    const ds=dateStr(d);
    const entries=weekHist.filter(e=>e.date===ds);
    return entries.reduce((s,e)=>s+(e.correct||0),0);
  });
  const maxVal=Math.max(...dayData,1);
  const fmt=d=>(d.getMonth()+1)+'/'+d.getDate();
  const isThisWeek=weekOffset===0;
  const isLastWeek=weekOffset===-1;
  const weekLabel=isThisWeek?T.thisWeek:isLastWeek?T.lastWeek:fmt(days[0])+T.weekRangeSep+fmt(days[6]);
  const canPrev=weekOffset>=-1;  // 先々週(-2)まで遡れる。それ以上は表示しない
  const canNext=weekOffset<0;

  // 棒グラフHTML
  let barsHtml='';
  for(let i=0;i<7;i++){
    const val=dayData[i];
    const ds=dateStr(days[i]);
    const isToday=ds===todayStr;
    const pct=Math.round(val/maxVal*100);
    const fillClass='report-bar-fill'+(isToday?' today':'')+(val===0?' empty':'');
    const fillH=val>0?pct+'%':'0%';
    const minH=val>0?'4px':'0';
    const labelColor=isToday?'var(--accent-cobalt)':'var(--ink-lt)';
    barsHtml+='<div class="report-bar-wrap">';
    barsHtml+='<div class="report-bar-val">'+(val||'')+'</div>';
    barsHtml+='<div class="report-bar-bg"><div class="'+fillClass+'" style="height:'+fillH+';min-height:'+minH+';"></div></div>';
    barsHtml+='<div class="report-bar-label" style="color:'+labelColor+';">'+DAY_LABELS[i]+'</div>';
    barsHtml+='</div>';
  }

  const prevColor=canPrev?'var(--ink-mid)':'var(--ink-lt)';
  const nextColor=canNext?'var(--ink-mid)':'var(--ink-lt)';
  const prevCursor=canPrev?'pointer':'default';
  const nextCursor=canNext?'pointer':'default';
  const noData=studiedDays===0?'<div class="report-no-data">'+T.noDataWeek+'</div>':'';

  body.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'+
      '<button onclick="renderReport('+(weekOffset-1)+')" style="padding:6px 14px;border:2px solid var(--border);border-radius:99px;background:var(--card);font-family:inherit;font-size:calc(var(--fs-other) - 2px);font-weight:900;color:'+prevColor+';cursor:'+prevCursor+';">'+T.prevWeek+'</button>'+
      '<div style="font-size:var(--fs-other);font-weight:900;color:var(--ink);">'+weekLabel+'</div>'+
      '<button onclick="renderReport('+(weekOffset+1)+')" style="padding:6px 14px;border:2px solid var(--border);border-radius:99px;background:var(--card);font-family:inherit;font-size:calc(var(--fs-other) - 2px);font-weight:900;color:'+nextColor+';cursor:'+nextCursor+';">'+T.nextWeek+'</button>'+
    '</div>'+
    '<div class="report-stat-row">'+
      '<div class="report-stat hl"><div class="report-stat-label">DAYS STUDIED</div><div class="report-stat-val">'+studiedDays+'<span style="font-size:calc(var(--fs-other) - 2px);opacity:0.7;"> / 7</span></div><div class="report-stat-unit">'+T.statDays+'</div></div>'+
      '<div class="report-stat hl4"><div class="report-stat-label">SESSIONS</div><div class="report-stat-val">'+totalSessions+'</div><div class="report-stat-unit">'+T.statSessions+'</div></div>'+
      '<div class="report-stat hl3"><div class="report-stat-label">CORRECT</div><div class="report-stat-val">'+totalCorrect+'</div><div class="report-stat-unit">'+T.statCorrect+'</div></div>'+
      '<div class="report-stat hl2"><div class="report-stat-label">MASTERED</div><div class="report-stat-val">'+masteredCount+'</div><div class="report-stat-unit">'+T.statMastered+'</div></div>'+
    '</div>'+
    '<div class="report-graph-card">'+
      '<div class="report-graph-title">'+T.graphTitle+'</div>'+
      '<div class="report-bars">'+barsHtml+'</div>'+
    '</div>'+
    noData;
}
let spellCurrent=0,spellOk=0,spellNg=0,spellMissed=[],spellAnswered=false;

function speakSpell(){
  const btn=document.getElementById('spellSpeakBtn');
  btn.classList.add('speaking');btn.textContent='🔉';
  speakEn(btn._word||'');
  setTimeout(()=>{btn.classList.remove('speaking');btn.textContent='🔊';},1500);
}
function normalizeSpell(s){
  return s.toLowerCase().replace(/[\s\-''\u2019]/g,'');
}

function renderSpell(){
  spellAnswered=false;
  const inp=document.getElementById('spellInput');
  inp.value='';inp.className='';inp.disabled=false;
  document.getElementById('spellFeedback').textContent='';
  document.getElementById('spellFeedback').style.color='';
  document.getElementById('spellSkipBtn').style.display='none';

  const q=sessionDeck[spellCurrent];
  const prog=loadProgress();
  const mastery=getMastery(q.id,prog);
  makePips('spellMasteryPips',mastery,false);

  document.getElementById('spellWordJp').textContent=q.jp||'—';
  const spellBtn=document.getElementById('spellSpeakBtn');
  spellBtn._word=q.w;spellBtn.classList.remove('speaking');spellBtn.textContent='🔊';
  const exJp=q.exJp||'';
  const ea=document.getElementById('spellExArea');
  if(exJp){document.getElementById('spellWordExJp').textContent=exJp;ea.style.display='';}
  else{ea.style.display='none';}

  const total=sessionDeck.length;
  document.getElementById('spellProgFill').style.width=`${Math.round(spellCurrent/total*100)}%`;
  document.getElementById('spellProgLabel').textContent=`${spellCurrent+1}/${total}`;
  document.getElementById('spellProgRemain').textContent=T.remainQs(total-spellCurrent);
  document.getElementById('spellOkCount').textContent=spellOk;
  document.getElementById('spellNgCount').textContent=spellNg;

  setTimeout(()=>inp.focus(),100);
}

function submitSpelling(){
  if(spellAnswered)return;
  const inp=document.getElementById('spellInput');
  const q=sessionDeck[spellCurrent];
  const answer=inp.value.trim();
  if(!answer)return;

  const isCorrect=normalizeSpell(answer)===normalizeSpell(q.w);
  spellAnswered=true;
  const prog=loadProgress();
  if(isCorrect){spellOk++;}else{spellNg++;spellMissed.push(q);}
  recordResult(q,isCorrect,prog);
  if(isCorrect){
    inp.className='correct';
    document.getElementById('spellFeedback').textContent=T.spellCorrect;
    document.getElementById('spellFeedback').style.color='var(--correct)';
    document.getElementById('spellOkCount').textContent=spellOk;
    setTimeout(()=>advanceSpell(),700);
  }else{
    inp.className='wrong';
    inp.disabled=true;
    document.getElementById('spellFeedback').textContent=T.spellWrongAnswer(q.w);
    document.getElementById('spellFeedback').style.color='var(--wrong)';
    document.getElementById('spellSkipBtn').style.display='block';
    document.getElementById('spellNgCount').textContent=spellNg;
  }
}

function skipSpelling(){
  advanceSpell();
}

function advanceSpell(){
  spellCurrent++;
  if(spellCurrent>=sessionDeck.length){
    addHistory({date:localDateStr(),correct:spellOk,wrong:spellNg,total:sessionDeck.length});
    sessionOk=spellOk;sessionNg=spellNg;sessionMissed=spellMissed;
    finishSession();
  }else{
    renderSpell();
  }
}

// 終了
function finishSession(){
  if(sessionMode==='flash')addHistory({date:localDateStr(),correct:sessionOk,wrong:sessionNg,total:sessionDeck.length});
  // セッション完了時にもチケット処理（今日の記録追加後に実行）
  checkAndUseTicket();
  const total=sessionDeck.length;const pct=total>0?sessionOk/total:0;
  let emoji,title,sub;
  if(pct>=0.85){emoji='🌟';title=T.resultHigh.title;sub=T.resultHigh.sub;}
  else if(pct>=0.6){emoji='📚';title=T.resultMid.title;sub=T.resultMid.sub;}
  else{emoji='🌱';title=T.resultLow.title;sub=T.resultLow.sub;}
  document.getElementById('sessEmoji').textContent=emoji;document.getElementById('sessTitle').textContent=title;
  document.getElementById('sessScoreNum').textContent=sessionOk;document.getElementById('sessScoreTot').textContent=total;
  document.getElementById('sessSub').textContent=sub;
  const ml=document.getElementById('missedList');ml.innerHTML='';const rb=document.getElementById('retryBtn');
  if(!sessionMissed.length){document.getElementById('missedBox').style.display='none';rb.style.display='none';}
  else{
    document.getElementById('missedBox').style.display='block';rb.style.display='block';
    rb.textContent=T.retryBtn(sessionMissed.length);
    sessionMissed.forEach(w=>{const d=document.createElement('div');d.className='missed-item';d.innerHTML=`<div class="missed-en">${w.w}</div><div class="missed-jp">${w.jp}</div>`;ml.appendChild(d);});
  }
  showScreen('sessResultScreen');
}

function retryMissed(){
  sessionDeck=shuffle([...sessionMissed]);sessionCurrent=0;sessionOk=0;sessionNg=0;sessionMissed=[];
  quizCurrent=0;quizOk=0;quizNg=0;quizMissed=[];
  if(sessionMode==='quiz'&&WORDS.length>=4){document.getElementById('quizTitle').textContent=T.titleRetryQuiz(sessionDeck.length);showScreen('quizScreen');renderQuiz();}
  else if(sessionMode==='spell'){
    spellCurrent=0;spellOk=0;spellNg=0;spellMissed=[];spellAnswered=false;
    document.getElementById('spellTitle').textContent=T.titleRetrySpell(sessionDeck.length);
    showScreen('spellScreen');renderSpell();
  }else{document.getElementById('fcTitle').textContent=T.titleRetryFlash(sessionDeck.length);showScreen('fcScreen');renderFC();}
}

function copyResult(){
  const prog=loadProgress();const total=WORDS.length;const mc=WORDS.filter(w=>getStatus(w.id,prog)==='master').length;
  const date=new Date().toLocaleDateString(CFG.dateLocale,{month:'long',day:'numeric'});
  const missed=sessionMissed.map(w=>`  ✕ ${w.w}（${w.jp}）`).join('\n');
  const appName=(loadSettings().appName||CFG.appNameDefault).replace(SUFFIX_RE,'')+CFG.suffix;
  const text=T.copyReport({appName,date,ok:sessionOk,deckLen:sessionDeck.length,pct:sessionDeck.length?Math.round(sessionOk/sessionDeck.length*100):0,ng:sessionNg,mc,total,mcPct:total?Math.round(mc/total*100):0,streak:getStreak(),missedCount:sessionMissed.length,missed});
  navigator.clipboard.writeText(text).catch(()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);});
  showToast(T.toastCopied);
}
function goToDash(){updateDash();showScreen('dashScreen');}
function endSession(){if(confirm(T.confirmEnd))goToDash();}

// 単語一覧
let currentFilter='all';
function renderWordList(){
  const prog=loadProgress();
  const query=(document.getElementById('wlSearchInput')?.value||'').trim().toLowerCase();
  // クリアボタンの表示制御
  const clearBtn=document.getElementById('wlSearchClear');
  if(clearBtn)clearBtn.style.display=query?'block':'none';

  const filtered=WORDS.filter(w=>{
    // ステータスフィルター
    if(currentFilter==='excluded')return prog[w.id]&&prog[w.id].excluded;
    if(currentFilter!=='all'){
      if(prog[w.id]&&prog[w.id].excluded)return false;
      if(getStatus(w.id,prog)!==currentFilter)return false;
    }
    // 検索フィルター（部分一致、英語・日本語・例文）
    if(query){
      const inEn=(w.w||'').toLowerCase().includes(query);
      const inJp=(w.jp||'').toLowerCase().includes(query);
      const inEx=(w.ex||'').toLowerCase().includes(query);
      const inExJp=(w.exJp||'').toLowerCase().includes(query);
      return inEn||inJp||inEx||inExJp;
    }
    return true;
  });
  const sort=(document.getElementById('wlSortSelect')?.value)||'num-asc';
  const statusOrder={master:0,learning:1,new:2};
  const sorted=[...filtered].sort((a,b)=>{
    if(sort==='num-asc')return (a.num||0)-(b.num||0);
    if(sort==='num-desc')return (b.num||0)-(a.num||0);
    if(sort==='status-master'){
      const sa=statusOrder[getStatus(a.id,prog)]??3;
      const sb=statusOrder[getStatus(b.id,prog)]??3;
      return sa!==sb?sa-sb:(a.num||0)-(b.num||0);
    }
    if(sort==='status-new'){
      const sa=statusOrder[getStatus(a.id,prog)]??3;
      const sb=statusOrder[getStatus(b.id,prog)]??3;
      return sa!==sb?sb-sa:(a.num||0)-(b.num||0);
    }
    return 0;
  });
  const container=document.getElementById('wordListItems');container.innerHTML='';
  if(!sorted.length){
    const empty=document.createElement('div');
    empty.style.cssText='text-align:center;padding:32px 0;color:var(--ink-lt);font-size:var(--fs-other);font-weight:700;';
    empty.textContent=query?T.wlEmptySearch(query):T.wlEmpty;
    container.appendChild(empty);
    return;
  }
  sorted.forEach(w=>{
    const st=getStatus(w.id,prog);const m=getMastery(w.id,prog);const isEx=prog[w.id]&&prog[w.id].excluded;
    const dc=st==='master'?'wi-master':st==='learning'?'wi-learning':'wi-new';
    const meta=st==='master'?T.wiMetaMastered:st==='learning'?T.wiMetaLearning(m):T.wiMetaNew;
    const div=document.createElement('div');div.className='word-item'+(isEx?' excluded':'');
    const exHtml=w.ex?`<div class="wi-ex">${w.ex}${w.exJp?`<div class="wi-ex-jp">${w.exJp}</div>`:''}</div>`:'';
    div.innerHTML=`<div class="wi-dot ${dc}"></div><div class="wi-body"><div class="wi-en">${w.w}</div><div class="wi-jp">${w.jp}</div>${exHtml}</div><div class="wi-btns"><button class="wi-speak" onclick="speakEn('${w.w.replace(/'/g,"\\'")}')">🔊</button><button class="${isEx?'wi-toggle':'wi-toggle on'}" onclick="toggleExclude('${w.id}',this)">${isEx?'✕':'✓'}</button></div>`;
    container.appendChild(div);
  });
}
function filterWords(btn){document.querySelectorAll('.wl-filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentFilter=btn.dataset.filter;renderWordList();}
function clearSearch(){const inp=document.getElementById('wlSearchInput');if(inp){inp.value='';inp.focus();}renderWordList();}

// 設定UI
function loadSettingsUI(){
  const s=loadSettings();
  document.getElementById('sessionSizeInput').value=s.sessionSize;
  document.getElementById('directionInput').value=s.direction;
  document.getElementById('dailyGoalInput').value=s.dailyGoal||10;
  document.getElementById('autoSpeakInput').value=s.autoSpeak||'off';
  document.getElementById('appNameInput').value=(s.appName||'').replace(SUFFIX_RE,'');
  const sizes=s.fontSizes||{global:'medium'};
  // 各スコープのactiveボタンを反映
  ['global','card','choice','wl','other'].forEach(scope=>{
    const val=sizes[scope]||'medium';
    document.querySelectorAll(`[data-scope="${scope}"]`).forEach(b=>b.classList.toggle('active',b.dataset.fs===val));
  });
  document.getElementById('ticketCountDisplay').textContent=getTicketDisplay();
  updateWordsCountLabel();
}
function updateWordsCountLabel(){const el=document.getElementById('wordsCountLabel');if(el)el.textContent=WORDS.length?T.wordsCount(WORDS.length):T.wordsNone;}

function importWords(mode){
  const raw=document.getElementById('wordsImportTextarea').value.trim();
  if(!raw){showToast(T.toastEmptyText);return;}
  let incoming;try{incoming=JSON.parse(raw);}catch(e){showToast(T.toastBadJson);return;}
  if(!Array.isArray(incoming)||!incoming.length){showToast(T.toastNeedArray);return;}
  if(mode==='reset'){
    openModal('replaceConfirmModal');
    document.getElementById('replaceConfirmModal')._pendingData=incoming;
    return;
  }
  _doImportWords(incoming,'add');
}
function confirmReplace(){
  const modal=document.getElementById('replaceConfirmModal');
  const incoming=modal._pendingData;
  closeModal('replaceConfirmModal');
  if(incoming)_doImportWords(incoming,'reset');
}
function _doImportWords(incoming,mode){
  const existing=mode==='reset'?[]:[...WORDS];
  const maxNum=existing.length?Math.max(...existing.map(w=>w.num||0)):0;
  let added=0,updated=0;
  incoming.forEach(item=>{
    if(!item.w||!item.jp)return;
    const ei=existing.findIndex(w=>w.w===item.w);
    const id=ei>=0?existing[ei].id:makeId(item.w);
    const entry={id,w:item.w,jp:item.jp,num:0,ph:item.ph||'',ex:item.ex||'',exJp:item.exJp||''};
    if(ei>=0){entry.num=existing[ei].num;existing[ei]=entry;updated++;}else{entry.num=maxNum+added+1;existing.push(entry);added++;}
  });
  saveWords(existing);WORDS=existing;
  document.getElementById('wordsImportTextarea').value='';
  document.getElementById('wordsCountLabel').textContent=T.importResultLabel(WORDS.length,added,updated);
  updateDash();renderWordList();
  showToast(T.toastImported(added,updated));
}

function exportData(){
  try{
    const data={progress:localStorage.getItem(LS.progress),history:localStorage.getItem(LS.history),settings:localStorage.getItem(LS.settings),words:localStorage.getItem(LS.words),tickets:localStorage.getItem(LS.tickets)};
    const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${CFG.prefix}_backup_${localDateStr()}.json`;a.click();URL.revokeObjectURL(url);
    showToast(T.toastBackupSaved);
  }catch(e){showToast(T.toastExportFailed);}
}
function importData(){document.getElementById('importTextarea').value='';openModal('importModal');}
function doImport(){
  const text=document.getElementById('importTextarea').value.trim();
  if(!text){showToast(T.toastEmptyText);return;}
  try{
    const data=JSON.parse(text);
    if(data.progress)localStorage.setItem(LS.progress,data.progress);
    if(data.history)localStorage.setItem(LS.history,data.history);
    if(data.settings)localStorage.setItem(LS.settings,data.settings);
    if(data.words){localStorage.setItem(LS.words,data.words);WORDS=loadWords();}
    if(data.tickets)localStorage.setItem(LS.tickets,data.tickets);
    closeModal('importModal');showToast(T.toastRestored);updateDash();renderWordList();
  }catch(e){showToast(T.toastRestoreFailed);}
}
function handleImportFile(event){
  const input=event.target;const file=input.files&&input.files[0];
  if(!file){return;}
  const reader=new FileReader();
  reader.onload=()=>{
    const text=String(reader.result||'').trim();
    input.value='';
    if(!text){showToast(T.toastEmptyText);return;}
    try{
      const data=JSON.parse(text);
      if(data.progress)localStorage.setItem(LS.progress,data.progress);
      if(data.history)localStorage.setItem(LS.history,data.history);
      if(data.settings)localStorage.setItem(LS.settings,data.settings);
      if(data.words){localStorage.setItem(LS.words,data.words);WORDS=loadWords();}
      if(data.tickets)localStorage.setItem(LS.tickets,data.tickets);
      closeModal('importModal');showToast(T.toastRestored);updateDash();renderWordList();
    }catch(e){showToast(T.toastRestoreFailed);}
  };
  reader.onerror=()=>{input.value='';showToast(T.toastRestoreFailed);};
  reader.readAsText(file);
}

// ナビ
const tabScreens={dash:'dashScreen',report:'reportScreen',wordlist:'wordlistScreen',settings:'settingsScreen'};
function showTab(tab,btn){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')===btn.getAttribute('onclick')));
  showScreen(tabScreens[tab]);
  if(tab==='wordlist'){const inp=document.getElementById('wlSearchInput');if(inp)inp.value='';renderWordList();}
  if(tab==='settings')loadSettingsUI();
  if(tab==='dash')updateDash();
  if(tab==='report')renderReport(0);
}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}
function openModal(id){document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden');}
function confirmReset(){openModal('resetModal');}
function doReset(){localStorage.removeItem(LS.progress);localStorage.removeItem(LS.history);closeModal('resetModal');showToast(T.toastReset);updateDash();renderWordList();}
function toggleExclude(id,btn){
  const prog=loadProgress();if(!prog[id])prog[id]={correct:0,wrong:0,lastSeen:null};
  prog[id].excluded=!prog[id].excluded;saveProgress(prog);
  const ex=prog[id].excluded;btn.classList.toggle('on',!ex);btn.textContent=ex?'✕':'✓';
  btn.closest('.word-item').classList.toggle('excluded',ex);showToast(ex?T.toastExcluded:T.toastUnexcluded);
}

// 初期化
try{speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();}catch(e){}
(function(){const s=loadSettings();applyFontSizes(s.fontSizes);})();
updateDash();
// Service Worker 登録（iOS PWA キャッシュ対策）
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw-'+CFG.prefix+'.js',{scope:'./'+CFG.prefix+'.html'})
      .catch(e=>console.warn('SW:',e));
  });
}
