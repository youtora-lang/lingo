// chiilingo-theme.js — chiilingo 専用（chiilingo.html だけが読み込む）
// 画面に出る絵文字を取り除く。アイコンが必要な場所は chiilingo-theme.css の線画アイコンで置き換える。
// 共通コア（lingo-core.js）には手を入れていないので、他アプリには影響しない。
// 学習データ・機能には触れない（表示上の文字だけを書き換える）。
(function(){
  // 絵文字（国旗・異体字セレクタ・ZWJ結合を含む）と直後の空白1つ。© ® ™ は残す。
  const EMOJI=/(?:(?![©®™])\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|⃣|‍(?:\p{Extended_Pictographic})️?)*[ 　]?/gu;
  const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1};

  function cleanText(node){
    const v=node.nodeValue;
    if(!v)return;
    EMOJI.lastIndex=0;
    if(!EMOJI.test(v))return;
    const nv=v.replace(EMOJI,'');
    if(nv!==v)node.nodeValue=nv;
  }
  function cleanTree(root){
    if(root.nodeType===3){if(!root.parentNode||!SKIP[root.parentNode.nodeName])cleanText(root);return;}
    if(root.nodeType!==1||SKIP[root.nodeName])return;
    if(root.hasAttribute&&root.hasAttribute('placeholder')){
      const p=root.getAttribute('placeholder'),np=p.replace(EMOJI,'');
      if(np!==p)root.setAttribute('placeholder',np);
    }
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{
      acceptNode:n=>n.nodeType===1&&SKIP[n.nodeName]?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
    });
    let n;
    while((n=w.nextNode())){
      if(n.nodeType===3)cleanText(n);
      else if(n.hasAttribute('placeholder')){
        const p=n.getAttribute('placeholder'),np=p.replace(EMOJI,'');
        if(np!==p)n.setAttribute('placeholder',np);
      }
    }
  }

  // ステータスバーの色を、表示中ページのテーマ色に合わせる
  function syncThemeColor(){
    const m=document.querySelector('meta[name="theme-color"]');
    if(!m)return;
    const c=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if(c&&m.content!==c)m.content=c;
  }

  // 下のタブでページを切り替えたら、そのページのいちばん上から表示する
  // （インラインの onclick=showTab(...) が先に動き、その後にここが動く）
  function scrollPageTop(){
    window.scrollTo({top:0,left:0,behavior:'instant'});
    document.querySelectorAll('.screen.active .dash-body,.screen.active .wl-body,.screen.active .set-body')
      .forEach(el=>{el.scrollTop=0;});
  }
  document.addEventListener('click',e=>{
    if(e.target.closest&&e.target.closest('.nav-btn'))scrollPageTop();
  });

  // 設定画面フッターの「Last updated」を自動で最新にする
  // GitHub 上で chiilingo に関係するファイルが最後に更新（push）された日時を取得して表示する。
  // 取得できないとき（オフライン・API制限など）は、共通コアの CORE_VERSION 表示のまま。
  // 結果はタブを閉じるまで sessionStorage に保存し、毎回は問い合わせない（学習データの localStorage には触れない）。
  const REPO='youtora-lang/lingo';
  const WATCH=['chiilingo.html','chiilingo-theme.css','chiilingo-theme.js','lingo-core.js','lingo.css'];
  const CACHE_KEY='chiilingoTheme.lastUpdated';
  function fmtJST(iso){
    const p={};
    new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso)).forEach(x=>{p[x.type]=x.value;});
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
  }
  function showLastUpdated(iso){
    const el=document.getElementById('lastUpdatedLabel');
    if(el&&iso)el.textContent='Last updated: '+fmtJST(iso)+' JST';
  }
  async function loadLastUpdated(){
    try{const c=sessionStorage.getItem(CACHE_KEY);if(c){showLastUpdated(c);return;}}catch(e){}
    try{
      const dates=await Promise.all(WATCH.map(path=>
        fetch(`https://api.github.com/repos/${REPO}/commits?sha=main&per_page=1&path=${encodeURIComponent(path)}`,{cache:'no-store'})
          .then(r=>r.ok?r.json():[])
          .then(a=>(a[0]&&a[0].commit&&a[0].commit.committer&&a[0].commit.committer.date)||null)
          .catch(()=>null)));
      const latest=dates.filter(Boolean).sort().pop();
      if(!latest)return;
      showLastUpdated(latest);
      try{sessionStorage.setItem(CACHE_KEY,latest);}catch(e){}
    }catch(e){}
  }

  // 単語一覧の検索窓と絞り込みボタンを1つの箱にまとめ、CSS でスクロール時に上へ固定する
  // （中の要素・id はそのまま。単語リスト #wordListItems は箱の外に残す）
  function wrapWordlistControls(){
    const body=document.querySelector('#wordlistScreen .wl-body');
    if(!body||body.querySelector('.wl-sticky'))return;
    const list=document.getElementById('wordListItems');
    const box=document.createElement('div');box.className='wl-sticky';
    [...body.children].filter(el=>el!==list).forEach(el=>box.appendChild(el));
    body.insertBefore(box,list);
  }

  function start(){
    wrapWordlistControls();
    cleanTree(document.body);
    syncThemeColor();
    loadLastUpdated();
    new MutationObserver(list=>{
      let screenChanged=false;
      for(const r of list){
        if(r.type==='characterData')cleanText(r.target);
        else if(r.type==='childList')r.addedNodes.forEach(cleanTree);
        else if(r.type==='attributes'){
          if(r.attributeName==='class')screenChanged=true;
          else cleanTree(r.target);
        }
      }
      if(screenChanged)syncThemeColor();
    }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','placeholder']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
