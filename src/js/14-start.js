/* ---------- Clicks ---------- */
function focusTo(sel){const el=document.querySelector(sel);if(!el)return;const d=el.matches("details")?el:el.closest("details");if(d)d.open=true;if(!el.getClientRects().length)return;el.scrollIntoView({block:"center",behavior:RM()?"auto":"smooth"});el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1600)}
const newCountdown=()=>openES(null,null,{ad:true,cd:true,d:nd(todayN()+7)});
function addHere(){if(tab==="f")return openBS(null);if(tab==="d")return newCountdown();openES(null,null,{d:nd(tab==="k"?SEL:todayN())})}
$("tadd").onclick=addHere;$("kd_add").onclick=()=>openES(null,null,{d:nd(SEL)});$("ht_add").onclick=()=>openES(null,null,{d:nd(todayN())});$("f_add").onclick=()=>openBS(null);$("d_add").onclick=newCountdown;
$("c_perm").onclick=async()=>{try{const r=await Notification.requestPermission();toast(r==="granted"?tx("Notiser tillåtna","Notifications allowed"):tx("Notiser är inte tillåtna. Påminnelser visas bara i appen.","Notifications are not allowed. Reminders only show in the app."),r==="granted"?"ok":"warn")}catch(e){}renderSettings()};
document.addEventListener("click",e=>{const g=x=>e.target.closest&&e.target.closest(x);let b;
  if(b=g("[data-go]")){go(b.dataset.go);if(b.dataset.to)setTimeout(()=>focusTo(b.dataset.to),60);return}
  if(b=g(".mnav b")){if(yrOpen())closeYears();else openYears(b);return}
  if(b=g("[data-yr]")){P.y=+b.dataset.yr;if(P.y===NOW.getFullYear())P.m=NOW.getMonth();const[,,sd]=ymd(SEL);SEL=P.y===NOW.getFullYear()&&P.m===NOW.getMonth()?todayN():dnOf(P.y,P.m,Math.min(sd,dim(P.y,P.m)));closeYears();renderMonth();return}
  if(yrOpen()&&!g("#yrs"))closeYears();
  if(b=g("[data-mv]")){moveMonth(+b.dataset.mv);return}
  if(g("[data-now]")){pickDay(todayN());return}
  if(b=g("[data-cday]")){pickDay(+b.dataset.cday);if(!WIDE.matches)setTimeout(()=>{const r=$("k_day").getBoundingClientRect();if(r.top>innerHeight-140)$("k_day").scrollIntoView({block:"start",behavior:RM()?"auto":"smooth"})},30);return}
  if(b=g("[data-gday]")){go("k");pickDay(+b.dataset.gday);return}
  if(b=g("[data-ev]")){openES(b.dataset.ev,b.dataset.on);return}
  if(b=g("[data-bd]")){openBS(b.dataset.bd);return}
  if(b=g("[data-ag]")){AG.past=b.dataset.ag==="1";AG.lim=90;renderAgenda();return}
  if(b=g("[data-hu]"))return histUndo(b.dataset.hu);
  if(g("#u_clear"))return ask(tx("Rensa historiken?","Clear the history?"),tx("Det går inte att ångra något av det som står här efteråt. Kalendern påverkas inte.","Nothing listed here can be undone afterwards. Your calendar is not affected.")).then(ok=>{if(ok){H=[];histSave();renderHist()}});
  if(g("#bk_now")){const s=$("bk_save");if(s)s.click();return}
  if(g("#bk_later")){lsSet("kalenderkoll.bkSnooze",Date.now()+14*864e5);renderBk();return}
  if(b=g("[data-zm]")){S.zoom=+b.dataset.zm;applyRead();persist();renderRead();return}
  if(b=g("[data-hc]")){S.hc=b.dataset.hc==="1";applyRead();persist();renderRead();return}
  if(b=g("[data-bg]")){S.bg=b.dataset.bg;S.bgPick=true;try{localStorage.setItem("kalenderkoll.bg2",S.bg)}catch(err){}persist();renderRead();FX.setMotion();return}
  if(b=g("[data-lang]")){S.lang=b.dataset.lang;persist();applyLang();return}
  if(b=g("#c_th [data-th],#c_tm [data-th]")){S.theme=b.dataset.th;applyTheme();persist();render();return}
  if(b=g("[data-ck]")){S.click=b.dataset.ck==="1";persist();renderSettings();return}
  if(b=g("[data-sn]")){S.sound=b.dataset.sn==="1";persist();renderSettings();if(S.sound)chime("ok");return}
  if(b=g("[data-mo]")){S.motion=b.dataset.mo==="1";persist();FX.setMotion();renderSettings();return}
  if(b=g("[data-tg]")){S.toasts=b.dataset.tg==="1";persist();renderSettings();if(S.toasts)toast(t("tNotif"),"ok");return}
  if(b=g("[data-wn]")){S.wkno=b.dataset.wn==="1";persist();render();return}
  if(b=g("[data-ho]")){S.hol=b.dataset.ho==="1";persist();render();return}
  if(b=g("[data-rm]")){S.rem=b.dataset.rm==="1";persist();renderSettings();return}});

/* ---------- Start ---------- */
const WIDE=matchMedia("(min-width:700px)");
try{const g=localStorage.getItem("kalenderkoll.bg2");if(g==="mist"||g==="lines"){S.bg=g;S.bgPick=true}}catch(e){}
seedExample();applyTheme();applyLang();let startTab="h";try{const s=sessionStorage.getItem("kalenderkoll.tab");if(s&&TABS.includes(s))startTab=s}catch(e){}go(startTab);
WIDE.addEventListener("change",()=>{closeYears();render()});
/* Opening transition: wait until the first screen is drawn and the fonts are in, then reveal it. */
(()=>{const H=document.documentElement,still=!S.motion||matchMedia("(prefers-reduced-motion:reduce)").matches;if(still)H.classList.add("still");
  const show=()=>{if(H.classList.contains("reveal"))return;const sec=document.querySelector("main section:not(.hide)");if(sec)[...sec.children].forEach((c,i)=>c.style.setProperty("--i",Math.min(i,7)));
    H.classList.remove("boot");H.classList.add("reveal");if(!still)H.classList.add("enter");
    setTimeout(()=>{H.classList.remove("enter");const i=$("intro");if(i)i.remove();if(sec)[...sec.children].forEach(c=>c.style.removeProperty("--i"))},1400)};
  const fonts=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,800))]):Promise.resolve();
  fonts.then(()=>setTimeout(()=>requestAnimationFrame(show),Math.max(0,(still?0:720)-performance.now())));setTimeout(show,1800)})();
/* Keep "in 25 min" and today's date fresh. */
let lastDay=todayN();
function tickClock(){const n=todayN();if(n!==lastDay){if(SEL===lastDay){SEL=n;const[y,m]=ymd(n);P={y,m}}lastDay=n}render()}
setInterval(()=>{if(!document.hidden)tickClock()},6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)tickClock()});
/* Everything is saved on this device. The page still works without storage. */
(async()=>{try{
  const db=await claude.use("db");if(!db)return;
  col=histWrap(db.collection("cal"));
  col.onSnapshot(snap=>{const real=snap.docs.some(d=>/^(ev|bd)_|^started$/.test(d.id)),old=S.lang;allIds=snap.docs.map(d=>d.id);
    if(real){exampleMode=false;EV=[];BD=[]}
    snap.docs.forEach(d=>{const v=d.data()||{};
      if(d.id==="plan"){if(PEND.has("plan"))return;if(typeof v.zoom==="number")S.zoom=v.zoom;if(v.bg2==="mist"||v.bg2==="lines"){S.bg=v.bg2;S.bgPick=true}["hc","toasts","sound","click","motion","wkno","hol","rem"].forEach(k=>{if(typeof v[k]==="boolean")S[k]=v[k]});if(typeof v.theme==="string")S.theme=v.theme;if(v.lang==="sv"||v.lang==="en")S.lang=v.lang;applyRead();FX.setMotion()}
      else if(real&&v.kind==="ev"&&typeof v.d==="string"&&/^\d{4}-\d\d-\d\d$/.test(v.d))EV.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),d:v.d,e:/^\d{4}-\d\d-\d\d$/.test(v.e||"")&&v.e>v.d?v.e:"",t:/^\d\d:\d\d$/.test(v.t||"")?v.t:"",t2:/^\d\d:\d\d$/.test(v.t2||"")?v.t2:"",r:["o","d","wd","w","2w","m","y"].includes(v.r)?v.r:"o",u:/^\d{4}-\d\d-\d\d$/.test(v.u||"")?v.u:"",skip:Array.isArray(v.skip)?v.skip.filter(x=>typeof x==="string"):[],c:CATS.some(c=>c[0]===v.c)?v.c:"o",pl:String(v.pl||""),o:String(v.o||""),rem:typeof v.rem==="number"?v.rem:-1,cd:!!v.cd});
      else if(real&&v.kind==="bd"&&/^\d\d-\d\d$/.test(v.md||""))BD.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),md:v.md,y:+v.y||0,ty:["b","a","o"].includes(v.ty)?v.ty:"b"})});
    applyTheme();
    if(S.lang!==old){applyLang();go(tab);return}
    render();maybeWelcome()},()=>{col=null;render()});
}catch(e){}})();
/* On narrow phones the longest menu words are shortened, so all menu buttons can stay the same size. */
function fitNav(){[["f","nF","nFs"],["d","nD","nDs"]].forEach(([k,a,s])=>{const b=document.querySelector(`nav [data-go="${k}"]`),e=b&&b.querySelector("em");if(!e||getComputedStyle(b).flexGrow==="0")return;e.textContent=t(a);if(e.scrollWidth>b.clientWidth-4)e.textContent=t(s)})}
fitNav();addEventListener("resize",fitNav);document.fonts&&document.fonts.ready.then(fitNav);

/* Start with an empty calendar: removes every event and birthday. Settings stay, and History can undo it. */
async function emptyAll(){if(exampleMode){exampleMode=false;EV=[];BD=[];if(col)col.doc("started").set({kind:"started"}).catch(()=>{});return}
  const ids=allIds.filter(id=>/^(ev|bd)_/.test(id));EV=[];BD=[];if(col){col.doc("started").set({kind:"started"}).catch(()=>{});await Promise.all(ids.map(id=>col.doc(id).delete()))}}
$("empty").onclick=async()=>{if(!await ask(tx("Börja med en tom kalender?","Start with an empty calendar?"),tx("Alla händelser och födelsedagar tas bort. Inställningarna finns kvar. Du kan ångra det under Historik.","All events and birthdays are removed. Settings stay. You can undo it under History.")))return;
  await emptyAll();render();go("k");toast(tx("Kalendern är tom. Tryck Ny för att lägga till något.","The calendar is empty. Tap New to add something."),"ok")};
let rt;$("reset").onclick=async()=>{const b=$("reset");
  if(b.dataset.arm!=="1"){b.dataset.arm="1";b.textContent=t("resetAgain");clearTimeout(rt);rt=setTimeout(()=>{b.dataset.arm="0";b.textContent=t("reset")},4000);return}
  b.dataset.arm="0";b.textContent=t("reset");
  try{await emptyAll()}catch(e){toast(t("tDelFail"));return}
  render();toast(t("tDel"))};

/* Android back button: close what is open, then go to the previous page, and only leave the app from Idag. */
(()=>{const NAV=[];let backing=false;const _go=go;
  go=function(x){if(!backing&&x!==tab){NAV.push(tab);if(NAV.length>30)NAV.shift()}return _go(x)};
  const on=id=>{const e=$(id);return !!(e&&e.classList.contains("on"))};
  function closeTop(){if(on("wl")){wlPick("ex");return true}if(on("modal")){$("m_no").click();return true}
    for(const [id,f] of [["dp",closeDP],["tp",closeTP],["pk",closePK],["sc",()=>closeSC(null)],["es",closeES],["bs",closeBS]])if(on(id)){f();return true}
    if(yrOpen()){closeYears();return true}
    if(on("drawer")){$("scrim").click();return true}
    return false}
  const guard=()=>history.pushState({kk:1},"");
  try{history.replaceState({kk:0},"");guard()}catch(e){return}
  addEventListener("popstate",()=>{if(closeTop())return guard();
    let to=null;while(NAV.length&&to===null){const p=NAV.pop();if(p!==tab)to=p}
    if(to===null&&tab!=="h")to="h";
    if(to!==null){backing=true;go(to);backing=false;return guard()}
    history.back()})})();
