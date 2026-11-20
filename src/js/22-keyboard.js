/* ---------- The bottom bar puts the keyboard away ----------
   A tap on the bar or in one of its menus closes the keyboard; formatting still goes to the line you were on.
   Only something new to write in (a new list, a list name, a link) opens the keyboard again. */
function mmKbAway(){const a=document.activeElement;if(a&&$("mm_w").contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"))a.blur();MMKB=false}
document.querySelector(".mmbar").addEventListener("pointerdown",mmKbAway,true);
["mm_fmt","mm_sym","mm_lst"].forEach(id=>$(id).addEventListener("pointerdown",mmKbAway,true));

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
