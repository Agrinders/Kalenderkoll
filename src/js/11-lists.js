/* ---------- Agenda: everything coming up, grouped by day, with search ---------- */
const AG={past:false,q:"",lim:90};
function renderAgenda(){const n=todayN(),q=AG.q.trim().toLowerCase(),hit=e=>!q||[e.n,e.pl,e.o].some(x=>x&&x.toLowerCase().includes(q));
  $("a_rng").innerHTML=[["0",tx("Kommande","Coming up")],["1",tx("Tidigare","Earlier")]].map(([v,l])=>`<button class="chip ${(AG.past?"1":"0")===v?"on":""}" data-ag="${v}">${l}</button>`).join("");
  const span=q?Math.max(AG.lim,366):AG.lim,A=AG.past?n-span:n,B=AG.past?n-1:n+span,L=between(A,B).filter(o=>hit(o.e)),days=new Map(),add=(d,h)=>{if(!days.has(d))days.set(d,[]);days.get(d).push(h)};
  L.forEach(o=>{const d=Math.max(o.s,A);add(d,evRow(o,o.end>o.s?null:d,{nopast:AG.past}))});
  BD.filter(b=>!q||b.n.toLowerCase().includes(q)).forEach(b=>{const[y]=ymd(A);for(let k=y;k<=ymd(B)[0];k++){const s=bdOnYear(b,k);if(s>=A&&s<=B)add(s,bdRow(b,s))}});
  if(S.hol&&!q)for(let y=ymd(A)[0];y<=ymd(B)[0];y++)holidays(y).forEach(h=>{if(h[0]>=A&&h[0]<=B)add(h[0],holRow(h))});
  const keys=[...days.keys()].sort((a,b)=>AG.past?b-a:a-b);let lastM=-1;
  $("a_list").innerHTML=keys.length?keys.map(d=>{const[y,m]=ymd(d),mk=y*12+m,mh=mk!==lastM?`<div class="amon">${mn(m)} ${y!==NOW.getFullYear()?y:""}</div>`:"";lastM=mk;
    const hol=days.get(d).filter(x=>x.includes("evr hol")),rest=days.get(d).filter(x=>!x.includes("evr hol"));
    return mh+`<div class="aday${d===n?" t":""}"><button class="adh" data-gday="${d}"><b>${ymd(d)[2]}</b><small>${dshort(wdOf(d))}</small></button><div>${hol.join("")+rest.join("")}</div></div>`}).join("")
    :`<p class="note" style="margin-top:2px">${q?tx("Inget hittades.","Nothing found."):AG.past?tx("Inget de senaste månaderna.","Nothing in the past months."):tx("Inget inplanerat. Tryck Ny för att lägga till.","Nothing planned. Tap New to add something.")}</p>`;
  $("a_more").classList.toggle("hide",!!q||AG.lim>=730);$("a_more").textContent=AG.past?tx("Visa längre bak","Show further back"):tx("Visa längre fram","Show further ahead")}
$("a_q").addEventListener("input",()=>{AG.q=$("a_q").value;renderAgenda()});
$("a_more").onclick=()=>{AG.lim=Math.min(730,AG.lim+180);renderAgenda()};

/* ---------- Födelsedagar ---------- */
function renderBirthdays(){const n=todayN(),L=BD.map(b=>({b,s:bdNext(b)})).sort((a,b)=>a.s-b.s||a.b.n.localeCompare(b.b.n)),f=L[0];
  if(!f){$("f_lbl").textContent=tx("Nästa födelsedag","Next birthday");$("f_big").textContent="–";$("f_sub").textContent=tx("Lägg till dem du inte vill glömma.","Add the ones you do not want to forget.")}
  else{const d=f.s-n;$("f_lbl").textContent=f.b.ty==="b"?tx("Nästa födelsedag","Next birthday"):tx("Nästa högtidsdag","Next special day");$("f_big").textContent=d===0?tx("Idag!","Today!"):d===1?tx("Imorgon","Tomorrow"):tx(`${d} dagar`,`${d} days`);$("f_sub").textContent=bdText(f.b,f.s)+" · "+fmtD(f.s,{weekday:"long",day:"numeric",month:"long"})}
  $("f_head").textContent=tx("Alla","Everyone");$("f_add").textContent=tx("Lägg till födelsedag","Add a birthday");$("f_note").textContent=tx("Födelsedagarna syns också i kalendern, varje år.","Birthdays also show in the calendar, every year.");
  let lastM=-1;$("f_list").innerHTML=L.length?L.map(({b,s})=>{const[y,m]=ymd(s),k=y*12+m,h=k!==lastM?`<div class="hday">${mn(m)}${y!==NOW.getFullYear()?" "+y:""}</div>`:"";lastM=k;return h+bdRow(b,s,{when:1,date:1})}).join(""):`<p class="note" style="margin-top:0">${tx("Inga födelsedagar ännu.","No birthdays yet.")}</p>`}

/* ---------- Nedräkning: events marked to count down to ---------- */
function renderCountdown(){const n=todayN(),now=Date.now(),L=[];EV.filter(e=>e.cd).forEach(e=>{const o=occ(e,n-1,n+3650).map(s=>({e,s,end:s+evDur(e)})).find(x=>endMs(x)>now);if(o)L.push(o)});L.sort(byTime);
  const f=L[0],bar=$("d_bar");
  if(!f){$("d_lbl").textContent=tx("Räkna ner till något","Count down to something");$("d_big").textContent="–";$("d_sub").textContent=tx("Lägg till en resa, en konsert eller semestern.","Add a trip, a concert or the holiday.");bar.classList.add("hide")}
  else{const d=f.s-n,ms=startMs(f)-now;$("d_lbl").textContent=f.e.n;
    $("d_big").textContent=d>0?tx(`${d} ${d===1?"dag":"dagar"}`,`${d} ${d===1?"day":"days"}`):ms>0&&f.e.t?tx(`${Math.floor(ms/36e5)} tim ${Math.floor(ms%36e5/6e4)} min`,`${Math.floor(ms/36e5)} h ${Math.floor(ms%36e5/6e4)} min`):tx("Nu!","Now!");
    $("d_sub").textContent=cap(fmtDay(f.s))+(f.e.t?" "+f.e.t:"")+(d>=7?tx(` · ${Math.floor(d/7)} veckor och ${d%7} dagar`,` · ${Math.floor(d/7)} weeks and ${d%7} days`):"");
    /* The bar fills up from when you added it (or 100 days before) until the day. */
    const made=+((/^[a-z0-9]{8,}$/.test(f.e.id)&&parseInt(f.e.id.slice(0,8),36))||0),from=made>1e12&&made<startMs(f)?made:startMs(f)-100*864e5,p=Math.max(0,Math.min(1,(now-from)/(startMs(f)-from)));
    bar.classList.remove("hide");bar.firstElementChild.style.width=(p*100).toFixed(1)+"%"}
  $("d_head").textContent=tx("Dina nedräkningar","Your countdowns");$("d_add").textContent=tx("Ny nedräkning","New countdown");$("d_note").textContent=tx("Alla händelser kan visas här. Slå på Nedräkning när du lägger till eller ändrar en händelse.","Any event can show here. Turn on Countdown when you add or change an event.");
  $("d_list").innerHTML=L.length?L.map(o=>{const d=o.s-n;return `<button class="evr cdr" data-ev="${esc(o.e.id)}" data-on="${nd(o.s)}" style="--k:${catVar(o.e.c)}"><i></i><span class="en"><b>${esc(o.e.n)}</b><small>${cap(fmtD(o.s,{weekday:"short",day:"numeric",month:"short",year:ymd(o.s)[0]!==NOW.getFullYear()?"numeric":undefined}))}${o.e.t?" "+o.e.t:""}</small></span><span class="et"><b>${d<=0?tx("Nu","Now"):d}</b>${d>0?`<small>${d===1?tx("dag","day"):tx("dagar","days")}</small>`:""}</span></button>`}).join(""):`<p class="note" style="margin-top:0">${tx("Inga nedräkningar ännu.","No countdowns yet.")}</p>`;
  const H2=[];for(let y=ymd(n)[0];y<=ymd(n)[0]+1&&H2.length<3;y++)holidays(y).forEach(h=>{if(h[0]>=n&&H2.length<3&&(h[3]||EVES.includes(h[1])))H2.push(h)});
  $("d_hol").classList.toggle("hide",!S.hol);$("d_hh").textContent=tx("Lediga dagar som närmar sig","Days off coming up");$("d_hg").textContent=tx("Alla helgdagar →","All holidays →");
  $("d_hl").innerHTML=H2.map(h=>`<div class="row"><span>${esc(h[1+li()])}<small class="rs">${cap(fmtD(h[0],{weekday:"long",day:"numeric",month:"long"}))}</small></span><b>${esc(inDays(h[0]-n))}</b></div>`).join("")}

/* ---------- Helgdagar: the Swedish public holidays for a year, and the bridge days ---------- */
let XY=NOW.getFullYear();
function renderHolidays(){const n=todayN(),L=holidays(XY),br=bridges(XY),red=L.filter(h=>h[3]),onWk=red.filter(h=>wdOf(h[0])<5).length;
  $("x_t").textContent=tx(`Helgdagar ${XY}`,`Holidays ${XY}`);
  $("x_tiles").innerHTML=[[red.length,tx("röda dagar","public holidays")],[onWk,tx("på vardagar","on weekdays")],[br.length,tx("klämdagar","bridge days")]].map(([v,l])=>`<div class="tile"><b>${v}</b><small>${l}</small></div>`).join("");
  $("x_h1").textContent=tx("Alla helgdagar","All holidays");
  $("x_list").innerHTML=L.map(h=>`<div class="xrow${h[3]?" red":""}${h[0]<n?" past":""}"><span class="xd"><b>${ymd(h[0])[2]}</b><small>${ms(ymd(h[0])[1])}</small></span><span><b>${esc(h[1+li()])}</b><small>${cap(dOf(h[0]).toLocaleDateString(loc(),{weekday:"long"}))} · ${h[3]?tx("röd dag","public holiday"):tx("helgdagsafton","holiday eve")}</small></span>${h[0]>=n&&h[0]-n<=400?`<em>${esc(inDays(h[0]-n))}</em>`:""}</div>`).join("");
  $("x_h2").textContent=tx("Klämdagar","Bridge days");$("x_kn").textContent=tx("Vardagar mellan en ledig dag och helgen. Ta ledigt en dag, få flera lediga i rad.","Weekdays between a day off and the weekend. Take one day off and get several in a row.");
  $("x_kd").innerHTML=br.length?br.map(d=>{let a=d,b=d;while(offDay(a-1))a--;while(offDay(b+1))b++;return `<div class="row"><span>${cap(fmtD(d,{weekday:"long",day:"numeric",month:"long"}))}<small class="rs">${tx(`Ger ${b-a+1} lediga dagar i rad`,`Gives ${b-a+1} days off in a row`)}</small></span><b>${fmtD(a,{day:"numeric",month:"short"})}–${fmtD(b,{day:"numeric",month:"short"})}</b></div>`}).join(""):`<p class="note">${tx("Inga klämdagar det här året.","No bridge days this year.")}</p>`}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-xy]");if(b){XY+=+b.dataset.xy;renderHolidays()}});
