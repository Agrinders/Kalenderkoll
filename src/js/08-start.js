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
$("reset").onclick=async()=>{if(!await ask(tx("Radera allt?","Delete everything?"),LOCAL?tx("Alla händelser, uppgifter, lappar och namn tas bort från den här telefonen.","All events, tasks, notes and names are removed from this phone."):tx("Alla händelser, uppgifter, lappar och namn tas bort, för er båda.","All events, tasks, notes and names are removed, for both of you."),tx("Radera","Delete")))return;
  const ids=allIds.filter(id=>id!=="plan");EV=[];BD=[];TODOS=[];NOTES=[];DAYS={};CP={a:"",b:"",ua:"",ub:"",since:""};if(col)await Promise.all(ids.map(id=>col.doc(id).delete().catch(()=>{})));render();go("h");setTimeout(()=>openCS(true),300)};

/* ---------- Start ---------- */
try{const l=JSON.parse(localStorage.getItem("kalenderkoll.look")||"null");if(l){if(l.lang==="sv"||l.lang==="en")S.lang=l.lang;if(["auto","light","dark"].includes(l.theme))S.theme=l.theme}}catch(e){}
applyTheme();applyLang();let startTab="h";try{const s=sessionStorage.getItem("kalenderkoll.tab");if(TABS.includes(s))startTab=s}catch(e){}go(startTab);
requestAnimationFrame(()=>document.documentElement.classList.remove("boot"));setTimeout(()=>document.documentElement.classList.remove("boot"),600);
let lastDay=todayN();
function tick(){const n=todayN();if(n!==lastDay){if(SEL===lastDay){SEL=n;const[y,m]=ymd(n);P={y,m}}lastDay=n}const ae=document.activeElement;if(!(ae&&ae.dataset&&ae.dataset.tn))render()}
setInterval(()=>{if(!document.hidden)tick()},6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
/* First time: your names. On a partner's phone: which of the two names is yours. */
let firstDone=false;
async function firstRun(){if(firstDone)return;firstDone=true;if(!CP.a||!CP.b){openCS(true);return}
  if(MYID){if(CP.ua===MYID){setMe("a");return}if(CP.ub===MYID){setMe("b");return}}
  if(ME&&!MYID)return;
  const free=["a","b"].filter(w=>!CP["u"+w]);if(ME&&!free.length)return;
  const w=await askOpts(tx("Vem är du?","Who are you?"),tx("Så vet appen vad som är ditt.","So the app knows what is yours."),[["a",CP.a,""],["b",CP.b,""]]);if(!w)return;setMe(w);if(MYID&&!CP["u"+w]){CP["u"+w]=MYID;saveCouple()}render()}
/* Everything is saved in shared storage (or on this phone in the installed version). */
(async()=>{let ok=false;try{
  const db=await claude.use("db");if(!db)throw 0;
  if(!LOCAL){try{const u=await claude.use("user");if(u&&u.id)MYID=await u.id()||""}catch(e){}}
  col=db.collection("cal");let first=true;
  col.onSnapshot(snap=>{ok=true;allIds=snap.docs.map(d=>d.id);DOCS={};const prevT=TODOS;EV=[];BD=[];TODOS=[];NOTES=[];DAYS={};let cp=null;
    snap.docs.forEach(d=>{const v=d.data()||{};DOCS[d.id]=copy(v);const iso=x=>/^\d{4}-\d\d-\d\d$/.test(x||"");
      if(d.id==="plan"){if(!PEND.has("plan")){if(typeof v.wkno==="boolean")S.wkno=v.wkno;if(typeof v.hol==="boolean")S.hol=v.hol}}
      else if(d.id==="couple")cp={a:String(v.a||""),b:String(v.b||""),ua:String(v.ua||""),ub:String(v.ub||""),since:iso(v.since)?v.since:""};
      else if(v.kind==="ev"&&iso(v.d))EV.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),d:v.d,e:iso(v.e)&&v.e>v.d?v.e:"",t:/^\d\d:\d\d$/.test(v.t||"")?v.t:"",t2:/^\d\d:\d\d$/.test(v.t2||"")?v.t2:"",r:["o","d","wd","w","2w","m","y"].includes(v.r)?v.r:"o",u:iso(v.u)?v.u:"",skip:Array.isArray(v.skip)?v.skip.filter(x=>typeof x==="string"):[],pl:String(v.pl||""),o:String(v.o||""),w:["a","b","g"].includes(v.w)?v.w:"g",col:/^#[0-9a-f]{6}$/i.test(v.col||"")?v.col:"",st:v.st==="glass"?"glass":"fill",ic:ICONS[v.ic]?v.ic:"",fx:fxCls(v.fx)?v.fx:"",wd:Array.isArray(v.wd)?[...new Set(v.wd.filter(x=>Number.isInteger(x)&&x>=0&&x<7))].sort():[]});
      else if(v.kind==="day"&&iso(v.d)&&ICONS[v.ic])DAYS[v.d]={ic:v.ic};
      else if(v.kind==="bd"&&/^\d\d-\d\d$/.test(v.md||""))BD.push({id:String(v.id||d.id.slice(3)),n:String(v.n||""),md:v.md,y:+v.y||0,ty:["b","a","o"].includes(v.ty)?v.ty:"b"});
      else if(v.kind==="todo"){const id=String(v.id||d.id.slice(5)),ae=document.activeElement,typing=ae&&ae.dataset&&ae.dataset.tn===id||PEND.has("todo_"+id);TODOS.push(typing&&prevT.find(z=>z.id===id)||{id,n:String(v.n||""),w:["a","b","g"].includes(v.w)?v.w:"g",done:!!v.done,at:+v.at||0,dt:+v.dt||0})}
      else if(v.kind==="note"&&typeof v.txt==="string")NOTES.push({id:String(v.id||d.id.slice(5)),f:v.f==="b"?"b":"a",txt:v.txt,at:+v.at||0})});
    /* Tasks added on this phone but not saved yet stay in the list. */
    prevT.forEach(x=>{if(PEND.has("todo_"+x.id)&&!TODOS.some(z=>z.id===x.id))TODOS.push(x)});
    CP=cp||{a:"",b:"",ua:"",ub:"",since:""};
    if(MYID){if(CP.ua===MYID)setMe("a");else if(CP.ub===MYID)setMe("b")}
    render();if(first){first=false;setTimeout(firstRun,200)}},()=>{col=null;render()});
}catch(e){}setTimeout(()=>{if(!ok&&!firstDone)firstRun()},col?10000:400)})();

/* Android back button: close what is open first, then go back to Idag, and only then leave. */
(()=>{const on=id=>$(id).classList.contains("on");
  function closeTop(){if(on("modal")){$("m_no").click();return true}for(const[id,f]of[["dp",closeDP],["tp",closeTP],["pk",closePK],["ip",closeIP],["sc",()=>closeSC(null)],["es",closeES],["bs",closeBS],["ns",closeNS],["ds",closeDS]])if(on(id)){f();return true}if(on("cs")&&!$("cs_no").classList.contains("hide")){closeCS();return true}if(on("drawer")){closeDrawer();return true}return false}
  const guard=()=>history.pushState({kk:1},"");try{history.replaceState({kk:0},"");guard()}catch(e){return}
  addEventListener("popstate",()=>{if(closeTop())return guard();if(tab!=="h"){go("h");return guard()}history.back()})})();
