/* ---------- Marked words, everywhere you write ----------
   Words marked in a text line or a list point stay marked when you use the buttons at the bottom,
   and bold, italic, strike and colour go on just them, in list points too. */

/* Lines that can hold styled words: text lines and list points (not headings, prices or descriptions). */
function richOK(el){return !!(el&&el.isConnected&&((el.tagName==="TEXTAREA"&&!el.classList.contains("mbds")&&el.closest(".mb-p"))||(el.tagName==="INPUT"&&el.parentElement&&el.parentElement.classList.contains("mbf")&&el.closest(".mb-c"))))}

/* The phone may clear the marking the moment the finger lands on a button. The last marking is kept a moment so it can be put back. */
var LSEL=null,SELHOLD=null;
document.addEventListener("selectionchange",()=>{const a=document.activeElement;if(!a||!(a.tagName==="TEXTAREA"||a.tagName==="INPUT")||!$("mm_w").contains(a))return;
  if(a.selectionStart!==a.selectionEnd)LSEL={el:a,s:a.selectionStart,e:a.selectionEnd,alive:true,tc:0};
  else if(LSEL&&LSEL.el===a&&LSEL.alive){LSEL.alive=false;LSEL.tc=Date.now()}});
function selKeep(){const a=mmKbField();
  if(a&&a.selectionStart!==a.selectionEnd)return{el:a,s:a.selectionStart,e:a.selectionEnd};
  if(LSEL&&LSEL.el.isConnected&&(!a||a===LSEL.el)&&(LSEL.alive||Date.now()-LSEL.tc<1500))return{el:LSEL.el,s:LSEL.s,e:LSEL.e};
  return null}
/* After the button has done its work, the marking is shown again where it now is. */
function selBack(){const H=SELHOLD;SELHOLD=null;if(!H)return;const m=mmSel&&mmSel.el===H.el?mmSel:H,t=H.el;if(!t.isConnected)return;
  try{if(document.activeElement!==t)t.focus({preventScroll:true});t.setSelectionRange(Math.min(m.s,m.e),Math.max(m.s,m.e))}catch(e){}
  LSEL={el:t,s:Math.min(m.s,m.e),e:Math.max(m.s,m.e),alive:true,tc:0}}
["mm_fmt","mm_sym","mm_lst"].forEach(id=>$(id).addEventListener("click",()=>{if(SELHOLD)selBack()}));

/* Bold, italic, strike and colour on marked words, in text lines and list points alike. */
wrapSel=function(open,close){const S3=mmSel,t=S3&&S3.el;if(!richOK(t)){toast(tx("Markera några ord i en rad först","Select some words in a line first"));return false}
  const v=t.value,a=Math.min(S3.s,S3.e),b=Math.max(S3.s,S3.e);t.value=v.slice(0,a)+open+v.slice(a,b)+close+v.slice(b);const na=a+open.length,nb=b+open.length;
  if(!MMSOFT||document.activeElement===t){if(document.activeElement!==t)t.focus();t.setSelectionRange(na,nb)}
  mmSel={el:t,s:na,e:nb};if(SELHOLD&&SELHOLD.el===t)SELHOLD={el:t,s:na,e:nb};if(t.tagName==="TEXTAREA")mmGrow(t);mmChanged();const d=t.closest(".mb");liveUpd(d);inPaint(d);return true};
$("mm_fmt").addEventListener("click",e=>{const c=e.target.closest("[data-fk]"),S3=mmSel;
  if(c&&c.dataset.fk&&S3&&S3.el&&S3.el.tagName==="INPUT"&&richOK(S3.el)&&S3.s!==S3.e&&S3.el.closest(".mb")===mmTarget()){e.stopImmediatePropagation();wrapSel("{"+c.dataset.fk+"|","}")}},true);

/* A list point with styled words: the field draws nothing itself, the styled words are drawn exactly under it.
   While you write in it the marks stay (faint) so the cursor keeps in step; otherwise they are hidden. */
function inPaint(d){if(!d||d.dataset.t!=="c")return;const inp=d.querySelector(".mbf>input");if(!inp)return;
  const on=RICH_RE.test(inp.value);let o=d.querySelector(".mbio");d.classList.toggle("richi",on);if(!on){if(o)o.remove();return}
  if(!o){o=document.createElement("div");o.className="mbio";o.setAttribute("aria-hidden","true");inp.after(o)}
  const cs=getComputedStyle(inp);["fontFamily","fontSize","fontStyle","letterSpacing","paddingTop","paddingBottom","paddingLeft","paddingRight","lineHeight"].forEach(k=>o.style[k]=cs[k]);
  const live=document.activeElement===inp;o.classList.toggle("live",live);o.innerHTML=richHTML(inp.value,false,live)+"​";o.scrollLeft=live?inp.scrollLeft:0}
const _mbBlock23=mmBlock;mmBlock=function(b){const d=_mbBlock23(b);if(b.t==="c"&&RICH_RE.test(b.x||""))requestAnimationFrame(()=>inPaint(d));return d};
$("mm_body").addEventListener("input",e=>{if(e.target.tagName==="INPUT")inPaint(e.target.closest(".mb-c"))});
$("mm_body").addEventListener("focusin",e=>{if(e.target.tagName==="INPUT")inPaint(e.target.closest(".mb-c"))});
$("mm_body").addEventListener("focusout",e=>{if(e.target.tagName==="INPUT"){const d=e.target.closest(".mb-c");setTimeout(()=>inPaint(d),0)}});
$("mm_body").addEventListener("scroll",e=>{const t=e.target;if(t.tagName==="INPUT"){const o=t.parentElement.querySelector(".mbio");if(o)o.scrollLeft=t.scrollLeft}},true);
document.addEventListener("selectionchange",()=>{const a=document.activeElement;if(a&&a.tagName==="INPUT"&&a.parentElement&&a.parentElement.classList.contains("mbf")){const o=a.parentElement.querySelector(".mbio");if(o)o.scrollLeft=a.scrollLeft}});
["mm_fmt","mm_lst"].forEach(id=>$(id).addEventListener("click",()=>requestAnimationFrame(()=>document.querySelectorAll("#mm_body .mb-c.richi").forEach(inPaint))));
