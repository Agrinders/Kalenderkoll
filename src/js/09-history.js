/* ---------- History and undo: every change to a saved record is noted with what it looked like before. ---------- */
const HKEY="kalenderkoll.history.v1",HSKIP=/^(plan|started)$/;let H=[],HG=null,histMute=0;
try{H=JSON.parse(localStorage.getItem(HKEY)||"[]")||[]}catch(e){H=[]}
const hcopy=v=>v==null?null:JSON.parse(JSON.stringify(v)),hsame=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function hcur(id){try{const d=JSON.parse(localStorage.getItem("kalenderkoll.data.v1")||"{}");return hcopy((d.cal||{})[id])}catch(e){return null}}
function histSave(){const cut=Date.now()-30*864e5;H=H.filter(e=>e.at>cut).slice(0,60);let j=JSON.stringify(H);while(j.length>15e5&&H.length>1){H.pop();j=JSON.stringify(H)}try{localStorage.setItem(HKEY,j)}catch(e){}}
function histWrap(c){return{...c,doc:id=>{const d=c.doc(id);return{...d,set:v=>{histNote(id);return d.set(v)},update:v=>{histNote(id);return d.update(v)},delete:()=>{histNote(id);return d.delete()}}}}}
function histNote(id){if(histMute||exampleMode||HSKIP.test(id))return;if(!HG)HG={docs:{}};if(!(id in HG.docs))HG.docs[id]=hcur(id);clearTimeout(HG.t);HG.t=setTimeout(histClose,600)}
function histClose(){if(!HG)return;const g=HG;HG=null;clearTimeout(g.t);const docs={};Object.keys(g.docs).forEach(id=>{const a=hcur(id);if(!hsame(g.docs[id],a))docs[id]=[g.docs[id],a]});const ids=Object.keys(docs);if(!ids.length)return;
  H.unshift({i:Date.now().toString(36)+Math.random().toString(36).slice(2,6),at:Date.now(),docs,u:false});
  histSave();if(tab==="u")renderHist();
  const e=H[0],d=hdesc(e);if(d.k==="del"){const tb=lastToast;if(tb&&tb.isConnected&&!tb._going&&!tb.querySelector(".tundo")){clearTimeout(tb._t);tb._t=setTimeout(()=>dropToast(tb),6500);const b=document.createElement("button");b.className="tundo";b.textContent=tx("Ångra","Undo");b.onclick=ev=>{ev.stopPropagation();dropToast(tb);histUndo(e.i)};tb.appendChild(b)}}}
const hname=n=>n&&n.trim()?n.trim():tx("en händelse","an event");
const hday=iso=>{try{return fmtD(dn(iso),{day:"numeric",month:"short"})}catch(e){return iso}};
function hone(id,b,a){const v=a||b,n=hname(v.n);
  if(id.startsWith("ev_")){if(!b)return["add",tx(`La till ${n} ${hday(a.d)}`,`Added ${n} on ${hday(a.d)}`)];if(!a)return["del",tx(`Tog bort ${n}`,`Removed ${n}`)];
    const sa=a.skip||[],sb=b.skip||[];if(sa.length>sb.length){const k=sa.find(x=>!sb.includes(x));return["del",tx(`Tog bort ${n} ${hday(k)}`,`Removed ${n} on ${hday(k)}`)]}
    if(a.u&&a.u!==b.u)return["del",tx(`${n} slutar efter ${hday(a.u)}`,`${n} ends after ${hday(a.u)}`)];
    if(a.n!==b.n)return["edit",tx(`Bytte namn: ${hname(b.n)} → ${n}`,`Renamed: ${hname(b.n)} → ${n}`)];
    if(a.d!==b.d||a.t!==b.t)return["edit",tx(`Flyttade ${n}`,`Moved ${n}`)];
    return["edit",tx(`Ändrade ${n}`,`Changed ${n}`)]}
  if(id.startsWith("bd_")){if(!b)return["add",tx(`La till ${n}`,`Added ${n}`)];if(!a)return["del",tx(`Tog bort ${n}`,`Removed ${n}`)];return["edit",tx(`Ändrade ${n}`,`Changed ${n}`)]}
  return["edit",tx("Ändrade sparad data","Changed saved data")]}
function hdesc(e){const ids=Object.keys(e.docs),L=ids.map(id=>hone(id,e.docs[id][0],e.docs[id][1]));
  if(ids.length>=4&&ids.every(id=>e.docs[id][1]==null))return{k:"del",t:tx("Tömde kalendern","Emptied the calendar"),more:0};
  if(ids.length>=3&&ids.every(id=>e.docs[id][0]==null))return{k:"add",t:tx(`Importerade ${ids.length} saker`,`Imported ${ids.length} items`),more:0};
  return{k:L[0][0],t:L[0][1],more:ids.length-1}}
function renderHist(){$("u_head").textContent=tx("Det här har du gjort","What you have done");$("u_note").textContent=tx("De senaste 30 dagarna. Tryck Ångra för att ta tillbaka en ändring. Historiken finns bara på den här enheten.","The last 30 days. Tap Undo to take back a change. The history is only on this device.");$("u_clear").textContent=tx("Rensa historiken","Clear the history");$("u_clear").classList.toggle("hide",!H.length);
  if(!H.length){$("u_list").innerHTML=`<p class="note" style="margin-top:6px">${tx("Inget ännu. När du lägger till, ändrar eller tar bort något syns det här.","Nothing yet. When you add, change or remove something it shows here.")}</p>`;return}
  const day=t=>{const d=new Date(t),n=new Date(),k=x=>x.toDateString();if(k(d)===k(n))return tx("Idag","Today");n.setDate(n.getDate()-1);if(k(d)===k(n))return tx("Igår","Yesterday");return cap(d.toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long"}))};
  const IC={add:'<path d="M12 6v12M6 12h12"/>',del:'<path d="M6 12h12"/>',edit:'<path d="m5 16.5 9.5-9.5 3 3L8 19.5H5z"/>'};let last="";
  $("u_list").innerHTML=H.map(e=>{const d=hdesc(e),dl=day(e.at),h=dl!==last?`<div class="hday">${dl}</div>`:"";last=dl;return h+`<div class="hrow ${e.u?"undone":""}"><i class="${d.k}"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[d.k]}</svg></i><div><b>${esc(d.t)}</b><small>${new Date(e.at).toLocaleTimeString(loc(),{hour:"2-digit",minute:"2-digit"})}${d.more?" · "+tx(`och ${d.more} till`,`and ${d.more} more`):""}${e.u?" · "+tx("Ångrad","Undone"):""}</small></div><button class="btn out" data-hu="${e.i}">${e.u?tx("Gör om","Redo"):tx("Ångra","Undo")}</button></div>`}).join("")}
async function histUndo(i){histClose();flushSaves();const e=H.find(x=>x.i===i);if(!e||!col)return;const from=e.u?0:1,to=e.u?1:0,ids=Object.keys(e.docs);
  if(ids.some(id=>!hsame(hcur(id),e.docs[id][from]))&&!await ask(tx("Det har ändrats sedan dess","It has changed since then"),tx("Om du fortsätter skrivs senare ändringar av samma sak över.","If you go ahead, later changes to the same thing are overwritten.")))return;
  histMute++;try{ids.forEach(id=>{const v=e.docs[id][to];(v==null?col.doc(id).delete():col.doc(id).set(v)).catch(()=>{})})}finally{histMute--}
  e.u=!e.u;histSave();renderHist();toast((e.u?tx("Ångrat","Undone"):tx("Gjort igen","Redone"))+" · "+hdesc(e).t,"ok")}
