/* ---------- The bottom bar and the line you are on ----------
   The simple rule: the line with the blinking cursor is the line the buttons at the bottom work on.
   Tapping a button or a choice in its menu never takes the cursor away from that line, so you can go on writing.
   If no line has the cursor, the buttons work on the line you were on last and do not bring up the keyboard. */
function mmKbField(){const a=document.activeElement;return a&&$("mm_w").contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA")?a:null}
function mmKbAway(){const a=mmKbField();if(a)a.blur();MMKB=false}
[document.querySelector(".mmbar"),$("mm_fmt"),$("mm_sym"),$("mm_lst")].forEach(el=>{
  el.addEventListener("pointerdown",()=>{const S=selKeep();if(S){mmSel={el:S.el,s:S.s,e:S.e};SELHOLD=S}},true);
  /* The button never takes the focus, so the cursor stays where it is. */
  el.addEventListener("mousedown",e=>{if(!e.target.closest("input,textarea,select"))e.preventDefault()},true);
  el.addEventListener("click",()=>selBack())});

/* A tap beside the lines closes an open menu without bringing up the keyboard. Taps on lines work as usual. */
const mmMenuOpen=()=>!$("mm_fmt").hidden||!$("mm_sym").hidden||!$("mm_lst").hidden;
function mmMenusShut(){mmFmt(false);mmSym(false);mmLst(false)}
$("mm_w").addEventListener("mousedown",e=>{if(!mmMenuOpen()||DR)return;const d=e.target.closest("#mm_body>.mb");if(d&&/^(p|c|lh)$/.test(d.dataset.t))return;
  e.preventDefault();e.stopPropagation();mmSwallow=true;setTimeout(()=>{mmSwallow=false},600);mmMenusShut()},true);
/* An open menu follows the line you move to. */
$("mm_body").addEventListener("focusin",()=>{if(!$("mm_fmt").hidden){FMT_SUB="";mmFmtPaint()}if(!$("mm_lst").hidden)mmLst(true)});
/* When a menu choice replaces the line (a heading, a list) without a cursor, the menus keep working on the new line. */
const _focusEnd22=mmFocusEnd;mmFocusEnd=function(d){if(MMSOFT&&d&&d.isConnected){mmLast=d;const f=d.querySelector("textarea,input");if(f){const n=f.value.length;mmSel={el:f,s:n,e:n}}return}_focusEnd22(d)};
/* "Do not bring the keyboard up" lasts for one tap only, whatever the tap's handlers do with it. */
window.addEventListener("click",()=>setTimeout(()=>{MMSOFT=false},0),true);
["keydown","pointerdown","input"].forEach(ev=>window.addEventListener(ev,()=>{MMSOFT=false},true));
