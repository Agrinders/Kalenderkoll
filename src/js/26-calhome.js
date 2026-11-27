/* ---------- The calendar is home ----------
   The app opens on the calendar, and on a phone the month fills the screen under the title bar.
   The tab bar hides; tap the title to bring it up when you want to go somewhere else.
   Swipe to change month (the month follows the finger), search sits in the title bar, and a small
   "Till idag" pill brings you back to this month. */
const NARROW=matchMedia("(max-width:859px)");
function calAuto(){const want=tab==="k"&&KV==="month"&&NARROW.matches;document.body.classList.toggle("ktab",tab==="k"&&NARROW.matches);
  const top=$("main_top");if(top)document.documentElement.style.setProperty("--toph",top.offsetHeight+"px");
  if(want!==CALFS)calFs(want)}
function navUp(on){document.body.classList.toggle("navup",on);$("ttl").setAttribute("aria-expanded",on?"true":"false")}
$("ttl").addEventListener("click",()=>{if(tab==="k"&&NARROW.matches)navUp(!document.body.classList.contains("navup"))});
$("ttl").setAttribute("role","button");
/* Picking a tab puts the bar away again on the calendar; a tap in the calendar does too. */
const _go26=go;go=function(x){navUp(false);const r=_go26.apply(this,arguments);$("tsrch").classList.toggle("hide",x!=="k");calAuto();return r};
const _render26=render;render=function(){_render26.apply(this,arguments);calAuto()};
$("k_cal").addEventListener("pointerdown",()=>{if(document.body.classList.contains("navup"))navUp(false)},true);
NARROW.addEventListener?NARROW.addEventListener("change",calAuto):NARROW.addListener(calAuto);
window.addEventListener("resize",()=>{const top=$("main_top");if(top)document.documentElement.style.setProperty("--toph",top.offsetHeight+"px")});
$("tsrch").onclick=()=>openSearch();$("tsrch").setAttribute("aria-label",tx("Sök","Search"));
/* Tapping the month's name goes back to this month. */
$("k_m").addEventListener("click",()=>{if(P.y===NOW.getFullYear()&&P.m===NOW.getMonth())return;$("k_now").click()});

/* Swiping: the month follows the finger, slides out, and the next one slides in from the other side. */
(()=>{const card=$("k_cal");let sx=0,sy=0,dx=0,on=false,dead=false,busy=false,W=1;
  const parts=()=>[$("k_gr"),$("k_m")];
  const put=x=>parts().forEach((el,i)=>{el.style.transform=`translateX(${x*(i?0.5:1)}px)`;el.style.opacity=String(1-Math.min(.6,Math.abs(x)/W*.9))});
  const clear=()=>parts().forEach(el=>{el.style.transform="";el.style.opacity=""});
  card.addEventListener("touchstart",e=>{if(busy||e.touches.length>1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;on=false;dead=false;W=card.clientWidth||360},{passive:true});
  card.addEventListener("touchmove",e=>{if(busy||dead)return;const t=e.touches[0],x=t.clientX-sx,y=t.clientY-sy;
    if(!on){if(Math.abs(y)>10&&Math.abs(y)>Math.abs(x)){dead=true;return}if(Math.abs(x)<10)return;on=true}
    dx=x;put(dx)},{passive:true});
  const done=()=>{if(!on){return}on=false;
    if(Math.abs(dx)<60){parts().forEach(el=>el.animate([{transform:el.style.transform,opacity:el.style.opacity},{transform:"none",opacity:1}],{duration:200,easing:"cubic-bezier(.2,.8,.2,1)"}));clear();return}
    busy=true;const k=dx<0?1:-1,out=-k*W*.55,ease="cubic-bezier(.3,.7,.3,1)";
    const a=parts().map((el,i)=>el.animate([{transform:el.style.transform,opacity:el.style.opacity},{transform:`translateX(${out*(i?0.5:1)}px)`,opacity:0}],{duration:140,easing:"ease-in",fill:"forwards"}));
    a[0].finished.then(()=>{moveMonth(k);a.forEach(x=>x.cancel());clear();
      parts().forEach((el,i)=>el.animate([{transform:`translateX(${-out*.6*(i?0.5:1)}px)`,opacity:0},{transform:"none",opacity:1}],{duration:240,easing:ease}));
      busy=false}).catch(()=>{busy=false;clear()});
    /* The finger lifted after a swipe is not a tap on a day. */
    const stop=e=>{e.stopPropagation();e.preventDefault()};card.addEventListener("click",stop,{capture:true,once:true});setTimeout(()=>card.removeEventListener("click",stop,{capture:true}),400)};
  card.addEventListener("touchend",done,{passive:true});card.addEventListener("touchcancel",()=>{if(on){on=false;clear()}},{passive:true})})();
$("tsrch").classList.toggle("hide",tab!=="k");calAuto();
/* Switching between the full month and the week or day view starts at the top, never under the title bar. */
const _calFs26=calFs;calFs=function(on){const was=CALFS;_calFs26(on);if(was!==CALFS){window.scrollTo(0,0);document.body.scrollTop=0;if(!CALFS){document.body.style.removeProperty("padding-top");setTimeout(fixTop,30)}}};
/* On a phone, Månad / Vecka / Dag sits in the heading of the view you are in, right of its name. */
function segPlace(){const seg=$("k_v");if(!seg)return;let host=null;
  if(NARROW.matches&&tab==="k"){const card=KV==="week"?$("k_wv"):KV==="day"?$("k_dv"):$("k_cal");host=card&&card.querySelector(".mnav")}
  if(host){if(seg.parentElement!==host)host.appendChild(seg)}
  else if(seg.parentElement!==$("main_top"))$("main_top").insertBefore(seg,$("tsrch"))}
const _calAuto27=calAuto;calAuto=function(){_calAuto27();segPlace()};
const _renderKV27=renderKV;renderKV=function(){_renderKV27.apply(this,arguments);segPlace()};
segPlace();
/* On a narrow phone the day's heading uses the short weekday so it fits beside Månad / Vecka / Dag. */
const _rdv27=renderDayView;renderDayView=function(){_rdv27.apply(this,arguments);if(!NARROW.matches)return;const s=$("dv_t").querySelector("span");if(s)s.textContent=SEL===todayN()?tx("Idag","Today")+", "+fmtD(SEL,{day:"numeric",month:"short"}).replace(/\./g,""):cap(fmtD(SEL,{weekday:"short",day:"numeric",month:"short"}).replace(/\./g,""))};
/* Week and day views reach down to the bottom of the screen, like the month, so more hours show at once. */
function fitTall(){["dv_body","wv_body"].forEach(id=>{const el=$(id);if(!el)return;
  if(!(NARROW.matches&&tab==="k")||!el.offsetParent){el.style.removeProperty("max-height");return}
  const top=el.getBoundingClientRect().top+window.scrollY;el.style.setProperty("--fitTop",Math.round(top)+"px");el.style.maxHeight="max(240px,calc(100dvh - var(--fitTop) - 26px - var(--sab)))"})}
const _rdv28=renderDayView;renderDayView=function(){_rdv28.apply(this,arguments);requestAnimationFrame(fitTall)};
const _rwv28=renderWeekView;renderWeekView=function(){_rwv28.apply(this,arguments);
  /* A shorter week heading on a phone, so the dates are not cut off beside Månad / Vecka / Dag. */
  const w=$("wv_t");if(NARROW.matches&&w&&w.children.length===0)w.textContent=w.textContent.replace(/^Vecka /,"v. ").replace(/^Week /,"Wk ");requestAnimationFrame(fitTall)};
const _calAuto28=calAuto;calAuto=function(){_calAuto28();requestAnimationFrame(fitTall)};
window.addEventListener("resize",()=>requestAnimationFrame(fitTall));
