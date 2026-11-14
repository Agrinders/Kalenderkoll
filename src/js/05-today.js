/* ---------- Shared rows ---------- */
const ICAKE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5h16M5.5 20.5v-7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v7"/><path d="M5.5 15.5c1.6 1 2.6 1 4.1 0s2.6-1 4.1 0 2.6 1 4.1 0"/><path d="M12 11.5V8.3"/></svg>';
const IFLAG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 21V3.5"/><path d="M5.5 4.5h12l-2.4 4.2 2.4 4.3h-12"/></svg>';
const IREP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3l3 3-3 3"/><path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4"/></svg>';
const IBELL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>';
const live=o=>{const now=Date.now();return o.e.t&&startMs(o)<=now&&endMs(o)>now};
function evRow(o,n,opt){const e=o.e,nowOn=n===todayN()&&live(o),past=n!=null&&n<=todayN()&&endMs(o)<=Date.now()&&!!e.t&&!(opt&&opt.nopast);
  const meta=[opt&&opt.date?cap(fmtD(o.s,{weekday:"short",day:"numeric",month:"short"})):"",e.pl?esc(e.pl):"",o.end>o.s&&(n==null||opt&&opt.date)?tx(`${o.end-o.s+1} dagar`,`${o.end-o.s+1} days`):""].filter(Boolean).join(" · ");
  return `<button class="evr${nowOn?" live":""}${past?" past":""}" data-ev="${esc(e.id)}" data-on="${nd(o.s)}" style="--k:${catVar(e.c)}"><i></i><span class="en"><b>${esc(e.n)}</b>${meta||e.r!=="o"||e.rem>=0?`<small>${meta}${e.r!=="o"?`<u title="${esc(repName(e.r))}">${IREP}</u>`:""}${e.rem>=0?`<u>${IBELL}</u>`:""}</small>`:""}</span><span class="et">${nowOn?`<em>${tx("Nu","Now")}</em>`:esc(timeLbl(o,n))}</span></button>`}
function bdRow(b,s,opt){const a=bdAge(b,s);return `<button class="evr bdr" data-bd="${esc(b.id)}"><i>${ICAKE}</i><span class="en"><b>${esc(bdText(b,s))}</b>${opt&&opt.date?`<small>${cap(fmtD(s,{weekday:"short",day:"numeric",month:"short"}))}</small>`:""}</span><span class="et">${opt&&opt.when?esc(inDays(s-todayN())):a&&b.ty!=="o"?a+tx(" år"," yrs"):""}</span></button>`}
const holRow=h=>`<div class="evr hol${h[3]?" red":""}"><i>${IFLAG}</i><span class="en"><b>${esc(h[1+li()])}</b><small>${h[3]?tx("Röd dag","Public holiday"):tx("Helgdagsafton","Holiday eve")}</small></span><span class="et"></span></div>`;
function dayRows(n,opt){const h=S.hol?holOn(n):null,L=onDay(n),B=bdOn(n);return (h?holRow(h):"")+B.map(b=>bdRow(b,n)).join("")+L.map(o=>evRow(o,n,opt)).join("")}
const dayCount=n=>onDay(n).length+bdOn(n).length;

/* ---------- Idag ---------- */
function greet(){const h=new Date().getHours();return h<5?tx("God natt","Good night"):h<10?tx("God morgon","Good morning"):h<13?tx("Hej","Hello"):h<18?tx("God eftermiddag","Good afternoon"):tx("God kväll","Good evening")}
function nextUp(){const now=Date.now(),n=todayN();return between(n,n+120).find(o=>o.e.t?endMs(o)>now:o.s>n)||null}
function renderHome(){const n=todayN(),now=Date.now();
  $("h_ex").classList.toggle("hide",!exampleMode);
  $("h_hi").innerHTML=`<b>${greet()}</b><span>${tx("Vecka","Week")} ${isoWeek(n)}</span>`;
  const big=$("h_big"),o=nextUp();big.classList.remove("verdict");
  if(!o){$("h_lbl").textContent=cap(fmtDay(n));big.textContent=tx("Ledigt","All clear");big.classList.add("verdict");$("h_sub").textContent=tx("Inget inplanerat de närmaste månaderna.","Nothing planned in the coming months.")}
  else{const st=startMs(o),mins=Math.round((st-now)/6e4),e=o.e,w=e.pl?" · "+e.pl:"";
    if(live(o)){$("h_lbl").textContent=tx("Pågår nu","Happening now");big.textContent=e.n;big.classList.add("verdict");$("h_sub").textContent=(e.t2?tx("Till ","Until ")+e.t2:tx("Började ","Started ")+e.t)+w}
    else if(o.s===n&&e.t){$("h_lbl").textContent=tx("Nästa idag","Next today");big.textContent=mins<90?tx(`Om ${Math.max(1,mins)} min`,`In ${Math.max(1,mins)} min`):e.t;$("h_sub").textContent=e.n+(mins<90?" · "+e.t:"")+w}
    else{$("h_lbl").textContent=tx("Nästa händelse","Next up");const d=o.s-n;big.textContent=d===1?tx("Imorgon","Tomorrow"):tx(`Om ${d} dagar`,`In ${d} days`);$("h_sub").textContent=e.n+" · "+cap(fmtD(o.s,{weekday:"short",day:"numeric",month:"short"}))+(e.t?" "+e.t:"")+w}}
  /* This week as a strip. */
  const mon=n-wdOf(n);$("hw_t").textContent=tx("Den här veckan","This week");$("hw_n").textContent=fmtD(mon,{day:"numeric",month:"short"})+" – "+fmtD(mon+6,{day:"numeric",month:"short"});
  $("h_strip").innerHTML=[0,1,2,3,4,5,6].map(i=>{const d=mon+i,L=onDay(d),B=bdOn(d),h=S.hol&&holOn(d);return `<button data-gday="${d}" class="${d===n?"t":""}${isRed(d)&&(S.hol||wdOf(d)===6)?" red":""}${d<n?" past":""}" aria-label="${esc(cap(fmtDay(d)))}"><small>${dshort(i)}</small><b>${ymd(d)[2]}</b><span class="dots">${B.length?'<i style="--k:var(--kb)"></i>':""}${L.slice(0,3-(B.length?1:0)).map(o=>`<i style="--k:${catVar(o.e.c)}"></i>`).join("")}${h&&!B.length&&!L.length?'<i style="--k:var(--bad)"></i>':""}</span></button>`}).join("");
  /* Today and the coming days. */
  $("ht_t").textContent=tx("Idag","Today")+" · "+fmtD(n,{weekday:"long",day:"numeric",month:"long"});$("ht_add").textContent=tx("＋ Lägg till","＋ Add");
  $("ht_list").innerHTML=dayRows(n)||`<p class="note" style="margin-top:4px">${tx("Inget idag. Njut av dagen.","Nothing today. Enjoy the day.")}</p>`;
  $("hn_t").textContent=tx("Kommande dagar","Coming days");$("hn_all").textContent=tx("Hela agendan →","Full agenda →");
  let h="",cnt=0;for(let d=n+1;d<=n+7&&cnt<8;d++){const r=dayRows(d,{nopast:1});if(!r)continue;h+=`<div class="hday">${esc(relDay(d))}</div>`+r;cnt+=dayCount(d)}
  $("hn_list").innerHTML=h||`<p class="note" style="margin-top:4px">${tx("Inget inplanerat den kommande veckan.","Nothing planned for the coming week.")}</p>`;
  const bd=BD.map(b=>({b,s:bdNext(b)})).filter(x=>x.s-n<=31).sort((a,b)=>a.s-b.s).slice(0,4);
  $("h_bd").classList.toggle("hide",!bd.length);$("hb_t").textContent=tx("Snart fyller","Coming birthdays");$("hb_all").textContent=tx("Alla →","All →");
  $("hb_list").innerHTML=bd.map(x=>bdRow(x.b,x.s,{when:1,date:1})).join("")}
