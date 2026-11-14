/* ---------- Kalender: the month, and the chosen day below it ---------- */
let P={y:NOW.getFullYear(),m:NOW.getMonth()},SEL=todayN();
const isNowM=()=>P.y===NOW.getFullYear()&&P.m===NOW.getMonth();
const IBACK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5h11a5 5 0 0 1 0 10H9"/><path d="M8.5 6 4 10.5 8.5 15"/></svg>';
const mnavHtml=()=>`<div class="mnav"><button data-mv="-1" aria-label="${tx("Förra månaden","Previous month")}">‹</button><b>${mn(P.m)} ${P.y}</b><button data-mv="1" aria-label="${tx("Nästa månad","Next month")}">›</button></div>${isNowM()&&SEL===todayN()?"":`<button class="now" data-now>${IBACK}${tx("Tillbaka till idag","Back to today")}</button>`}`;
function renderMonth(){const n=todayN(),first=dnOf(P.y,P.m,1),off=wdOf(first),rows=Math.ceil((off+dim(P.y,P.m))/7),start=first-off;
  $("k_per").innerHTML=mnavHtml();$("k_cal").classList.toggle("wn",S.wkno);
  $("k_wk").innerHTML=(S.wkno?`<span class="v">${tx("v.","wk")}</span>`:"")+[0,1,2,3,4,5,6].map(i=>`<span class="${i===6?"red":""}">${dshort(i)}</span>`).join("");
  const B=between(start,start+rows*7-1);let h="";
  for(let r=0;r<rows;r++){if(S.wkno)h+=`<span class="v">${isoWeek(start+r*7)}</span>`;
    for(let i=0;i<7;i++){const d=start+r*7+i,[,m,dd]=ymd(d),L=B.filter(o=>o.s<=d&&o.end>=d),bd=bdOn(d),hol=S.hol&&holOn(d),all=[...bd.map(b=>({b})),...L];
      const cls=[m!==P.m?"out":"",d===n?"t":"",d===SEL?"s":"",(wdOf(d)===6||(hol&&hol[3]))?"red":"",d<n?"past":""].filter(Boolean).join(" ");
      const lab=cap(fmtDay(d))+(all.length?", "+tx(`${all.length} ${all.length===1?"sak":"saker"}`,`${all.length} ${all.length===1?"item":"items"}`):"")+(hol?", "+hol[1+li()]:"");
      h+=`<button data-cday="${d}" class="${cls}" aria-label="${esc(lab)}"${d===SEL?' aria-pressed="true"':""}><b>${dd}</b>`
        +`<span class="cd">${all.slice(0,3).map(x=>`<i style="--k:${x.b?"var(--kb)":catVar(x.e.c)}"></i>`).join("")}${all.length>3?"<em>+</em>":""}</span>`
        +`<span class="ct">${hol?`<u class="hl">${esc(hol[1+li()])}</u>`:""}${all.slice(0,hol?2:3).map(x=>x.b?`<u style="--k:var(--kb)">${esc(x.b.n)}</u>`:`<u style="--k:${catVar(x.e.c)}"${x.s<d?' class="cont"':""}>${x.e.t&&x.s===d?`<s>${x.e.t}</s> `:""}${esc(x.e.n)}</u>`).join("")}${all.length>(hol?2:3)?`<em>${tx(`+${all.length-(hol?2:3)} till`,`+${all.length-(hol?2:3)} more`)}</em>`:""}</span></button>`}}
  $("k_gr").innerHTML=h;
  $("kd_t").textContent=relDay(SEL)===cap(fmtDay(SEL))?cap(fmtDay(SEL)):relDay(SEL)+" · "+fmtD(SEL,{weekday:"short",day:"numeric",month:"short"});$("kd_w").textContent=tx("Vecka ","Week ")+isoWeek(SEL);
  $("kd_list").innerHTML=dayRows(SEL)||`<p class="note" style="margin-top:6px">${tx("Inget den här dagen.","Nothing on this day.")}</p>`;
  $("kd_add").textContent=tx("Lägg till ","Add on ")+fmtD(SEL,{day:"numeric",month:"short"})}
function pickDay(d){SEL=d;const[y,m]=ymd(d);P={y,m};renderMonth();FX.tab("k")}
function moveMonth(k){const d=new Date(P.y,P.m+k,1);P={y:d.getFullYear(),m:d.getMonth()};const[sy,sm,sd]=ymd(SEL);if(sy!==P.y||sm!==P.m)SEL=P.y===NOW.getFullYear()&&P.m===NOW.getMonth()?todayN():dnOf(P.y,P.m,Math.min(sd,dim(P.y,P.m)));renderMonth()}
/* Swipe sideways on the month to change month. */
(()=>{let sx=0,sy=0,on=false;const g=$("k_cal");
  g.addEventListener("touchstart",e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;on=true},{passive:true});
  g.addEventListener("touchend",e=>{if(!on)return;on=false;const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6){moveMonth(dx<0?1:-1);const a=g.animate&&!RM()?g.animate([{transform:`translateX(${dx<0?24:-24}px)`,opacity:.4},{transform:"none",opacity:1}],{duration:240,easing:"cubic-bezier(.2,.8,.2,1)"}):null}},{passive:true})})();
