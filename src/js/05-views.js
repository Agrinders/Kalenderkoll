/* ---------- Rows ---------- */
const ICHK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.5 12.5 4 4L18.5 7.5"/></svg>',IX='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',IOK='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/></svg>';
const live=o=>{const now=Date.now();return !!o.e.t&&startMs(o)<=now&&endMs(o)>now};
const evCol=e=>e.col||pvar(e.w||"g");
/* An event in a list: a coloured block, or an indented glassy pill. Both can carry an icon. */
function evRow(o,n,withDate){const e=o.e,on=n!=null&&n===todayN()&&live(o),past=n!=null&&n===todayN()&&!!e.t&&endMs(o)<=Date.now();
  const meta=[withDate?cap(fmtD(o.s,{weekday:"short",day:"numeric",month:"short"})):"",e.pl||"",e.r&&e.r!=="o"?(e.r==="w"&&e.wd&&e.wd.length>1?e.wd.map(i=>dshort(i).toLowerCase()).join(", "):repName(e.r).toLowerCase()):""].filter(Boolean).join(" · ");
  return `<button class="evr ${e.st==="glass"?"glass":"fill"}${on?" now":""}${past?" past":""}" style="--c:${evCol(e)}" data-ev="${esc(e.id)}" data-on="${nd(o.s)}"><i class="ei${e.ic?fxCls(e.fx):""}">${e.ic?icon(e.ic):""}</i><span><b>${esc(e.n)}</b><small>${ava(e.w||"g")}<span>${esc(meta||pname(e.w||"g"))}</span></small></span><span class="et">${on?tx("Nu","Now"):esc(timeLbl(o,n))}</span></button>`}
function bdRow(b,s,when){const a=bdAge(b,s);return `<button class="evr bdr" data-bd="${esc(b.id)}"><span><b>${esc(bdText(b,s))}</b><small><span>${cap(fmtD(s,{weekday:"short",day:"numeric",month:"short"}))}</span></small></span><span class="et">${when?esc(inDays(s-todayN())):a&&b.ty==="b"?a+tx(" år"," yrs"):""}</span></button>`}
const holRow=h=>`<div class="evr soft${h[3]?" red":""}"><span><b>${esc(h[1+li()])}</b></span><span class="et"></span></div>`;
function dayRows(n){const h=S.hol?holOn(n):null;return (h?holRow(h):"")+bdOn(n).map(b=>`<button class="evr bdr" data-bd="${esc(b.id)}"><span><b>${esc(bdText(b,n))}</b></span><span class="et">♥</span></button>`).join("")+onDay(n).map(o=>evRow(o,n)).join("")}

/* ---------- Idag ---------- */
const nextUp=()=>{const now=Date.now(),n=todayN();return between(n,n+180).find(o=>o.e.t?endMs(o)>now:o.s>n)||null};
function renderHome(){const n=todayN(),now=Date.now(),o=nextUp(),big=$("h_big");
  $("h_date").textContent=tx("Vecka ","Week ")+isoWeek(n);$("h_hi").textContent=cap(fmtDay(n));big.classList.remove("word");
  {let off=false;try{off=localStorage.getItem("kalenderkoll.nudge")==="0"}catch(e){}const show=LOCAL&&SHARED()&&!!ME&&!!CP[ME]&&!joined()&&!off;$("h_inv").classList.toggle("hide",!show);if(show)$("h_inv").innerHTML=`<h3>${tx("Bjud in din partner","Invite your partner")}</h3><p class="muted">${tx("Skicka en länk, så ser ni samma kalender på båda telefonerna.","Send a link and you both see the same calendar on your phones.")}</p><div class="row2"><button class="btn" data-share>${tx("Skicka inbjudan","Send the invite")}</button><button class="lnk" data-nudgex>${tx("Inte nu","Not now")}</button></div>`}
  if(!o){$("h_lbl").textContent=tx("Härnäst","Next");big.textContent=tx("Inget planerat","Nothing planned");big.classList.add("word");$("h_sub").textContent=tx("Lägg till något under Kalender.","Add something under Calendar.")}
  else{const e=o.e,mins=Math.round((startMs(o)-now)/6e4),who=" · "+((e.w||"g")==="g"?tx("Ni båda","Both of you"):pname(e.w));
    if(live(o)){$("h_lbl").textContent=tx("Pågår nu","Now");big.textContent=e.n;big.classList.add("word");$("h_sub").textContent=(e.t2?tx("Till ","Until ")+e.t2:"")+who}
    else if(o.s===n){$("h_lbl").textContent=tx("Härnäst idag","Next today");big.textContent=mins<90?tx(`Om ${Math.max(1,mins)} min`,`In ${Math.max(1,mins)} min`):e.t;$("h_sub").textContent=e.n+(mins<90?" · "+e.t:"")+who}
    else{const d=o.s-n;$("h_lbl").textContent=tx("Härnäst","Next");big.textContent=d===1?tx("Imorgon","Tomorrow"):tx(`Om ${d} dagar`,`In ${d} days`);$("h_sub").textContent=e.n+" · "+cap(fmtD(o.s,{weekday:"short",day:"numeric",month:"short"}))+(e.t?" "+e.t:"")+who}}
  const mon=n-wdOf(n);
  $("h_strip").innerHTML=[0,1,2,3,4,5,6].map(i=>{const d=mon+i,L=onDay(d);return `<button data-gday="${d}" class="${d===n?"t":""}${fxCls(fxOf(L))}${S.hol&&isRed(d)||wdOf(d)===6?" red":""}${d<n?" past":""}" aria-label="${esc(cap(fmtDay(d)))}"><small>${dshort(i)}</small><b>${ymd(d)[2]}</b>${dIc(d)?`<span class="dic"${L.length?` style="--dc:${evCol(L[0].e)}"`:""}>${icon(dIc(d))}</span>`:`<span class="dots">${[...new Set(L.map(x=>evCol(x.e)))].slice(0,3).map(c=>`<i style="--p:${c}"></i>`).join("")}${bdOn(d).length?'<i style="--p:var(--acc)"></i>':""}</span>`}</button>`}).join("");
  $("ht_t").textContent=tx("Idag","Today");$("ht_list").innerHTML=dayRows(n)||`<p class="empty">${tx("Inget idag.","Nothing today.")}</p>`;
  let h="",cnt=0;for(let d=n+1;d<=n+7&&cnt<6;d++){const L=onDay(d).slice(0,6-cnt),hol=S.hol?holOn(d):null,B=bdOn(d);if(!L.length&&!hol&&!B.length)continue;cnt+=L.length+B.length;h+=`<p class="dayh">${esc(relDay(d))}</p>`+(hol?holRow(hol):"")+B.map(b=>bdRow(b,d)).join("")+L.map(o=>evRow(o,d)).join("")}
  if(h)h+=`<button class="lnk" data-go="k">${tx("Hela kalendern","Full calendar")}</button>`;
  $("hn_t").textContent=tx("Kommande vecka","Coming week");$("hn_list").innerHTML=h;$("h_soon").classList.toggle("hide",!h);
  const open=TODOS.filter(x=>!x.done&&(x.w==="g"||x.w===me())).sort((a,b)=>a.at-b.at);$("h_todo").classList.toggle("hide",!open.length);
  $("hd_t").textContent=tx("Att göra","To do");$("hd_all").textContent=tx("Alla","All");$("hd_list").innerHTML=open.slice(0,3).map(x=>todoRow(x,true)).join("")}

/* ---------- Kalender ---------- */
let P={y:NOW.getFullYear(),m:NOW.getMonth()},SEL=todayN();
function renderMonth(){const n=todayN(),first=dnOf(P.y,P.m,1),off=wdOf(first),rows=Math.ceil((off+dim(P.y,P.m))/7),start=first-off,B=between(start,start+rows*7-1);
  $("k_m").textContent=mn(P.m)+" "+P.y;["k_wk","k_gr"].forEach(id=>$(id).classList.toggle("wkn",S.wkno));
  $("k_wk").innerHTML=(S.wkno?`<span class="v"></span>`:"")+[0,1,2,3,4,5,6].map(i=>`<span>${dshort(i)}</span>`).join("");
  let h="";for(let r=0;r<rows;r++){if(S.wkno)h+=`<span class="v">${isoWeek(start+r*7)}</span>`;
    for(let i=0;i<7;i++){const d=start+r*7+i,[,m,dd]=ymd(d),L=B.filter(o=>o.s<=d&&o.end>=d),ws=[...new Set(L.map(x=>x.e.w||"g"))];
      const cls=[m!==P.m?"out":"",d===n?"t":"",d===SEL?"s":"",(wdOf(d)===6||(S.hol&&isRed(d)))?"red":""].filter(Boolean).join(" ");
      h+=`<button data-cday="${d}" class="${cls}" aria-label="${esc(cap(fmtDay(d)))}"${d===SEL?' aria-pressed="true"':""}><b class="${fxCls(fxOf(L)).trim()}">${dd}</b>${dIc(d)?`<span class="dic"${L.length?` style="--dc:${evCol(L[0].e)}"`:""}>${icon(dIc(d))}</span>`:""}<span class="cev">${(()=>{const B=bdOn(d).map(b=>`<u style="--c:var(--acc)">♥ ${esc(b.n)}</u>`),E=L.map(o=>`<u class="${o.e.st==="glass"?"gl":""}" style="--c:${evCol(o.e)}">${esc(o.e.n)}</u>`),A=[...B,...E],max=A.length>3?2:3;return A.slice(0,max).join("")+(A.length>max?`<em>+${A.length-max}</em>`:"")})()}</span></button>`}}
  $("k_gr").innerHTML=h;
  $("kd_t").innerHTML=(dIc(SEL)?icon(dIc(SEL))+" ":"")+esc(SEL===n?tx("Idag","Today"):cap(fmtDay(SEL)));$("kd_ic").innerHTML=icon(dIc(SEL)||"star")+`<span>${dIc(SEL)?tx("Byt dagens ikon","Change the day's icon"):tx("Ikon för dagen","Icon for the day")}</span>`;
  renderKV();if(KV==="day")renderDayView();$("k_now").textContent=tx("Till idag","To today");$("k_now").classList.toggle("hide",P.y===NOW.getFullYear()&&P.m===NOW.getMonth());
  $("kd_list").innerHTML=dayRows(SEL)||`<p class="empty">${tx("Inget den här dagen.","Nothing on this day.")}</p>`;$("kd_add").textContent=tx("＋ Lägg till ","＋ Add on ")+fmtD(SEL,{day:"numeric",month:"short"})}
/* The chosen day's events open in a sheet. */
const openDS=()=>$("ds").classList.add("on"),closeDS=()=>$("ds").classList.remove("on");
function pickDay(d){SEL=d;const[y,m]=ymd(d);P={y,m};renderMonth()}

/* ---------- Day view: both of you side by side ---------- */
let KV="month";try{const v=localStorage.getItem("kalenderkoll.kv");if(v==="day"||v==="month")KV=v}catch(e){}
function renderKV(){$("k_v").innerHTML=[["month",tx("Månad","Month")],["day",tx("Dag","Day")]].map(([v,l])=>`<button class="${KV===v?"on":""}" data-kv="${v}">${l}</button>`).join("");$("k_cal").classList.toggle("hide",KV==="day");if(KV==="day")closeDS();$("k_dv").classList.toggle("hide",KV!=="day")}
const HPX=58;
function renderDayView(){const n=SEL,L=onDay(n),timed=L.filter(o=>o.e.t&&o.s===n),all=L.filter(o=>!(o.e.t&&o.s===n)),st=o=>tmin(o.e.t),en=o=>Math.max(st(o)+30,o.e.t2&&tmin(o.e.t2)>st(o)?tmin(o.e.t2):st(o)+60);
  const h0=Math.min(7,...timed.map(o=>Math.floor(st(o)/60))),h1=Math.min(24,Math.max(22,...timed.map(o=>Math.ceil(en(o)/60)))),nowM=n===todayN()?new Date().getHours()*60+new Date().getMinutes():-1,hol=S.hol?holOn(n):null;
  $("dv_t").innerHTML=(dIc(n)?icon(dIc(n)):"")+`<span>${esc(n===todayN()?tx("Idag","Today")+", "+fmtD(n,{day:"numeric",month:"long"}):cap(fmtDay(n)))}</span>`;
  const col=w=>{const items=timed.filter(o=>(o.e.w||"g")===w||(o.e.w||"g")==="g").sort((a,b)=>st(a)-st(b)),lanes=[],pos=new Map();items.forEach(o=>{let i=lanes.findIndex(e=>e<=st(o));if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=en(o);pos.set(o,i)});
    return items.map(o=>{const e=o.e,nl=lanes.length,i=pos.get(o),top=(st(o)-h0*60)/60*HPX,ht=Math.max(e.st==="glass"?30:34,(en(o)-st(o))/60*HPX-4);
      return `<button class="dvev ${e.st==="glass"?"glass":"fill"}${(e.w||"g")==="g"?" both":""}${fxCls(e.fx)}" data-ev="${esc(e.id)}" data-on="${nd(o.s)}" style="--c:${evCol(e)};top:${top+2}px;height:${e.st==="glass"?Math.min(ht,40):ht}px;left:calc(${100/nl*i}% + 3px);width:calc(${100/nl}% - ${e.st==="glass"?12:6}px)">${e.ic?icon(e.ic):""}<span><b>${esc(e.n)}</b>${ht>44&&e.st!=="glass"?`<small>${e.t}${e.t2?"–"+e.t2:""}</small>`:""}</span></button>`}).join("")};
  const allDay=w=>all.filter(o=>(o.e.w||"g")===w||(o.e.w||"g")==="g").map(o=>`<button class="dvall${fxCls(o.e.fx)}" data-ev="${esc(o.e.id)}" data-on="${nd(o.s)}" style="--c:${evCol(o.e)}">${o.e.ic?icon(o.e.ic):""}<span>${esc(o.e.n)}</span></button>`).join("");
  const bd=bdOn(n).map(b=>`<button class="dvall" data-bd="${esc(b.id)}" style="--c:var(--acc)">${icon("cake")}<span>${esc(bdText(b,n))}</span></button>`).join("");
  let h=`<div class="dvh"><span></span><b class="pa">${ava("a")}${esc(pname("a"))}</b><b class="pb">${ava("b")}${esc(pname("b"))}</b></div>`;
  const ad=[allDay("a"),allDay("b")];if(ad[0]||ad[1]||bd||hol)h+=`<div class="dvad">${hol||bd?`<div class="dvfull">${hol?`<span class="hol${hol[3]?" red":""}">${esc(hol[1+li()])}</span>`:""}${bd}</div>`:""}<span class="adl">${tx("Heldag","All day")}</span><div>${ad[0]}</div><div>${ad[1]}</div></div>`;
  if(!L.length&&!bd&&!hol)h+=`<p class="muted dvhint">${tx("Inget planerat. Tryck på en tid för att lägga till.","Nothing planned. Tap a time to add something.")}</p>`;
  $("dv_head").innerHTML=h;h="";
  h+=`<div class="dvb" style="height:${(h1-h0)*HPX}px"><div class="dvg">`;for(let k=h0;k<h1;k++)h+=`<i style="top:${(k-h0)*HPX}px"><s>${pad(k)}:00</s></i>`;h+=`</div>`;
  h+=`<div class="dvcol pa" data-slot="a" data-h0="${h0}">${col("a")}</div><div class="dvcol pb" data-slot="b" data-h0="${h0}">${col("b")}</div>`;
  if(nowM>=h0*60&&nowM<=h1*60)h+=`<i class="nowl" style="top:${(nowM-h0*60)/60*HPX}px"></i>`;
  $("dv_body").innerHTML=h+`</div>`;
  const first=timed.length?Math.min(...timed.map(st)):nowM>=0?nowM-60:8*60;requestAnimationFrame(()=>{const b=$("dv_body");if(b&&b.dataset.n!==String(n)){b.dataset.n=n;b.scrollTop=Math.max(0,(first-h0*60)/60*HPX-20)}})}
(()=>{let sx=0,sy=0;const g=$("k_dv");g.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});g.addEventListener("touchend",e=>{const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)pickDay(SEL+(dx<0?1:-1))},{passive:true})})();
function moveMonth(k){const d=new Date(P.y,P.m+k,1);P={y:d.getFullYear(),m:d.getMonth()};const[sy,sm,sd]=ymd(SEL);if(sy!==P.y||sm!==P.m)SEL=P.y===NOW.getFullYear()&&P.m===NOW.getMonth()?todayN():dnOf(P.y,P.m,Math.min(sd,dim(P.y,P.m)));renderMonth()}
(()=>{let sx=0,sy=0;const g=$("k_cal");g.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});g.addEventListener("touchend",e=>{const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)moveMonth(dx<0?1:-1)},{passive:true})})();

/* ---------- Att göra ---------- */
let TF="g";
function todoRow(x,mini){const done=!!x.done;return `<div class="todo${done?" done":""}"><button class="tchk${done?" on":""}" data-tchk="${esc(x.id)}" aria-label="${esc(done?tx("Inte klar","Not done"):tx("Klar","Done"))}" aria-pressed="${done}">${ICHK}</button>${mini?`<span class="tn">${esc(x.n)}</span>${x.w!=="g"?ava(x.w):""}`:`<input class="tn" data-tn="${esc(x.id)}" value="${esc(x.n)}" aria-label="${esc(x.n)}"><button class="x" data-tdel="${esc(x.id)}" aria-label="${tx("Ta bort","Delete")}">${IX}</button>`}</div>`}
let TDOPEN=false;
function renderTodo(){const cnt=w=>TODOS.filter(x=>x.w===w&&!x.done).length;
  $("t_seg").innerHTML=["g","a","b"].map(w=>`<button class="${TF===w?"on":""}" data-tf="${w}"><span>${esc(w==="g"?tx("Båda","Both"):pname(w))}</span>${cnt(w)?`<small>${cnt(w)}</small>`:""}</button>`).join("");
  const ae=document.activeElement,typing=ae&&ae.dataset&&ae.dataset.tn&&$("t_list").contains(ae),open=TODOS.filter(x=>x.w===TF&&!x.done).sort((a,b)=>a.at-b.at),done=TODOS.filter(x=>x.w===TF&&x.done).sort((a,b)=>(b.dt||0)-(a.dt||0));
  if(!typing)$("t_list").innerHTML=open.length?open.map(x=>todoRow(x)).join(""):`<div class="tempty"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/></svg><b>${done.length?tx("Allt klart!","All done!"):tx("Inget på listan än","Nothing on the list yet")}</b><p>${TF==="g"?tx("Skriv något ni ska göra, eller börja med ett förslag.","Write something to do together, or start with a suggestion."):tx(`Skriv något för ${esc(pname(TF))}, eller börja med ett förslag.`,`Write something for ${esc(pname(TF))}, or start with a suggestion.`)}</p><div class="chips">${(li()?["Buy groceries","Plan the weekend","Book laundry time"]:["Handla mat","Planera helgen","Boka tvättid"]).map(x=>`<button type="button" class="chip" data-tsug="${x}">＋ ${x}</button>`).join("")}</div></div>`;
  $("t_q").placeholder=TF==="g"?tx("Något ni ska göra…","Something to do together…"):tx(`Något för ${pname(TF)}…`,`Something for ${pname(TF)}…`);$("t_add").setAttribute("aria-label",tx("Lägg till","Add"));
  $("t_done").innerHTML=done.length?`<details class="tdone"${TDOPEN?" open":""}><summary>${tx("Klara","Done")} (${done.length})</summary>${done.map(x=>todoRow(x)).join("")}<button class="lnk" id="t_clear">${tx("Rensa klara","Clear done")}</button></details>`:""}
document.addEventListener("toggle",e=>{if(e.target.classList&&e.target.classList.contains("tdone"))TDOPEN=e.target.open},true);

/* ---------- Vi ---------- */
const togetherDays=()=>CP.since&&dn(CP.since)<=todayN()?todayN()-dn(CP.since):null;
const agoT=ts=>{const m=Math.round((Date.now()-ts)/6e4);if(m<2)return tx("nyss","just now");if(m<60)return tx(`för ${m} min sedan`,`${m} min ago`);if(m<1440)return tx(`för ${Math.round(m/60)} tim sedan`,`${Math.round(m/60)} h ago`);const d=todayN()-dn(isoOf(new Date(ts)));return d===1?tx("igår","yesterday"):d<7?tx(`för ${d} dagar sedan`,`${d} days ago`):fmtD(dn(isoOf(new Date(ts))),{day:"numeric",month:"short"})};
function annNext(){if(!CP.since)return null;const s=dn(CP.since),[sy]=ymd(s),b={md:CP.since.slice(5),y:sy};let n=bdNext(b);return{n,years:ymd(n)[0]-sy}}
const joined=()=>!!(CP.ua&&CP.ub);
function renderUs(){const dt=togetherDays(),an=annNext(),n=todayN();
  $("v_duo").innerHTML=`<span>${ava("a","xl")}<b>${esc(pname("a"))}</b></span><i class="h">♥</i><span>${ava("b","xl")}<b>${esc(pname("b"))}</b></span>`;
  $("v_big").textContent=dt==null?"":tx(`${dt.toLocaleString("sv-SE")} dagar`,`${dt.toLocaleString("en-GB")} days`);$("v_big").classList.toggle("hide",dt==null);
  $("v_sub").textContent=dt==null?tx("Lägg in när ni blev ett par under Ändra namn och datum.","Add when you got together under Change names and date."):tx("tillsammans sedan ","together since ")+fmtD(dn(CP.since),{day:"numeric",month:"long",year:"numeric"});
  $("v_ann").classList.toggle("hide",!an);if(an){const d=an.n-n;$("v_ann").textContent=d===0?tx(`Grattis på er ${an.years}-årsdag ♥`,`Happy ${an.years}-year anniversary ♥`):tx(`${d} ${d===1?"dag":"dagar"} kvar till er ${an.years}-årsdag`,`${d} ${d===1?"day":"days"} to your ${an.years}-year anniversary`)}
  /* Invite: the shared version lives in Claude, where you share the page with each other. */
  const p=pname(other(me()));let inv="";
  if(LOCAL&&!SHARED())inv=`<h3>${tx("Inte ansluten just nu","Not connected right now")}</h3><p class="muted">${tx("Det du lägger in sparas på telefonen och delas så fort appen får kontakt igen.","What you add is saved on this phone and shared as soon as the app can connect again.")}</p>`;
  else if(LOCAL&&joined())inv=`<div class="ok">${IOK}<span>${tx("Ni är båda med. Allt ni lägger in syns hos den andra.","You are both in. Everything you add shows up for the other.")}</span></div><button class="lnk" id="v_share">${tx("Skicka inbjudan igen","Send the invite again")}</button>`;
  else if(LOCAL)inv=`<h3>${tx(`Bjud in ${esc(p)}`,`Invite ${esc(p)}`)}</h3><ol><li>${tx(`Skicka länken till ${esc(p)}.`,`Send the link to ${esc(p)}.`)}</li><li>${tx(`${esc(p)} öppnar den på sin telefon och väljer sitt namn.`,`${esc(p)} opens it on their phone and picks their name.`)}</li><li>${tx("Sedan ser ni samma kalender, och ändringar syns direkt.","Then you see the same calendar, and changes show up right away.")}</li></ol><button class="btn wide" id="v_share">${tx("Skicka inbjudan","Send the invite")}</button><p class="muted" style="margin-top:10px">${tx(`Har ${esc(p)} redan appen? Öppna den, tryck på menyn och välj Gå med med länk. Du får en notis när ${esc(p)} har gått med.`,`Does ${esc(p)} already have the app? Open it, tap the menu and choose Join with a link. You get a notification when ${esc(p)} has joined.`)}</p>`;
  else if(joined())inv=`<div class="ok">${IOK}<span>${tx(`Ni är båda med. Allt ni lägger in syns hos den andra.`,`You are both in. Everything you add shows up for the other.`)}</span></div>`;
  else inv=`<h3>${tx(`Bjud in ${p}`,`Invite ${p}`)}</h3><ol><li>${tx("Tryck på <b>Dela</b> för den här sidan i Claude.","Tap <b>Share</b> for this page in Claude.")}</li><li>${tx(`Lägg till ${esc(p)}s e-post och låt hen <b>redigera</b>.`,`Add ${esc(p)}'s email and let them <b>edit</b>.`)}</li><li>${tx(`Skicka länken. ${esc(p)} öppnar den i Claude-appen på telefonen och väljer sitt namn.`,`Send the link. ${esc(p)} opens it in the Claude app on their phone and picks their name.`)}</li></ol><button class="btn ghost wide" id="v_copy">${tx("Kopiera länken","Copy the link")}</button><p class="muted hide" id="v_link" style="user-select:all;word-break:break-all">${ART_URL}</p>`;
  if(LOCAL)inv+=`<button class="lnk wide" data-join>${joined()?tx("Gå med i en annan kalender","Join another calendar"):tx("Har du fått en länk? Gå med","Got a link? Join")}</button>`;
  $("v_inv").className="card inv";$("v_inv").innerHTML=inv;
  $("v_lh").textContent=tx("Lappar","Notes");$("v_ladd").textContent=tx("＋ Skriv","＋ Write");
  const N=[...NOTES].sort((a,b)=>b.at-a.at).slice(0,6);
  $("v_ll").innerHTML=N.length?N.map(x=>`<div class="lapp" data-note="${esc(x.id)}" role="button" tabindex="0"><small>${ava(x.f)}${esc(pname(x.f))} · ${esc(agoT(x.at))}</small><p>${esc(x.txt)}</p></div>`).join(""):`<p class="empty">${tx(`Skriv en liten lapp till ${esc(p)}.`,`Write a little note to ${esc(p)}.`)}</p>`;
  $("v_dh").textContent=tx("Viktiga dagar","Special days");$("v_dadd").textContent=tx("＋ Lägg till","＋ Add");
  const L=BD.map(b=>({b,s:bdNext(b)})).sort((a,b)=>a.s-b.s);
  $("v_dl").innerHTML=L.length?L.map(x=>bdRow(x.b,x.s,true)).join(""):`<p class="empty">${tx("Födelsedagar och andra dagar ni vill minnas.","Birthdays and other days you want to remember.")}</p>`;
  renderDrawer()}

/* ---------- Inställningar ---------- */
const segOf=(k,opts,cur)=>opts.map(([v,l])=>`<button class="${String(cur)===String(v)?"on":""}" data-${k}="${v}">${l}</button>`).join("");
function renderSettings(){
  $("c_h1").textContent=tx("Utseende och kalender","Look and calendar");$("c_thl").textContent=tx("Tema","Theme");$("c_lgl").textContent=tx("Språk","Language");$("c_wnl").textContent=tx("Veckonummer","Week numbers");$("c_hol").textContent=tx("Röda dagar","Public holidays");
  $("c_th").innerHTML=segOf("th",[["auto","Auto"],["light",tx("Ljust","Light")],["dark",tx("Mörkt","Dark")]],S.theme);
  $("c_lg").innerHTML=segOf("lg",[["sv","Svenska"],["en","English"]],S.lang);
  $("c_wn").innerHTML=segOf("wn",[["1",tx("Visa","Show")],["0",tx("Dölj","Hide")]],S.wkno?1:0);$("c_ho").innerHTML=segOf("ho",[["1",tx("Visa","Show")],["0",tx("Dölj","Hide")]],S.hol?1:0);
  {const can=LOCAL&&window.KK&&KK.signUp;$("c_acc").classList.toggle("hide",!can);if(can)$("c_acc").innerHTML=`<h3>${tx("Konto","Account")}</h3>`+(KK.email?`<div class="ok">${IOK}<span>${tx("Inloggad som ","Logged in as ")}<b>${esc(KK.email)}</b></span></div><p class="muted">${tx("Om du installerar om appen eller byter telefon loggar du in, så är allt tillbaka.","If you reinstall the app or change phones, log in and everything is back.")}</p>`:`<p class="muted">${tx("Skapa ett konto så kan du aldrig tappa kalendern. Installerar du om appen loggar du bara in igen.","Create an account and you can never lose the calendar. If you reinstall the app, you just log in again.")}</p><button class="btn wide" data-acc="up">${tx("Skapa konto","Create an account")}</button><button class="lnk wide" data-acc="in">${tx("Jag har redan ett konto","I already have an account")}</button>`)}
  $("c_h2").textContent=tx("Er data","Your data");$("c_st").textContent=!col?tx("Inte ansluten: inget sparas när sidan stängs.","Not connected: nothing is saved when the page closes."):!SHARED()?tx("Allt sparas bara på den här telefonen.","Everything is saved on this phone only."):tx("Kalendern är delad. Ändringar syns direkt hos den andra.","The calendar is shared. Changes show up for the other right away.");
  $("c_bk").classList.toggle("hide",!LOCAL);$("c_bk").textContent=NATIVE()?tx("En säkerhetskopia sparas automatiskt i Dokument › Kalenderkoll på telefonen. Om du installerar om appen trycker du på Återställ och väljer filen.","A backup is saved automatically in Documents › Kalenderkoll on the phone. If you reinstall the app, tap Restore and pick the file.")+(bkLast()?" "+tx("Senast sparad ","Last saved ")+bkLast()+".":""):tx("Spara en säkerhetskopia ibland. Om du byter telefon eller installerar om appen kan du hämta tillbaka allt från filen.","Save a backup now and then. If you change phones or reinstall the app, you can bring everything back from the file.");
  $("c_bkb").innerHTML=`<button class="btn wide" id="bk_save">${tx("Spara säkerhetskopia","Save a backup")}</button>`+(LOCAL?`<button class="btn ghost wide" id="bk_load">${tx("Återställ från säkerhetskopia","Restore from a backup")}</button>`:"");$("ics_out").textContent=tx("Exportera till telefonens kalender","Export to your phone's calendar");$("c_h3").textContent=tx("Börja om","Start over");$("c_rs").textContent=tx("Tar bort alla händelser, uppgifter och lappar för er båda. Det går inte att ångra.","Removes all events, tasks and notes for both of you. This cannot be undone.");$("reset").textContent=tx("Radera allt","Delete everything")}

/* ---------- Side menu ---------- */
function renderDrawer(){$("dr_sub").textContent=CP.a&&CP.b?CP.a+" ♥ "+CP.b:tx("Er gemensamma kalender","Your shared calendar");
  $("dr_join").lastElementChild.textContent=tx("Gå med med länk","Join with a link");$("dr_inv").lastElementChild.textContent=LOCAL&&!SHARED()?tx("Dela med varandra","Share with each other"):joined()?tx("Ansluten till ","Connected to ")+pname(other(me())):tx("Dela kalendern med din partner","Share the calendar with your partner");$("dr_names").lastElementChild.textContent=tx("Din profil","Your profile");
  $("dr_set").lastElementChild.textContent=t("ttlC");$("dr_ics").lastElementChild.textContent=tx("Exportera till telefonens kalender","Export to your phone's calendar");
  $("dr_lang").innerHTML=[["sv","🇸🇪","Svenska"],["en","🇬🇧","English"]].map(([v,f,l])=>`<button class="${S.lang===v?"on":""}" data-lg="${v}" aria-label="${l}" title="${l}" aria-pressed="${S.lang===v}">${f}</button>`).join("")}
const openDrawer=()=>{$("drawer").classList.add("on");$("scrim").classList.add("on")},closeDrawer=()=>{$("drawer").classList.remove("on");$("scrim").classList.remove("on")};

/* ---------- Drawing and moving between pages ---------- */
function render(){NOW=new Date();$("ttl").textContent=t("ttl"+tab.toUpperCase());renderHome();renderMonth();renderTodo();renderUs();renderSettings()}
const TABS=["h","k","t","v","c"];
function go(x){if(!TABS.includes(x))x="h";tab=x;try{sessionStorage.setItem("kalenderkoll.tab",x)}catch(e){}TABS.forEach(s=>$(s).classList.toggle("hide",s!==x));document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.go===x));$("dr_set").classList.toggle("on",x==="c");closeDrawer();closeDS();$("ttl").textContent=t("ttl"+x.toUpperCase());$("tadd").classList.toggle("hide",x!=="k");$("k_v").classList.toggle("hide",x!=="k");$("tadd").setAttribute("aria-label",x==="t"?tx("Ny uppgift","New task"):x==="v"?tx("Ny lapp","New note"):tx("Ny händelse","New event"));window.scrollTo(0,0)}
function applyTheme(){S.theme==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",S.theme)}
function applyLang(){document.documentElement.lang=S.lang;document.querySelectorAll("[data-i]").forEach(e=>{e.textContent=t(e.dataset.i)});$("es_n").placeholder=tx("Vad ska hända?","What's happening?");render()}
