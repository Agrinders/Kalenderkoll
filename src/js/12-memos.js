/* ---------- Anteckningar (notes) ----------
   A note has a title and a list of blocks: text, to-do items, links and pictures.
   It saves itself while you write; an empty note is removed when you leave it. */
/* var, so the list can be drawn while the app is still starting. */
var MFONT={sf:"Serif",h:"Skrivstil",r:"Rund",m:"Mono"},MB_T=["p","c","l","i","lh"],MCOL={r:"#e5484d",o:"#ee8a2a",y:"#c99a0e",g:"#2f9e63",b:"#3b82f6",v:"#8a72ee",p:"#e0559c",s:"#8b8494"},URLRE=/https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/gi;
function memoClean(v,fid){const id=String(v.id||fid);if(!id)return null;
  const bl=(Array.isArray(v.bl)?v.bl:[]).slice(0,400).map((b,ix)=>b&&MB_T.includes(b.t)?(b.t==="p"?{t:"p",x:String(b.x||"").slice(0,20000),...(b.s==="h1"||b.s==="h2"?{s:b.s}:{}),...(MCOL[b.k]?{k:b.k}:{}),...(MFONT[b.f]?{f:b.f}:{})}:b.t==="c"?{t:"c",x:String(b.x||"").slice(0,500),d:!!b.d,...(MCOL[b.k]?{k:b.k}:{}),...(MFONT[b.f]?{f:b.f}:{}),...(b.m==="b"||b.m==="n"?{m:b.m}:{}),...(typeof b.ds==="string"&&b.ds?{ds:b.ds.slice(0,1000)}:{}),...(Number.isFinite(+b.pr)&&b.pr!==""&&b.pr!==null?{pr:Math.round(+b.pr*100)/100}:{}),...(b.od?{od:1}:{}),...(b.op?{op:1}:{}),...(b.d&&(b.db==="a"||b.db==="b")?{db:b.db}:{}),...(b.d&&+b.dt>0?{dt:+b.dt}:{})}:b.t==="lh"?{t:"lh",x:String(b.x||"").slice(0,200),...(b.od?{od:1}:{}),...(b.op?{op:1}:{}),...(MCOL[b.k]?{k:b.k}:{}),...(MFONT[b.f]?{f:b.f}:{})}:b.t==="l"?(/^https?:\/\//i.test(b.u||"")?{t:"l",u:String(b.u).slice(0,2000)}:null):(typeof b.i==="string"&&b.i?{t:"i",i:b.i}:null)):null).map((x,ix)=>x&&{...x,b:typeof v.bl[ix].b==="string"&&v.bl[ix].b?v.bl[ix].b.slice(0,24):"o"+ix,tm:+v.bl[ix].tm||0}).filter(Boolean);
  return{id,priv:v.priv?1:0,pin:+v.pin||0,ti:String(v.ti||"").slice(0,120),tu:+v.tu||0,gone:Array.isArray(v.gone)?v.gone.filter(x=>typeof x==="string").slice(-500):[],bl,del:+v.del||0,at:+v.at||0,up:+v.up||+v.at||0,by:v.by==="a"||v.by==="b"?v.by:"",ub:v.ub==="a"||v.ub==="b"?v.ub:""}}
/* A fingerprint of a note's content, to tell whether a copy is one this phone has already handled. */
function memoKey(m){return m?m.ti+"\u0002"+(m.tu||0)+"\u0002"+(m.bl||[]).map(b=>b.b+":"+(b.tm||0)+":"+mbSig(b)).join("|")+"\u0002"+(m.gone||[]).length+"\u0002"+(m.del||0):""}
var memoDoc=m=>({kind:"memo",id:m.id,...(m.priv?{priv:1}:{}),pin:m.pin||0,ti:m.ti,tu:m.tu||0,gone:m.gone||[],bl:m.bl,at:m.at,up:m.up,by:m.by,ub:m.ub,...(m.del?{del:m.del}:{})});
var memoEmpty=m=>!m.ti.trim()&&!m.bl.some(b=>b.t==="p"||b.t==="c"||b.t==="lh"?b.x.trim():true);
var host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return u}};
var whenTxt=ms=>{const d=new Date(ms),n=dnD(d),h=pad(d.getHours())+":"+pad(d.getMinutes());return n===todayN()?h:n===todayN()-1?tx("Igår","Yesterday")+" "+h:fmtD(n,{day:"numeric",month:"short"})+(ymd(n)[0]!==ymd(todayN())[0]?" "+ymd(n)[0]:"")};

/* The list on the Att göra page. */
var MMDEL=false;
function renderMemos(){const el=$("t_memos");if(!el)return;const L=[...MEMOS].filter(m=>!m.del).sort((a,b)=>b.up-a.up),D=MEMOS.filter(m=>m.del).sort((a,b)=>b.del-a.del);
  let h=`<div class="mmlh"><h3>${tx("Anteckningar","Notes")}</h3><button class="btn sm" id="mm_new" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>${tx("Ny","New")}</button></div>`;
  if(!L.length)h+=`<div class="mmempty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7.5L19 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5V8h5M9 12.5h6M9 16h4"/></svg><p>${tx("Skriv ner idéer, listor, länkar och bilder. Ni ser dem båda.","Write down ideas, lists, links and pictures. You both see them.")}</p></div>`;
  else h+=`<div class="mml">${L.map(m=>{const txt=m.bl.filter(b=>b.t==="p"||b.t==="c"||b.t==="lh").map(b=>b.x).join(" ").replace(/\s+/g," ").trim(),first=m.ti.trim()||txt.split(" ").slice(0,8).join(" ")||tx("Ny anteckning","New note"),
      img=m.bl.find(b=>b.t==="i"&&MIMG[b.i]),C=m.bl.filter(b=>b.t==="c"),nd2=C.filter(b=>b.d).length,lk=m.bl.find(b=>b.t==="l"),rest=m.ti.trim()?txt:txt.split(" ").slice(8).join(" ");
      return `<button class="mmi" data-memo="${esc(m.id)}" type="button"><span class="mmit"><b>${esc(first)}</b><small><em>${esc(whenTxt(m.up))}</em>${esc(rest||(lk?host(lk.u):img?tx("Bild","Picture"):""))}</small>${C.length||lk?`<span class="mmtags">${C.length?`<i class="${nd2===C.length?"ok":""}">☑ ${nd2}/${C.length}</i>`:""}${lk?`<i>↗ ${esc(host(lk.u))}</i>`:""}</span>`:""}</span>${img?`<span class="mmth" style="background-image:url('${MIMG[img.i]}')"></span>`:""}</button>`}).join("")}</div>`;
  if(D.length){h+=`<button class="mmtrash" data-mmtrash type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>${tx("Nyligen raderade","Recently deleted")} (${D.length})<span>${MMDEL?"▴":"▾"}</span></button>`;
    if(MMDEL)h+=`<div class="mml del">${D.map(m=>{const left=Math.max(1,30-Math.floor((Date.now()-m.del)/864e5));return `<div class="mmi"><span class="mmit"><b>${esc(m.ti.trim()||tx("Utan rubrik","Untitled"))}</b><small>${tx(`Raderas för alltid om ${left} dagar`,`Deleted for good in ${left} days`)}</small></span><button class="btn sm ghost" data-mmback="${esc(m.id)}" type="button">${tx("Återställ","Restore")}</button><button class="lnk bad" data-mmgone="${esc(m.id)}" type="button">${tx("Radera","Delete")}</button></div>`}).join("")}</div>`}
  el.innerHTML=h;if(MM&&MM.open)mmMaybeRefresh();mmPurge()}
/* Notes in Recently deleted are removed for good after 30 days. */
function mmPurge(){const old=MEMOS.filter(m=>m.del&&Date.now()-m.del>30*864e5);if(!old.length)return;old.forEach(m=>{del("memo_"+m.id);m.bl.filter(b=>b.t==="i").forEach(b=>del("mimg_"+b.i))});MEMOS=MEMOS.filter(m=>!old.includes(m))}

/* ---------- The editor ---------- */
var MM={open:false,id:"",m:null,dirty:false,t:0,loadedUp:0};
function mmBlock(b){const d=document.createElement("div");d.className="mb mb-"+b.t+(b.s?" mb-"+b.s:"");d.dataset.t=b.t;if(b.s)d.dataset.s=b.s;if(b.k){d.dataset.k=b.k;d.style.setProperty("--tk",MCOL[b.k])}if(b.f)d.dataset.f=b.f;if(b.m)d.dataset.m=b.m;
  if(b.t==="lh"){d.innerHTML=`<input type="text" maxlength="200" placeholder="${esc(tx("Listans namn","List name"))}"><span class="mbprog"><i></i><em></em></span>`;d.firstChild.value=b.x;return d}
  if(b.t==="p"){d.innerHTML=`<textarea rows="1" placeholder="${esc(b.s==="h1"?tx("Rubrik","Heading"):b.s==="h2"?tx("Underrubrik","Subheading"):tx("Skriv något…","Write something…"))}"></textarea><div class="mblinks"></div>`;d.firstChild.value=b.x;}
  else if(b.t==="c"){d.innerHTML=`<span class="mbmk"></span><button type="button" class="mbck${b.d?" on":""}" aria-label="${esc(tx("Klar","Done"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 12.5 3.6 3.6 7.4-8"/></svg></button><input type="text" maxlength="500">`;d.lastChild.value=b.x;if(b.d&&!b.m)d.classList.add("done")}
  else if(b.t==="l"){if(b.u){d.dataset.u=b.u;d.innerHTML=`<a href="${esc(b.u)}" target="_blank" rel="noopener noreferrer" class="mbl"><span class="mblf">${esc((host(b.u)[0]||"?").toUpperCase())}</span><span class="mblt"><b>${esc(host(b.u))}</b><small>${esc(b.u)}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7"/></svg></a><button type="button" class="mbx" aria-label="${esc(tx("Ta bort","Remove"))}">×</button>`}
    else{d.innerHTML=`<input type="url" class="mblin" inputmode="url" placeholder="${esc(tx("Klistra in eller skriv en länk","Paste or type a link"))}">`}}
  else if(b.t==="i"){d.dataset.i=b.i;d.innerHTML=MIMG[b.i]?`<img src="${MIMG[b.i]}" alt=""><button type="button" class="mbx" aria-label="${esc(tx("Ta bort","Remove"))}">×</button>`:`<span class="mbwait">${tx("Bilden laddas…","Loading picture…")}</span>`}
  return d}
function mmGrow(t){t.style.height="auto";t.style.height=t.scrollHeight+"px"}
function mmLinks(d){const t=d.querySelector("textarea"),box=d.querySelector(".mblinks");if(!t||!box)return;const U=[...new Set(t.value.match(URLRE)||[])].slice(0,6);
  box.innerHTML=U.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">↗ ${esc(host(u))}</a>`).join("")}
function mmRead(){const bl=[],E=[...$("mm_body").querySelectorAll(":scope>.mb")];E.forEach((d,ix)=>{const t=d.dataset.t;let b=null;
  const k={...(d.dataset.k&&MCOL[d.dataset.k]?{k:d.dataset.k}:{}),...(d.dataset.f&&MFONT[d.dataset.f]?{f:d.dataset.f}:{})};
  if(t==="p")b={t:"p",x:d.querySelector("textarea").value,...(d.dataset.s?{s:d.dataset.s}:{}),...k};else if(t==="c")b={t:"c",x:d.querySelector("input").value,d:!d.dataset.m&&d.classList.contains("done"),...k,...(d.dataset.m?{m:d.dataset.m}:{}),...itemExtra(d)};else if(t==="lh")b={t:"lh",x:d.querySelector("input").value,...k,...(d.dataset.od?{od:1}:{}),...(d.dataset.op?{op:1}:{})};
  else if(t==="l"&&d.dataset.u)b={t:"l",u:d.dataset.u};else if(t==="i"&&d.dataset.i)b={t:"i",i:d.dataset.i};if(!b)return;
  /* Each line has its own id and the time it last changed, so two phones can be merged line by line. */
  const sg=mbSig(b);if(sg!==d._sig){d._sig=sg;d._u=Date.now()}
  /* Empty lines nobody has written in (the line at the end, and the "Skriv något" line between lists) are not saved. */
  if(t==="p"&&!b.x&&!b.s&&!d._u)return;bl.push({...b,b:d.dataset.b,tm:d._u||0})});return bl}
function mmPaint(){const m=MM.m;$("mm_ti").value=m.ti;$("mm_body").innerHTML="";const bl=m.bl.length?m.bl:[{t:"p",x:""}];
  bl.forEach(b=>$("mm_body").appendChild(mmBlock(b)));if(bl[bl.length-1].t!=="p")$("mm_body").appendChild(mmBlock({t:"p",x:""}));
  $("mm_body").querySelectorAll(".mb-p").forEach(d=>{mmGrow(d.querySelector("textarea"));mmLinks(d)});mmProg();mmMeta();MM.loadedUp=m.up;MM.lastKey=memoKey(m)}
function mmMeta(){const m=MM.m;$("mm_meta").textContent=m.at?(m.by?tx("Skapad av ","Created by ")+pname(m.by)+" · ":"")+whenTxt(m.at)+(m.up>m.at+60000?" · "+tx("ändrad ","edited ")+whenTxt(m.up)+(m.ub&&m.ub!==m.by?" "+tx("av ","by ")+pname(m.ub):""):""):""}
function openMM(id){let m=id&&MEMOS.find(x=>x.id===id);
  if(!m){const now=Date.now();m={id:newId(),ti:"",bl:[{t:"p",x:""}],at:now,up:now,by:ME||"",ub:ME||""};MM.fresh=true}else MM.fresh=false;
  MM.open=true;MM.id=m.id;MM.m=JSON.parse(JSON.stringify(m));MM.dirty=false;
  $("mm_bt").textContent=tx("Anteckningar","Notes");$("mm_ti").placeholder=tx("Rubrik","Title");$("mm_chkt").textContent=tx("Lista","List");$("mv_s").textContent=tx("Spara bild","Save picture");$("mm_imgt").textContent=tx("Bild","Picture");$("mm_lnkt").textContent=tx("Länk","Link");$("mm_st").textContent="";
  mmPaint();$("mm").classList.add("on");document.body.classList.add("mmopen");$("mm_w").scrollTop=0;
  if(MM.fresh)setTimeout(()=>$("mm_ti").focus(),280)}
function mmChanged(){mmProg();MM.dirty=true;$("mm_st").textContent=tx("Sparar…","Saving…");clearTimeout(MM.t);MM.t=setTimeout(mmSave,700)}
function mmSave(){clearTimeout(MM.t);if(!MM.m)return;const mine=mmMine();if(!MM.dirty)return;MM.dirty=false;
  if(memoEmpty(mine)&&MM.fresh){$("mm_st").textContent="";return}
  const th=MEMOS.find(x=>x.id===MM.id&&x!==MM.m),mg=th&&!MM.fresh?mmMerge(mine,th):mine;
  const m={...MM.m,ti:mg.ti,tu:mg.tu,bl:mg.bl,gone:mg.gone,up:Date.now(),ub:ME||MM.m.ub};MM.fresh=false;MM.m=m;MM.saved=new Set(m.bl.map(b=>b.b));
  const i=MEMOS.findIndex(x=>x.id===m.id),c=JSON.parse(JSON.stringify(m));if(i>=0)MEMOS[i]=c;else MEMOS.push(c);
  put("memo_"+m.id,memoDoc(m));MM.loadedUp=m.up;MM.lastKey=memoKey(m);if(th)mmReconcile(mg);mmMeta();$("mm_st").textContent=tx("Sparat","Saved");setTimeout(()=>{if(!MM.dirty)$("mm_st").textContent=""},1400)}
/* Pictures no note uses any more are removed. */
function mmSweep(){const used=new Set(MEMOS.flatMap(m=>m.bl.filter(b=>b.t==="i").map(b=>b.i)));Object.keys(DOCS).filter(k=>k.startsWith("mimg_")&&!used.has(k.slice(5))&&Date.now()-(+(DOCS[k]||{}).at||0)>60000).forEach(k=>{del(k);delete MIMG[k.slice(5)]})}
function closeMM(){if(!MM.open)return;mmSave();const m=MM.m;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen");document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
  if(m&&memoEmpty(m)&&MEMOS.some(x=>x.id===m.id)){MEMOS=MEMOS.filter(x=>x.id!==m.id);del("memo_"+m.id)}
  MM.m=null;setTimeout(mmSweep,1500);renderMemos()}
/* If your partner changes the note you have open and you are not typing, you see their change. */
/* Your partner's changes come in line by line while you write; the line you are on is never moved under your fingers. */
function mmMaybeRefresh(){const m=MEMOS.find(x=>x.id===MM.id);
  if(!m||m.del){if(!MM.fresh&&MM.m){toast(m?tx("Anteckningen flyttades till Nyligen raderade","The note was moved to Recently deleted"):tx("Anteckningen togs bort","The note was removed"));MM.m=null;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen")}return}
  /* "New" means different from the last copy this phone saved or took in — never judged by clocks, which differ between phones. */
  if(memoKey(m)!==MM.lastKey&&m!==MM.m){const mine=mmMine(),mg=mmMerge(mine,m);MM.loadedUp=m.up;MM.lastKey=memoKey(m);MM.m={...m,ti:mg.ti,tu:mg.tu,bl:mg.bl,gone:mg.gone};MM.saved=new Set(m.bl.map(b=>b.b));mmReconcile(mg);mmMeta();
    /* If this phone has lines the shared copy lacks, they are saved again so nothing is lost. */
    const key=L=>L.map(b=>b.b+":"+mbSig(b)+":"+(b.tm||0)).join("|");if(key(mg.bl)!==key(m.bl)||mg.ti!==m.ti){MM.dirty=true;clearTimeout(MM.t);MM.t=setTimeout(mmSave,500)}}
  $("mm_body").querySelectorAll(".mb-i").forEach(d=>{if(d.querySelector(".mbwait")&&MIMG[d.dataset.i]&&d!==mmCur())d.replaceWith(mmBlock({t:"i",i:d.dataset.i,b:d.dataset.b,tm:d._u}))})}
function mmCur(){const a=document.activeElement;return a&&a.closest?a.closest("#mm_body .mb"):null}
function mmInsert(b,after,focus){const d=mmBlock(b),at=after||mmCur()||$("mm_body").lastElementChild;
  /* An empty text line is replaced instead of left behind. */
  if(at&&at.dataset.t==="p"&&!at.querySelector("textarea").value.trim()&&b.t!=="p"){at.replaceWith(d)}else if(at)at.after(d);else $("mm_body").appendChild(d);
  if(b.t!=="p"&&!d.nextElementSibling)d.after(mmBlock({t:"p",x:""})),mmGrow(d.nextElementSibling.querySelector("textarea"));
  if(focus){const f=d.querySelector("input,textarea");if(f){f.focus();const n=f.value.length;try{f.setSelectionRange(n,n)}catch(e){}}}
  if(b.t==="p")mmGrow(d.querySelector("textarea"));mmChanged();return d}
function mmAddImages(files){[...files].filter(f=>/^image\//.test(f.type)).slice(0,10).forEach(f=>{const u=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{const max=1400,k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
    let q=.8,data=c.toDataURL("image/jpeg",q);while(data.length>850000&&q>.4){q-=.12;data=c.toDataURL("image/jpeg",q)}
    if(data.length>950000){toast(tx("Bilden är för stor","The picture is too big"));return}
    const id=newId();MIMG[id]=data;put("mimg_"+id,{kind:"mimg",id,memo:MM.id,data,at:Date.now()});if(MM.open)mmInsert({t:"i",i:id})};
  im.onerror=()=>{URL.revokeObjectURL(u);toast(tx("Bilden gick inte att använda","That picture could not be used"))};im.src=u})}
function mmLinkFrom(s){s=String(s||"").trim();if(/^www\./i.test(s))s="https://"+s;return /^https?:\/\/\S+\.\S+$/i.test(s)&&!/\s/.test(s)?s:""}
function closeMV(){$("mv").classList.remove("on")}

/* Wiring */
document.addEventListener("click",e=>{if(!e.target.closest)return;
  if(e.target.closest("#mm_new")){openMM("");return}const it=e.target.closest("[data-memo]");if(it){openMM(it.dataset.memo);return}});
$("mm_back").onclick=()=>history.state&&history.state.kk?history.back():closeMM();
/* Deleting moves the note to Recently deleted, where it stays for 30 days. */
function mmTrash(){if(!MM.m)return;clearTimeout(MM.t);const ti=$("mm_ti").value,bl=mmRead();if(memoEmpty({ti,bl})){MM.dirty=false;closeMM();return}
  const m={...MM.m,ti,bl,del:Date.now(),up:Date.now(),ub:ME||MM.m.ub};MM.dirty=false;MM.m=null;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen");mmFmt(false);mmSym(false);
  const i=MEMOS.findIndex(x=>x.id===m.id);if(i>=0)MEMOS[i]=m;else MEMOS.push(m);put("memo_"+m.id,memoDoc(m));renderMemos();
  toast(tx("Flyttad till Nyligen raderade","Moved to Recently deleted"));const tb=$("toasts").lastElementChild;if(tb){const b=document.createElement("button");b.className="tundo";b.textContent=tx("Ångra","Undo");b.onclick=()=>{mmRestore(m.id);tb.remove()};tb.appendChild(b)}}
function mmRestore(id){const m=MEMOS.find(x=>x.id===id);if(!m)return;m.del=0;m.up=Date.now();put("memo_"+m.id,memoDoc(m));renderMemos();toast(tx("Anteckningen är tillbaka","The note is back"))}
document.addEventListener("click",async e=>{if(!e.target.closest)return;let b;
  if(e.target.closest("[data-mmtrash]")){MMDEL=!MMDEL;renderMemos();return}
  if(b=e.target.closest("[data-mmback]")){mmRestore(b.dataset.mmback);return}
  if(b=e.target.closest("[data-mmgone]")){const m=MEMOS.find(x=>x.id===b.dataset.mmgone);if(!m)return;
    if(!await ask(tx("Radera för alltid?","Delete for good?"),tx("Anteckningen och bilderna i den försvinner för er båda och går inte att få tillbaka.","The note and its pictures disappear for both of you and cannot be brought back."),tx("Radera för alltid","Delete for good")))return;
    del("memo_"+m.id);m.bl.filter(x=>x.t==="i").forEach(x=>{del("mimg_"+x.i);delete MIMG[x.i]});MEMOS=MEMOS.filter(x=>x!==m);renderMemos()}});
/* The ⋯ menu: save to the phone, copy the text, or move to Recently deleted. */
$("mm_more").onclick=async()=>{if(!MM.m)return;mmSave();
  const v=await askOpts(MM.m.ti.trim()||tx("Anteckning","Note"),"",[["save",tx("Spara på telefonen","Save to the phone"),tx("Som en fil med text och bilder","As a file with text and pictures")],["copy",tx("Kopiera texten","Copy the text"),""],["del",tx("Radera","Delete"),tx("Hamnar i Nyligen raderade i 30 dagar","Goes to Recently deleted for 30 days"),true]]);
  if(v==="save")mmExport();else if(v==="copy")mmCopy();else if(v==="del")mmTrash()};
function mmPlain(){const m={ti:$("mm_ti").value,bl:mmRead()};let n=0,prev="";return [m.ti.trim(),...m.bl.map(b=>{if(b.t!=="c")n=0;const r=b.t==="p"?b.x:b.t==="lh"?"\n"+b.x+":":b.t==="c"?(b.m==="b"?"• ":b.m==="n"?(++n)+". ":(b.d?"☑ ":"☐ "))+b.x:b.t==="l"?b.u:"";return r})].filter((x,i)=>i===0?x:x!=="" ).join("\n").trim()}
async function mmCopy(){const t=mmPlain();try{await navigator.clipboard.writeText(t);toast(tx("Texten är kopierad","The text is copied"))}catch(e){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");toast(tx("Texten är kopierad","The text is copied"))}catch(e2){toast(tx("Kunde inte kopiera","Could not copy"))}a.remove()}}
const FF={sf:"Fraunces,Georgia,serif",h:"Caveat,cursive",r:"Nunito,system-ui,sans-serif",m:"'DM Mono',ui-monospace,monospace"};
/* The saved file is a small web page: it opens in any browser and keeps headings, colours, lists and pictures. */
function mmExport(){const ti=$("mm_ti").value.trim()||tx("Anteckning","Note"),bl=mmRead();let n=0,inList=false,h="";
  const st=b=>`${b.k?`color:${MCOL[b.k]};`:""}${b.f?`font-family:${FF[b.f]};`:""}`;
  bl.forEach(b=>{if(b.t!=="c"){n=0;if(inList){h+="</ul>";inList=false}}
    if(b.t==="p"){if(!b.x.trim())return;const tag=b.s==="h1"?"h2":b.s==="h2"?"h3":"p";h+=`<${tag} style="${st(b)}">${(typeof richHTML==="function"?richHTML(b.x):esc(b.x)).replace(URLRE,u=>`<a href="${u}">${u}</a>`).replace(/\n/g,"<br>")}</${tag}>`}
    else if(b.t==="lh")h+=`<h4 style="${st(b)}">${esc(b.x)}</h4>`;
    else if(b.t==="c"){if(!inList){h+="<ul>";inList=true}const mk=b.m==="b"?"•":b.m==="n"?(++n)+".":b.d?"☑":"☐";h+=`<li style="${st(b)}${b.d&&!b.m?"text-decoration:line-through;opacity:.6;":""}"><span>${mk}</span>${typeof richHTML==="function"?richHTML(b.x):esc(b.x)}</li>`}
    else if(b.t==="l")h+=`<p><a href="${esc(b.u)}">${esc(b.u)}</a></p>`;
    else if(b.t==="i"&&MIMG[b.i])h+=`<img src="${MIMG[b.i]}" alt="">`});
  if(inList)h+="</ul>";
  const doc=`<!DOCTYPE html><html lang="${S.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(ti)}</title><style>.rb{font-weight:700}.ri{font-style:italic}.rs{text-decoration:line-through}body{max-width:680px;margin:0 auto;padding:28px 20px;font:17px/1.55 system-ui,sans-serif;color:#2a2530;background:#fffcfd}h1{font:500 30px/1.2 Georgia,serif}ul{list-style:none;padding:0}li{padding:4px 0;display:flex;gap:10px}li span{min-width:1.2em;color:#8a72ee}img{max-width:100%;border-radius:14px;margin:10px 0}a{color:#8a72ee}small{color:#867d8c}</style></head><body><h1>${esc(ti)}</h1><small>Kalenderkoll · ${esc(new Date().toLocaleDateString(S.lang==="en"?"en-GB":"sv-SE"))}</small>${h}</body></html>`;
  const name=(ti.replace(/[\\/:*?"<>|]+/g," ").trim().slice(0,60)||"Anteckning")+".html";saveFile(name,doc,"text/html")}
/* Saving a picture from the full-screen view. */
async function saveB64(name,dataUrl){const F=FSP(),b64=dataUrl.split(",")[1]||"";
  if(F){try{await F.writeFile({path:"Kalenderkoll/"+name,data:b64,directory:"DOCUMENTS",recursive:true});toast(tx("Sparad i Dokument › Kalenderkoll","Saved in Documents › Kalenderkoll")+" · "+name)}catch(e){toast(tx("Kunde inte spara bilden","Could not save the picture"))}return}
  const a=document.createElement("a");a.href=dataUrl;a.download=name;document.body.appendChild(a);a.click();a.remove()}
$("mv_s").onclick=()=>saveB64("Bild-"+isoOf(new Date())+"-"+Date.now().toString(36).slice(-4)+".jpg",$("mv_i").src);
$("mm_ti").addEventListener("input",mmChanged);
$("mm_ti").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const f=$("mm_body").querySelector(".mb textarea,.mb input");if(f)f.focus()}});
$("mm_tail").onclick=()=>{const L=$("mm_body").lastElementChild;const f=L&&L.querySelector("textarea");if(f){f.focus();const n=f.value.length;f.setSelectionRange(n,n)}else mmInsert({t:"p",x:""},L,true)};
$("mm_body").addEventListener("input",e=>{const d=e.target.closest(".mb");if(!d)return;if(e.target.tagName==="TEXTAREA"){mmGrow(e.target);mmLinks(d)}
  if(e.target.classList.contains("mblin"))return;mmChanged()});
$("mm_body").addEventListener("click",e=>{const d=e.target.closest(".mb");if(!d)return;
  if(e.target.closest(".mbck")){d.classList.toggle("done");e.target.closest(".mbck").classList.toggle("on");mmChanged();return}
  if(e.target.closest(".mbx")){const x=e.target.closest(".mbx");
    /* Removing a picture or link takes two taps, so it does not happen by mistake. */
    if(!x.classList.contains("arm")){x.classList.add("arm");x.textContent=tx("Ta bort?","Remove?");clearTimeout(x._t);x._t=setTimeout(()=>{x.classList.remove("arm");x.textContent="×"},3000);return}
    d.remove();if(!$("mm_body").children.length)$("mm_body").appendChild(mmBlock({t:"p",x:""}));mmChanged();return}
  if(e.target.tagName==="IMG"){$("mv_i").src=e.target.src;$("mv").classList.add("on")}});
$("mm_body").addEventListener("keydown",e=>{const d=e.target.closest(".mb");if(!d)return;
  if(d.dataset.t==="c"&&e.target.tagName==="INPUT"){
    if(e.key==="Enter"){e.preventDefault();const v=e.target.value,pos=e.target.selectionStart;
      /* Enter on an empty item ends the list, like in Notes. */
      if(!v.trim()){const p=mmBlock({t:"p",x:""});d.replaceWith(p);mmGrow(p.querySelector("textarea"));p.querySelector("textarea").focus();mmChanged();return}
      e.target.value=v.slice(0,pos);mmInsert({t:"c",x:v.slice(pos),d:false,...(d.dataset.m?{m:d.dataset.m}:{}),...(d.dataset.f?{f:d.dataset.f}:{})},d,true).querySelector("input").setSelectionRange(0,0)}
    else if(e.key==="Backspace"&&e.target.selectionStart===0&&e.target.selectionEnd===0){e.preventDefault();const prev=d.previousElementSibling,v=e.target.value;
      if(prev&&prev.dataset.t==="c"){const pi=prev.querySelector("input"),n=pi.value.length;pi.value+=v;d.remove();pi.focus();pi.setSelectionRange(n,n)}
      else{const p=mmBlock({t:"p",x:v});d.replaceWith(p);const ta=p.querySelector("textarea");mmGrow(ta);ta.focus();ta.setSelectionRange(0,0)}mmChanged()}}
  else if(d.dataset.t==="p"&&e.key==="Backspace"&&e.target.selectionStart===0&&e.target.selectionEnd===0){const prev=d.previousElementSibling;
    if(prev&&(prev.dataset.t==="p"||prev.dataset.t==="c")){e.preventDefault();const f=prev.querySelector("textarea,input"),n=f.value.length,v=e.target.value;f.value+=(prev.dataset.t==="p"&&v&&n?"\n":"")+v;d.remove();if(f.tagName==="TEXTAREA")mmGrow(f);f.focus();f.setSelectionRange(n,n);mmChanged()}
    else if(prev&&!e.target.value){e.preventDefault()}}
  else if(e.target.classList.contains("mblin")&&e.key==="Enter"){e.preventDefault();e.target.blur()}});
$("mm_body").addEventListener("focusout",e=>{if(!e.target.classList||!e.target.classList.contains("mblin"))return;const d=e.target.closest(".mb"),u=mmLinkFrom(e.target.value);
  if(u){const n=mmBlock({t:"l",u});d.replaceWith(n);mmChanged()}else{if(e.target.value.trim())toast(tx("Det där ser inte ut som en länk","That does not look like a link"));d.remove()}});
/* Pasting: a picture becomes a picture, a single link becomes a link card. */
$("mm").addEventListener("paste",e=>{const cd=e.clipboardData;if(!cd)return;const files=[...(cd.files||[])].filter(f=>/^image\//.test(f.type));
  if(files.length){e.preventDefault();mmAddImages(files);return}
  const t=cd.getData("text/plain"),u=mmLinkFrom(t);if(u&&e.target.id!=="mm_ti"&&!e.target.classList.contains("mblin")){e.preventDefault();const d=mmCur();mmInsert({t:"l",u},d)}});
$("mm_chk").onmousedown=e=>e.preventDefault();$("mm_img").onmousedown=e=>e.preventDefault();$("mm_lnk").onmousedown=e=>e.preventDefault();
$("mm_chk").onclick=()=>{const d=mmCur();if(d&&d.dataset.t==="c"){const p=mmBlock({t:"p",x:d.querySelector("input").value});d.replaceWith(p);mmGrow(p.querySelector("textarea"));p.querySelector("textarea").focus();mmChanged();return}
  if(d&&d.dataset.t==="p"){const ta=d.querySelector("textarea"),v=ta.value;
    /* The line you are on becomes a to-do item. */
    const pos=ta.selectionStart,a=v.lastIndexOf("\n",pos-1)+1,z=v.indexOf("\n",pos)<0?v.length:v.indexOf("\n",pos),line=v.slice(a,z),before=v.slice(0,a).replace(/\n$/,""),after=v.slice(z+1);
    if(!v.trim()){const c=mmBlock({t:"c",x:"",d:false});d.replaceWith(c);if(!c.nextElementSibling)c.after(mmBlock({t:"p",x:""}));c.querySelector("input").focus();mmChanged();return}
    if(before)ta.value=before;else{d.remove()}const c=mmInsert({t:"c",x:line,d:false},before?d:null,true);if(after){const p=mmBlock({t:"p",x:after});c.after(p);mmGrow(p.querySelector("textarea"))}if(!before&&!c.previousElementSibling&&d.isConnected===false){}return}
  mmInsert({t:"c",x:"",d:false},null,true)};
$("mm_img").onclick=()=>{$("mm_in").value="";$("mm_in").click()};
$("mm_in").addEventListener("change",()=>{if($("mm_in").files.length)mmAddImages($("mm_in").files)});
$("mm_lnk").onclick=()=>{mmInsert({t:"l",u:""},null,true)};
$("mv_x").onclick=closeMV;$("mv").addEventListener("click",e=>{if(e.target===$("mv"))closeMV()});
addEventListener("pagehide",()=>{if(MM.open)mmSave()});document.addEventListener("visibilitychange",()=>{if(document.hidden&&MM.open)mmSave()});

/* ---------- Headings, colours and separate lists ---------- */
/* Each list name shows how many of the items under it are done. */
function mmProg(){$("mm_body").querySelectorAll(".mb-lh").forEach(h=>{let n=0,dn=0;for(let x=h.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling){n++;if(x.classList.contains("done"))dn++;x.classList.add("inl")}
  h.querySelector("em").textContent=n?dn+"/"+n:"";/* The bar is 46px wide, so the filled part is measured in pixels of that, not of the whole row. */
  h.querySelector("i").style.width=n?Math.round(dn/n*46)+"px":"0";h.classList.toggle("all",n>0&&dn===n)});
  $("mm_body").querySelectorAll(".mb-c").forEach(c=>{let p=c.previousElementSibling;while(p&&p.dataset.t==="c")p=p.previousElementSibling;c.classList.toggle("inl",!!(p&&p.dataset.t==="lh"));c.classList.toggle("lastl",!(c.nextElementSibling&&c.nextElementSibling.dataset.t==="c"))})}
let mmLast=null;$("mm_body").addEventListener("focusin",e=>{const d=e.target.closest(".mb");if(d)mmLast=d});
const mmTarget=()=>{const d=mmCur()||mmLast;return d&&d.isConnected?d:null};
function mmFmtPaint(){const d=mmTarget(),st=d?(d.dataset.t==="p"?(d.dataset.s||"p"):d.dataset.t):"",k=d&&d.dataset.k||"";
  const S2=[["h1",tx("Rubrik","Heading")],["h2",tx("Underrubrik","Subheading")],["p",tx("Text","Text")]];
  $("mm_fmt").innerHTML=`<div class="mmfs">${S2.map(([v,l])=>`<button type="button" data-fs="${v}" class="fs-${v}${st===v?" on":""}">${l}</button>`).join("")}</div><div class="mmfc"><button type="button" data-fk="" class="${!k?"on":""}" style="--c:var(--ink)" aria-label="${esc(tx("Standard","Default"))}"></button>${Object.entries(MCOL).map(([n,c])=>`<button type="button" data-fk="${n}" class="${k===n?"on":""}" style="--c:${c}" aria-label="${n}"></button>`).join("")}</div>`}
function mmFmt(open){const f=$("mm_fmt");if(open===undefined)open=f.hidden;f.hidden=!open;$("mm_aa").classList.toggle("on",open);if(open)mmFmtPaint()}
$("mm_aa").onmousedown=e=>e.preventDefault();$("mm_fmt").addEventListener("mousedown",e=>e.preventDefault());
$("mm_aa").onclick=()=>mmFmt();
function mmFocusEnd(d){const f=d&&d.querySelector("textarea,input");if(!f)return;f.focus();const n=f.value.length;try{f.setSelectionRange(n,n)}catch(e){}}
/* Focus that always happens: used when something new to write in is created. */
var mmFocusHard=mmFocusEnd;
$("mm_fmt").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;let d=mmTarget();
  if(b.dataset.fs!==undefined){const v=b.dataset.fs;
    if(v==="lh"){/* A new list: a name, then its first item. */const at=d||$("mm_body").lastElementChild;const h=mmBlock({t:"lh",x:""});
      if(at&&at.dataset.t==="p"&&!at.querySelector("textarea").value.trim())at.replaceWith(h);else if(at)at.after(h);else $("mm_body").appendChild(h);
      const c=mmBlock({t:"c",x:"",d:false});h.after(c);if(!c.nextElementSibling)c.after(mmBlock({t:"p",x:""}));h.querySelector("input").focus();mmChanged();mmFmtPaint();return}
    if(!d){d=mmInsert({t:"p",x:""},null,true)}
    const txt=(d.querySelector("textarea,input")||{}).value||"",k=d.dataset.k||"";
    const nb=v==="p"?{t:"p",x:txt}:{t:"p",x:txt,s:v};if(k)nb.k=k;
    const n=mmBlock(nb);d.replaceWith(n);if(n.querySelector("textarea")){mmGrow(n.querySelector("textarea"));mmLinks(n)}mmFocusEnd(n);mmChanged();mmFmtPaint();return}
  if(b.dataset.fk!==undefined){if(!d)return;const k=b.dataset.fk;if(k){d.dataset.k=k;d.style.setProperty("--tk",MCOL[k])}else{delete d.dataset.k;d.style.removeProperty("--tk")}
    mmFocusEnd(d);mmChanged();mmFmtPaint()}});
document.addEventListener("selectionchange",()=>{if(!$("mm_fmt").hidden&&MM&&MM.open)mmFmtPaint()});
/* Keys for headings and list names: Enter goes on to a new line of text, or to the list's first item. */
$("mm_body").addEventListener("keydown",e=>{const d=e.target.closest(".mb");if(!d)return;
  if(d.dataset.t==="lh"&&e.key==="Enter"){e.preventDefault();const nx=d.nextElementSibling;if(nx&&nx.dataset.t==="c")mmFocusEnd(nx);else mmInsert({t:"c",x:"",d:false},d,true)}
  else if(d.dataset.t==="lh"&&e.key==="Backspace"&&!e.target.value){e.preventDefault();const pv=d.previousElementSibling;d.remove();if(pv)mmFocusEnd(pv);mmChanged()}
  else if(d.dataset.t==="p"&&d.dataset.s&&e.key==="Enter"){e.preventDefault();const ta=e.target,pos=ta.selectionStart,rest=ta.value.slice(pos);ta.value=ta.value.slice(0,pos);mmGrow(ta);
    const n=mmBlock({t:"p",x:rest});d.after(n);mmGrow(n.querySelector("textarea"));const t2=n.querySelector("textarea");t2.focus();t2.setSelectionRange(0,0);mmChanged()}},true);
const mmCloseOld=closeMM;closeMM=function(){mmFmt(false);mmLast=null;mmCloseOld()};

/* ---------- Fonts, list kinds and symbols ---------- */
const MKIND=[["c","☐",tx("Bockar","Checkboxes")],["b","•",tx("Punkter","Bullets")],["n","1.",tx("Nummer","Numbers")]];
function mmGroup(d){/* The list a line belongs to: its name and all items next to each other. */
  let a=d;if(a.dataset.t==="lh")a=a.nextElementSibling;if(!a||a.dataset.t!=="c")return[];while(a.previousElementSibling&&a.previousElementSibling.dataset.t==="c")a=a.previousElementSibling;const L=[];for(let x=a;x&&x.dataset.t==="c";x=x.nextElementSibling)L.push(x);return L}
const _paint=mmFmtPaint;mmFmtPaint=function(){_paint();const d=mmTarget(),f=d&&d.dataset.f||"",isL=d&&(d.dataset.t==="c"||d.dataset.t==="lh"),G=isL?mmGroup(d):[],mk=G[0]&&G[0].dataset.m||"c";
  let h="";
  h+=`<div class="mmfs mmff"><button type="button" data-ff="" class="${!f?"on":""}">Standard</button>${Object.entries(MFONT).map(([v,l])=>`<button type="button" data-ff="${v}" class="ff-${v}${f===v?" on":""}">${l}</button>`).join("")}</div>`;
  $("mm_fmt").querySelector(".mmfs").insertAdjacentHTML("afterend",h)};
$("mm_fmt").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=mmTarget();if(!d)return;
  if(b.dataset.fm!==undefined){const v=b.dataset.fm;mmGroup(d).forEach(x=>{if(v==="c")delete x.dataset.m;else{x.dataset.m=v;x.classList.remove("done");const ck=x.querySelector(".mbck");if(ck)ck.classList.remove("on")}});mmChanged();mmFocusEnd(d);mmFmtPaint()}
  else if(b.dataset.ff!==undefined){const v=b.dataset.ff;if(v)d.dataset.f=v;else delete d.dataset.f;const t=d.querySelector("textarea");if(t)mmGrow(t);mmChanged();mmFocusEnd(d);mmFmtPaint()}});
/* Numbers count up within each list. */
const _prog=mmProg;mmProg=function(){_prog();$("mm_body").querySelectorAll(".mb-c").forEach(c=>{const p=c.previousElementSibling,n=p&&p.dataset.t==="c"&&p.dataset.m===c.dataset.m?(+p.dataset.no||0)+1:1;c.dataset.no=n;const mk=c.querySelector(".mbmk");if(mk)mk.textContent=c.dataset.m==="n"?n+".":c.dataset.m==="b"?"•":""})};
/* Symbols: tap one and it goes in where you were writing. */
const SYMS=[["Hjärtan","Hearts","❤️ 🧡 💛 💚 💙 💜 🩷 🤍 💕 💞 💖 💘 💗 ❣️"],["Ansikten","Faces","😊 😍 🥰 😘 😂 🥹 😎 🤩 😴 🥳 😅 🤔 😢 😮"],["Saker","Things","🎂 🎁 🎉 🎈 ✈️ 🚗 🏠 🛒 🍕 🍷 ☕ 🍰 💐 🌹 🎬 🎵 📚 💼 🏋️ ⚽ 🐶 🐱 💍 🔑"],["Väder","Weather","☀️ 🌤️ ⛅ 🌧️ ❄️ ⛄ 🌈 🌙 ⭐ ✨ 🔥 🌊 🌸 🍂 🎄 🎃"],["Symboler","Symbols","✓ ✔︎ ✗ ★ ☆ → ← ↑ ↓ • ◦ — – … ± × ÷ ≈ ≠ ∞ § © ® ™ € £ % # @ & ♪ ☎ ✉ ⏰ 📌 📍 ⚠️ ❗ ❓"]];
let mmSel=null;["keyup","click","input","select","focusin"].forEach(ev=>$("mm").addEventListener(ev,e=>{const t=e.target;if(t&&(t.tagName==="TEXTAREA"||(t.tagName==="INPUT"&&t.type!=="file"))&&$("mm").contains(t))mmSel={el:t,s:t.selectionStart,e:t.selectionEnd}},true));
function mmSym(open){const f=$("mm_sym");if(open===undefined)open=f.hidden;f.hidden=!open;$("mm_sy").classList.toggle("on",open);if(open){mmFmt(false);f.innerHTML=SYMS.map(([sv,en,L])=>`<p>${S.lang==="en"?en:sv}</p><div class="mmsg">${L.split(" ").map(x=>`<button type="button" data-sym="${x}">${x}</button>`).join("")}</div>`).join("")}}
$("mm_sy").onmousedown=e=>e.preventDefault();$("mm_sym").addEventListener("mousedown",e=>e.preventDefault());
$("mm_sy").onclick=()=>mmSym();
const _fmt=mmFmt;mmFmt=function(open){if(open===undefined)open=$("mm_fmt").hidden;if(open)mmSym(false);_fmt(open)};
$("mm_sym").addEventListener("click",e=>{const b=e.target.closest("[data-sym]");if(!b)return;let t=mmSel&&mmSel.el&&mmSel.el.isConnected?mmSel.el:null;
  if(!t){const d=mmInsert({t:"p",x:""},null,true);t=d.querySelector("textarea");mmSel={el:t,s:0,e:0}}
  const v=t.value,s0=Math.min(mmSel.s??v.length,v.length),e0=Math.min(mmSel.e??v.length,v.length),sym=b.dataset.sym;t.value=v.slice(0,s0)+sym+v.slice(e0);const p=s0+sym.length;if(!MMSOFT)t.focus();try{t.setSelectionRange(p,p)}catch(err){}mmSel={el:t,s:p,e:p};
  if(t.tagName==="TEXTAREA")mmGrow(t);if(t.id==="mm_ti"||t.closest(".mb"))mmChanged()});
const _closeMM2=closeMM;closeMM=function(){mmSym(false);_closeMM2()};

/* ---------- Writing together ----------
   Lines are merged by id: new lines from both of you are kept (placed after the line they followed),
   a changed line keeps the newest change, and a removed line stays removed. */
function mbSig(b){const{b:_1,tm:_2,...r}=b;return JSON.stringify(r)}
const bid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const _mbBlock=mmBlock;mmBlock=function(b){const d=_mbBlock(b);d.dataset.b=b.b||bid();d._u=b.tm||0;d._sig=mbSig({...b});
  if(b.t==="c"||b.t==="lh"){const inp=d.querySelector("input");if(inp){inp.setAttribute("enterkeyhint","next");const f=document.createElement("form");f.className="mbf";f.noValidate=true;inp.replaceWith(f);f.appendChild(inp)}}
  /* The signature is taken from what the line really shows, so opening a note never counts as a change. */
  return d};
function mmMine(){const ti=$("mm_ti").value;if(ti!==MM.lastTi){MM.lastTi=ti;MM.tu=Date.now()}const bl=mmRead(),here=new Set(bl.map(b=>b.b));
  $("mm_body").querySelectorAll(":scope>.mb").forEach(d=>here.add(d.dataset.b));
  const gone=new Set(MM.m&&MM.m.gone||[]);(MM.saved||new Set()).forEach(id=>{if(!here.has(id))gone.add(id)});return{ti,tu:MM.tu||0,bl,gone:[...gone].slice(-500)}}
function mmMerge(a,b){const gone=new Set([...(a.gone||[]),...(b.gone||[])]),A=new Map(a.bl.map(x=>[x.b,x])),B=new Set(b.bl.map(x=>x.b));
  const res=b.bl.filter(x=>!gone.has(x.b)).map(x=>{const y=A.get(x.b);return y&&(y.tm||0)>(x.tm||0)?y:x});
  a.bl.forEach((x,i)=>{if(B.has(x.b)||gone.has(x.b))return;let j=-1;for(let k=i-1;k>=0;k--){const pi=res.findIndex(z=>z.b===a.bl[k].b);if(pi>=0){j=pi;break}}res.splice(j+1,0,x)});
  return{ti:(a.tu||0)>(b.tu||0)?a.ti:b.ti,tu:Math.max(a.tu||0,b.tu||0),bl:res,gone:[...gone].slice(-500)}}
function mmReconcile(mg){const body=$("mm_body"),foc=mmCur(),E=[...body.querySelectorAll(":scope>.mb")],els=new Map(E.map(e=>[e.dataset.b,e])),keep=new Set(mg.bl.map(x=>x.b));
  const spare=e=>e.dataset.t==="p"&&!e.querySelector("textarea").value&&!e._u;
  /* Empty helper lines are taken out too (they are put back between lists afterwards), so none is left inside a list. */
  E.forEach(e=>{if(!keep.has(e.dataset.b)&&e!==foc)e.remove()});
  let prev=null;mg.bl.forEach(x=>{let e=els.get(x.b);
    if(e&&e!==foc&&e._sig!==mbSig(x)){const n=mmBlock(x);e.replaceWith(n);e=n}else if(!e){e=mmBlock(x)}
    if(e!==foc){const want=prev?prev.nextElementSibling:body.firstElementChild;if(e!==want){if(prev)prev.after(e);else body.prepend(e)}}
    const t=e.querySelector("textarea");if(t){mmGrow(t);mmLinks(e)}prev=e});
  const last=body.lastElementChild;if(!last||last.dataset.t!=="p")body.appendChild(mmBlock({t:"p",x:""}));
  if(document.activeElement!==$("mm_ti")&&$("mm_ti").value!==mg.ti){$("mm_ti").value=mg.ti;MM.lastTi=mg.ti}mmProg()}
const _openMM=openMM;openMM=function(id){_openMM(id);MM.saved=new Set((MM.m.bl||[]).map(b=>b.b));MM.lastTi=MM.m.ti;MM.tu=MM.m.tu||0;
  mmTidy()};
/* Enter on a list line always makes a new point, also on phone keyboards that do not send a normal Enter key. */
let mmEnterAt=0;$("mm_body").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.isTrusted)mmEnterAt=Date.now()},true);
$("mm_body").addEventListener("submit",e=>{e.preventDefault();const inp=e.target.querySelector("input");if(!inp||Date.now()-mmEnterAt<400)return;inp.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}))});
/* In ordinary text, a line that starts with "-", "•" or "1." carries on as a list when you press Enter. */
$("mm_body").addEventListener("beforeinput",e=>{if(e.target.tagName!=="TEXTAREA"||(e.inputType!=="insertLineBreak"&&e.inputType!=="insertParagraph"))return;const d=e.target.closest(".mb");if(!d||d.dataset.s)return;
  const ta=e.target,v=ta.value,pos=ta.selectionStart;if(pos!==ta.selectionEnd)return;const a=v.lastIndexOf("\n",pos-1)+1,line=v.slice(a,pos),mt=line.match(/^(\s*)([-•*]|(\d+)([.)]))\s+/);if(!mt)return;e.preventDefault();
  if(line.slice(mt[0].length).trim()===""&&v.slice(pos,v.indexOf("\n",pos)<0?v.length:v.indexOf("\n",pos)).trim()===""){ta.value=v.slice(0,a)+v.slice(pos);ta.setSelectionRange(a,a)}
  else{const nx=mt[1]+(mt[3]?(+mt[3]+1)+mt[4]:mt[2])+" ";ta.value=v.slice(0,pos)+"\n"+nx+v.slice(pos);const q=pos+1+nx.length;ta.setSelectionRange(q,q)}
  mmGrow(ta);mmLinks(d);mmChanged()});
/* ---------- Folding lists ----------
   A named list can be folded to just its name and progress. Which lists are folded is kept on this phone only,
   so folding a list never folds it for your partner. */
const FK="kalenderkoll.fold";
function foldSet(){try{return new Set(JSON.parse(localStorage.getItem(FK)||"[]"))}catch(e){return new Set()}}
function foldSave(S2){try{localStorage.setItem(FK,JSON.stringify([...S2].slice(-400)))}catch(e){}}
const _mbBlock2=mmBlock;mmBlock=function(b){const d=_mbBlock2(b);if(b.t==="lh"){const f=document.createElement("button");f.type="button";f.className="mbfold";f.setAttribute("aria-label",tx("Fäll ihop eller ut","Fold or unfold"));
  f.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>';d.prepend(f);if(MM&&MM.id){const F=foldSet();if(F.has(MM.id+":"+d.dataset.b)||(b.x&&F.has(MM.id+":n:"+b.x.trim())))d.classList.add("fold")}}return d};
const _prog2=mmProg;mmProg=function(){_prog2();$("mm_body").querySelectorAll(".mb-c").forEach(c=>c.classList.remove("hid"));
  $("mm_body").querySelectorAll(".mb-lh.fold").forEach(h=>{for(let x=h.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling)x.classList.add("hid")})};
/* Folding is drawn with transforms and opacity only: the lines are shown or hidden in one step, and what you see
   is the lines fading while everything below slides. That keeps it smooth however long the list is. */
const calm=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
var foldBusy=0;
function mmFold(h,on){if(on===undefined)on=!h.classList.contains("fold");if(h.classList.contains("fold")===on)return;
  const G=[];for(let x=h.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling)G.push(x);
  const S2=foldSet(),nm=h.querySelector("input").value.trim();[MM.id+":"+h.dataset.b,...(nm?[MM.id+":n:"+nm]:[])].forEach(k=>{if(on)S2.add(k);else S2.delete(k)});foldSave(S2);
  try{if(navigator.vibrate)navigator.vibrate(6)}catch(e){}
  /* The line you were writing on is not hidden away. */
  if(on){const a=mmCur();if(a&&G.includes(a))h.querySelector("input").focus()}
  const w=$("mm_w"),vb=w.getBoundingClientRect().bottom,EASE="cubic-bezier(.22,.9,.3,1)",DUR=260,anim=!calm()&&G.length&&h.getBoundingClientRect().top<vb;
  G.forEach(x=>x.getAnimations&&x.getAnimations().forEach(a=>a.cancel()));
  const after=[];if(anim){for(let x=G[G.length-1].nextElementSibling;x&&after.length<40;x=x.nextElementSibling)after.push(x);const t=$("mm_tail");if(t)after.push(t)}
  const top0=after.length?after[0].getBoundingClientRect().top:0;
  if(!on){G.forEach(x=>x.classList.remove("hid"));h.classList.remove("fold")}
  const top1=!on&&after.length?after[0].getBoundingClientRect().top:0,H=on?(G.length?G[G.length-1].getBoundingClientRect().bottom-G[0].getBoundingClientRect().top:0):top1-top0;
  if(on)h.classList.add("fold");
  if(!anim){if(on)G.forEach(x=>x.classList.add("hid"));mmProg();return}
  const seen=G.filter(x=>{const r=x.getBoundingClientRect();return r.top<vb}).slice(0,14);
  if(on){/* Closing: lines fade up and out while what is below slides up; then the lines are taken out of the page. */
    seen.forEach((x,i)=>x.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-6px)"}],{duration:130,delay:Math.max(0,(seen.length-1-i))*10,easing:"ease-in",fill:"forwards"}));
    const vis=after.filter(x=>x.getBoundingClientRect().top-H<vb+40);
    const A=vis.map(x=>x.animate([{transform:"none"},{transform:`translateY(${-H}px)`}],{duration:DUR,easing:EASE,fill:"forwards"}));
    foldBusy++;const done=()=>{foldBusy--;G.forEach(x=>{x.classList.add("hid");x.getAnimations().forEach(a=>a.cancel())});A.forEach(a=>a.cancel());mmProg()};
    if(A.length)A[0].finished.then(done,()=>{});else setTimeout(done,150)}
  else{/* Opening: the lines are already in place; they fade in from just above while what is below slides down. */
    seen.forEach((x,i)=>x.animate([{opacity:0,transform:"translateY(-8px)"},{opacity:1,transform:"none"}],{duration:200,delay:40+i*16,easing:EASE,fill:"backwards"}));
    after.filter(x=>x.getBoundingClientRect().top-H<vb+40).forEach(x=>x.animate([{transform:`translateY(${-H}px)`},{transform:"none"}],{duration:DUR,easing:EASE}));mmProg()}}
$("mm_body").addEventListener("click",e=>{const f=e.target.closest(".mbfold");if(!f)return;e.stopPropagation();mmFold(f.closest(".mb"))},true);
/* Pressing Enter on a folded list's name opens it and goes to its first point. */
$("mm_body").addEventListener("keydown",e=>{const d=e.target.closest&&e.target.closest(".mb-lh.fold");if(d&&e.key==="Enter")mmFold(d,false)},true);

/* ---------- The Lista button: a menu of list kinds ----------
   Pick checkboxes, bullets or numbers, or a new list with a name. Inside a list the same choice changes that list. */
const mmMakeList=$("mm_chk").onclick;
function mmLst(open){const f=$("mm_lst");if(open===undefined)open=f.hidden;f.hidden=!open;$("mm_chk").classList.toggle("on",open);if(!open)return;mmFmt(false);mmSym(false);
  const d=mmTarget(),G=d&&(d.dataset.t==="c"||d.dataset.t==="lh")?mmGroup(d):[],cur=G.length?(G[0].dataset.m||"c"):"";
  const prev={c:'<i class="pc"></i><i class="pc on"></i><i class="pc"></i>',b:'<i class="pb"></i><i class="pb"></i><i class="pb"></i>',n:'<i class="pn">1</i><i class="pn">2</i><i class="pn">3</i>'};
  f.innerHTML=`<p>${G.length?tx("Ändra listan till","Change the list to"):tx("Lägg till en lista","Add a list")}</p><div class="mmlk">${MKIND.map(([v,i,l])=>`<button type="button" data-lk="${v}" class="${cur===v?"on":""}"><span class="lkp">${prev[v]}</span><b>${l}</b></button>`).join("")}</div>
    <button type="button" class="mmln" data-lk="named"><span class="lkh"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg></span><span><b>${tx("Ny lista med rubrik","New list with a name")}</b><small>${tx("Med namn och en stapel som visar hur mycket som är klart. Kan fällas ihop.","With a name and a bar showing how much is done. Can be folded.")}</small></span></button>`}
$("mm_chk").onclick=()=>mmLst();$("mm_lst").addEventListener("mousedown",e=>e.preventDefault());
const _fmt3=mmFmt;mmFmt=function(open){if(open===undefined)open=$("mm_fmt").hidden;if(open)mmLst(false);_fmt3(open)};
const _sym3=mmSym;mmSym=function(open){if(open===undefined)open=$("mm_sym").hidden;if(open)mmLst(false);_sym3(open)};
const _close3=closeMM;closeMM=function(){mmLst(false);_close3()};
function mmSetKind(L,v){L.forEach(x=>{if(v==="c")delete x.dataset.m;else{x.dataset.m=v;x.classList.remove("done");const ck=x.querySelector(".mbck");if(ck)ck.classList.remove("on")}})}
$("mm_lst").addEventListener("click",e=>{const b=e.target.closest("[data-lk]");if(!b)return;const v=b.dataset.lk,d=mmTarget();
  if(v==="named"){const at=d||$("mm_body").lastElementChild,h=mmBlock({t:"lh",x:""});
    if(at&&at.dataset.t==="p"&&!at.querySelector("textarea").value.trim())at.replaceWith(h);else if(at){let x=at;if(x.dataset.t==="c"||x.dataset.t==="lh"){const G=mmGroup(x);if(G.length)x=G[G.length-1]}x.after(h)}else $("mm_body").appendChild(h);
    const c=mmBlock({t:"c",x:"",d:false});h.after(c);if(!c.nextElementSibling)c.after(mmBlock({t:"p",x:""}));h.querySelector("input").focus();mmChanged();mmLst(false);return}
  const G=d&&(d.dataset.t==="c"||d.dataset.t==="lh")?mmGroup(d):[];
  if(G.length){mmSetKind(G,v);mmChanged();mmFocusEnd(d);mmLst(false);return}
  if(d)mmFocusHard(d);mmMakeList();const n=mmCur();if(n&&n.dataset.t==="c"){mmSetKind(mmGroup(n),v);mmChanged()}mmLst(false)});

/* ---------- Jump to a heading or list ----------
   A small flap on the left edge appears when a note has headings or named lists.
   Tap it for a short list of them; tap one and the note scrolls there. */
function tocItems(){return[...$("mm_body").querySelectorAll(":scope>.mb-h1,:scope>.mb-h2,:scope>.mb-lh")].map(d=>({d,lv:d.classList.contains("mb-h1")?1:d.classList.contains("mb-h2")?2:3,x:(d.querySelector("textarea,input")||{}).value||""})).filter(o=>o.x.trim())}
function tocPaint(){const L=tocItems();$("toc_f").classList.toggle("hide",L.length<2);if(L.length<2)tocOpen(false);
  if($("toc_p").classList.contains("on"))$("toc_p").innerHTML=`<p>${tx("Hoppa till","Jump to")}</p>`+L.map((o,i)=>`<button type="button" data-toc="${i}" class="lv${o.lv}"${o.d.dataset.k?` style="--tc:${MCOL[o.d.dataset.k]}"`:""}>${o.lv===3?'<span class="tl"></span>':""}${esc(o.x)}</button>`).join("")}
function tocOpen(on){const p=$("toc_p");if(on===undefined)on=!p.classList.contains("on");p.classList.toggle("on",on);p.setAttribute("aria-hidden",String(!on));$("toc_f").classList.toggle("on",on);if(on)tocPaint()}
$("toc_f").onclick=()=>tocOpen();
$("toc_p").addEventListener("click",e=>{const b=e.target.closest("[data-toc]");if(!b)return;const o=tocItems()[+b.dataset.toc];tocOpen(false);if(!o)return;
  const w=$("mm_w"),y=o.d.getBoundingClientRect().top-w.getBoundingClientRect().top+w.scrollTop-14;w.scrollTo({top:Math.max(0,y),behavior:"smooth"});
  /* A soft glow shows where you landed; folded lists open. */
  if(o.d.classList.contains("fold"))mmFold(o.d,false);o.d.classList.remove("flash");void o.d.offsetWidth;o.d.classList.add("flash")});
$("mm_w").addEventListener("click",()=>tocOpen(false));
const _prog3=mmProg;mmProg=function(){_prog3();tocPaint()};
const _close4=closeMM;closeMM=function(){tocOpen(false);_close4()};

/* Tapping the progress side of a list's name also folds it. */
$("mm_body").addEventListener("click",e=>{const pr=e.target.closest(".mb-lh .mbprog");if(pr)mmFold(pr.closest(".mb"))});

/* Items in a named list carry the list's colour, so their frame can be tinted to match the glass header. */
const _prog4=mmProg;mmProg=function(){_prog4();$("mm_body").querySelectorAll(".mb-lh").forEach(h=>{const c=h.dataset.k&&MCOL[h.dataset.k]||"";for(let x=h.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling){if(c)x.style.setProperty("--lc",c);else x.style.removeProperty("--lc")}})};

/* ---------- Dragging items and whole lists ----------
   Each list line and each list name has a grip on the right. Hold it and drag: a line can move within a list or to
   another list; a list name brings its whole list along. A moved line gets a new id, so the move is kept when two
   phones' copies are merged. */
const GRIP='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6.5" r="1.5"/><circle cx="15" cy="6.5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="17.5" r="1.5"/><circle cx="15" cy="17.5" r="1.5"/></svg>';
const _mbBlock3=mmBlock;mmBlock=function(b){const d=_mbBlock3(b);if(b.t==="c"||b.t==="lh"){const g=document.createElement("span");g.className="mbgrip";g.setAttribute("aria-label",tx("Dra för att flytta","Drag to move"));g.innerHTML=GRIP;d.appendChild(g)}return d};
function itemsOf(h){const L=[];for(let x=h.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling)L.push(x);return L}
/* The neighbour to step over: for a whole list that is another whole list (or a plain run of points), for a single line just the next line. */
function unitAt(el,whole,dir){if(!el)return null;if(!whole)return[el];
  if(el.dataset.t==="lh")return[el,...itemsOf(el)];
  if(el.dataset.t==="c"){let a=el;while(a.previousElementSibling&&a.previousElementSibling.dataset.t==="c")a=a.previousElementSibling;const h=a.previousElementSibling&&a.previousElementSibling.dataset.t==="lh"?a.previousElementSibling:null;const first=h||a;const L=[first];for(let x=first.nextElementSibling;x&&x.dataset.t==="c";x=x.nextElementSibling)L.push(x);return L}
  return[el]}
function flip(els,fn){const r=new Map(els.map(e=>[e,e.getBoundingClientRect().top]));fn();els.forEach(e=>{const dy=r.get(e)-e.getBoundingClientRect().top;if(!dy)return;e.style.transition="none";e.style.transform=`translateY(${dy}px)`;requestAnimationFrame(()=>{e.style.transition="transform .22s cubic-bezier(.3,.8,.3,1)";e.style.transform=""})})}
let DR=null;
/* The grip only picks a line up after you have held it still for half a second, so a quick touch never moves anything.
   A ring fills around the grip while you hold. */
let ARM=null;
$("mm_body").addEventListener("pointerdown",e=>{const g=e.target.closest(".mbgrip");if(!g||DR||ARM)return;e.preventDefault();try{g.setPointerCapture(e.pointerId)}catch(err){}
  g.classList.add("arming");ARM={g,x:e.clientX,y:e.clientY,id:e.pointerId,t:setTimeout(()=>{const A=ARM;ARM=null;g.classList.remove("arming");startDrag({clientY:A.y,pointerId:A.id},g)},500)}});
$("mm_body").addEventListener("pointermove",e=>{if(ARM&&Math.hypot(e.clientX-ARM.x,e.clientY-ARM.y)>8){clearTimeout(ARM.t);ARM.g.classList.remove("arming");ARM=null}else if(ARM){ARM.y=e.clientY}});
["pointerup","pointercancel"].forEach(ev=>$("mm_body").addEventListener(ev,()=>{if(ARM){clearTimeout(ARM.t);ARM.g.classList.remove("arming");ARM=null}}));
function startDrag(e,g){const d=g.closest(".mb"),whole=d.dataset.t==="lh",unit=whole?[d,...itemsOf(d)]:[d],step=d.dataset.t!=="c";
  if(document.activeElement&&$("mm").contains(document.activeElement))document.activeElement.blur();tocOpen(false);
  const r0=unit[0].getBoundingClientRect(),r1=unit[unit.length-1].getBoundingClientRect();
  DR={unit,whole,step,y0:e.clientY,top0:r0.top+$("mm_w").scrollTop,c0:(r0.top+r1.bottom)/2,h:r1.bottom-r0.top,moved:false,order:[...$("mm_body").children].map(x=>x.dataset.b).join(),sc0:$("mm_w").scrollTop};
  unit.forEach(x=>{x.classList.add("drg");x.style.transition="none"});d.classList.add("lift");try{if(navigator.vibrate)navigator.vibrate(12)}catch(err){}}
function drPlace(){const w=$("mm_w"),u=DR.unit,nowTop=u[0].getBoundingClientRect().top-parseFloat((u[0].style.transform||"").replace(/[^\d.-]/g,"")||0)+w.scrollTop;
  const dy=DR.y-DR.y0+(w.scrollTop-DR.sc0)-(nowTop-DR.top0);u.forEach(x=>x.style.transform=`translateY(${dy}px)`)}
$("mm_body").addEventListener("pointermove",e=>{if(!DR)return;e.preventDefault();DR.y=e.clientY;const w=$("mm_w"),u=DR.unit,center=DR.c0+(e.clientY-DR.y0);
  /* Hidden blank lines between lists are stepped over, they are not places to land. */
  const skip=(x,dir)=>{while(x&&x.classList.contains("slim"))x=dir<0?x.previousElementSibling:x.nextElementSibling;return x};
  const prev=unitAt(skip(u[0].previousElementSibling,-1),DR.step),next=unitAt(skip(u[u.length-1].nextElementSibling,1),DR.step);
  const mid=U=>{const a=U[0].getBoundingClientRect(),b=U[U.length-1].getBoundingClientRect();return(a.top+b.bottom)/2};
  /* Lines step over neighbours as your finger passes their middle; the neighbours slide out of the way. */
  if(prev&&center<mid(prev)-(DR.whole?0:4)){flip(prev,()=>prev[0].before(...u));DR.moved=true;DR.c0+=0}
  else if(next&&center>mid(next)+(DR.whole?0:4)){flip(next,()=>next[next.length-1].after(...u));DR.moved=true}
  drPlace();
  /* Near the top or bottom edge the note scrolls along. */
  const wr=w.getBoundingClientRect();if(e.clientY<wr.top+50)w.scrollTop-=10;else if(e.clientY>wr.bottom-50)w.scrollTop+=10});
function drEnd(){if(!DR)return;const u=DR.unit,changed=[...$("mm_body").children].map(x=>x.dataset.b).join()!==DR.order;
  u.forEach(x=>{x.style.transition="transform .2s cubic-bezier(.3,.8,.3,1)";x.style.transform="";x.classList.remove("lift")});setTimeout(()=>u.forEach(x=>{x.classList.remove("drg");x.style.transition=""}),220);
  if(changed){u.forEach(x=>{x.dataset.b=bid();x._u=Date.now();x._sig=""});
    /* A list name keeps its folded state under its new id. */
    if(DR.whole&&u[0].classList.contains("fold")){const S2=foldSet();S2.add(MM.id+":"+u[0].dataset.b);foldSave(S2)}
    const last=$("mm_body").lastElementChild;if(!last||last.dataset.t!=="p")$("mm_body").appendChild(mmBlock({t:"p",x:""}));mmChanged()}
  DR=null}
$("mm_body").addEventListener("pointerup",drEnd);$("mm_body").addEventListener("pointercancel",drEnd);
/* While nothing changed on the other phone, this phone's own order is kept as it is. */
const _merge0=mmMerge;mmMerge=function(a,b){if(MM&&MM.m&&b&&b.id===MM.id&&memoKey(b)===MM.lastKey)return{...a,gone:[...new Set([...(a.gone||[]),...(b.gone||[])])].slice(-500)};return _merge0(a,b)};

/* ---------- Sorting a list ---------- */
function mmSort(d,how){const h=d.dataset.t==="lh"?d:null,L=h?itemsOf(h):mmGroup(d);if(L.length<2)return;
  const val=x=>x.querySelector("input").value.trim().toLocaleLowerCase(S.lang==="en"?"en":"sv");
  const S3=[...L].sort(how==="az"?(a,b)=>val(a).localeCompare(val(b),S.lang==="en"?"en":"sv"):(a,b)=>(a.classList.contains("done")-b.classList.contains("done")));
  if(S3.every((x,i)=>x===L[i])){toast(tx("Listan är redan sorterad","The list is already sorted"));return}
  const anchor=L[0].previousElementSibling;flip(L,()=>{if(anchor)anchor.after(...S3);else $("mm_body").prepend(...S3)});S3.forEach(x=>{x.dataset.b=bid();x._u=Date.now();x._sig=""});mmChanged()}
const _lst2=mmLst;mmLst=function(open){_lst2(open);const f=$("mm_lst");if(f.hidden)return;const d=mmTarget(),G=d&&(d.dataset.t==="c"||d.dataset.t==="lh")?mmGroup(d):[];
  if(G.length>1)f.insertAdjacentHTML("beforeend",`<p>${tx("Sortera listan","Sort the list")}</p><div class="mmfs"><button type="button" data-srt="az">A–Ö</button><button type="button" data-srt="done">${tx("Klara sist","Done last")}</button></div><p class="mmtip">${tx("Tips: håll fingret på högra kanten av en punkt en halv sekund och dra för att flytta den. På en listas namn flyttar du hela listan. Bilder och länkar har ett eget handtag, och ett stycke text visar sitt när du skriver i det.","Tip: hold your finger on the right edge of a point for half a second and drag to move it. On a list's name you move the whole list. Pictures and links have their own handle, and a paragraph shows its handle while you write in it.")}</p>`)};
$("mm_lst").addEventListener("click",e=>{const b=e.target.closest("[data-srt]");if(!b)return;const d=mmTarget();if(d)mmSort(d,b.dataset.srt);mmLst(false)});

/* ---------- Searching in a note ---------- */
let FD={L:[],i:0};
function fdOpen(on){const f=$("mm_fd");f.hidden=!on;$("mm_find").classList.toggle("on",on);if(on){$("fd_q").placeholder=tx("Sök i anteckningen","Search the note");$("fd_x").textContent=tx("Klar","Done");tocOpen(false);mmFmt(false);mmSym(false);mmLst(false);$("fd_q").focus();fdRun()}else{$("fd_q").value="";fdClear()}}
function fdClear(){$("mm_body").querySelectorAll(".hit,.hitc").forEach(x=>x.classList.remove("hit","hitc"));$("mm_ti").classList.remove("hit","hitc");FD={L:[],i:0};$("fd_n").textContent=""}
function fdRun(){fdClear();const q=$("fd_q").value.trim().toLocaleLowerCase();if(!q)return;
  const L=[];if($("mm_ti").value.toLocaleLowerCase().includes(q))L.push($("mm_ti"));
  $("mm_body").querySelectorAll(":scope>.mb").forEach(d=>{const t=[...d.querySelectorAll("textarea,input")].map(x=>x.value).join(" ")+" "+(d.dataset.u||"");if(t.toLocaleLowerCase().includes(q))L.push(d)});
  L.forEach(x=>x.classList.add("hit"));FD={L,i:0};fdGo(0)}
function fdGo(step){const L=FD.L;if(!L.length){$("fd_n").textContent=$("fd_q").value.trim()?tx("Inga träffar","No matches"):"";return}
  FD.i=(FD.i+step+L.length)%L.length;L.forEach(x=>x.classList.remove("hitc"));const el=L[FD.i];el.classList.add("hitc");$("fd_n").textContent=(FD.i+1)+" / "+L.length;
  /* A match inside a folded list opens the list. */
  if(el.classList.contains("hid")){let h=el.previousElementSibling;while(h&&h.dataset.t==="c")h=h.previousElementSibling;if(h&&h.classList.contains("fold"))mmFold(h,false)}
  setTimeout(()=>{const w=$("mm_w"),y=el.getBoundingClientRect().top-w.getBoundingClientRect().top+w.scrollTop-w.clientHeight/3;w.scrollTo({top:Math.max(0,y),behavior:"smooth"})},el.classList.contains("hid")?380:0)}
$("mm_find").onclick=()=>fdOpen($("mm_fd").hidden);$("fd_x").onclick=()=>fdOpen(false);
$("fd_q").addEventListener("input",fdRun);$("fd_q").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();fdGo(1)}});
$("fd_dn").onmousedown=e=>e.preventDefault();$("fd_up").onmousedown=e=>e.preventDefault();$("fd_dn").onclick=()=>fdGo(1);$("fd_up").onclick=()=>fdGo(-1);
const _close5=closeMM;closeMM=function(){if(!$("mm_fd").hidden)fdOpen(false);_close5()};

/* ---------- Space between lists ----------
   An empty line that only sits between two lists is kept slim until you tap into it. */
const _prog5=mmProg;mmProg=function(){_prog5();$("mm_body").querySelectorAll(":scope>.mb-p").forEach(p=>{const t=p.querySelector("textarea"),a=p.previousElementSibling,b=p.nextElementSibling,isL=x=>x&&(x.dataset.t==="c"||x.dataset.t==="lh");
  /* Several blank lines in a row (even ones holding only spaces or line breaks) count as one gap. */
  const blank=x=>x&&x.dataset.t==="p"&&!x.dataset.s&&!x.querySelector("textarea").value.trim()&&document.activeElement!==x.querySelector("textarea");
  let A=a;while(blank(A))A=A.previousElementSibling;let B=b;while(blank(B))B=B.nextElementSibling;
  p.classList.toggle("slim",blank(p)&&isL(A)&&isL(B))})};
$("mm_body").addEventListener("focusin",e=>{const p=e.target.closest(".mb-p.slim");if(p)p.classList.remove("slim")});
$("mm_body").addEventListener("focusout",e=>{if(e.target.closest(".mb-p"))setTimeout(mmProg,0)});

/* ---------- One writable line between lists ----------
   Between two lists there is always exactly one "Skriv något…" line to tap into; any further blank lines stay hidden. */
const _prog6=mmProg;mmProg=function(){_prog6();if(DR)return;const body=$("mm_body"),isL=x=>x&&(x.dataset.t==="c"||x.dataset.t==="lh");
  const blank=x=>x&&x.dataset.t==="p"&&!x.dataset.s&&!x.querySelector("textarea").value.trim();
  body.querySelectorAll(":scope>.gapline").forEach(x=>x.classList.remove("gapline"));
  /* An empty helper line that ended up between a list's name and its points, or between two points, is removed. */
  body.querySelectorAll(":scope>.mb-p").forEach(x=>{const a=x.previousElementSibling,b=x.nextElementSibling;if(blank(x)&&!x._u&&document.activeElement!==x.querySelector("textarea")&&a&&b&&b.dataset.t==="c"&&(a.dataset.t==="lh"||(a.dataset.t==="c"&&b.classList.contains("inl")&&!a.classList.contains("lastl"))))x.remove()});
  [...body.querySelectorAll(":scope>.mb")].forEach(x=>{
    const starts=x.dataset.t==="lh"||(x.dataset.t==="c"&&!(x.previousElementSibling&&x.previousElementSibling.dataset.t==="c"));if(!starts)return;
    if(x.dataset.t==="c"&&x.previousElementSibling&&x.previousElementSibling.dataset.t==="lh")return;
    const run=[];let p=x.previousElementSibling;while(blank(p)){run.unshift(p);p=p.previousElementSibling}if(!isL(p))return;
    if(!run.length){const n=mmBlock({t:"p",x:""});x.before(n);run.push(n)}
    run.forEach((r,i)=>{r.classList.toggle("slim",i>0);r.classList.toggle("gapline",i===0)})})};

/* ---------- Keeping notes from growing by themselves ----------
   A line of mine that the shared copy lacks is only kept if it is new on this phone. If this phone had it from an
   earlier sync, the other phone removed or moved it, so it is not put back (that used to bring whole lists back twice). */
const _merge1=mmMerge;mmMerge=function(a,b){const base=MM&&MM.saved,B=new Set((b.bl||[]).map(x=>x.b));
  return _merge1(base?{...a,bl:a.bl.filter(x=>B.has(x.b)||!base.has(x.b))}:a,b)};
/* When a note opens, lists that are exact copies of an earlier list are removed, and lines sharing an id are separated. */
function mmTidy(){const bl=MM.m&&MM.m.bl||[];if(bl.length<2)return;const out=[],seenL=new Set(),seenId=new Map();let dropped=0,changed=false;
  for(let i=0;i<bl.length;){const b=bl[i];
    if(b.t==="lh"){let j=i+1;while(j<bl.length&&bl[j].t==="c")j++;const sig=b.x.trim().toLowerCase()+"\u0001"+bl.slice(i+1,j).map(x=>x.x.trim()).join("\u0001");
      if(b.x.trim()&&j>i+1&&seenL.has(sig)){dropped++;changed=true;i=j;continue}seenL.add(sig)}
    const sg=mbSig(b);if(seenId.has(b.b)){changed=true;if(seenId.get(b.b)===sg&&b.t!=="p"){i++;continue}out.push({...b,b:bid()})}else{seenId.set(b.b,sg);out.push(b)}i++}
  if(!changed)return;MM.m.bl=out;const y=$("mm_w").scrollTop;mmPaint();$("mm_w").scrollTop=y;MM.dirty=true;clearTimeout(MM.t);MM.t=setTimeout(mmSave,600);
  if(dropped)toast(tx(`Tog bort ${dropped} ${dropped>1?"listor som var kopior":"lista som var en kopia"}`,`Removed ${dropped} duplicated list${dropped>1?"s":""}`),4500)}
/* Long notes: the formatting panel is only refreshed when it is open, and progress is recounted at most once per frame. */
const _prog7=mmProg;let progQ=0;mmProg=function(){if(progQ)return;progQ=requestAnimationFrame(()=>{progQ=0;_prog7()})};
/* While you are dragging, changes from the other phone wait until you let go, so lines are not moved under your finger. */
let drWait=false;const _mr=mmMaybeRefresh;mmMaybeRefresh=function(){if(DR){drWait=true;return}_mr()};
["pointerup","pointercancel"].forEach(ev=>$("mm_body").addEventListener(ev,()=>{if(drWait&&!DR){drWait=false;if(MM.open)mmMaybeRefresh()}}));
/* ---------- Hold a list's name to remove the list ---------- */
(()=>{let t=0,x0=0,y0=0;const stop=()=>{clearTimeout(t);t=0};
  $("mm_body").addEventListener("pointerdown",e=>{const h=e.target.closest(".mb-lh");if(!h||e.target.closest(".mbgrip,.mbfold"))return;x0=e.clientX;y0=e.clientY;stop();t=setTimeout(()=>{t=0;lhMenu(h)},550)});
  $("mm_body").addEventListener("pointermove",e=>{if(t&&Math.hypot(e.clientX-x0,e.clientY-y0)>10)stop()});
  ["pointerup","pointercancel","scroll"].forEach(ev=>$("mm_body").addEventListener(ev,stop));$("mm_w").addEventListener("scroll",stop,{passive:true});
  $("mm_body").addEventListener("contextmenu",e=>{if(e.target.closest(".mb-lh"))e.preventDefault()})})();
async function lhMenu(h){if(DR||!h.isConnected)return;try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}
  if(document.activeElement&&$("mm").contains(document.activeElement))document.activeElement.blur();h.classList.add("held");
  const L=itemsOf(h),nm=h.querySelector("input").value.trim()||tx("Lista","List");
  const v=await askOpts(nm,"",[["del",tx("Ta bort listan","Remove the list"),L.length?tx(`Rubriken och ${L.length} ${L.length===1?"punkt":"punkter"} tas bort`,`The name and ${L.length} point${L.length===1?"":"s"} are removed`):"",true]]);
  h.classList.remove("held");if(v!=="del"||!h.isConnected)return;
  const all=[h,...L],anchor=h.previousElementSibling;all.forEach(x=>x.remove());if(!$("mm_body").children.length)$("mm_body").appendChild(mmBlock({t:"p",x:""}));mmChanged();
  toast(tx("Listan togs bort","The list was removed")+" · "+nm,6000);const tb=$("toasts").lastElementChild;
  if(tb){const b=document.createElement("button");b.className="tundo";b.textContent=tx("Ångra","Undo");b.onclick=()=>{tb.remove();if(!MM.open)return;
    all.forEach(x=>{x.dataset.b=bid();x._u=Date.now();x._sig=""});if(anchor&&anchor.isConnected)anchor.after(...all);else $("mm_body").prepend(...all);mmChanged()};tb.appendChild(b)}}
/* Never more than one empty "Skriv något…" line in a row, anywhere in the note: spare helper lines are removed,
   and other empty lines after the first are hidden. The line you are in is always kept. */
const _prog8=_prog7;function mmOneBlank(){if(DR)return;const blank=x=>x&&x.dataset.t==="p"&&!x.dataset.s&&!x.querySelector("textarea").value.trim();
  let run=[];const flush=()=>{if(run.length>1){const foc=run.find(x=>x.querySelector("textarea")===document.activeElement),keep=foc||run.find(x=>x.classList.contains("gapline"))||run[0];
      run.forEach(x=>{if(x===keep){x.classList.remove("slim");return}if(!x._u)x.remove();else{x.classList.add("slim");x.classList.remove("gapline")}})}run=[]};
  [...$("mm_body").querySelectorAll(":scope>.mb")].forEach(x=>{if(blank(x))run.push(x);else flush()});flush()}
mmProg=function(){if(progQ)return;progQ=requestAnimationFrame(()=>{progQ=0;_prog8();mmOneBlank()})};

/* ---------- Long notes open at once ----------
   The first screenful is drawn straight away and the rest is added over the next few frames, out of sight.
   Anything that needs the whole note (saving, searching, merging) finishes the drawing first, so nothing is ever lost. */
const _paint0=mmPaint;let paintJob=null;
function paintAdd(L){const body=$("mm_body"),fr=document.createDocumentFragment(),E=L.map(b=>mmBlock(b));
  E.forEach(d=>{/* Points of a folded list are born hidden, so they never flash. */
    if(d.dataset.t==="lh")paintJob.fold=d.classList.contains("fold");else if(d.dataset.t==="c"){if(paintJob.fold)d.classList.add("hid","inl")}else paintJob.fold=false;fr.appendChild(d)});
  body.appendChild(fr);E.forEach(d=>{if(d.dataset.t==="p"){mmGrow(d.querySelector("textarea"));mmLinks(d)}})}
function paintStep(job){if(paintJob!==job)return;paintAdd(job.rest.splice(0,90));if(job.rest.length)requestAnimationFrame(()=>paintStep(job));else paintEnd()}
function paintEnd(){paintJob=null;const last=$("mm_body").lastElementChild;if(!last||last.dataset.t!=="p")$("mm_body").appendChild(mmBlock({t:"p",x:""}));mmProg()}
function paintFlush(){if(!paintJob)return;const job=paintJob;paintAdd(job.rest.splice(0));paintEnd()}
mmPaint=function(){paintJob=null;const m=MM.m;if(!m||m.bl.length<=120){_paint0();return}
  $("mm_ti").value=m.ti;$("mm_body").innerHTML="";const job=paintJob={rest:m.bl.slice(),fold:false};paintAdd(job.rest.splice(0,60));mmProg();mmMeta();MM.loadedUp=m.up;MM.lastKey=memoKey(m);requestAnimationFrame(()=>paintStep(job))};
const _read0=mmRead;mmRead=function(){paintFlush();return _read0()};
const _fd0=fdRun;fdRun=function(){paintFlush();_fd0()};$("fd_q").removeEventListener("input",_fd0);$("fd_q").addEventListener("input",()=>fdRun());
const _close6=closeMM;closeMM=function(){paintFlush();_close6()};
/* While a list is sliding shut, nothing else re-lays out the note. */
const _prog9=mmProg;mmProg=function(){if(foldBusy>0)return;_prog9()};
