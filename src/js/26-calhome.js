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

/* Swiping: the month follows the finger, slides out, and the next one slides in from the other side.
   Only transforms move (on their own layer), at most once a frame; the new month is drawn while hidden
   and only slides in once it is fully drawn, so nothing stutters. */
(()=>{const card=$("k_cal");let sx=0,sy=0,dx=0,on=false,dead=false,busy=false,W=1,raf=0;
  const parts=()=>[$("k_gr"),$("k_m")];
  const put=()=>{raf=0;const x=dx;parts().forEach((el,i)=>{el.style.transform=`translate3d(${x*(i?0.5:1)}px,0,0)`})};
  const layer=v=>parts().forEach(el=>{el.style.willChange=v?"transform,opacity":""});
  const clear=()=>parts().forEach(el=>{el.style.transform="";el.style.opacity=""});
  const frames=n=>new Promise(r=>{const f=()=>--n<=0?r():requestAnimationFrame(f);requestAnimationFrame(f)});
  card.addEventListener("touchstart",e=>{if(busy||e.touches.length>1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;on=false;dead=false;W=card.clientWidth||360},{passive:true});
  card.addEventListener("touchmove",e=>{if(busy||dead)return;const t=e.touches[0],x=t.clientX-sx,y=t.clientY-sy;
    if(!on){if(Math.abs(y)>10&&Math.abs(y)>Math.abs(x)){dead=true;return}if(Math.abs(x)<10)return;on=true;layer(true)}
    dx=x;if(!raf)raf=requestAnimationFrame(put)},{passive:true});
  const done=async()=>{if(!on)return;on=false;if(raf){cancelAnimationFrame(raf);raf=0}
    /* The finger lifted after a swipe is not a tap on a day. */
    const stop=e=>{e.stopPropagation();e.preventDefault()};card.addEventListener("click",stop,{capture:true,once:true});setTimeout(()=>card.removeEventListener("click",stop,{capture:true}),400);
    if(Math.abs(dx)<60){await Promise.all(parts().map((el,i)=>el.animate([{transform:`translate3d(${dx*(i?0.5:1)}px,0,0)`},{transform:"translate3d(0,0,0)"}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"}).finished.catch(()=>{})));clear();layer(false);return}
    busy=true;const k=dx<0?1:-1,out=-k*W;
    try{
      const a=parts().map((el,i)=>el.animate([{transform:`translate3d(${dx*(i?0.5:1)}px,0,0)`,opacity:1},{transform:`translate3d(${out*(i?0.5:1)}px,0,0)`,opacity:0}],{duration:170,easing:"cubic-bezier(.4,0,.9,.6)",fill:"forwards"}));
      await a[0].finished;
      parts().forEach(el=>{el.style.opacity="0"});a.forEach(x=>x.cancel());
      moveMonth(k);await frames(2);
      parts().forEach(el=>{el.style.transform="";el.style.opacity=""});
      await Promise.all(parts().map((el,i)=>el.animate([{transform:`translate3d(${-out*.35*(i?0.5:1)}px,0,0)`,opacity:0},{transform:"translate3d(0,0,0)",opacity:1}],{duration:260,easing:"cubic-bezier(.2,.8,.2,1)"}).finished.catch(()=>{})));
    }catch(e){}
    clear();layer(false);busy=false};
  card.addEventListener("touchend",done,{passive:true});card.addEventListener("touchcancel",()=>{if(on){on=false;clear();layer(false)}},{passive:true})})();
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
/* ---------- The tabs live in the side menu (phones) ----------
   The tab bar is gone on a phone; Idag, Kalender, Att göra and Vi are at the top of the side menu
   under "Menyer". The title no longer opens anything. */
navUp=function(){document.body.classList.remove("navup")};
(()=>{const dr=$("drawer"),brand=dr&&dr.querySelector(".dbrand");if(!brand)return;const box=document.createElement("div");box.id="dr_tabs";box.className="dtabs";
  box.innerHTML=`<div class="dsec" data-dk="mMenus"></div>`+[...document.querySelectorAll("nav button[data-go]")].map(b=>`<button class="di" type="button" data-go="${b.dataset.go}">${b.querySelector("svg").outerHTML}<span data-i="${b.querySelector("em").dataset.i}"></span></button>`).join("")+`<div class="dsec dsec2" data-dk="mMore"></div>`;
  brand.after(box);
  const paint=()=>{box.querySelector('[data-dk="mMenus"]').textContent=tx("Menyer","Menus");box.querySelector('[data-dk="mMore"]').textContent=tx("Mer","More");
    box.querySelectorAll("[data-go] span").forEach(s=>{s.textContent=t(s.dataset.i)});box.querySelectorAll("[data-go]").forEach(b=>b.classList.toggle("on",b.dataset.go===tab))};
  paint();const _go=go;go=function(x){const r=_go.apply(this,arguments);paint();return r};const _al=applyLang;applyLang=function(){_al.apply(this,arguments);paint()}})();
$("ttl").removeAttribute("role");$("ttl").removeAttribute("aria-expanded");
