/* ---------- Private notes ----------
   A private note is saved in a separate space whose code only you have, never in the shared calendar.
   Your partner's phone does not get it, cannot open it and is not told about it. */
function privStart(db){try{pcol=db.collection("priv");pcol.onSnapshot(s=>{PDOCS={};PMEMOS=[];PIMG={};
  s.docs.forEach(d=>{const v=d.data()||{};PDOCS[d.id]=copy(v);if(v.kind==="memo"){const m=memoClean(v,d.id.slice(5));if(m){m.priv=1;PMEMOS.push(m)}}else if(v.kind==="mimg"&&typeof v.data==="string")PIMG[String(v.id||d.id.slice(5))]=v.data});
  privMerge();renderMemos()})}catch(e){}}
/* The notes list shows shared and private notes together; private ones carry a lock. */
function privMerge(){MEMOS=MEMOS.filter(m=>!m.priv).concat(PMEMOS.map(m=>({...m})));Object.assign(MIMG,PIMG);if(MM&&MM.open&&MM.m&&MM.m.priv){const m=MEMOS.find(x=>x.id===MM.id);if(m&&memoKey(m)!==MM.lastKey)mmMaybeRefresh()}}
const privMemo=id=>!!(MEMOS.find(m=>m.id===id&&m.priv)||(MM&&MM.m&&MM.m.id===id&&MM.m.priv));
const isPriv=(id,v)=>v?(v.kind==="memo"&&!!v.priv)||(v.kind==="mimg"&&privMemo(v.memo)):(id in PDOCS);
/* Saving and removing go to the right place. */
/* The private list is updated right away, so a shared update arriving first never makes a private note look gone. */
const _put0=put;put=function(id,v){if(isPriv(id,v)){MINE.add(id);PDOCS[id]=copy(v);if(v.kind==="memo"){const m=memoClean(v,id.slice(5));if(m){m.priv=1;PMEMOS=PMEMOS.filter(x=>x.id!==m.id).concat([m])}}else if(v.kind==="mimg")PIMG[String(v.id)]=v.data;if(pcol)track(pcol.doc(id).set(v)).catch(()=>toast(tx("Kunde inte spara. Försök igen.","Could not save. Try again.")));return}_put0(id,v)};
const _del0=del;del=function(id){if(id in PDOCS&&!(id in DOCS)){const before=copy(PDOCS[id]);delete PDOCS[id];if(id.startsWith("memo_"))PMEMOS=PMEMOS.filter(x=>x.id!==id.slice(5));if(pcol)track(pcol.doc(id).delete()).catch(()=>{});return before}return _del0(id)};
/* Moving a note between shared and private: it is written to the new place first, then removed from the old one. */
async function memoMove(m,toPriv){const imgs=m.bl.filter(b=>b.t==="i").map(b=>b.i),wasShared=!m.priv;
  const nm={...m,priv:toPriv?1:0,up:Date.now()};
  if(toPriv){imgs.forEach(i=>{const d=DOCS["mimg_"+i];if(d){PDOCS["mimg_"+i]=copy(d);pcol&&pcol.doc("mimg_"+i).set(d);_del0("mimg_"+i)}});pcol&&pcol.doc("memo_"+m.id).set(memoDoc(nm));PDOCS["memo_"+m.id]=memoDoc(nm);_del0("memo_"+m.id)}
  else{imgs.forEach(i=>{const d=PDOCS["mimg_"+i];if(d){col&&col.doc("mimg_"+i).set(d);delete PDOCS["mimg_"+i];pcol&&pcol.doc("mimg_"+i).delete()}});col&&col.doc("memo_"+m.id).set(memoDoc(nm));delete PDOCS["memo_"+m.id];pcol&&pcol.doc("memo_"+m.id).delete()}
  PMEMOS=PMEMOS.filter(x=>x.id!==m.id);if(toPriv)PMEMOS.push({...nm});MEMOS=MEMOS.filter(x=>x.id!==m.id).concat([nm]);if(MM.m&&MM.m.id===m.id){MM.m.priv=nm.priv;MM.lastKey="";privBadge()}renderMemos();
  toast(toPriv?tx("Nu är anteckningen privat · bara du ser den","The note is now private · only you see it"):tx("Nu delar ni anteckningen","You now share the note"),3500)}
/* Creating: a lock button beside "Ny" makes a private note straight away. */
const privAvail=()=>window.KK&&KK.mode==="cloud"&&SHARED()&&joined();
const _rm2=renderMemos;renderMemos=function(){_rm2();const el=$("t_memos");if(!el)return;const h=el.querySelector(".mmlh");
  if(h&&!$("mm_newp")){h.querySelector("#mm_new").insertAdjacentHTML("beforebegin",`<button class="btn sm ghost" id="mm_newp" type="button" aria-label="${esc(tx("Ny privat anteckning","New private note"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>${tx("Privat","Private")}</button>`);const w=document.createElement("span");w.className="mmbtns";h.querySelector("#mm_newp").before(w);w.append($("mm_newp"),$("mm_new"))}
  const b=$("mm_newp");if(b)b.classList.toggle("hide",!privAvail());
  el.querySelectorAll(".mmrow").forEach(r=>{const id=r.querySelector("[data-memo]").dataset.memo,m=MEMOS.find(x=>x.id===id);r.classList.toggle("priv",!!(m&&m.priv));const t=r.querySelector(".mmit b");if(m&&m.priv&&t&&!t.querySelector(".mmlock"))t.insertAdjacentHTML("afterbegin",'<span class="mmlock" aria-label="Privat"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></span>')})};
document.addEventListener("click",e=>{if(!e.target.closest||!e.target.closest("#mm_newp"))return;e.stopPropagation();openMM("");MM.m.priv=1;MM.fresh=true;privBadge();toast(tx("Privat anteckning · bara du ser den","Private note · only you see it"),2500)},true);
/* In the editor: a small line under the title says who sees the note. */
function privBadge(){let b=$("mm_pv");if(!b){b=document.createElement("button");b.id="mm_pv";b.type="button";b.className="mmpv";$("mm_meta").after(b)}
  const p=MM.m&&MM.m.priv,show=privAvail()||p;b.hidden=!show;if(!show)return;b.classList.toggle("on",!!p);
  b.innerHTML=p?`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>${tx("Privat · bara du ser den","Private · only you see it")}`:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M14 15c2.300-.3 4.400.9 5.300 3.500"/></svg>${tx("Delad med ","Shared with ")+esc(pname(other(ME||"a")))}`}
const _openMM3=openMM;openMM=function(id){_openMM3(id);privBadge()};
document.addEventListener("click",async e=>{if(!e.target.closest||!e.target.closest("#mm_pv"))return;if(!MM.m)return;const p=!!MM.m.priv;
  if(MM.fresh&&memoEmpty({ti:$("mm_ti").value,bl:mmRead()})){MM.m.priv=p?0:1;privBadge();return}
  mmSave();const m=MEMOS.find(x=>x.id===MM.id)||MM.m;
  if(!await ask(p?tx("Dela anteckningen?","Share the note?"):tx("Gör anteckningen privat?","Make the note private?"),p?tx(`${pname(other(ME||"a"))} kommer att kunna se och ändra den.`,`${pname(other(ME||"a"))} will be able to see and change it.`):tx(`Den försvinner från ${pname(other(ME||"a"))}s telefon och syns bara för dig.`,`It disappears from ${pname(other(ME||"a"))}'s phone and only you see it.`),p?tx("Dela","Share"):tx("Gör privat","Make private")))return;
  await memoMove(m,!p)});
