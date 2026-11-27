/* ---------- The month on the whole screen ----------
   A button in the month's heading opens the month over the whole screen: no top bar, no tab bar,
   every day as large as the screen allows and as many events in each day as fit. Swipe for the next month,
   tap a day to see it, and the same button (or the back button) brings you back. Turn the phone sideways for times too. */
var CALFS=false;
function calFsOn(){return CALFS}
function fsIcon(){const b=$("k_fs");if(!b)return;b.setAttribute("aria-label",CALFS?tx("Stäng helskärm","Close full screen"):tx("Visa månaden i helskärm","Show the month full screen"));
  b.innerHTML=CALFS?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'}
function calFs(on){if(CALFS===on)return;CALFS=on;document.body.classList.toggle("calfs",on);fsIcon();renderMonth();
}
/* In full screen every event of the day is drawn, then the ones that do not fit are counted in a "+2" line. */
function calFsPaint(){const g=$("k_gr");if(!g)return;const one=g.querySelector("button[data-cday]"),wide=one&&one.clientWidth>=84;
  g.querySelectorAll("button[data-cday]").forEach(bt=>{const d=+bt.dataset.cday,c=bt.querySelector(".cev");if(!c)return;
    const A=[...bdOn(d).map(b=>`<u style="--c:var(--acc)">♥ ${esc(b.n)}</u>`),...between(d,d).filter(o=>o.s<=d&&o.end>=d).map(o=>`<u class="${stMini(o.e)}" style="--c:${evCol(o.e)}">${wide&&o.e.t&&o.s===d?`<i>${esc(o.e.t)}</i> `:""}${esc(o.e.n)}</u>`)];
    c.innerHTML=A.join("")});
  requestAnimationFrame(calFsFit)}
function calFsFit(){document.querySelectorAll("#k_gr .cev").forEach(c=>{const K=[...c.children];if(!K.length)return;const H=c.clientHeight;if(c.scrollHeight<=H+1)return;
  const em=document.createElement("em");c.appendChild(em);let n=0;for(let i=K.length-1;i>=0&&c.scrollHeight>H+1;i--){K[i].style.display="none";n++;em.textContent="+"+n}})}
const _renderMonth24=renderMonth;renderMonth=function(){if(CALFS&&KV!=="month"){calFs(false);return}_renderMonth24.apply(this,arguments);if(CALFS)calFsPaint()};
const _go24=go;go=function(x){if(CALFS&&x!=="k")calFs(false);return _go24.apply(this,arguments)};
let FST=0;window.addEventListener("resize",()=>{if(!CALFS)return;clearTimeout(FST);FST=setTimeout(calFsPaint,120)});
