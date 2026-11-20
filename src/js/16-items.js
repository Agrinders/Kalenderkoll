/* ---------- Descriptions and costs on list points ----------
   Each list can switch on a description under every point, and a cost on every point with the sum shown.
   The switches belong to the list (its name, or the first point of a list without a name). */
function parseKr(s){s=String(s||"").replace(/\s|kr|sek|:-/gi,"").replace(",",".");if(!s)return null;const n=+s;return Number.isFinite(n)?n:null}
const fmtKr=n=>(Math.round(n*100)/100).toLocaleString(S.lang==="en"?"en-GB":"sv-SE",{maximumFractionDigits:2})+" kr";
function itemExtra(d){const o={};const ds=d.querySelector(".mbds"),pr=d.querySelector(".mbpr");if(ds&&ds.value.trim())o.ds=ds.value;
  const n=pr?parseKr(pr.value):null;if(n!==null)o.pr=Math.round(n*100)/100;if(d.dataset.od)o.od=1;if(d.dataset.op)o.op=1;return o}
const _mbItems=mmBlock;mmBlock=function(b){const d=_mbItems(b);
  if(b.t==="c"){const pr=document.createElement("input");pr.className="mbpr";pr.type="text";pr.inputMode="decimal";pr.placeholder="0 kr";pr.setAttribute("aria-label",tx("Kostnad","Cost"));pr.value=b.pr!==undefined?fmtKr(b.pr):"";
    const g=d.querySelector(".mbgrip");if(g)g.before(pr);else d.appendChild(pr);
    const ds=document.createElement("textarea");ds.className="mbds";ds.rows=1;ds.maxLength=1000;ds.placeholder=tx("Beskrivning","Description");ds.value=b.ds||"";d.appendChild(ds);
    if(b.od)d.dataset.od="1";if(b.op)d.dataset.op="1"}
  if(b.t==="lh"){if(b.od)d.dataset.od="1";if(b.op)d.dataset.op="1";const sum=document.createElement("span");sum.className="mbsum";const pg=d.querySelector(".mbprog");if(pg)pg.before(sum);else d.appendChild(sum)}
  return d};
/* Where a list keeps its switches. */
function flagHolder(d){if(!d)return null;if(d.dataset.t==="lh")return d;const G=mmGroup(d);if(!G.length)return null;const h=G[0].previousElementSibling;return h&&h.dataset.t==="lh"?h:G[0]}
const _prog10=mmProg;mmProg=function(){_prog10();itemsPaint()};
function itemsPaint(){const body=$("mm_body");body.querySelectorAll(":scope>.mb-c .mbtot").forEach(x=>x.remove());
  const seen=new Set();body.querySelectorAll(":scope>.mb-c").forEach(c=>{if(seen.has(c))return;const G=mmGroup(c);G.forEach(x=>seen.add(x));if(!G.length)return;
    const h=G[0].previousElementSibling&&G[0].previousElementSibling.dataset.t==="lh"?G[0].previousElementSibling:null,F=h||G[0],od=!!F.dataset.od,op=!!F.dataset.op;
    let sum=0,left=0,any=false;G.forEach(x=>{x.classList.toggle("showd",od);x.classList.toggle("showp",op);const n=parseKr(x.querySelector(".mbpr")&&x.querySelector(".mbpr").value);if(n!==null){any=true;sum+=n;if(!x.classList.contains("done"))left+=n}
      const t=x.querySelector(".mbds");if(t&&od&&t.offsetParent){t.style.height="auto";t.style.height=t.scrollHeight+"px"}});
    const check=!G[0].dataset.m,txt=op?(any?fmtKr(sum)+(check&&left!==sum?" · "+fmtKr(left)+" "+tx("kvar","left"):""):tx("Inga kostnader än","No costs yet")):"";
    if(h){const s=h.querySelector(".mbsum");if(s){s.textContent=op&&any?fmtKr(sum):"";s.title=txt}}
    if(op){const last=G[G.length-1],tot=document.createElement("div");tot.className="mbtot";tot.innerHTML=`<span>${tx("Totalt","Total")}</span><b>${esc(txt)}</b>`;last.appendChild(tot)}})}
$("mm_body").addEventListener("input",e=>{if(e.target.classList&&(e.target.classList.contains("mbpr")||e.target.classList.contains("mbds"))){if(e.target.classList.contains("mbds")){e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px"}mmChanged()}});
/* Enter in a description goes on to the next point; in a cost it goes to the description or the next point. */
$("mm_body").addEventListener("keydown",e=>{const t=e.target;if(!t.classList||e.key!=="Enter")return;
  if(t.classList.contains("mbpr")){e.preventDefault();e.stopImmediatePropagation();const d=t.closest(".mb");if(d.classList.contains("showd"))d.querySelector(".mbds").focus();else{const n=d.nextElementSibling;if(n&&n.dataset.t==="c")n.querySelector("form input").focus()}}
  else if(t.classList.contains("mbds")&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();const d=t.closest(".mb");mmInsert({t:"c",x:"",d:false,...(d.dataset.m?{m:d.dataset.m}:{})},d,true)}},true);
/* Leaving a cost tidies how it is written. */
$("mm_body").addEventListener("focusout",e=>{const t=e.target;if(t.classList&&t.classList.contains("mbpr")){const n=parseKr(t.value);t.value=n===null?"":fmtKr(n);itemsPaint()}});
/* While you type a cost it is plain digits; the "kr" comes back when you leave it. */
$("mm_body").addEventListener("focusin",e=>{const t=e.target;if(t.classList&&t.classList.contains("mbpr")){const n=parseKr(t.value);t.value=n===null?"":String(n).replace(".",S.lang==="en"?".":",");try{t.select()}catch(err){}}});
/* The switches, in the Lista menu when you are in a list. */
const _lst3=mmLst;mmLst=function(open){_lst3(open);const f=$("mm_lst");if(f.hidden)return;const d=mmTarget(),F=d&&(d.dataset.t==="c"||d.dataset.t==="lh")?flagHolder(d):null;if(!F)return;
  const sw=(k,l,sub)=>`<button type="button" class="mmsw${F.dataset[k]?" on":""}" data-flag="${k}"><span><b>${l}</b><small>${sub}</small></span><i></i></button>`;
  f.insertAdjacentHTML("beforeend",`<p>${tx("I den här listan","In this list")}</p>${sw("od",tx("Beskrivning under punkterna","Description under the points"),tx("En rad för detaljer under varje punkt","A line for details under each point"))}${sw("op",tx("Kostnad och summa","Cost and total"),tx("Ett belopp på varje punkt och summan för listan","An amount on each point and the list's total"))}`)};
$("mm_lst").addEventListener("click",e=>{const b=e.target.closest("[data-flag]");if(!b)return;const d=mmTarget(),F=flagHolder(d);if(!F)return;const k=b.dataset.flag;
  if(F.dataset[k])delete F.dataset[k];else F.dataset[k]="1";b.classList.toggle("on",!!F.dataset[k]);F._sig="";mmChanged();itemsPaint();
  if(F.dataset[k]){const G=F.dataset.t==="lh"?itemsOf(F):mmGroup(F),first=G[0];if(first)setTimeout(()=>{const t=first.querySelector(k==="op"?".mbpr":".mbds");if(t)t.focus()},60)}});
/* Search, copy and the saved files include descriptions and costs. */
const _plain3=mmPlain;mmPlain=function(){const bl=mmRead(),lines=[];let n=0;const ti=$("mm_ti").value.trim();if(ti)lines.push(ti);
  bl.forEach(b=>{if(b.t!=="c")n=0;if(b.t==="p")lines.push(richPlain(b.x));else if(b.t==="lh")lines.push("","",b.x+":");else if(b.t==="c"){lines.push((b.m==="b"?"• ":b.m==="n"?(++n)+". ":(b.d?"☑ ":"☐ "))+richPlain(b.x)+(b.pr!==undefined?" – "+fmtKr(b.pr):""));if(b.ds)lines.push("   "+b.ds.replace(/\n/g,"\n   "))}else if(b.t==="l")lines.push(b.u)});
  return lines.join("\n").replace(/\n{3,}/g,"\n\n").trim()};
const _fdRun2=fdRun;fdRun=function(){_fdRun2();const q=$("fd_q").value.trim().toLocaleLowerCase();if(!q)return;
  $("mm_body").querySelectorAll(":scope>.mb-c:not(.hit)").forEach(d=>{const t=d.querySelector(".mbds");if(t&&t.value.toLocaleLowerCase().includes(q)){d.classList.add("hit");FD.L.push(d)}});if(FD.L.length)fdGo(0)};
/* ---------- A tap while you are writing only ends the writing ----------
   If you are in a field (a point, a cost, a description, the title …) and tap another place you could write,
   the first tap just closes the keyboard so you can look at the note. Tap again to start writing there. */
let mmSwallow=false;
$("mm_w").addEventListener("mousedown",e=>{const a=document.activeElement,w=$("mm_w");
  if(!a||!w.contains(a)||!(a.tagName==="INPUT"||a.tagName==="TEXTAREA"))return;
  const t=e.target;if(t===a||(a.contains&&a.contains(t)))return;
  if(!t.closest("input,textarea,.mbv,#mm_tail,.mmti"))return;
  e.preventDefault();e.stopPropagation();a.blur();mmSwallow=true;setTimeout(()=>{mmSwallow=false},600)},true);
$("mm_w").addEventListener("click",e=>{if(!mmSwallow)return;mmSwallow=false;e.preventDefault();e.stopPropagation()},true);

/* ---------- The bar at the bottom does not open the keyboard by itself ----------
   Formatting, symbols, list kinds, sorting and switches work on the line you were on without bringing the keyboard up.
   Only something new to write in (a new list, a list name, a link) opens it, so you can type right away.
   If you were already writing, you stay where you were. */
var MMKB=false,MMSOFT=false;
["mm_fmt","mm_sym","mm_lst"].forEach(id=>{const el=$(id);
  el.addEventListener("pointerdown",()=>{const a=document.activeElement;MMKB=!!(a&&$("mm_w").contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"))},true);
  el.addEventListener("click",()=>{MMSOFT=!MMKB},true);el.addEventListener("click",()=>{setTimeout(()=>{MMSOFT=false},0)})});
document.querySelector(".mmbar").addEventListener("pointerdown",()=>{const a=document.activeElement;MMKB=!!(a&&$("mm_w").contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"))},true);
const _focusEnd=mmFocusEnd;mmFocusEnd=function(d){if(MMSOFT)return;_focusEnd(d)};
