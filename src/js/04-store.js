/* ---------- Saving. Every record is one document: ev_, bd_, todo_, note_, plus "couple" and "plan". ---------- */
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const PEND=new Map();
function later(key,fn,ms){const old=PEND.get(key);if(old)clearTimeout(old.t);PEND.set(key,{fn,t:setTimeout(()=>{PEND.delete(key);fn()},ms)})}
function flushSaves(){PEND.forEach(e=>{clearTimeout(e.t);e.fn()});PEND.clear()}
addEventListener("pagehide",flushSaves);document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSaves()});
const evDoc=e=>({kind:"ev",id:e.id,n:e.n,d:e.d,e:e.e||"",t:e.t||"",t2:e.t2||"",r:e.r||"o",u:e.u||"",skip:e.skip||[],pl:e.pl||"",o:e.o||"",w:["a","b","g"].includes(e.w)?e.w:"g",col:/^#[0-9a-f]{6}$/i.test(e.col||"")?e.col:"",st:e.st==="glass"?"glass":"fill",ic:ICONS[e.ic]?e.ic:"",fx:fxCls(e.fx)?e.fx:"",wd:e.r==="w"&&Array.isArray(e.wd)?e.wd:[]});
const bdDoc=b=>({kind:"bd",id:b.id,n:b.n,md:b.md,y:b.y||0,ty:b.ty||"b"});
const todoDoc=x=>({kind:"todo",id:x.id,n:x.n,w:x.w||"g",done:!!x.done,at:x.at||0,dt:x.dt||0});
const noteDoc=x=>({kind:"note",id:x.id,f:x.f,txt:x.txt,at:x.at});
const putIn=(L,x)=>{const i=L.findIndex(z=>z.id===x.id);if(i>=0)L[i]=x;else L.push(x)};
/* The last saved copy of every record, so a delete can be undone. */
let DOCS={};const copy=v=>v==null?null:JSON.parse(JSON.stringify(v));
const MINE=new Set();
function put(id,v){MINE.add(id);DOCS[id]=copy(v);if(col)col.doc(id).set(v).catch(()=>toast(tx("Kunde inte spara. Försök igen.","Could not save. Try again.")))}
function del(id){const before=copy(DOCS[id]);delete DOCS[id];if(col)col.doc(id).delete().catch(()=>{});return before}
/* After a delete, the notice gets an Undo button that puts the record back. */
function undoable(e,ids){const was=ids.map(id=>[id,del(id)]).filter(x=>x[1]);if(!e||!was.length)return;const b=document.createElement("button");b.className="tundo";b.textContent=tx("Ångra","Undo");
  b.onclick=ev=>{ev.stopPropagation();dropToast(e);was.forEach(([id,v])=>put(id,v));reload()};clearTimeout(e._t);e._t=setTimeout(()=>dropToast(e),6000);e.appendChild(b)}
function saveEv(e){putIn(EV,e);put("ev_"+e.id,evDoc(e))}
function dropEv(e,msg){EV=EV.filter(z=>z.id!==e.id);undoable(toast(msg||tx("Borttagen · ","Removed · ")+e.n),["ev_"+e.id])}
function saveBd(b){putIn(BD,b);put("bd_"+b.id,bdDoc(b))}
function dropBd(b){BD=BD.filter(z=>z.id!==b.id);undoable(toast(tx("Borttagen · ","Removed · ")+b.n),["bd_"+b.id])}
function saveTodo(x,slow){putIn(TODOS,x);DOCS["todo_"+x.id]=todoDoc(x);later("todo_"+x.id,()=>{const y=TODOS.find(z=>z.id===x.id);if(y)put("todo_"+y.id,todoDoc(y))},slow?500:0)}
function dropTodo(x,quiet){TODOS=TODOS.filter(z=>z.id!==x.id);const q=PEND.get("todo_"+x.id);if(q){clearTimeout(q.t);PEND.delete("todo_"+x.id)}if(quiet)del("todo_"+x.id);else undoable(toast(tx("Borttagen · ","Removed · ")+x.n),["todo_"+x.id])}
function saveNote(x){putIn(NOTES,x);put("note_"+x.id,noteDoc(x))}
function dropNote(x){NOTES=NOTES.filter(z=>z.id!==x.id);undoable(toast(tx("Lappen är borttagen","The note is removed")),["note_"+x.id])}
/* An icon for a whole day, shared like everything else. */
let DAYS={};
const dIc=n=>(DAYS[nd(n)]||{}).ic||"";
/* A day gets its effect from the first event that day that has one. */
const fxOf=L=>{const o=L.find(x=>x.e.fx);return o?o.e.fx:""};
function setDay(iso,ic){if(ic){DAYS[iso]={ic};put("day_"+iso,{kind:"day",d:iso,ic})}else{delete DAYS[iso];del("day_"+iso)}}
const hasData=()=>EV.length+BD.length+TODOS.length+NOTES.length>0;
function saveCouple(){put("couple",{kind:"couple",...CP})}
function persist(){try{localStorage.setItem("kalenderkoll.look",JSON.stringify({lang:S.lang,theme:S.theme}))}catch(e){}if(col)later("plan",()=>put("plan",{kind:"plan",wkno:S.wkno,hol:S.hol}),150)}
/* Rebuild the lists from the saved copies (used after Undo when there is no storage). */
function reload(){if(col)return;render()}
