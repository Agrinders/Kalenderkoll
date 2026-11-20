/* ---------- Notes, round 4: writing together ---------- */

/* Who ticked a point, and when. A small letter in the partner's colour sits on points they ticked;
   tapping it says when. Your own ticks need no letter. */
$("mm_body").addEventListener("click",e=>{const ck=e.target.closest(".mbck");if(!ck)return;const d=ck.closest(".mb");if(!d)return;
  if(d.classList.contains("done")){d.dataset.db=me();d.dataset.dt=String(Date.now())}else{delete d.dataset.db;delete d.dataset.dt}whoPaint(d)});
const _itemExtra20=itemExtra;itemExtra=function(d){const o=_itemExtra20(d);if(d.classList.contains("done")&&!d.dataset.m&&(d.dataset.db==="a"||d.dataset.db==="b")){o.db=d.dataset.db;if(+d.dataset.dt)o.dt=+d.dataset.dt}return o};
const _mbBlock20=mmBlock;mmBlock=function(b){const d=_mbBlock20(b);if(b.t==="c"&&b.d){if(b.db)d.dataset.db=b.db;if(b.dt)d.dataset.dt=String(b.dt);whoPaint(d)}return d};
function whoPaint(d){let w=d.querySelector(".mbwho");const by=d.dataset.db,show=d.classList.contains("done")&&!d.dataset.m&&by&&by!==ME&&SHARED()&&!(MM.m&&MM.m.priv);
  if(!show){if(w)w.remove();return}
  if(!w){w=document.createElement("button");w.type="button";w.className="mbwho";const at=d.querySelector(".mbpr")||d.querySelector(".mbgrip");if(at)at.before(w);else d.appendChild(w)}
  const n=pname(by);w.textContent=(n[0]||"?").toUpperCase();w.style.setProperty("--wc",pvar(by));w.setAttribute("aria-label",tx(`Bockad av ${n}`,`Ticked by ${n}`))}
$("mm_body").addEventListener("click",e=>{const w=e.target.closest(".mbwho");if(!w)return;e.preventDefault();e.stopPropagation();const d=w.closest(".mb"),t=+d.dataset.dt;
  toast(tx(`${pname(d.dataset.db)} bockade av den`,`${pname(d.dataset.db)} ticked it`)+(t?" "+(dnD(new Date(t))===todayN()?tx("i dag ","today "):"")+whenTxt(t):""),3000)},true);

/* "Maya skriver…": while the other phone's changes keep arriving in a note, it says so in the note and in the list of notes.
   It goes by when changes arrive on this phone, so the two clocks need not agree. */
var PRES={},MCB=null;
function presOn(id){return PRES[id]&&Date.now()-PRES[id]<9000}
function presPaint(){const p=pname(other(ME)),lbl=tx(`${p} skriver…`,`${p} is writing…`);
  const meta=$("mm_meta");if(meta){let s=meta.querySelector(".mmtyp");const on=MM.open&&MM.m&&!MM.m.priv&&presOn(MM.id);
    if(on&&!s){s=document.createElement("span");s.className="mmtyp";meta.appendChild(s)}if(s){if(on){s.innerHTML=`<i></i><i></i><i></i>${esc(lbl)}`;s.style.setProperty("--wc",pvar(other(ME)))}else s.remove()}}
  document.querySelectorAll(".mmi[data-memo]").forEach(b=>{let s=b.querySelector(".mmtyp");const on=presOn(b.dataset.memo);
    if(on&&!s){s=document.createElement("span");s.className="mmtyp";s.style.setProperty("--wc",pvar(other(ME)));s.innerHTML=`<i></i><i></i><i></i>${esc(lbl)}`;const t=b.querySelector(".mmit small")||b.querySelector(".mmit");if(t)t.after(s)}else if(!on&&s)s.remove()})}
const _mmMeta20=mmMeta;mmMeta=function(){_mmMeta20();presPaint()};
setInterval(()=>{if(Object.keys(PRES).some(k=>Date.now()-PRES[k]<12000))presPaint()},1500);
const _rm20=renderMemos;renderMemos=function(){_rm20.apply(this,arguments);presPaint()};

/* Counts of points and ticked points in each shared note, so the phone can say "Maya added 3 things to Inför flytt". */
function memoCounts(m){let n=0,done=0;(m.bl||[]).forEach(b=>{if(b.t==="c"&&String(b.x||"").trim()){n++;if(b.d&&!b.m)done++}});return[n,done]}
function mcAll(){const o={};MEMOS.forEach(m=>{if(!m.priv&&!m.del)o["memo_"+m.id]=memoCounts(m)});return o}
var MCK={},LPEND={},LT=0;
function watchLists(){if(!ME||!SHARED())return;let B=MCB;if(!B){try{B=JSON.parse(localStorage.getItem("kalenderkoll.mc")||"null")}catch(e){}}
  const cur=mcAll(),first=!B;B=B||{};
  MEMOS.forEach(m=>{if(m.priv)return;const id="memo_"+m.id,k=memoKey(m);
    if(MCK[m.id]!==undefined&&MCK[m.id]!==k&&m.ub===other(ME)){PRES[m.id]=Date.now()}
    MCK[m.id]=k;
    const was=B[id],now=cur[id];if(first||!was||!now||m.ub!==other(ME)||m.del)return;
    const add=Math.max(0,now[0]-was[0]),tick=Math.max(0,now[1]-was[1]);if(!add&&!tick)return;
    /* The note you are looking at needs no notice. */
    if(MM.open&&MM.id===m.id&&!document.hidden)return;
    const P=LPEND[m.id]||(LPEND[m.id]={add:0,tick:0});P.add+=add;P.tick+=tick;P.ti=m.ti});
  MCB=cur;try{localStorage.setItem("kalenderkoll.mc",JSON.stringify(cur))}catch(e){}
  presPaint();
  /* Changes come one at a time while someone writes; one notice comes when they have stopped for a little while. */
  if(Object.keys(LPEND).length){clearTimeout(LT);LT=setTimeout(listTell,20000)}}
function listTell(){const p=pname(other(ME)),L=Object.values(LPEND);LPEND={};if(!L.length)return;
  const one=P=>{const t=P.ti||tx("en anteckning","a note"),a=P.add,k=P.tick;
    if(a&&k)return tx(`${p} lade till ${a===1?"en sak":a+" saker"} och bockade av ${k===1?"en":k} i ${t}`,`${p} added ${a===1?"a thing":a+" things"} and ticked off ${k===1?"one":k} in ${t}`);
    if(a)return a===1?tx(`${p} lade till en sak i ${t}`,`${p} added a thing to ${t}`):tx(`${p} lade till ${a} saker i ${t}`,`${p} added ${a} things to ${t}`);
    return k===1?tx(`${p} bockade av en sak i ${t}`,`${p} ticked off a thing in ${t}`):tx(`${p} bockade av ${k} saker i ${t}`,`${p} ticked off ${k} things in ${t}`)};
  const msg=L.length===1?one(L[0]):tx(`${p} har ändrat i ${L.length} listor`,`${p} changed ${L.length} lists`);
  toast(msg,5000);notify("Kalenderkoll",msg);bgSync()}
const _watchNew20=watchNew;watchNew=function(){_watchNew20();try{watchLists()}catch(e){}};
/* Before the phone goes to sleep, any waiting notice is given right away. */
document.addEventListener("visibilitychange",()=>{if(document.hidden&&Object.keys(LPEND).length){clearTimeout(LT);listTell()}});
