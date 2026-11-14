/* ---------- Dates: the app's own calendar instead of the phone's standard one ---------- */
let DP=null;
function dpLabel(el){const v=el.value;let txt=el.dataset.ph||tx("Välj datum","Pick a date");if(v){const n=dn(v);txt=cap(dOf(n).toLocaleDateString(loc(),{weekday:"short",day:"numeric",month:"short",...(ymd(n)[0]!==new Date().getFullYear()?{year:"numeric"}:{})}))}el.querySelector("span").textContent=txt;el.classList.toggle("empty",!v)}
function paintDP(){const{y,m,el}=DP,sel=el.value,today=isoOf(new Date()),off=(new Date(y,m,1).getDay()+6)%7,dd=dim(y,m);$("dp_t").textContent=mn(m)+" "+y;$("dp_w").innerHTML=[0,1,2,3,4,5,6].map(i=>`<span>${dshort(i)}</span>`).join("");let h="";for(let i=0;i<42;i++){const d=i-off+1;if(d<1||d>dd){h+="<i></i>";continue}const iso=y+"-"+pad(m+1)+"-"+pad(d),n=dn(iso);h+=`<button type="button" data-dd="${iso}" class="${iso===sel?"s":""}${iso===today?" t":""}${S.hol&&isRed(n)?" red":""}" aria-label="${d} ${mn(m)} ${y}"${iso===sel?' aria-pressed="true"':""}>${d}</button>`}$("dp_g").innerHTML=h;$("dp_no").textContent=t("cancel");$("dp_now").textContent=tx("Idag","Today");$("dp_cl").textContent=tx("Rensa datum","Clear date");$("dp_cl").classList.toggle("hide",!sel||el.dataset.req==="1")}
function openDP(el){const base=el.value||el.dataset.base||isoOf(new Date()),[y,m]=base.split("-").map(Number);DP={el,y,m:m-1};paintDP();$("dp").classList.add("on")}
const closeDP=()=>{$("dp").classList.remove("on");if(DP)DP.el.focus();DP=null};
const pickDP=v=>{if(!DP)return;DP.el.value=v;DP.el.dispatchEvent(new Event("change",{bubbles:true}));closeDP()};
document.querySelectorAll(".dbtn").forEach(el=>{dpLabel(el);new MutationObserver(()=>dpLabel(el)).observe(el,{attributes:true,attributeFilter:["value"]});el.addEventListener("click",()=>openDP(el))});
$("dp").addEventListener("click",e=>{if(e.target===$("dp"))return closeDP();const d=e.target.closest("[data-dd]");if(d)return pickDP(d.dataset.dd);const a=e.target.closest("[data-dm]");if(a&&DP){const q=new Date(DP.y,DP.m+ +a.dataset.dm,1);DP.y=q.getFullYear();DP.m=q.getMonth();paintDP()}});
$("dp_no").onclick=closeDP;$("dp_now").onclick=()=>pickDP(isoOf(new Date()));$("dp_cl").onclick=()=>pickDP("");

/* ---------- Times: tap an hour, then the minutes ---------- */
let TP=null;
function tpLabel(el){el.querySelector("span").textContent=el.value||el.dataset.ph||"–";el.classList.toggle("empty",!el.value)}
function paintTP(){const[h,m]=TP.v?TP.v.split(":"):["",""];$("tp_v").textContent=(h||"––")+":"+(m||"––");$("tp_hl").textContent=tx("Timme","Hour");$("tp_ml").textContent=tx("Minut","Minute");
  $("tp_h").innerHTML=Array.from({length:24},(_,i)=>`<button type="button" data-th="${pad(i)}" class="${pad(i)===h?"s":""}">${pad(i)}</button>`).join("");
  $("tp_m").innerHTML=Array.from({length:12},(_,i)=>`<button type="button" data-tm="${pad(i*5)}" class="${pad(i*5)===m?"s":""}">${pad(i*5)}</button>`).join("");
  $("tp_no").textContent=t("cancel");$("tp_ok").textContent=tx("Klar","Done");$("tp_cl").textContent=tx("Ingen sluttid","No end time");$("tp_cl").classList.toggle("hide",TP.el.id!=="es_t2")}
function openTP(el){TP={el,v:el.value||(el.id==="es_t2"&&$("es_t1").value?addMin($("es_t1").value,60):"")};$("tp_t").textContent=el.id==="es_t2"?tx("Slutar","Ends"):tx("Börjar","Starts");paintTP();$("tp").classList.add("on")}
const closeTP=()=>{$("tp").classList.remove("on");if(TP)TP.el.focus();TP=null};
const addMin=(s,k)=>{const v=Math.min(23*60+55,Math.max(0,tmin(s)+k));return pad(Math.floor(v/60))+":"+pad(v%60)};
function setTP(v){const el=TP.el;el.value=v;tpLabel(el);if(el.id==="es_t1"&&v){const e2=$("es_t2");if(!e2.value||tmin(e2.value)<=tmin(v)){e2.value=addMin(v,60);tpLabel(e2)}}closeTP()}
$("tp").addEventListener("click",e=>{if(e.target===$("tp"))return closeTP();const h=e.target.closest("[data-th]"),m=e.target.closest("[data-tm]");if(!TP)return;
  if(h){const mm=TP.v?TP.v.split(":")[1]:"00";TP.v=h.dataset.th+":"+mm;paintTP()}else if(m){const hh=TP.v?TP.v.split(":")[0]:"12";TP.v=hh+":"+m.dataset.tm;paintTP()}});
$("tp_no").onclick=closeTP;$("tp_ok").onclick=()=>{if(TP)setTP(TP.v||"12:00")};$("tp_cl").onclick=()=>{if(TP)setTP("")};
document.querySelectorAll(".tbtn").forEach(el=>{tpLabel(el);el.addEventListener("click",()=>openTP(el))});

/* ---------- Choose: one list of options in a sheet ---------- */
let PK=null;
function openPK(title,items,cur,cb){PK=cb;$("pk_t").textContent=title;$("pk_no").textContent=t("cancel");$("pk_l").innerHTML=items.map(([v,l])=>`<button class="pko ${String(v)===String(cur)?"on":""}" data-pko="${esc(v)}"><span>${esc(l)}</span></button>`).join("");$("pk").classList.add("on");const on=$("pk_l").querySelector(".on");if(on)setTimeout(()=>on.scrollIntoView({block:"center"}),0)}
const closePK=()=>{$("pk").classList.remove("on");PK=null};
$("pk_no").onclick=closePK;$("pk").addEventListener("click",e=>{if(e.target===$("pk"))return closePK();const b=e.target.closest("[data-pko]");if(b&&PK){const f=PK;closePK();f(b.dataset.pko)}});

/* ---------- One time, from now on, or all: asked for repeating events ---------- */
let SCR=null;
function askScope(title,sub,opts){return new Promise(res=>{SCR=res;$("sc_t").textContent=title;$("sc_s").textContent=sub;$("sc_no").textContent=t("cancel");$("sc_o").innerHTML=opts.map(([v,a,b,bad])=>`<button class="opt${bad?" bad":""}" data-sco="${v}">${esc(a)}${b?`<small>${esc(b)}</small>`:""}</button>`).join("");$("sc").classList.add("on")})}
const closeSC=v=>{$("sc").classList.remove("on");const r=SCR;SCR=null;if(r)r(v||null)};
$("sc_no").onclick=()=>closeSC(null);$("sc").addEventListener("click",e=>{if(e.target===$("sc"))return closeSC(null);const b=e.target.closest("[data-sco]");if(b)closeSC(b.dataset.sco)});
const scopeOpts=(on,del)=>[["one",del?tx(`Bara ${fmtD(dn(on),{day:"numeric",month:"short"})}`,`Only ${fmtD(dn(on),{day:"numeric",month:"short"})}`):tx("Bara den här gången","Only this time"),tx("De andra gångerna är kvar som de är.","The other times stay as they are."),del],["fwd",tx("Den här och alla kommande","This and all coming times"),tx("Tidigare gånger är kvar.","Earlier times stay."),del],["all",tx("Alla gånger","Every time"),del?tx("Försvinner helt, även bakåt.","Disappears completely, earlier ones too."):tx("Även de som redan varit.","Including the ones already past."),del]];

/* ---------- The event sheet ---------- */
let ES=null;
const REMS=[[-1,"Ingen","None"],[0,"Vid start","At start"],[10,"10 min före","10 min before"],[60,"1 tim före","1 hour before"],[1440,"Dagen före","The day before"]];
const remLbl=(v,ad)=>ad&&v===0?tx("Samma dag kl 08","Same day at 08"):ad&&v===1440?tx("Dagen före kl 08","Day before at 08"):(REMS.find(x=>x[0]===v)||REMS[0])[1+li()];
function paintES(){const ad=ES.ad;
  $("es_ad").innerHTML=[["1",tx("Heldag","All day")],["0",tx("Med tid","With a time")]].map(([v,l])=>`<button type="button" class="${(ad?"1":"0")===v?"on":""}" data-esad="${v}">${l}</button>`).join("");
  $("es_tw").classList.toggle("hide",ad);$("es").querySelector(".esg").classList.toggle("one",ad);
  $("es_r").innerHTML=REPS.map(([v,a,b])=>`<button type="button" class="chip ${ES.r===v?"on":""}" data-esr="${v}">${li()?b:a}</button>`).join("");$("es_uw").classList.toggle("hide",ES.r==="o");
  $("es_c").innerHTML=CATS.map(([k,a,b])=>`<button type="button" class="chip ${ES.c===k?"on":""}" data-esc="${k}" style="--k:${catVar(k)}"><i></i>${li()?b:a}</button>`).join("");
  $("es_m").innerHTML=REMS.filter(x=>!(ad&&x[0]===10||ad&&x[0]===60)).map(([v])=>`<button type="button" class="chip ${ES.rem===v?"on":""}" data-esm="${v}">${remLbl(v,ad)}</button>`).join("");
  $("es_k").innerHTML=onOff("esk",ES.cd)}
function openES(id,on,pre){const e=id?EV.find(z=>z.id===id):null;if(id&&!e)return;const n=todayN();
  let d=pre&&pre.d?pre.d:nd(tab==="k"?SEL:n);
  const nh=new Date().getHours()+1,t1=e?e.t:pre&&pre.ad?"":pad(dn(d)===n&&nh>=7&&nh<=22?nh:9)+":00";
  ES={id:e?e.id:null,on:e?(on||e.d):null,ad:e?!e.t:!!(pre&&pre.ad),r:e?e.r||"o":"o",c:e?e.c||"o":"o",rem:e?(typeof e.rem==="number"?e.rem:-1):(pre&&pre.ad?-1:10),cd:e?!!e.cd:!!(pre&&pre.cd)};
  const sd=e?ES.on:d,dur=e?evDur(e):0;
  $("es_t").textContent=e?tx("Ändra händelse","Edit event"):pre&&pre.cd?tx("Ny nedräkning","New countdown"):tx("Ny händelse","New event");
  $("es_nl").textContent=tx("Vad?","What?");$("es_n").placeholder=tx("Till exempel Tandläkare","For example Dentist");$("es_dl").textContent=tx("Datum","Date");$("es_tl").textContent=tx("Tid","Time");$("es_el").textContent=tx("Slutdatum, om det pågår flera dagar","End date, if it lasts several days");$("es_rl").textContent=tx("Upprepa","Repeat");$("es_ul").textContent=tx("Sista gången (valfritt)","Last time (optional)");$("es_cl").textContent=tx("Kategori","Category");$("es_pl").textContent=tx("Plats (valfritt)","Place (optional)");$("es_ml").textContent=tx("Påminnelse","Reminder");$("es_kl").textContent=tx("Nedräkning","Countdown");$("es_kh").textContent=tx("Visa den här under Nedräkning, med dagar kvar.","Show this under Countdown, with days left.");$("es_ol").textContent=tx("Anteckning (valfritt)","Note (optional)");
  $("es_e").dataset.ph=tx("Samma dag","Same day");$("es_u").dataset.ph=tx("Fortsätter tills vidare","Goes on until further notice");$("es_t1").dataset.ph=tx("Start","Start");$("es_t2").dataset.ph=tx("Slut","End");$("es_d").dataset.req="1";
  $("es_n").value=e?e.n:"";$("es_d").value=sd;$("es_e").value=dur?nd(dn(sd)+dur):"";$("es_e").dataset.base=sd;$("es_u").value=e?e.u||"":"";$("es_u").dataset.base=sd;$("es_t1").value=e?e.t||"":t1;$("es_t2").value=e?e.t2||"":(t1?addMin(t1,60):"");$("es_p").value=e?e.pl||"":"";$("es_o").value=e?e.o||"":"";
  document.querySelectorAll("#es .tbtn").forEach(tpLabel);document.querySelectorAll("#es .dbtn").forEach(dpLabel);
  $("es_no").textContent=t("cancel");$("es_ok").textContent=t("saveW");$("es_del").textContent=tx("Ta bort händelsen","Delete event");$("es_ics").textContent=tx("Lägg i telefonens kalender","Add to your phone's calendar");
  $("es_del").classList.toggle("hide",!e);$("es_ics").classList.toggle("hide",!e);paintES();$("es").classList.add("on");$("es").querySelector(".mbox").scrollTop=0;if(!e)setTimeout(()=>$("es_n").focus(),60)}
const closeES=()=>{$("es").classList.remove("on");ES=null};
$("es").addEventListener("click",e=>{if(e.target===$("es"))return closeES();if(!ES)return;const g=x=>e.target.closest(x);let b;
  if(b=g("[data-esad]")){ES.ad=b.dataset.esad==="1";if(!ES.ad&&!$("es_t1").value){$("es_t1").value="09:00";$("es_t2").value="10:00";tpLabel($("es_t1"));tpLabel($("es_t2"))}if(ES.ad&&(ES.rem===10||ES.rem===60))ES.rem=0;paintES();return}
  if(b=g("[data-esr]")){ES.r=b.dataset.esr;paintES();return}
  if(b=g("[data-esc]")){ES.c=b.dataset.esc;paintES();return}
  if(b=g("[data-esm]")){ES.rem=+b.dataset.esm;paintES();return}
  if(b=g("[data-esk]")){ES.cd=b.dataset.esk==="1";paintES();return}});
$("es_d").addEventListener("change",()=>{$("es_e").dataset.base=$("es_u").dataset.base=$("es_d").value;if($("es_e").value&&$("es_e").value<$("es_d").value)$("es_e").value=""});
$("es_no").onclick=closeES;
function esVals(){const d=$("es_d").value,e=$("es_e").value,u=$("es_u").value,ad=ES.ad;
  return{n:$("es_n").value.trim(),d,e:e&&e>d?e:"",t:ad?"":$("es_t1").value,t2:ad?"":$("es_t2").value,r:ES.r,u:ES.r!=="o"&&u&&u>=d?u:"",c:ES.c,pl:$("es_p").value.trim(),o:$("es_o").value.trim(),rem:ES.rem,cd:ES.cd}}
const shiftIso=(iso,k)=>iso?nd(dn(iso)+k):"";
$("es_ok").onclick=async()=>{if(!ES)return;const v=esVals();if(!v.n){toast(t("tNeedName"));$("es_n").focus();return}if(!v.d){toast(t("tNeedDate"));return}if(!ES.ad&&!v.t){toast(tx("Välj en starttid, eller välj Heldag","Pick a start time, or choose All day"),"warn");return}
  const old=ES.id&&EV.find(z=>z.id===ES.id),on=ES.on;
  if(!old){const e={id:newId(),skip:[],...v};saveEv(e);closeES();afterSave(e,dn(v.d),true);return}
  const cur={n:old.n,d:on,e:evDur(old)?shiftIso(on,evDur(old)):"",t:old.t||"",t2:old.t2||"",r:old.r||"o",u:old.u||"",c:old.c||"o",pl:old.pl||"",o:old.o||"",rem:typeof old.rem==="number"?old.rem:-1,cd:!!old.cd};
  if(JSON.stringify(cur)===JSON.stringify(v)){closeES();return}
  let scope="all";
  if((old.r||"o")!=="o"){scope=await askScope(old.n,tx("Det här upprepas. Vad vill du ändra?","This repeats. What do you want to change?"),scopeOpts(on,false));if(!scope)return}
  const delta=dn(v.d)-dn(on);
  if(scope==="one"){saveEv({...old,skip:[...(old.skip||[]),on]});const e={id:newId(),skip:[],...v,r:"o",u:""};saveEv(e);closeES();afterSave(e,dn(v.d));return}
  if(scope==="fwd"&&dn(on)>dn(old.d)){saveEv({...old,u:nd(dn(on)-1)});const e={id:newId(),...v,skip:(old.skip||[]).filter(x=>x>=on).map(x=>shiftIso(x,delta))};saveEv(e);closeES();afterSave(e,dn(v.d));return}
  const nd0=shiftIso(old.d,delta),e={...old,...v,d:nd0,e:v.e?shiftIso(nd0,dn(v.e)-dn(v.d)):"",skip:(old.skip||[]).map(x=>shiftIso(x,delta)),u:v.u};saveEv(e);closeES();afterSave(e,dn(v.d))};
function afterSave(e,n,isNew){const w=relDay(n)+(e.t?" "+e.t:"");toast(isNew?t("tAdd",e.n)+" · "+w:t("tSave")+" · "+e.n+", "+w.charAt(0).toLowerCase()+w.slice(1));if(tab==="k")pickDay(n);render()}
$("es_del").onclick=async()=>{if(!ES)return;const old=EV.find(z=>z.id===ES.id),on=ES.on;if(!old)return closeES();
  if((old.r||"o")==="o"){closeES();dropEv(old);toast(t("tRem")+" · "+old.n,"del");render();return}
  const sc=await askScope(old.n,tx("Det här upprepas. Vad vill du ta bort?","This repeats. What do you want to delete?"),scopeOpts(on,true));if(!sc)return;closeES();
  if(sc==="one")saveEv({...old,skip:[...(old.skip||[]),on]});else if(sc==="fwd"&&dn(on)>dn(old.d))saveEv({...old,u:nd(dn(on)-1)});else dropEv(old);
  toast(t("tRem")+" · "+old.n+(sc==="one"?", "+fmtD(dn(on),{day:"numeric",month:"short"}):""),"del");render()};
$("es_ics").onclick=()=>{const e=ES&&EV.find(z=>z.id===ES.id);if(e)icsDownload([e],[],e.n)};

/* ---------- The birthday sheet ---------- */
let BS=null;
function paintBS(){$("bs_ty").innerHTML=BTY.map(([v,a,b])=>`<button type="button" class="${BS.ty===v?"on":""}" data-bty="${v}">${li()?b:a}</button>`).join("");$("bs_d").querySelector("span").textContent=BS.d?BS.d+"":tx("Dag","Day");$("bs_m").querySelector("span").textContent=BS.m?mn(BS.m-1):tx("Månad","Month");$("bs_d").classList.toggle("empty",!BS.d);$("bs_m").classList.toggle("empty",!BS.m);
  $("bs_nl").textContent=BS.ty==="b"?tx("Vem?","Who?"):tx("Vad?","What?");$("bs_n").placeholder=BS.ty==="b"?tx("Till exempel Mormor","For example Grandma"):BS.ty==="a"?tx("Till exempel Bröllopsdag","For example Wedding day"):tx("Till exempel Hundens dag","For example The dog's day");$("bs_yl").textContent=BS.ty==="b"?tx("Födelseår (valfritt)","Year of birth (optional)"):tx("Vilket år (valfritt)","Which year (optional)");$("bs_h").textContent=tx("Med år visas hur många år det blir.","With a year, the app shows how many years it will be.")}
function openBS(id){const b=id?BD.find(z=>z.id===id):null;const[,m,d]=b?[0,...b.md.split("-").map(Number)]:[0,0,0];BS={id:b?b.id:null,ty:b?b.ty||"b":"b",d,m};
  $("bs_t").textContent=b?tx("Ändra","Edit"):tx("Ny födelsedag","New birthday");$("bs_dl").textContent=tx("Datum","Date");$("bs_n").value=b?b.n:"";$("bs_y").value=b&&b.y?b.y:"";$("bs_no").textContent=t("cancel");$("bs_ok").textContent=t("saveW");$("bs_del").textContent=tx("Ta bort","Delete");$("bs_del").classList.toggle("hide",!b);paintBS();$("bs").classList.add("on");if(!b)setTimeout(()=>$("bs_n").focus(),60)}
const closeBS=()=>{$("bs").classList.remove("on");BS=null};
$("bs").addEventListener("click",e=>{if(e.target===$("bs"))return closeBS();const b=e.target.closest("[data-bty]");if(b&&BS){BS.ty=b.dataset.bty;paintBS()}});
$("bs_d").onclick=()=>{const k=BS;openPK(tx("Dag","Day"),Array.from({length:31},(_,i)=>[i+1,String(i+1)]),k.d,v=>{if(BS){BS.d=+v;if(BS.m&&BS.d>dim(2024,BS.m-1))BS.d=dim(2024,BS.m-1);paintBS()}})};
$("bs_m").onclick=()=>{const k=BS;openPK(tx("Månad","Month"),MNS[li()].map((x,i)=>[i+1,x]),k.m,v=>{if(BS){BS.m=+v;if(BS.d>dim(2024,BS.m-1))BS.d=dim(2024,BS.m-1);paintBS()}})};
$("bs_no").onclick=closeBS;
$("bs_ok").onclick=()=>{if(!BS)return;const n=$("bs_n").value.trim(),y=parseInt($("bs_y").value,10)||0;if(!n){toast(t("tNeedName"));$("bs_n").focus();return}if(!BS.d||!BS.m){toast(tx("Välj dag och månad","Pick a day and month"),"warn");return}if(y&&(y<1850||y>NOW.getFullYear())){toast(tx("Året ser inte rätt ut","The year does not look right"),"warn");return}
  const b={id:BS.id||newId(),n,md:pad(BS.m)+"-"+pad(BS.d),y,ty:BS.ty},isNew=!BS.id;saveBd(b);closeBS();const s=bdNext(b);toast((isNew?t("tAdd",n):t("tSave")+" · "+n)+" · "+inDays(s-todayN()));render()};
$("bs_del").onclick=()=>{if(!BS)return;const b=BD.find(z=>z.id===BS.id);closeBS();if(b){dropBd(b);toast(t("tRem")+" · "+b.n,"del");render()}};
