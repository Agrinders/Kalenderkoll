/* ---------- Picking a date ---------- */
let DP=null;
function dpLabel(el){const v=el.value;el.querySelector("span").textContent=v?cap(dOf(dn(v)).toLocaleDateString(loc(),{weekday:"short",day:"numeric",month:"short",...(ymd(dn(v))[0]!==new Date().getFullYear()?{year:"numeric"}:{})})):(el.dataset.ph||tx("Välj datum","Pick a date"));el.classList.toggle("empty",!v)}
function paintDP(){const{y,m,el}=DP,sel=el.value,today=isoOf(new Date()),off=(new Date(y,m,1).getDay()+6)%7,dd=dim(y,m);$("dp_t").textContent=cap(mn(m))+" "+y;$("dp_w").innerHTML=[0,1,2,3,4,5,6].map(i=>`<span>${dshort(i)}</span>`).join("");let h="";
  for(let i=0;i<42;i++){const d=i-off+1;if(d<1||d>dd){h+="<i></i>";continue}const iso=y+"-"+pad(m+1)+"-"+pad(d);h+=`<button type="button" data-dd="${iso}" class="${iso===sel?"s":""}${iso===today?" t":""}${S.hol&&isRed(dn(iso))||wdOf(dn(iso))===6?" red":""}">${d}</button>`}
  $("dp_g").innerHTML=h;$("dp_no").textContent=tx("Avbryt","Cancel");$("dp_now").textContent=tx("Idag","Today");$("dp_cl").textContent=tx("Rensa datum","Clear date");$("dp_cl").classList.toggle("hide",!sel||el.dataset.req==="1")}
function openDP(el){const[y,m]=(el.value||el.dataset.base||isoOf(new Date())).split("-").map(Number);DP={el,y,m:m-1};paintDP();$("dp").classList.add("on")}
const closeDP=()=>{$("dp").classList.remove("on");DP=null};
const pickDP=v=>{if(!DP)return;DP.el.value=v;dpLabel(DP.el);DP.el.dispatchEvent(new Event("change",{bubbles:true}));closeDP()};
document.querySelectorAll(".dbtn").forEach(el=>{dpLabel(el);el.addEventListener("click",()=>openDP(el))});
$("dp").addEventListener("click",e=>{if(e.target===$("dp"))return closeDP();const d=e.target.closest("[data-dd]");if(d)return pickDP(d.dataset.dd);const a=e.target.closest("[data-dm]");if(a&&DP){const q=new Date(DP.y,DP.m+ +a.dataset.dm,1);DP.y=q.getFullYear();DP.m=q.getMonth();paintDP()}});
$("dp_no").onclick=closeDP;$("dp_now").onclick=()=>pickDP(isoOf(new Date()));$("dp_cl").onclick=()=>pickDP("");

/* ---------- Picking a time: an hour, then minutes ---------- */
let TP=null;
const addMin=(s,k)=>{const v=Math.min(23*60+55,Math.max(0,tmin(s)+k));return pad(Math.floor(v/60))+":"+pad(v%60)};
function tpLabel(el){el.querySelector("span").textContent=el.value||el.dataset.ph||"–";el.classList.toggle("empty",!el.value)}
function paintTP(){const[h,m]=TP.v?TP.v.split(":"):["",""];$("tp_v").textContent=(h||"––")+":"+(m||"––");
  $("tp_h").innerHTML=Array.from({length:24},(_,i)=>`<button type="button" data-th="${pad(i)}" class="${pad(i)===h?"s":""}">${pad(i)}</button>`).join("");
  $("tp_m").innerHTML=Array.from({length:12},(_,i)=>`<button type="button" data-tm="${pad(i*5)}" class="${pad(i*5)===m?"s":""}">:${pad(i*5)}</button>`).join("");
  $("tp_ok").textContent=tx("Klar","Done");$("tp_cl").textContent=TP.el.id==="es_t2"?tx("Ingen sluttid","No end time"):tx("Avbryt","Cancel")}
function openTP(el){TP={el,v:el.value||(el.id==="es_t2"&&$("es_t1").value?addMin($("es_t1").value,60):"")};$("tp_t").textContent=el.id==="es_t2"?tx("Slutar","Ends"):tx("Börjar","Starts");paintTP();$("tp").classList.add("on")}
const closeTP=()=>{$("tp").classList.remove("on");TP=null};
function setTP(v){const el=TP.el,old=el.value;el.value=v;tpLabel(el);if(el.id==="es_t1"&&v){const e2=$("es_t2"),dur=old&&e2.value&&tmin(e2.value)>tmin(old)?tmin(e2.value)-tmin(old):60;if(e2.value||!old){e2.value=addMin(v,dur);tpLabel(e2)}}if(ES)paintES();closeTP()}
$("tp").addEventListener("click",e=>{if(e.target===$("tp"))return closeTP();if(!TP)return;const h=e.target.closest("[data-th]"),m=e.target.closest("[data-tm]");if(h){TP.v=h.dataset.th+":"+(TP.v?TP.v.split(":")[1]:"00");paintTP()}else if(m){TP.v=(TP.v?TP.v.split(":")[0]:"12")+":"+m.dataset.tm;paintTP()}});
$("tp_ok").onclick=()=>{if(TP)setTP(TP.v||"12:00")};$("tp_cl").onclick=()=>{if(!TP)return;if(TP.el.id==="es_t2")setTP("");else closeTP()};
document.querySelectorAll(".tbtn").forEach(el=>{tpLabel(el);el.addEventListener("click",()=>openTP(el))});

/* ---------- One list to choose from ---------- */
let PK=null;
function openPK(title,items,cur,cb){PK=cb;$("pk_t").textContent=title;$("pk_no").textContent=tx("Avbryt","Cancel");$("pk_l").innerHTML=items.map(([v,l])=>`<button class="pko ${String(v)===String(cur)?"on":""}" data-pko="${esc(v)}">${esc(l)}</button>`).join("");$("pk").classList.add("on");const on=$("pk_l").querySelector(".on");if(on)setTimeout(()=>on.scrollIntoView({block:"center"}),0)}
const closePK=()=>{$("pk").classList.remove("on");PK=null};
$("pk_no").onclick=closePK;$("pk").addEventListener("click",e=>{if(e.target===$("pk"))return closePK();const b=e.target.closest("[data-pko]");if(b&&PK){const f=PK;closePK();f(b.dataset.pko)}});

/* ---------- A few options, for repeating events and for "who are you" ---------- */
let SCR=null;
function askOpts(title,sub,opts){return new Promise(res=>{SCR=res;$("sc_t").textContent=title;$("sc_s").textContent=sub;$("sc_s").classList.toggle("hide",!sub);$("sc_no").textContent=tx("Avbryt","Cancel");$("sc_o").innerHTML=opts.map(([v,a,b,bad])=>`<button class="opt${bad?" bad":""}" data-sco="${esc(v)}">${esc(a)}${b?`<small>${esc(b)}</small>`:""}</button>`).join("");$("sc").classList.add("on")})}
const closeSC=v=>{$("sc").classList.remove("on");const r=SCR;SCR=null;if(r)r(v||null)};
$("sc_no").onclick=()=>closeSC(null);$("sc").addEventListener("click",e=>{if(e.target===$("sc"))return closeSC(null);const b=e.target.closest("[data-sco]");if(b)closeSC(b.dataset.sco)});
const scopeOpts=(on,isDel)=>[["one",tx("Bara den här gången","Only this time"),fmtD(dn(on),{weekday:"short",day:"numeric",month:"short"}),isDel],["fwd",tx("Den här och kommande","This and coming times"),"",isDel],["all",tx("Alla gånger","Every time"),"",isDel]];

/* ---------- The event sheet ---------- */
let ES=null;
const esWd=()=>{const w=wdOf(dn($("es_d").value));return[...new Set([...ES.wd,w])].sort()};
function paintES(){const c=ES.col||pvar(ES.w),dd=ymd(dn($("es_d").value))[2],wdn=wdOf(dn($("es_d").value));
  $("es_wd").classList.toggle("hide",ES.r!=="w");$("es_wd").innerHTML=[0,1,2,3,4,5,6].map(i=>`<button type="button" class="${esWd().includes(i)?"on":""}${i===wdn?" base":""}" data-eswd="${i}" aria-pressed="${esWd().includes(i)}">${dshort(i)}</button>`).join("");
  $("es_fx").innerHTML=[["",tx("Ingen","None"),tx("Ingen","None")],...FX].map(([k,a,b])=>`<button type="button" class="${ES.fx===k?"on":""}" data-esfx="${k}"><span class="fxd${fxCls(k)}">${dd}</span><small>${li()?b:a}</small></button>`).join("");
  $("es_st").innerHTML=[["fill",tx("Block","Block")],["glass",tx("Glas","Glass")]].map(([v,l])=>`<button type="button" class="${ES.st===v?"on":""}" data-est="${v}">${l}</button>`).join("");
  $("es_pv").innerHTML=`<div class="evr ${ES.st==="glass"?"glass":"fill"}" style="--c:${c}"><i class="ei${ES.ic?fxCls(ES.fx):""}">${ES.ic?icon(ES.ic):""}</i><span><b>${esc($("es_n").value.trim()||tx("Så här ser den ut","This is how it looks"))}</b></span><span class="et">${ES.ad?tx("Heldag","All day"):esc($("es_t1").value||"")}</span></div>`;
  $("es_c").innerHTML=`<button type="button" class="swt auto${!ES.col?" on":""}" data-esc="" style="--c:${pvar(ES.w)}" aria-label="${esc(tx("Personens färg","The person's colour"))}"></button>`+COLORS.map(x=>`<button type="button" class="swt${ES.col===x?" on":""}" data-esc="${x}" style="--c:${x}" aria-label="${x}"></button>`).join("")+`<label class="swt cust${ES.col&&!COLORS.includes(ES.col)?" on":""}" style="--c:${ES.col&&!COLORS.includes(ES.col)?ES.col:"#ffffff"}" aria-label="${esc(tx("Valfri färg","Any colour"))}"><input type="color" id="es_cc" value="${ES.col||"#a996f7"}"></label>`;
  $("es_ic").innerHTML=`<button type="button" class="${!ES.ic?"on":""}" data-esi="" aria-label="${esc(tx("Ingen ikon","No icon"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/></svg></button>`+Object.keys(ICONS).map(k=>`<button type="button" class="${ES.ic===k?"on":""}" data-esi="${k}" aria-label="${k}">${icon(k)}</button>`).join("");
$("es_w").innerHTML=["g","a","b"].map(w=>`<button type="button" class="${ES.w===w?"on":""}" data-esw="${w}">${ava(w)}<span>${esc(w==="g"?tx("Båda","Both"):pname(w))}</span></button>`).join("");
  $("es_ad").textContent=tx("Heldag","All day");$("es_ad").classList.toggle("on",ES.ad);$("es_tw").classList.toggle("hide",ES.ad);
  $("es_r").innerHTML=(REPS.some(x=>x[0]===ES.r)?REPS:[...REPS,REPALL.find(x=>x[0]===ES.r)]).map(([v,a,b])=>`<button type="button" class="chip ${ES.r===v?"on":""}" data-esr="${v}">${li()?b:a}</button>`).join("");
  $("es_uw").classList.toggle("hide",ES.r==="o");$("es_ew").classList.toggle("hide",ES.r!=="o");$("es_extra").classList.toggle("hide",!ES.more);$("es_more").classList.toggle("hide",ES.more);$("es_more").textContent=ES.r==="o"?tx("＋ Flera dagar, plats och anteckning","＋ Several days, place and note"):tx("＋ Plats och anteckning","＋ Place and note")}
function openES(id,on,pre){const e=id?EV.find(z=>z.id===id):null;if(id&&!e)return;pre=pre||{};const n=todayN(),d=pre.d||nd(tab==="k"?SEL:n),nh=new Date().getHours()+1;
  const t1=e?e.t:pre.t||pad(dn(d)===n&&nh>=7&&nh<=22?nh:18)+":00";
  ES={id:e?e.id:null,on:e?(on||e.d):null,ad:e?!e.t:!!pre.ad,r:e?e.r||"o":"o",w:e?e.w||"g":pre.w||"g",col:e?e.col||"":pre.col||"",st:e?e.st||"fill":pre.st||"fill",ic:e?e.ic||"":pre.ic||"",fx:e?e.fx||"":"",wd:e&&e.r==="w"&&e.wd&&e.wd.length?[...e.wd]:[],more:!!(e&&(e.e||e.u||e.pl||e.o))};
  const sd=e?ES.on:d,dur=e?evDur(e):0;
  $("es_t").textContent=e?tx("Ändra","Edit"):tx("Ny händelse","New event");$("es_wl").textContent=tx("Vems","Whose");$("es_sl").textContent=tx("Utseende","Look");$("es_fl").textContent=tx("Effekt (syns runt händelsen och runt dagen)","Effect (shows around the event and the day)");$("es_dl").textContent=tx("När","When");$("es_rl").textContent=tx("Upprepa","Repeat");$("es_el").textContent=tx("Pågår flera dagar? Sista dagen","Lasts several days? The last day");$("es_ul").textContent=tx("Upprepa till och med","Repeat until");$("es_pl").textContent=tx("Plats","Place");$("es_ol").textContent=tx("Anteckning","Note");
  $("es_d").dataset.req="1";$("es_e").dataset.ph=tx("Samma dag","Same day");$("es_u").dataset.ph=tx("Tills vidare","Until further notice");$("es_t1").dataset.ph=tx("Börjar","Starts");$("es_t2").dataset.ph=tx("Slutar","Ends");
  $("es_n").value=e?e.n:pre.n||"";$("es_d").value=sd;$("es_e").value=dur?nd(dn(sd)+dur):"";$("es_e").dataset.base=$("es_u").dataset.base=sd;$("es_u").value=e?e.u||"":"";$("es_t1").value=e?e.t||"":t1;$("es_t2").value=e?e.t2||"":(t1?addMin(t1,60):"");$("es_p").value=e?e.pl||"":"";$("es_o").value=e?e.o||"":"";
  document.querySelectorAll("#es .tbtn").forEach(tpLabel);document.querySelectorAll("#es .dbtn").forEach(dpLabel);
  $("es_ok").textContent=e?tx("Spara","Save"):tx("Lägg till","Add");$("es_del").textContent=tx("Ta bort","Delete");$("es_ics").textContent=tx("Lägg i telefonens kalender","Add to your phone's calendar");$("es_del").classList.toggle("hide",!e);$("es_ics").classList.toggle("hide",!e);
  paintES();$("es").classList.add("on");$("es").querySelector(".box").scrollTop=0;if(!e&&!pre.n)setTimeout(()=>$("es_n").focus(),60)}
const closeES=()=>{$("es").classList.remove("on");ES=null};
$("es_x").onclick=closeES;
$("es").addEventListener("click",e=>{if(e.target===$("es"))return closeES();if(!ES)return;const g=x=>e.target.closest(x);let b;
  if(g("#es_ad")){ES.ad=!ES.ad;if(!ES.ad&&!$("es_t1").value){$("es_t1").value="18:00";$("es_t2").value="19:00";tpLabel($("es_t1"));tpLabel($("es_t2"))}paintES();return}
  if(b=g("[data-esw]")){ES.w=b.dataset.esw;paintES();return}if(b=g("[data-est]")){ES.st=b.dataset.est;paintES();return}if(b=g("[data-esc]")){ES.col=b.dataset.esc;paintES();return}if(b=g("[data-esfx]")){ES.fx=b.dataset.esfx;paintES();return}if(b=g("[data-eswd]")){const i=+b.dataset.eswd;if(i===wdOf(dn($("es_d").value))){toast(tx("Dagen du valde som datum är alltid med","The day you picked as the date is always included"));return}ES.wd=esWd().includes(i)?esWd().filter(x=>x!==i):[...esWd(),i];paintES();return}if(b=g("[data-esi]")){ES.ic=b.dataset.esi;paintES();return}if(b=g("[data-esr]")){ES.r=b.dataset.esr;
    /* A repeating event has a last time instead of an end date, so a date picked as the end moves there. */
    if(ES.r!=="o"&&$("es_e").value){if(!$("es_u").value){$("es_u").value=$("es_e").value;dpLabel($("es_u"))}$("es_e").value="";dpLabel($("es_e"))}paintES();return}if(g("#es_more")){ES.more=true;paintES();return}});
$("es_d").addEventListener("change",()=>{if(ES){if(ES.wd.length<=1)ES.wd=[];paintES()}$("es_e").dataset.base=$("es_u").dataset.base=$("es_d").value;if($("es_e").value&&$("es_e").value<$("es_d").value){$("es_e").value="";dpLabel($("es_e"))}});
const shiftIso=(iso,k)=>iso?nd(dn(iso)+k):"";
function esVals(){const d=$("es_d").value,e=$("es_e").value,u=$("es_u").value;return{n:$("es_n").value.trim(),d,e:ES.r==="o"&&e&&e>d?e:"",t:ES.ad?"":$("es_t1").value,t2:ES.ad?"":$("es_t2").value,r:ES.r,u:ES.r!=="o"&&u&&u>=d?u:"",pl:$("es_p").value.trim(),o:$("es_o").value.trim(),w:ES.w,col:ES.col,st:ES.st,ic:ES.ic,fx:ES.fx,wd:ES.r==="w"?esWd():[]}}
function saved(e,n,isNew){toast((isNew?tx("Tillagd","Added"):tx("Sparad","Saved"))+" · "+e.n+", "+relDay(n).toLowerCase()+(e.t?" "+e.t:""));if(tab==="k")pickDay(n);render()}
$("es_ok").onclick=async()=>{if(!ES)return;const v=esVals();if(!v.n){$("es_n").focus();toast(tx("Skriv vad det är först","Write what it is first"));return}if(!ES.ad&&!v.t){toast(tx("Välj en tid, eller Heldag","Pick a time, or All day"));return}
  const old=ES.id&&EV.find(z=>z.id===ES.id),on=ES.on;
  if(!old){const e={id:newId(),skip:[],...v};saveEv(e);closeES();saved(e,dn(v.d),true);return}
  const cur={n:old.n,d:on,e:evDur(old)?shiftIso(on,evDur(old)):"",t:old.t||"",t2:old.t2||"",r:old.r||"o",u:old.u||"",pl:old.pl||"",o:old.o||"",w:old.w||"g",col:old.col||"",st:old.st||"fill",ic:old.ic||"",fx:old.fx||"",wd:old.r==="w"?[...new Set([...(old.wd||[]),wdOf(dn(on))])].sort():[]};
  if(JSON.stringify(cur)===JSON.stringify(v)){closeES();return}
  let sc="all";if((old.r||"o")!=="o"){sc=await askOpts(old.n,tx("Det här upprepas. Vad vill du ändra?","This repeats. What do you want to change?"),scopeOpts(on,false));if(!sc)return}
  const delta=dn(v.d)-dn(on);
  if(sc==="one"){saveEv({...old,skip:[...(old.skip||[]),on]});const e={id:newId(),skip:[],...v,r:"o",u:""};saveEv(e);closeES();saved(e,dn(v.d));return}
  if(sc==="fwd"&&dn(on)>dn(old.d)){saveEv({...old,u:nd(dn(on)-1)});const e={id:newId(),...v,skip:(old.skip||[]).filter(x=>x>=on).map(x=>shiftIso(x,delta))};saveEv(e);closeES();saved(e,dn(v.d));return}
  const d0=shiftIso(old.d,delta),e={...old,...v,d:d0,e:v.e?shiftIso(d0,dn(v.e)-dn(v.d)):"",skip:(old.skip||[]).map(x=>shiftIso(x,delta))};saveEv(e);closeES();saved(e,dn(v.d))};
$("es_del").onclick=async()=>{if(!ES)return;const old=EV.find(z=>z.id===ES.id),on=ES.on;if(!old)return closeES();
  if((old.r||"o")==="o"){closeES();dropEv(old);render();return}
  const sc=await askOpts(old.n,tx("Det här upprepas. Vad vill du ta bort?","This repeats. What do you want to delete?"),scopeOpts(on,true));if(!sc)return;closeES();
  if(sc==="one"){saveEv({...old,skip:[...(old.skip||[]),on]});toast(tx("Borttagen · ","Removed · ")+old.n+", "+fmtD(dn(on),{day:"numeric",month:"short"}))}
  else if(sc==="fwd"&&dn(on)>dn(old.d)){saveEv({...old,u:nd(dn(on)-1)});toast(tx("Slutar · ","Ends · ")+old.n)}else dropEv(old);render()};
$("es_ics").onclick=()=>{const e=ES&&EV.find(z=>z.id===ES.id);if(e)icsSave([e],[],e.n)};

/* ---------- Special days: birthdays and anniversaries ---------- */
let BS=null;
function paintBS(){$("bs_ty").innerHTML=BTY.map(([v,a,b])=>`<button type="button" class="${BS.ty===v?"on":""}" data-bty="${v}">${li()?b:a}</button>`).join("");$("bs_d").querySelector("span").textContent=BS.d?String(BS.d):tx("Dag","Day");$("bs_m").querySelector("span").textContent=BS.m?cap(mn(BS.m-1)):tx("Månad","Month");$("bs_d").classList.toggle("empty",!BS.d);$("bs_m").classList.toggle("empty",!BS.m);$("bs_n").placeholder=BS.ty==="b"?tx("Vems födelsedag?","Whose birthday?"):tx("Vad firar ni?","What are you celebrating?");$("bs_yl").textContent=BS.ty==="b"?tx("Födelseår (valfritt)","Year of birth (optional)"):tx("År (valfritt)","Year (optional)")}
function openBS(id){const b=id?BD.find(z=>z.id===id):null;const[m,d]=b?b.md.split("-").map(Number):[0,0];BS={id:b?b.id:null,ty:b?b.ty||"b":"b",d,m};$("bs_t").textContent=b?tx("Ändra","Edit"):tx("Ny viktig dag","New special day");$("bs_dl").textContent=tx("Datum","Date");$("bs_n").value=b?b.n:"";$("bs_y").value=b&&b.y?b.y:"";$("bs_ok").textContent=b?tx("Spara","Save"):tx("Lägg till","Add");$("bs_del").textContent=tx("Ta bort","Delete");$("bs_del").classList.toggle("hide",!b);paintBS();$("bs").classList.add("on");if(!b)setTimeout(()=>$("bs_n").focus(),60)}
const closeBS=()=>{$("bs").classList.remove("on");BS=null};
$("bs_x").onclick=closeBS;$("bs").addEventListener("click",e=>{if(e.target===$("bs"))return closeBS();const b=e.target.closest("[data-bty]");if(b&&BS){BS.ty=b.dataset.bty;paintBS()}});
$("bs_d").onclick=()=>openPK(tx("Dag","Day"),Array.from({length:31},(_,i)=>[i+1,String(i+1)]),BS.d,v=>{if(BS){BS.d=+v;if(BS.m)BS.d=Math.min(BS.d,dim(2024,BS.m-1));paintBS()}});
$("bs_m").onclick=()=>openPK(tx("Månad","Month"),MNS[li()].map((x,i)=>[i+1,cap(x)]),BS.m,v=>{if(BS){BS.m=+v;if(BS.d)BS.d=Math.min(BS.d,dim(2024,BS.m-1));paintBS()}});
$("bs_ok").onclick=()=>{if(!BS)return;const n=$("bs_n").value.trim(),y=parseInt($("bs_y").value,10)||0;if(!n){$("bs_n").focus();toast(tx("Skriv ett namn först","Write a name first"));return}if(!BS.d||!BS.m){toast(tx("Välj dag och månad","Pick a day and month"));return}if(y&&(y<1850||y>NOW.getFullYear())){toast(tx("Året ser inte rätt ut","The year does not look right"));return}
  const b={id:BS.id||newId(),n,md:pad(BS.m)+"-"+pad(BS.d),y,ty:BS.ty},isNew=!BS.id;saveBd(b);closeBS();toast((isNew?tx("Tillagd","Added"):tx("Sparad","Saved"))+" · "+n+", "+inDays(bdNext(b)-todayN()));render()};
$("bs_del").onclick=()=>{const b=BS&&BD.find(z=>z.id===BS.id);closeBS();if(b){dropBd(b);render()}};

/* ---------- A note to each other ---------- */
let NS=null;
function openNS(id){const x=id?NOTES.find(z=>z.id===id):null,mine=!x||x.f===me();NS={id:x?x.id:null,f:x?x.f:me()};
  $("ns_t").textContent=x?tx("Lapp från ","Note from ")+pname(x.f):tx("Till ","To ")+pname(other(me()));$("ns_p").textContent=x?agoT(x.at):tx(`${pname(other(me()))} ser den nästa gång appen öppnas.`,`${pname(other(me()))} sees it next time the app opens.`);
  $("ns_tx").value=x?x.txt:"";$("ns_tx").placeholder=tx("Skriv något fint…","Write something nice…");$("ns_tx").readOnly=!mine;$("ns_ok").textContent=x?tx("Spara","Save"):tx("Skicka","Send");$("ns_ok").parentElement.classList.toggle("hide",!mine);$("ns_del").textContent=tx("Ta bort lappen","Delete the note");$("ns_del").classList.toggle("hide",!x);
  $("ns").classList.add("on");if(!x)setTimeout(()=>$("ns_tx").focus(),60)}
const closeNS=()=>{$("ns").classList.remove("on");NS=null};
$("ns_x").onclick=closeNS;$("ns").addEventListener("click",e=>{if(e.target===$("ns"))closeNS()});
$("ns_ok").onclick=()=>{if(!NS)return;const txt=$("ns_tx").value.trim();if(!txt){$("ns_tx").focus();return}const old=NS.id&&NOTES.find(z=>z.id===NS.id);saveNote(old?{...old,txt}:{id:newId(),f:NS.f,txt,at:Date.now()});closeNS();render();toast(old?tx("Sparad","Saved"):tx("Skickad till ","Sent to ")+pname(other(me()))+" ♥")};
$("ns_del").onclick=()=>{const x=NS&&NOTES.find(z=>z.id===NS.id);closeNS();if(x){dropNote(x);render()}};

/* ---------- Your names, and when you got together ---------- */
/* Names: each of you only writes your own. Your partner's name arrives when they join.
   mode "new" starts a calendar, "join" is a partner joining, false edits your own name. */
let CSM=false;
function openCS(mode){if(mode===true)mode="new";CSM=mode;const m=me(),o=other(m);
  $("cs_t").textContent=mode==="new"?tx("Välkommen till Kalenderkoll","Welcome to Kalenderkoll"):mode==="join"?tx("Välkommen!","Welcome!"):tx("Ditt namn","Your name");
  $("cs_p").textContent=mode==="new"?tx("En kalender för er två. Börja med ditt namn, din partner skriver sitt när hen går med.","A calendar for the two of you. Start with your name; your partner writes theirs when they join."):mode==="join"?(CP[o]?tx(`Du går med i kalendern du delar med ${CP[o]}. Vad heter du?`,`You are joining the calendar you share with ${CP[o]}. What is your name?`):tx("Vad heter du?","What is your name?")):tx("Ditt namn syns i kalendern och på listorna.","Your name shows in the calendar and on the lists.");
  $("cs_al").textContent=tx("Ditt namn","Your name");$("cs_sl").textContent=tx("Tillsammans sedan (valfritt)","Together since (optional)");
  $("cs_a").value=mode==="join"?"":CP[m]||"";$("cs_s").dataset.ph=tx("Välj datum","Pick a date");$("cs_s").dataset.base=CP.since||isoOf(new Date(NOW.getFullYear()-1,NOW.getMonth(),1));$("cs_s").value=CP.since||"";dpLabel($("cs_s"));
  $("cs_sl").classList.toggle("hide",mode==="join");$("cs_s").classList.toggle("hide",mode==="join");
  CSP={col:CP["c"+m]||"",img:PICS[m]||""};$("cs_pl").textContent=tx("Din bild (valfritt)","Your picture (optional)");$("cs_cl").textContent=tx("Din färg","Your colour");paintCSP();
  const first=mode==="new"||mode==="join";$("cs_no").textContent=tx("Avbryt","Cancel");$("cs_no").classList.toggle("hide",first);$("cs_ok").textContent=mode==="new"?tx("Börja","Start"):mode==="join"?tx("Gå med","Join"):tx("Spara","Save");$("cs_rs").textContent=tx("Har du en säkerhetskopia? Återställ den","Have a backup? Restore it");$("cs_rs").classList.toggle("hide",!(mode==="new"&&LOCAL));$("cs").classList.add("on");setTimeout(()=>$("cs_a").focus(),80)}
let CSP={col:"",img:""};
function paintCSP(){const m=me(),c=CSP.col||(m==="a"?"var(--pa)":"var(--pb)"),nm=$("cs_a").value.trim()||pname(m);
  $("cs_av").innerHTML=`<i class="ava xl${CSP.img?" pic":""}" style="--p:${c}${CSP.img?`;--img:url('${CSP.img}')`:""}">${esc((nm[0]||"?").toUpperCase())}</i>`;
  $("cs_pb").textContent=CSP.img?tx("Byt bild","Change picture"):tx("Välj bild","Pick a picture");$("cs_px").textContent=tx("Ta bort","Remove");$("cs_px").classList.toggle("hide",!CSP.img);
  $("cs_c").innerHTML=COLORS.map(x=>`<button type="button" class="swt${CSP.col.toLowerCase()===x.toLowerCase()?" on":""}" data-csc="${x}" style="--c:${x}" aria-label="${x}"></button>`).join("")+`<label class="swt cust${CSP.col&&!COLORS.includes(CSP.col)?" on":""}" style="--c:${CSP.col&&!COLORS.includes(CSP.col)?CSP.col:"#ffffff"}" aria-label="${esc(tx("Valfri färg","Any colour"))}"><input type="color" id="cs_cc" value="${CSP.col||"#a996f7"}"></label>`}
$("cs").addEventListener("click",e=>{const b=e.target.closest("[data-csc]");if(b){CSP.col=b.dataset.csc;paintCSP()}else if(e.target.closest("#cs_pb")){$("pic_in").value="";$("pic_in").click()}else if(e.target.closest("#cs_px")){CSP.img="";paintCSP()}});
$("cs").addEventListener("input",e=>{if(e.target.id==="cs_cc"){CSP.col=e.target.value;paintCSP()}else if(e.target.id==="cs_a"&&!CSP.img)paintCSP()});
/* The picture is cut to a square and shrunk, so it is small enough to save with the calendar. */
$("pic_in").addEventListener("change",()=>{const f=$("pic_in").files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{const S2=160,c=document.createElement("canvas");c.width=c.height=S2;const s=Math.min(im.width,im.height);c.getContext("2d").drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,S2,S2);URL.revokeObjectURL(u);const d=c.toDataURL("image/jpeg",.82);if(okPic(d)){CSP.img=d;paintCSP()}else toast(tx("Bilden gick inte att använda","That picture could not be used"))};
  im.onerror=()=>{URL.revokeObjectURL(u);toast(tx("Bilden gick inte att använda","That picture could not be used"))};im.src=u});
const closeCS=()=>$("cs").classList.remove("on");
$("cs_no").onclick=closeCS;$("cs").addEventListener("click",e=>{if(e.target===$("cs")&&!$("cs_no").classList.contains("hide"))closeCS()});
$("cs_ok").onclick=()=>{const a=$("cs_a").value.trim();if(!a){toast(tx("Skriv ditt namn","Write your name"));$("cs_a").focus();return}
  const m=me();setMe(m);CP[m]=a;CP["c"+m]=CSP.col||"";if(CSP.img!==(PICS[m]||"")){PICS[m]=CSP.img;if(CSP.img)put("pic_"+m,{kind:"pic",w:m,img:CSP.img});else del("pic_"+m)}applyPeople();askNotify();if(CSM!=="join")CP.since=$("cs_s").value||"";if(MYID)CP["u"+m]=MYID;if(CSM==="new"&&col)put("started",{kind:"started"});saveCouple();closeCS();if(window.KK&&KK.joinDone)KK.joinDone();render()};
$("es").addEventListener("input",e=>{if(!ES)return;if(e.target.id==="es_cc"){ES.col=e.target.value;paintES()}else if(e.target.id==="es_n"){const b=$("es_pv").querySelector("b");if(b)b.textContent=$("es_n").value.trim()||tx("Så här ser den ut","This is how it looks")}});

/* ---------- A day's icon ---------- */
let DS=null;
function pickDayIcon(n){DS={n};const cur=dIc(n);$("ip_t").textContent=tx("Ikon för ","Icon for ")+fmtD(n,{weekday:"long",day:"numeric",month:"long"});$("ip_il").classList.add("hide");$("ip_ok").classList.add("hide");$("ip_no").textContent=tx("Avbryt","Cancel");$("ip_none").textContent=tx("Ta bort ikonen","Remove the icon");$("ip_none").classList.toggle("hide",!cur);
  $("ip_l").innerHTML=Object.keys(ICONS).map(k=>`<button type="button" class="${cur===k?"on":""}" data-ipk="${k}" aria-label="${k}">${icon(k)}</button>`).join("");$("ip").classList.add("on")}
const closeIP=()=>{$("ip").classList.remove("on");DS=null};
$("ip_no").onclick=closeIP;
$("ip_none").onclick=()=>{if(!DS)return;const n=DS.n;closeIP();setDay(nd(n),"");render()};
$("ip").addEventListener("click",e=>{if(e.target===$("ip"))return closeIP();if(!DS)return;const b=e.target.closest("[data-ipk]");if(b){const n=DS.n;closeIP();setDay(nd(n),b.dataset.ipk);render()}});
