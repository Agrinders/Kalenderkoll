/* ---------- The bottom bar puts the keyboard away ----------
   A tap on the bar or in one of its menus closes the keyboard; formatting still goes to the line you were on.
   Only something new to write in (a new list, a list name, a link) opens the keyboard again. */
/* The keyboard is put away only after the tap has done its job. Putting it away while the finger is still down
   moves the bar under the finger, and the tap then lands on a line in the note instead. The view is held still
   while the keyboard slides away, so nothing jumps. */
var KBF=null;
function mmKbField(){const a=document.activeElement;return a&&$("mm_w").contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA")?a:null}
function mmHold(ms){const w=$("mm_w"),top=w.scrollTop,end=Date.now()+(ms||600);(function f(){if(Math.abs(w.scrollTop-top)>1)w.scrollTop=top;if(Date.now()<end)requestAnimationFrame(f)})()}
function mmKbAway(){const a=mmKbField();if(a){mmHold(700);a.blur()}MMKB=false}
function mmKbDown(e){if(!e.target.closest("input,textarea,select"))e.preventDefault()}
function mmKbAfter(){const was=KBF;KBF=null;if(was&&document.activeElement===was)mmKbAway()}
[document.querySelector(".mmbar"),$("mm_fmt"),$("mm_sym"),$("mm_lst")].forEach(el=>{
  el.addEventListener("pointerdown",e=>{KBF=mmKbField();MMKB=false;
    /* Words marked in a line stay marked, and the keyboard stays, so B, I, S and colours can go on them. */
    if(KBF&&KBF.tagName==="TEXTAREA"&&KBF.selectionStart!==KBF.selectionEnd){mmSel={el:KBF,s:KBF.selectionStart,e:KBF.selectionEnd};KBF=null;MMKB=true}},true);
  el.addEventListener("mousedown",mmKbDown,true);
  el.addEventListener("click",mmKbAfter)});

/* With a menu open, a tap in the note only closes the menu. It does not start writing or tick anything. */
const mmMenuOpen=()=>!$("mm_fmt").hidden||!$("mm_sym").hidden||!$("mm_lst").hidden;
function mmMenusShut(){mmFmt(false);mmSym(false);mmLst(false)}
$("mm_w").addEventListener("mousedown",e=>{if(!mmMenuOpen()||DR)return;e.preventDefault();e.stopPropagation();mmKbAway();mmMenusShut();mmSwallow=true;setTimeout(()=>{mmSwallow=false},600)},true);
$("mm_w").addEventListener("pointerdown",e=>{if(mmMenuOpen()&&e.target.closest(".mbgrip,.mb-lh"))e.stopPropagation()},true);
/* When a menu choice replaces the line (a heading, a list), the menus keep working on the new line,
   even though the keyboard stays away. */
const _focusEnd22=mmFocusEnd;mmFocusEnd=function(d){if(MMSOFT&&d&&d.isConnected){mmLast=d;const f=d.querySelector("textarea,input");if(f){const n=f.value.length;mmSel={el:f,s:n,e:n}}return}_focusEnd22(d)};
/* "Do not bring the keyboard up" lasts for one tap only, whatever the tap's handlers do with it. */
window.addEventListener("click",()=>setTimeout(()=>{MMSOFT=false},0),true);
["keydown","pointerdown","input"].forEach(ev=>window.addEventListener(ev,()=>{MMSOFT=false},true));
