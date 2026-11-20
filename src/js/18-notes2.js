/* ---------- Notes, round 2: writing feel ---------- */

/* Styled words while you write: the text field draws nothing itself; the finished look is drawn right under it,
   with the ** and ~~ marks so faint you hardly see them. Letters keep their width, so the cursor stays in step. */
function liveUpd(d){if(!d||d.dataset.t!=="p")return;const ta=d.querySelector("textarea");if(!ta)return;let o=d.querySelector(".mbo");
  const on=document.activeElement===ta&&RICH_RE.test(ta.value);
  if(on){if(!o){o=document.createElement("div");o.className="mbv mbo";o.setAttribute("aria-hidden","true");ta.before(o)}o.innerHTML=richHTML(ta.value,false,true)+"​"}
  d.classList.toggle("live",on)}
$("mm_body").addEventListener("input",e=>{if(e.target.tagName==="TEXTAREA"&&!e.target.classList.contains("mbds"))liveUpd(e.target.closest(".mb"))});
$("mm_body").addEventListener("focusin",e=>{if(e.target.tagName==="TEXTAREA")setTimeout(()=>liveUpd(e.target.closest(".mb")),0)});
$("mm_body").addEventListener("focusout",e=>{if(e.target.tagName==="TEXTAREA"){const d=e.target.closest(".mb");if(d)d.classList.remove("live")}});
const _wrapSel=wrapSel;wrapSel=function(a,b){const r=_wrapSel(a,b);const t=mmSel&&mmSel.el;if(t)liveUpd(t.closest(".mb"));return r};

/* The Aa panel in two short rows: B I S, text style and typeface on the first; colours on the second.
   Style and typeface open a small row of their own instead of taking more room. */
let FMT_SUB="";
mmFmtPaint=function(){const d=mmTarget(),st=d?(d.dataset.t==="p"?(d.dataset.s||"p"):d.dataset.t):"",k=d&&d.dataset.k||"",f=d&&d.dataset.f||"";
  const S2=[["h1",tx("Rubrik","Heading")],["h2",tx("Underrubrik","Subheading")],["p",tx("Text","Text")]],F2=[["",tx("Standard","Standard")],...Object.entries(MFONT)];
  const stName=(S2.find(x=>x[0]===st)||[0,tx("Text","Text")])[1],fName=(F2.find(x=>x[0]===f)||F2[0])[1];
  const S3=mmSel,sel=S3&&richOK(S3.el)&&S3.s!==S3.e;
  let h=`<div class="mmfr"><div class="mmbis"><button type="button" data-wr="**" aria-label="${tx("Fet","Bold")}"><b>B</b></button><button type="button" data-wr="*" aria-label="${tx("Kursiv","Italic")}"><i>I</i></button><button type="button" data-wr="~~" aria-label="${tx("Genomstruken","Strike")}"><s>S</s></button></div>
    <button type="button" class="mmdd${FMT_SUB==="s"?" on":""}" data-sub="s"><small>${tx("Stil","Style")}</small>${esc(stName)}<span>▾</span></button><button type="button" class="mmdd${FMT_SUB==="f"?" on":""}" data-sub="f"><small>${tx("Typsnitt","Font")}</small>${esc(fName)}<span>▾</span></button></div>`;
  if(FMT_SUB==="s")h+=`<div class="mmfs mmsub">${S2.map(([v,l])=>`<button type="button" data-fs="${v}" class="fs-${v}${st===v?" on":""}">${l}</button>`).join("")}</div>`;
  else if(FMT_SUB==="f")h+=`<div class="mmfs mmsub mmff">${F2.map(([v,l])=>`<button type="button" data-ff="${v}" class="${v?"ff-"+v:""}${f===v?" on":""}">${l}</button>`).join("")}</div>`;
  else h+=`<div class="mmfc"><button type="button" data-fk="" class="${!k?"on":""}" style="--c:var(--ink)" aria-label="${esc(tx("Standard","Default"))}"></button>${Object.entries(MCOL).map(([n,c])=>`<button type="button" data-fk="${n}" class="${k===n?"on":""}" style="--c:${c}" aria-label="${n}"></button>`).join("")}<span class="mmfch">${sel?tx("Markerade ord","Selected words"):tx("Hela raden","Whole line")}</span></div>`;
  $("mm_fmt").innerHTML=h;$("mm_fmt").classList.toggle("selmode",!!sel)};
$("mm_fmt").addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b){FMT_SUB=FMT_SUB===b.dataset.sub?"":b.dataset.sub;mmFmtPaint();return}
  /* After choosing a style or typeface the small row closes again. */
  if(e.target.closest("[data-fs],[data-ff]"))setTimeout(()=>{FMT_SUB="";if(!$("mm_fmt").hidden)mmFmtPaint()},0)});
const _fmtOpen=mmFmt;mmFmt=function(open){if(open===undefined)open=$("mm_fmt").hidden;if(open)FMT_SUB="";_fmtOpen(open)};

/* Pasting several lines into a list point makes one point per line. "- ", "• ", "1." and "[ ]" at the start are
   taken away, and "[x]" makes the point ticked. */
$("mm_body").addEventListener("paste",e=>{const inp=e.target;if(inp.tagName!=="INPUT")return;const d=inp.closest(".mb");if(!d||d.dataset.t!=="c")return;
  const t=(e.clipboardData&&e.clipboardData.getData("text/plain"))||"";if(!/\n/.test(t.trim()))return;e.preventDefault();e.stopPropagation();
  const L=t.replace(/\r/g,"").split("\n").map(x=>x.trim()).filter(Boolean).map(x=>{const done=/^\[[xX]\]/.test(x);return{x:x.replace(/^(\[[ xX]?\]|[-•*–]|\d+[.)])\s*/,""),done}});
  const a=inp.selectionStart,b=inp.selectionEnd,v=inp.value,rest=v.slice(b);inp.value=v.slice(0,a)+L[0].x;if(L[0].done&&!d.dataset.m){d.classList.add("done");const ck=d.querySelector(".mbck");if(ck)ck.classList.add("on")}
  let at=d;for(let i=1;i<L.length;i++){const n=mmBlock({t:"c",x:L[i].x+(i===L.length-1?rest:""),d:L[i].done&&!d.dataset.m,...(d.dataset.m?{m:d.dataset.m}:{}),...(d.dataset.f?{f:d.dataset.f}:{})});at.after(n);at=n}
  if(L.length===1)inp.value+=rest;mmChanged();const last=at.querySelector("form input");if(last){last.focus();const n=last.value.length-rest.length;try{last.setSelectionRange(n,n)}catch(err){}}
  toast(tx(`${L.length} punkter inklistrade`,`${L.length} points pasted`),2000)},true);

/* A new empty point says where to write. */
const _mbPh=mmBlock;mmBlock=function(b){const d=_mbPh(b);if(b.t==="c"){const i=d.querySelector("form input");if(i)i.placeholder=tx("Ny punkt","New point")}return d};
