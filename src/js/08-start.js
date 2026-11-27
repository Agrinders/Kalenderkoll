/* ---------- Taps ---------- */
function addHere(){openES(null,null,{d:nd(SEL)})}
$("tadd").onclick=addHere;$("kd_add").onclick=()=>openES(null,null,{d:nd(SEL)});$("menu").onclick=openDrawer;$("scrim").onclick=closeDrawer;
$("dr_names").onclick=()=>{closeDrawer();openCS(false)};$("dr_ics").onclick=()=>{closeDrawer();$("ics_out").click()};$("dr_inv").onclick=()=>{go("v");setTimeout(()=>$("v_inv").scrollIntoView({block:"center",behavior:RM()?"auto":"smooth"}),80)};
addEventListener("scroll",()=>$("main_top").classList.toggle("sc",scrollY>4),{passive:true});$("v_ladd").onclick=()=>openNS(null);$("v_dadd").onclick=()=>openBS(null);
$("k_m").onclick=()=>openPK(tx("Välj år","Pick a year"),Array.from({length:21},(_,i)=>{const y=NOW.getFullYear()-10+i;return[y,String(y)]}).reverse(),P.y,v=>{P.y=+v;const[,,sd]=ymd(SEL);SEL=dnOf(P.y,P.m,Math.min(sd,dim(P.y,P.m)));renderMonth()});
document.addEventListener("click",e=>{const g=x=>e.target.closest&&e.target.closest(x);let b;
  if(b=g("[data-go]")){go(b.dataset.go);return}
  if(b=g("[data-mv]")){moveMonth(+b.dataset.mv);return}
  if(b=g("[data-kv]")){KV=b.dataset.kv;try{localStorage.setItem("kalenderkoll.kv",KV)}catch(err){}renderMonth();return}
  if(b=g("[data-dmv]")){pickDay(SEL+ +b.dataset.dmv);return}
  if(b=g("[data-wmv]")){pickDay(SEL+ +b.dataset.wmv);return}
  if(b=g("[data-gwd]")){KV="day";try{localStorage.setItem("kalenderkoll.kv",KV)}catch(err){}pickDay(+b.dataset.gwd);return}
  if((b=g(".wvcol"))&&!g("[data-ev]")){const r=b.getBoundingClientRect(),m=Math.max(0,Math.floor(((e.clientY-r.top)/WPX*60+ +b.dataset.h0*60)/30)*30);openES(null,null,{d:nd(+b.dataset.d),t:pad(Math.min(23,Math.floor(m/60)))+":"+pad(m%60)});return}
  if(g("#dv_t")||g("#kd_ic")){pickDayIcon(SEL);return}
  if((b=g(".dvcol"))&&!g("[data-ev]")){const r=b.getBoundingClientRect(),m=Math.max(0,Math.floor(((e.clientY-r.top)/HPX*60+ +b.dataset.h0*60)/30)*30);openES(null,null,{d:nd(SEL),w:b.dataset.slot,t:pad(Math.min(23,Math.floor(m/60)))+":"+pad(m%60)});return}
  if(g("[data-now]")){pickDay(todayN());return}
  if(g("#ds_x")||e.target===$("ds")){closeDS();return}
  if(b=g("[data-cday]")){pickDay(+b.dataset.cday);openDS();return}
  if(b=g("[data-gday]")){go("k");pickDay(+b.dataset.gday);if(KV==="month")openDS();return}
  if(b=g("[data-ev]")){openES(b.dataset.ev,b.dataset.on);return}
  if(b=g("[data-bd]")){openBS(b.dataset.bd);return}
  if(b=g("[data-note]")){openNS(b.dataset.note);return}
  if(b=g("[data-tf]")){TF=b.dataset.tf;renderTodo();return}
  if(b=g("[data-tchk]")){const x=TODOS.find(z=>z.id===b.dataset.tchk);if(x){const done=!x.done;saveTodo({...x,done,dt:Date.now()});b.classList.toggle("on",done);setTimeout(()=>{renderTodo();renderHome()},done&&!RM()?350:0)}return}
  if(g("#t_clear")){TODOS.filter(x=>x.w===TF&&x.done).forEach(x=>dropTodo(x,true));renderTodo();return}
  if(b=g("[data-tdel]")){const x=TODOS.find(z=>z.id===b.dataset.tdel);if(x)animOut(b.closest(".todo"),()=>{dropTodo(x);renderTodo();renderHome()});return}
  if(g("#v_copy")){(navigator.clipboard?navigator.clipboard.writeText(ART_URL):Promise.reject()).then(()=>toast(tx("Länken är kopierad","The link is copied")+" · "+tx(`Kom ihåg att dela sidan med ${pname(other(me()))} i Claude först`,`Remember to share the page with ${pname(other(me()))} in Claude first`),5000)).catch(()=>$("v_link").classList.remove("hide"));return}
  if(b=g("[data-th]")&&g("#c_th")){S.theme=g("[data-th]").dataset.th;applyTheme();persist();renderSettings();return}
  if(b=g("[data-lg]")){S.lang=b.dataset.lg;persist();applyLang();return}
  if(b=g("[data-wn]")){S.wkno=b.dataset.wn==="1";persist();render();return}
  if(b=g("[data-ho]")){S.hol=b.dataset.ho==="1";persist();render();return}});
$("t_f").addEventListener("submit",e=>{e.preventDefault();const n=$("t_q").value.trim();if(!n){$("t_q").focus();return}saveTodo({id:newId(),n,w:TF,done:false,at:Date.now()});$("t_q").value="";renderTodo();renderHome()});
document.addEventListener("input",e=>{const id=e.target.dataset&&e.target.dataset.tn;if(!id)return;const x=TODOS.find(z=>z.id===id);if(x){x.n=e.target.value;saveTodo(x,true)}});
document.addEventListener("focusout",e=>{const id=e.target.dataset&&e.target.dataset.tn;if(!id)return;const x=TODOS.find(z=>z.id===id);if(x&&!x.n.trim())dropTodo(x,true);setTimeout(()=>{renderTodo();renderHome()},0)});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.tn)e.target.blur()});
$("reset").onclick=async()=>{if(!await ask(tx("Radera allt?","Delete everything?"),!SHARED()?tx("Alla händelser, uppgifter, lappar och namn tas bort från den här telefonen.","All events, tasks, notes and names are removed from this phone."):tx("Alla händelser, uppgifter, lappar och namn tas bort, för er båda.","All events, tasks, notes and names are removed, for both of you."),tx("Radera","Delete")))return;
  const ids=allIds.filter(id=>id!=="plan");EV=[];BD=[];TODOS=[];NOTES=[];DAYS={};CP={a:"",b:"",ua:"",ub:"",since:"",ca:"",cb:""};PICS={a:"",b:""};applyPeople();if(col)await Promise.all(ids.map(id=>col.doc(id).delete().catch(()=>{})));render();go("h");setTimeout(()=>openCS(true),300)};

/* ---------- Start ---------- */
try{const l=JSON.parse(localStorage.getItem("kalenderkoll.look")||"null");if(l){if(l.lang==="sv"||l.lang==="en")S.lang=l.lang;if(["auto","light","dark"].includes(l.theme))S.theme=l.theme}}catch(e){}
applyTheme();applyLang();let startTab="k";try{const s=sessionStorage.getItem("kalenderkoll.tab");if(TABS.includes(s))startTab=s}catch(e){}go(startTab);
requestAnimationFrame(()=>document.documentElement.classList.remove("boot"));setTimeout(()=>document.documentElement.classList.remove("boot"),600);
let lastDay=todayN();
function tick(){const n=todayN();if(n!==lastDay){if(SEL===lastDay){SEL=n;const[y,m]=ymd(n);P={y,m}}lastDay=n}const ae=document.activeElement;if(!(ae&&ae.dataset&&ae.dataset.tn))render()}
setInterval(()=>{if(!document.hidden)tick()},6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
/* First time: your names. On a partner's phone: which of the two names is yours. */
let firstDone=false,firstTry=0,whoOpen=false;
/* Who this phone is comes from its sign-in: the name slot that holds this phone's id is yours.
   The person who starts the calendar is "a"; the partner who joins takes the empty slot "b". */
async function firstRun(){if(firstDone)return;firstDone=true;const joining=!!(window.KK&&KK.joining&&KK.joining());
  if(MYID){if(CP.ua===MYID){setMe("a");return}if(CP.ub===MYID){setMe("b");return}}
  if(!CP.a&&!CP.ua){
    /* A phone that just joined waits for the shared calendar instead of starting one of its own. */
    if(joining&&firstTry++<40){firstDone=false;setTimeout(firstRun,500);return}
    setMe("a");openCS("new");return}
  if(!MYID)return;
  /* Restored from a backup: the name in the file is yours, even if your old install still holds it. */
  let rc=false;try{rc=localStorage.getItem("kalenderkoll.reclaim")==="1";localStorage.removeItem("kalenderkoll.reclaim")}catch(e){}
  if(ME&&rc){claimAs(ME);return}
  whoAmI()}
function whoAmI(){if(whoOpen)return;const free=["a","b"].find(x=>!CP["u"+x]);
  /* The free place is yours: write your own name. */
  if(free){if(free==="a"&&CP.a&&ME==="a"&&!joiningNow()){setMe("a");claimAs("a");return}setMe(free);openCS("join");return}
  /* Both places are taken by other phones: this is one of you after a reinstall without a backup. */
  whoOpen=true;askOpts(tx("Har du installerat om appen?","Did you reinstall the app?"),tx("Välj ditt eget namn för att fortsätta.","Pick your own name to carry on."),["a","b"].map(x=>[x,CP[x],""])).then(w=>{whoOpen=false;if(w)claimAs(w)})}
const joiningNow=()=>!!(window.KK&&KK.joining&&KK.joining());
function claimAs(w){setMe(w);if(MYID&&CP["u"+w]!==MYID){const o=other(w);if(CP["u"+o]===MYID)CP["u"+o]="";CP["u"+w]=MYID;saveCouple()}render()}
/* Later snapshots: a phone that is not in the couple yet gets its place. */
function checkWho(){if(!firstDone||!SHARED()||!MYID||$("cs").classList.contains("on")||CP.ua===MYID||CP.ub===MYID||(!CP.a&&!CP.ua))return;whoAmI()}
/* Everything is saved in shared storage (or on this phone in the installed version). */
(async()=>{let ok=false;try{
  const db=await claude.use("db");if(!db)throw 0;
  try{const u=await claude.use("user");if(u&&u.id)MYID=await u.id()||""}catch(e){}
  col=db.collection("cal");privStart(db);let first=true;
  col.onSnapshot(snap=>{if(first&&snap.metadata&&snap.metadata.fromCache&&!snap.docs.length){setTimeout(()=>{if(!firstDone)firstRun()},6000);return}ok=true;allIds=snap.docs.map(d=>d.id);DOCS={};const prevT=TODOS;MEMOS=[];MIMG={};EV=[];BD=[];TODOS=[];NOTES=[];DAYS={};PICS={a:"",b:""};let cp=null;
    snap.docs.forEach(d=>{const v=d.data()||{};DOCS[d.id]=copy(v);const iso=x=>/^\d{4}-\d\d-\d\d$/.test(x||"");
      if(d.id==="plan"){if(!PEND.has("plan")){if(typeof v.wkno==="boolean")S.wkno=v.wkno;if(typeof v.hol==="boolean")S.hol=v.hol}}
      else if(d.id==="couple")cp={a:String(v.a||""),b:String(v.b||""),ua:String(v.ua||""),ub:String(v.ub||""),since:iso(v.since)?v.since:"",ca:String(v.ca||""),cb:String(v.cb||"")};
      else if(v.kind==="pic"&&(v.w==="a"||v.w==="b")&&okPic(v.img))PICS[v.w]=v.img;
      else if(v.kind==="ev"&&iso(v.d))EV.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),d:v.d,e:iso(v.e)&&v.e>v.d&&(v.r||"o")==="o"?v.e:"",t:/^\d\d:\d\d$/.test(v.t||"")?v.t:"",t2:/^\d\d:\d\d$/.test(v.t2||"")?v.t2:"",r:["o","d","wd","w","2w","m","y"].includes(v.r)?v.r:"o",u:iso(v.u)?v.u:(iso(v.e)&&v.e>v.d&&v.r&&v.r!=="o"?v.e:""),skip:Array.isArray(v.skip)?v.skip.filter(x=>typeof x==="string"):[],pl:String(v.pl||""),o:String(v.o||""),w:["a","b","g"].includes(v.w)?v.w:"g",col:/^#[0-9a-f]{6}$/i.test(v.col||"")?v.col:"",st:v.st==="glass"||v.st==="stripe"?v.st:"fill",ic:ICONS[v.ic]?v.ic:"",fx:fxCls(v.fx)?v.fx:"",wd:Array.isArray(v.wd)?[...new Set(v.wd.filter(x=>Number.isInteger(x)&&x>=0&&x<7))].sort():[],by:v.by==="a"||v.by==="b"?v.by:"",at:+v.at||0,rm:REMS.includes(+v.rm)?+v.rm:-1});
      else if(v.kind==="day"&&iso(v.d)&&ICONS[v.ic])DAYS[v.d]={ic:v.ic};
      else if(v.kind==="bd"&&/^\d\d-\d\d$/.test(v.md||""))BD.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),md:v.md,y:+v.y||0,ty:["b","a","o"].includes(v.ty)?v.ty:"b"});
      else if(v.kind==="todo"){const id=String(v.id||d.id.slice(5)),ae=document.activeElement,typing=ae&&ae.dataset&&ae.dataset.tn===id||PEND.has("todo_"+id);TODOS.push(typing&&prevT.find(z=>z.id===id)||{id,n:String(v.n||""),w:["a","b","g"].includes(v.w)?v.w:"g",done:!!v.done,at:+v.at||0,dt:+v.dt||0})}
      else if(v.kind==="memo"){const m=memoClean(v,d.id.slice(5));if(m)MEMOS.push(m)}
      else if(v.kind==="mimg"&&typeof v.data==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(v.data))MIMG[String(v.id||d.id.slice(5))]=v.data;
      else if(v.kind==="note"&&typeof v.txt==="string")NOTES.push({id:String(v.id||d.id.slice(5)),f:v.f==="b"?"b":"a",txt:v.txt,at:+v.at||0})});
    /* Tasks added on this phone but not saved yet stay in the list. */
    prevT.forEach(x=>{if(PEND.has("todo_"+x.id)&&!TODOS.some(z=>z.id===x.id))TODOS.push(x)});
    CP=cp||{a:"",b:"",ua:"",ub:"",since:"",ca:"",cb:""};applyPeople();
    if(MYID){if(CP.ua===MYID)setMe("a");else if(CP.ub===MYID)setMe("b")}
    privMerge();document.body.classList.remove("loading");watchJoin();watchNew();render();remSched();bgSync();widgetSync();autoBackup();if(!first)checkWho();if(first){first=false;setTimeout(firstRun,200)}},()=>{col=null;render()});
}catch(e){}setTimeout(()=>{if(!ok&&!firstDone)firstRun()},col?10000:400)})();

/* Android back button: close what is open first, then go back to Idag, and only then leave. */
(()=>{const on=id=>$(id).classList.contains("on");
  function closeTop(){if(on("modal")){$("m_no").click();return true}for(const[id,f]of[["dp",closeDP],["tp",closeTP],["pk",closePK],["ip",closeIP],["sc",()=>closeSC(null)],["mv",closeMV],["mm",closeMM],["as",closeAS],["es",closeES],["bs",closeBS],["ns",closeNS],["ds",closeDS]])if(on(id)){f();return true}if(document.body.classList.contains("navup")){navUp(false);return true}if(on("cs")&&!$("cs_no").classList.contains("hide")){closeCS();return true}if(on("drawer")){closeDrawer();return true}if(on("js")){closeJS();return true}return false}
  const guard=()=>history.pushState({kk:1},"");try{history.replaceState({kk:0},"");guard()}catch(e){return}
  addEventListener("popstate",()=>{if(closeTop())return guard();if(tab!=="k"){go("k");return guard()}history.back()})})();

/* Inviting and joining (installed version, shared through Firebase). */
async function shareInvite(){askNotify();const url=KK.inviteUrl(),p=pname(other(me())),text=tx(`Hej ${p}! Gå med i vår gemensamma kalender:`,`Hi ${p}! Join our shared calendar:`);
  if(navigator.share){try{await navigator.share({title:"Kalenderkoll",text,url});return}catch(e){if(e&&e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(url);toast(tx("Länken är kopierad","The link is copied")+" · "+tx(`Klistra in den i ett meddelande till ${p}`,`Paste it into a message to ${p}`),5000)}catch(e){openJS(url)}}
document.addEventListener("click",e=>{if(!e.target.closest)return;if(e.target.closest("#v_share,[data-share]"))shareInvite();else if(e.target.closest("[data-join]"))openJS("");else if(e.target.closest("[data-nudgex]")){try{localStorage.setItem("kalenderkoll.nudge","0")}catch(err){}renderHome()}else{const s=e.target.closest("[data-tsug]");if(s){saveTodo({id:newId(),n:s.dataset.tsug,w:TF,done:false,at:Date.now()});renderTodo();renderHome()}}});
$("dr_join").onclick=()=>{closeDrawer();openJS("")};
function openJS(show){$("js_t").textContent=show?tx("Din inbjudningslänk","Your invite link"):tx("Gå med i en kalender","Join a calendar");$("js_p").textContent=show?tx("Kopiera länken och skicka den till din partner.","Copy the link and send it to your partner."):tx("Klistra in länken du har fått. Kalendern på den här telefonen byts mot er gemensamma.","Paste the link you got. The calendar on this phone is replaced by your shared one.");
  $("js_in").value=show||"";$("js_in").readOnly=!!show;$("js_ok").textContent=show?tx("Klar","Done"):tx("Gå med","Join");$("js").classList.add("on");if(show)setTimeout(()=>$("js_in").select(),60);else setTimeout(()=>$("js_in").focus(),60)}
const closeJS=()=>$("js").classList.remove("on");
$("js_no").onclick=closeJS;$("js").addEventListener("click",e=>{if(e.target===$("js"))closeJS()});
$("js_ok").onclick=async()=>{if($("js_in").readOnly){closeJS();return}const c=KK.codeIn($("js_in").value);if(!c){toast(tx("Det ser inte ut som en inbjudningslänk","That does not look like an invite link"));return}
  if(c===KK.space()){closeJS();toast(tx("Du är redan med i den här kalendern","You are already in this calendar"));return}
  if(hasData()&&!await ask(tx("Byta kalender?","Switch calendar?"),tx("Det du har lagt in på den här telefonen syns inte längre. Du ser i stället er gemensamma kalender.","What you added on this phone will no longer show. You will see your shared calendar instead."),tx("Gå med","Join")))return;
  try{localStorage.removeItem("kalenderkoll.me")}catch(err){}KK.join(c)};
/* A link opened on a phone that already has its own calendar: ask before switching. */
window.KK_askJoin=()=>ask(tx("Gå med i er gemensamma kalender?","Join your shared calendar?"),tx("Kalendern på den här telefonen byts mot den du blev inbjuden till.","The calendar on this phone is replaced by the one you were invited to."),tx("Gå med","Join")).then(ok=>{if(ok){try{localStorage.removeItem("kalenderkoll.me")}catch(e){}ME=""}return ok});

/* A notice when your partner joins. This phone remembers who the partner was last time;
   when someone new claims the other name, you get a toast and a phone notification. */
const JK="kalenderkoll.partner";
function notify(title,body){
  try{const N=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
    if(N){N.schedule({notifications:[{id:Math.floor(Date.now()/1000)%2000000000,title,body}]}).catch(()=>{});return}
    if("Notification"in window&&Notification.permission==="granted"){
      if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:"icons/icon-192.png"})).catch(()=>{});
      else new Notification(title,{body,icon:"icons/icon-192.png"})}}catch(e){}}
async function askNotify(){
  try{const N=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
    if(N){const p=await N.checkPermissions();if(p.display!=="granted")await N.requestPermissions();return}
    if("Notification"in window&&Notification.permission==="default")await Notification.requestPermission()}catch(e){}}
function watchJoin(){if(!SHARED()||!ME||!CP[ME]||!MYID||CP["u"+ME]!==MYID)return;const o=other(ME),id=CP["u"+o]||"none";let seen=null;
  try{seen=localStorage.getItem(JK)}catch(e){}
  if(seen===id)return;try{localStorage.setItem(JK,id)}catch(e){}
  /* Only tell you about a change you did not already see: a partner who joins after you started. */
  if(seen!==null&&id!=="none"&&id!==MYID){const p=pname(o),msg=tx(`${p} har gått med i er kalender`,`${p} has joined your calendar`);
    toast("💞 "+msg+" · "+tx("Nu ser ni samma kalender.","Now you see the same calendar."),6000);notify("Kalenderkoll",msg)}}

/* A notice when your partner adds something. This phone keeps a list of what it has already seen;
   anything new that this phone did not write itself comes from your partner. */
const SK="kalenderkoll.seen";let askedN=false;
function watchNew(){const ids=Object.keys(DOCS).filter(id=>/^(ev|note|todo|bd|memo)_/.test(id));let seen=null;
  try{const r=localStorage.getItem(SK);if(r)seen=new Set(JSON.parse(r))}catch(e){}
  const fresh=seen?ids.filter(id=>!seen.has(id)):[];if(seen&&!fresh.length)return;
  try{localStorage.setItem(SK,JSON.stringify([...new Set([...(seen||[]),...ids])].slice(-4000)))}catch(e){}
  const news=fresh.filter(id=>!MINE.has(id)&&!TOLD.has(id));if(!seen||!news.length||!SHARED()||!ME)return;
  const p=pname(other(ME)),v=DOCS[news[0]]||{},q=s=>String(s||"").slice(0,60);
  const msg=news.length>1?tx(`${p} har lagt till ${news.length} nya saker`,`${p} added ${news.length} new things`):
    v.kind==="ev"?tx(`${p} lade till: ${q(v.n)}`,`${p} added: ${q(v.n)}`)+(v.d?" ("+fmtD(dn(v.d),{day:"numeric",month:"short"})+")":""):
    v.kind==="note"?tx(`${p} skrev en lapp: ${q(v.txt)}`,`${p} wrote a note: ${q(v.txt)}`):
    v.kind==="memo"?tx(`${p} skrev en anteckning: ${q(v.ti||tx("utan rubrik","untitled"))}`,`${p} wrote a note: ${q(v.ti||"untitled")}`):
    v.kind==="todo"?tx(`${p} lade till en uppgift: ${q(v.n)}`,`${p} added a task: ${q(v.n)}`):
    tx(`${p} lade till en speciell dag: ${q(v.n)}`,`${p} added a special day: ${q(v.n)}`);
  toast(msg,5000);notify("Kalenderkoll",msg)}
/* The phone asks once whether the app may show notifications, the first time you tap something in a shared calendar. */
document.addEventListener("click",()=>{if(askedN||!SHARED()||!ME)return;askedN=true;askNotify()});
