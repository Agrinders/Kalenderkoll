/* ---------- Notes, round 3: finding words and moving everything ---------- */

/* Search marks the word itself, not the whole line. Text fields cannot colour single letters, so a see-through copy
   of the text is laid exactly over the field with only the found words painted. */
var FDQ="";
function fdEsc(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function fdHits(v,q){const lo=v.toLocaleLowerCase(),R=[];if(!q)return R;let i=lo.indexOf(q);while(i>=0){R.push(i);i=lo.indexOf(q,i+q.length)}return R}
function fdCover(f,q){if(!f.offsetWidth||!f.offsetHeight)return;const v=f.value||"",H=fdHits(v,q);if(!H.length)return;
  const P=f.parentElement;if(getComputedStyle(P).position==="static"){P.style.position="relative";P.dataset.fdpos="1"}
  const cs=getComputedStyle(f),o=document.createElement("div");o.className="fdm";o.setAttribute("aria-hidden","true");
  ["fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing","wordSpacing","textTransform","textIndent","textAlign","paddingTop","paddingRight","paddingBottom","paddingLeft","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","boxSizing"].forEach(k=>o.style[k]=cs[k]);
  o.style.borderStyle="solid";o.style.borderColor="transparent";o.style.whiteSpace=f.tagName==="TEXTAREA"?"pre-wrap":"pre";
  const pr=P.getBoundingClientRect(),r=f.getBoundingClientRect();
  Object.assign(o.style,{left:(r.left-pr.left-P.clientLeft)+"px",top:(r.top-pr.top-P.clientTop)+"px",width:r.width+"px",height:r.height+"px"});
  let h="",at=0;H.forEach(i=>{h+=fdEsc(v.slice(at,i))+"<mark>"+fdEsc(v.slice(i,i+q.length))+"</mark>";at=i+q.length});h+=fdEsc(v.slice(at));
  o.innerHTML=h+"​";f.after(o);o.scrollLeft=f.scrollLeft;f._fdm=o}
/* Styled text that is only being shown (not written in) gets real marks around the words. */
function fdWalk(root,q){const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),N=[];while(W.nextNode())N.push(W.currentNode);
  N.forEach(n=>{const H=fdHits(n.nodeValue,q);if(!H.length)return;const fr=document.createDocumentFragment();let at=0;const v=n.nodeValue;
    H.forEach(i=>{fr.append(v.slice(at,i));const m=document.createElement("mark");m.className="fdw";m.textContent=v.slice(i,i+q.length);fr.append(m);at=i+q.length});fr.append(v.slice(at));n.replaceWith(fr)})}
function fdUnmark(){document.querySelectorAll("#mm .fdm").forEach(o=>o.remove());
  document.querySelectorAll("#mm mark.fdw").forEach(m=>{const p=m.parentNode;m.replaceWith(m.textContent);if(p)p.normalize()});
  document.querySelectorAll("#mm [data-fdpos]").forEach(p=>{p.style.position="";delete p.dataset.fdpos})}
function fdMarkAll(){fdUnmark();const q=FDQ;if(!q||$("mm_fd").hidden)return;
  if(FD.L.includes($("mm_ti")))fdCover($("mm_ti"),q);
  FD.L.forEach(d=>{if(!d.classList||!d.classList.contains("mb"))return;
    d.querySelectorAll("textarea,input:not([type=checkbox])").forEach(f=>fdCover(f,q));
    const v=d.querySelector(".mbv:not(.mbo)");if(v&&v.offsetHeight)fdWalk(v,q);const l=d.querySelector(".mblt");if(l)fdWalk(l,q)});
  fdCur()}
function fdCur(){const el=FD.L[FD.i];document.querySelectorAll("#mm mark.cur").forEach(m=>m.classList.remove("cur"));if(!el)return;
  const own=el.id==="mm_ti"?(el._fdm?[el._fdm]:[]):[el];own.forEach(x=>x.querySelectorAll("mark").forEach(m=>m.classList.add("cur")))}
const _fdClear3=fdClear;fdClear=function(){_fdClear3();fdUnmark()};
const _fdRun3=fdRun;fdRun=function(){FDQ=$("fd_q").value.trim().toLocaleLowerCase();_fdRun3();if(FDQ&&FD.L.length)requestAnimationFrame(fdMarkAll)};
/* Opening a folded list moves things, so the marks are laid again once it has opened. */
const _fdGo3=fdGo;fdGo=function(step){const el=FD.L[(FD.i+step+FD.L.length)%(FD.L.length||1)],wasHid=el&&el.classList&&el.classList.contains("hid");_fdGo3(step);
  if(wasHid)setTimeout(fdMarkAll,420);else fdCur()};
/* Writing while searching lays the marks again. */
let FDT=0;$("mm_body").addEventListener("input",()=>{if($("mm_fd").hidden||!FDQ)return;clearTimeout(FDT);FDT=setTimeout(fdMarkAll,300)});
window.addEventListener("resize",()=>{if(!$("mm_fd").hidden&&FDQ)fdMarkAll()});

/* Text, pictures and links can be moved too, not only list points. Pictures and links show a grip;
   a paragraph shows its grip at the right edge while you write in it. They step over whole lists, never into one. */
const _mbBlock19=mmBlock;mmBlock=function(b){const d=_mbBlock19(b);
  if((b.t==="p"||b.t==="i"||(b.t==="l"&&b.u))&&!d.querySelector(".mbgrip")){const g=document.createElement("span");g.className="mbgrip";g.setAttribute("aria-label",tx("Håll och dra för att flytta","Hold and drag to move"));g.innerHTML=GRIP;d.appendChild(g)}
  return d};
