/* ---------- Notes, round 5: copies and tags ---------- */

/* Tags: a few short words on a note (#resa, #hem). They are shown on the note and in the list, where they also filter. */
function tagsClean(a){const out=[],seen=new Set();(Array.isArray(a)?a:[]).forEach(t=>{t=String(t||"").replace(/^#+/,"").replace(/\s+/g," ").trim().slice(0,24);const k=t.toLocaleLowerCase();if(t&&!seen.has(k)&&out.length<8){seen.add(k);out.push(t)}});return out}
const _memoClean21=memoClean;memoClean=function(v,fid){const m=_memoClean21(v,fid);if(m){const t=tagsClean(v.tags);if(t.length)m.tags=t}return m};
const _memoDoc21=memoDoc;memoDoc=m=>{const d=_memoDoc21(m),t=tagsClean(m.tags);if(t.length)d.tags=t;return d};
const _memoKey21=memoKey;memoKey=function(m){return _memoKey21(m)+(m&&m.tags&&m.tags.length?"\u0003"+m.tags.join(","):"")};
const _memoHay21=memoHay;memoHay=function(m){return _memoHay21(m)+" "+(m.tags||[]).map(t=>"#"+t).join(" ").toLocaleLowerCase()};
function allTags(){const c=new Map();MEMOS.forEach(m=>{if(!m.del)(m.tags||[]).forEach(t=>{const k=t.toLocaleLowerCase();const o=c.get(k)||{t,n:0};o.n++;c.set(k,o)})});return[...c.values()].sort((a,b)=>b.n-a.n||a.t.localeCompare(b.t,"sv"))}

/* In the note: the tags under the title, with "+ Tagg". */
var TGADD=false;
function tagPaint(){let row=$("mm_tg");if(!row){row=document.createElement("div");row.id="mm_tg";row.className="mmtg";$("mm_meta").after(row)}
  const m=MM.m;if(!m){row.innerHTML="";return}const T=m.tags||[];
  let h=T.map((t,i)=>`<span class="tgc">#${esc(t)}<button type="button" data-tgx="${i}" aria-label="${esc(tx("Ta bort taggen","Remove the tag")+" "+t)}">×</button></span>`).join("");
  if(TGADD){const have=new Set(T.map(t=>t.toLocaleLowerCase())),sug=allTags().filter(o=>!have.has(o.t.toLocaleLowerCase())).slice(0,8);
    h+=`<span class="tgin"><span>#</span><input id="mm_tgi" type="text" maxlength="24" enterkeyhint="done" autocomplete="off" placeholder="${esc(tx("ny tagg","new tag"))}"></span>`+sug.map(o=>`<button type="button" class="tgs" data-tgs="${esc(o.t)}">#${esc(o.t)}</button>`).join("")}
  else if(T.length<8)h+=`<button type="button" class="tgadd" data-tgadd>${T.length?"+":"+ "+tx("Tagg","Tag")}</button>`;
  row.innerHTML=h;if(TGADD){const i=$("mm_tgi");if(i)setTimeout(()=>i.focus(),0)}}
function tagSet(T){if(!MM.m)return;MM.m.tags=tagsClean(T);MM.dirty=true;mmSave();tagPaint()}
document.addEventListener("click",e=>{const row=e.target.closest("#mm_tg");if(!row)return;
  const x=e.target.closest("[data-tgx]");if(x){const T=[...(MM.m.tags||[])];T.splice(+x.dataset.tgx,1);tagSet(T);return}
  const s=e.target.closest("[data-tgs]");if(s){TGADD=false;tagSet([...(MM.m.tags||[]),s.dataset.tgs]);return}
  if(e.target.closest("[data-tgadd]")){TGADD=true;tagPaint()}});
/* The add button keeps the field from losing focus before the tap lands. */
document.addEventListener("pointerdown",e=>{if(e.target.closest("#mm_tg [data-tgs]"))e.preventDefault()});
document.addEventListener("keydown",e=>{if(e.target.id!=="mm_tgi")return;if(e.key==="Enter"||e.key===","){e.preventDefault();const v=e.target.value;TGADD=!!v.trim()&&(MM.m.tags||[]).length<7;if(v.trim())tagSet([...(MM.m.tags||[]),v]);else{TGADD=false;tagPaint()}}
  else if(e.key==="Escape"){TGADD=false;tagPaint()}},true);
document.addEventListener("focusout",e=>{if(e.target.id!=="mm_tgi")return;const v=e.target.value;setTimeout(()=>{if(!TGADD)return;TGADD=false;if(v.trim())tagSet([...(MM.m&&MM.m.tags||[]),v]);else tagPaint()},150)});
const _mmMeta21=mmMeta;mmMeta=function(){_mmMeta21();if(!$("mm_tgi"))tagPaint()};
const _closeMM21=closeMM;closeMM=function(){const i=$("mm_tgi");if(i&&i.value.trim()&&MM.m){MM.m.tags=tagsClean([...(MM.m.tags||[]),i.value]);MM.dirty=true}TGADD=false;_closeMM21()};

/* In the list: the tags on each note, and a row of tags to filter by. */
var MTAG="";try{MTAG=localStorage.getItem("kalenderkoll.mtag")||""}catch(e){}
const _rm21=renderMemos;renderMemos=function(){_rm21.apply(this,arguments);try{tagList()}catch(e){}};
function tagList(){const list=$("mm_list");if(!list)return;const A=allTags();if(MTAG&&!A.some(o=>o.t.toLocaleLowerCase()===MTAG.toLocaleLowerCase()))MTAG="";
  let f=$("mm_tagf");if(!f){f=document.createElement("div");f.id="mm_tagf";f.className="mmtagf";list.before(f)}
  f.hidden=!A.length;f.innerHTML=A.length?`<button type="button" data-tgf="" class="${!MTAG?"on":""}">${tx("Alla","All")}</button>`+A.map(o=>`<button type="button" data-tgf="${esc(o.t)}" class="${MTAG.toLocaleLowerCase()===o.t.toLocaleLowerCase()?"on":""}">#${esc(o.t)}<small>${o.n}</small></button>`).join(""):"";
  const k=MTAG.toLocaleLowerCase();let shown=0;
  list.querySelectorAll(".mmrow").forEach(r=>{const b=r.querySelector("[data-memo]"),m=b&&MEMOS.find(x=>x.id===b.dataset.memo);if(!m)return;
    const T=m.tags||[],ok=!k||T.some(t=>t.toLocaleLowerCase()===k);r.hidden=!ok;if(ok)shown++;
    const it=b.querySelector(".mmit");if(it&&T.length&&!it.querySelector(".mmutag")){let s=it.querySelector(".mmtags");if(!s){s=document.createElement("span");s.className="mmtags";it.appendChild(s)}s.insertAdjacentHTML("afterbegin",T.map(t=>`<i class="mmutag">#${esc(t)}</i>`).join(""))}});
  let none=list.querySelector(".mmtgnone");if(k&&!shown){if(!none){none=document.createElement("p");none.className="muted mmnone mmtgnone";list.prepend(none)}none.textContent=tx(`Inga anteckningar med #${MTAG}`,`No notes tagged #${MTAG}`)}else if(none)none.remove()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-tgf]");if(!b)return;const v=b.dataset.tgf;MTAG=MTAG.toLocaleLowerCase()===v.toLocaleLowerCase()?"":v;try{localStorage.setItem("kalenderkoll.mtag",MTAG)}catch(err){}tagList()});

/* Duplicate: a copy of the note, its pictures too. As a template, the ticks are taken away so the list can be used again. */
async function memoDup(){if(!MM.m)return;mmSave();const src=MEMOS.find(x=>x.id===MM.id)||MM.m;
  const how=await askOpts(tx("Duplicera","Duplicate"),"",[["copy",tx("Exakt kopia","Exact copy"),tx("Allt följer med, även bockarna","Everything comes along, ticks too")],["tpl",tx("Som mall","As a template"),tx("Alla bockar tas bort så listan kan användas igen","All ticks are removed so the list can be used again")]]);if(!how)return;
  const now=Date.now(),id=newId(),imgs={};
  const bl=src.bl.map(b=>{const c=JSON.parse(JSON.stringify(b));c.b=bid();c.tm=now;if(how==="tpl"&&c.t==="c"){c.d=false;delete c.db;delete c.dt}
    if(c.t==="i"){const ni=newId()+Math.random().toString(36).slice(2,5);imgs[ni]=c.i;c.i=ni}return c});
  const ti=src.ti.trim()?(how==="tpl"?src.ti:tx("Kopia av ","Copy of ")+src.ti).slice(0,120):"";
  const m={id,priv:src.priv?1:0,pin:0,ti,tu:now,gone:[],bl,at:now,up:now,by:ME||"",ub:ME||"",...(src.tags&&src.tags.length?{tags:[...src.tags]}:{})};
  MEMOS.push(JSON.parse(JSON.stringify(m)));put("memo_"+id,memoDoc(m));
  Object.entries(imgs).forEach(([ni,oi])=>{const data=MIMG[oi]||(typeof PIMG!=="undefined"&&PIMG[oi]);if(!data)return;MIMG[ni]=data;put("mimg_"+ni,{kind:"mimg",id:ni,memo:id,data,at:now})});
  closeMM();renderMemos();setTimeout(()=>{openMM(id);toast(how==="tpl"?tx("En ny lista från mallen","A new list from the template"):tx("Kopian är klar","The copy is ready"),2500)},260)}
/* The ⋯ menu gets Duplicera. */
$("mm_more").onclick=async()=>{if(!MM.m)return;mmSave();
  const v=await askOpts(MM.m.ti.trim()||tx("Anteckning","Note"),"",[["saveas",tx("Spara som…","Save as…"),tx("PDF, bild eller webbsida i Dokument › Kalenderkoll","PDF, picture or web page in Documents › Kalenderkoll")],["dup",tx("Duplicera","Duplicate"),tx("En kopia, eller en mall utan bockar","A copy, or a template without ticks")],["copy",tx("Kopiera texten","Copy the text"),""],["del",tx("Radera","Delete"),tx("Hamnar i Nyligen raderade i 30 dagar","Goes to Recently deleted for 30 days"),true]]);
  if(v==="copy")mmCopy();else if(v==="del")mmTrash();else if(v==="dup")memoDup();
  else if(v==="saveas"){const f=await askOpts(tx("Spara som","Save as"),"",[["pdf","PDF",tx("Sidor i A4, bra att skriva ut eller skicka","A4 pages, good to print or send")],["img",tx("Bild","Picture"),tx("En lång bild, lätt att dela i en chatt","One long picture, easy to share in a chat")],["html",tx("Webbsida","Web page"),tx("Öppnas i webbläsaren, med länkar som går att trycka på","Opens in the browser, with links you can tap")]]);
    if(f){toast(tx("Sparar…","Saving…"),1500);if(f==="pdf")mmPdf();else if(f==="img")mmImage();else mmExport()}}};
