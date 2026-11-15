/* ---------- Anteckningar (notes) ----------
   A note has a title and a list of blocks: text, to-do items, links and pictures.
   It saves itself while you write; an empty note is removed when you leave it. */
/* var, so the list can be drawn while the app is still starting. */
var MB_T=["p","c","l","i"],URLRE=/https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/gi;
function memoClean(v,fid){const id=String(v.id||fid);if(!id)return null;
  const bl=(Array.isArray(v.bl)?v.bl:[]).slice(0,400).map(b=>b&&MB_T.includes(b.t)?(b.t==="p"?{t:"p",x:String(b.x||"").slice(0,20000)}:b.t==="c"?{t:"c",x:String(b.x||"").slice(0,500),d:!!b.d}:b.t==="l"?(/^https?:\/\//i.test(b.u||"")?{t:"l",u:String(b.u).slice(0,2000)}:null):(typeof b.i==="string"&&b.i?{t:"i",i:b.i}:null)):null).filter(Boolean);
  return{id,ti:String(v.ti||"").slice(0,120),bl,at:+v.at||0,up:+v.up||+v.at||0,by:v.by==="a"||v.by==="b"?v.by:"",ub:v.ub==="a"||v.ub==="b"?v.ub:""}}
var memoDoc=m=>({kind:"memo",id:m.id,ti:m.ti,bl:m.bl,at:m.at,up:m.up,by:m.by,ub:m.ub});
var memoEmpty=m=>!m.ti.trim()&&!m.bl.some(b=>b.t==="p"?b.x.trim():b.t==="c"?b.x.trim():true);
var host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return u}};
var whenTxt=ms=>{const d=new Date(ms),n=dnD(d),h=pad(d.getHours())+":"+pad(d.getMinutes());return n===todayN()?h:n===todayN()-1?tx("Igår","Yesterday")+" "+h:fmtD(n,{day:"numeric",month:"short"})+(ymd(n)[0]!==ymd(todayN())[0]?" "+ymd(n)[0]:"")};

/* The list on the Att göra page. */
function renderMemos(){const el=$("t_memos");if(!el)return;const L=[...MEMOS].sort((a,b)=>b.up-a.up);
  let h=`<div class="mmlh"><h3>${tx("Anteckningar","Notes")}</h3><button class="btn sm" id="mm_new" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>${tx("Ny","New")}</button></div>`;
  if(!L.length)h+=`<div class="mmempty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7.5L19 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5V8h5M9 12.5h6M9 16h4"/></svg><p>${tx("Skriv ner idéer, listor, länkar och bilder. Ni ser dem båda.","Write down ideas, lists, links and pictures. You both see them.")}</p></div>`;
  else h+=`<div class="mml">${L.map(m=>{const txt=m.bl.filter(b=>b.t==="p"||b.t==="c").map(b=>b.x).join(" ").replace(/\s+/g," ").trim(),first=m.ti.trim()||txt.split(" ").slice(0,8).join(" ")||tx("Ny anteckning","New note"),
      img=m.bl.find(b=>b.t==="i"&&MIMG[b.i]),C=m.bl.filter(b=>b.t==="c"),nd2=C.filter(b=>b.d).length,lk=m.bl.find(b=>b.t==="l"),rest=m.ti.trim()?txt:txt.split(" ").slice(8).join(" ");
      return `<button class="mmi" data-memo="${esc(m.id)}" type="button"><span class="mmit"><b>${esc(first)}</b><small><em>${esc(whenTxt(m.up))}</em>${esc(rest||(lk?host(lk.u):img?tx("Bild","Picture"):""))}</small>${C.length||lk?`<span class="mmtags">${C.length?`<i class="${nd2===C.length?"ok":""}">☑ ${nd2}/${C.length}</i>`:""}${lk?`<i>↗ ${esc(host(lk.u))}</i>`:""}</span>`:""}</span>${img?`<span class="mmth" style="background-image:url('${MIMG[img.i]}')"></span>`:""}</button>`}).join("")}</div>`;
  el.innerHTML=h;if(MM&&MM.open)mmMaybeRefresh()}

/* ---------- The editor ---------- */
var MM={open:false,id:"",m:null,dirty:false,t:0,loadedUp:0};
function mmBlock(b){const d=document.createElement("div");d.className="mb mb-"+b.t;d.dataset.t=b.t;
  if(b.t==="p"){d.innerHTML=`<textarea rows="1" placeholder="${esc(tx("Skriv något…","Write something…"))}"></textarea><div class="mblinks"></div>`;d.firstChild.value=b.x;}
  else if(b.t==="c"){d.innerHTML=`<button type="button" class="mbck${b.d?" on":""}" aria-label="${esc(tx("Klar","Done"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 12.5 3.6 3.6 7.4-8"/></svg></button><input type="text" maxlength="500">`;d.lastChild.value=b.x;if(b.d)d.classList.add("done")}
  else if(b.t==="l"){if(b.u){d.dataset.u=b.u;d.innerHTML=`<a href="${esc(b.u)}" target="_blank" rel="noopener noreferrer" class="mbl"><span class="mblf">${esc((host(b.u)[0]||"?").toUpperCase())}</span><span class="mblt"><b>${esc(host(b.u))}</b><small>${esc(b.u)}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7"/></svg></a><button type="button" class="mbx" aria-label="${esc(tx("Ta bort","Remove"))}">×</button>`}
    else{d.innerHTML=`<input type="url" class="mblin" inputmode="url" placeholder="${esc(tx("Klistra in eller skriv en länk","Paste or type a link"))}">`}}
  else if(b.t==="i"){d.dataset.i=b.i;d.innerHTML=MIMG[b.i]?`<img src="${MIMG[b.i]}" alt=""><button type="button" class="mbx" aria-label="${esc(tx("Ta bort","Remove"))}">×</button>`:`<span class="mbwait">${tx("Bilden laddas…","Loading picture…")}</span>`}
  return d}
function mmGrow(t){t.style.height="auto";t.style.height=t.scrollHeight+"px"}
function mmLinks(d){const t=d.querySelector("textarea"),box=d.querySelector(".mblinks");if(!t||!box)return;const U=[...new Set(t.value.match(URLRE)||[])].slice(0,6);
  box.innerHTML=U.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">↗ ${esc(host(u))}</a>`).join("")}
function mmRead(){const bl=[];$("mm_body").querySelectorAll(".mb").forEach(d=>{const t=d.dataset.t;
  if(t==="p")bl.push({t:"p",x:d.querySelector("textarea").value});else if(t==="c")bl.push({t:"c",x:d.querySelector("input").value,d:d.classList.contains("done")});
  else if(t==="l"&&d.dataset.u)bl.push({t:"l",u:d.dataset.u});else if(t==="i"&&d.dataset.i)bl.push({t:"i",i:d.dataset.i})});
  /* Text blocks next to each other are kept as one. */
  const out=[];bl.forEach(b=>{const p=out[out.length-1];if(b.t==="p"&&p&&p.t==="p"&&!b.x.trim())return;out.push(b)});return out}
function mmPaint(){const m=MM.m;$("mm_ti").value=m.ti;$("mm_body").innerHTML="";const bl=m.bl.length?m.bl:[{t:"p",x:""}];
  bl.forEach(b=>$("mm_body").appendChild(mmBlock(b)));if(bl[bl.length-1].t!=="p")$("mm_body").appendChild(mmBlock({t:"p",x:""}));
  $("mm_body").querySelectorAll(".mb-p").forEach(d=>{mmGrow(d.querySelector("textarea"));mmLinks(d)});mmMeta();MM.loadedUp=m.up}
function mmMeta(){const m=MM.m;$("mm_meta").textContent=m.at?(m.by?tx("Skapad av ","Created by ")+pname(m.by)+" · ":"")+whenTxt(m.at)+(m.up>m.at+60000?" · "+tx("ändrad ","edited ")+whenTxt(m.up)+(m.ub&&m.ub!==m.by?" "+tx("av ","by ")+pname(m.ub):""):""):""}
function openMM(id){let m=id&&MEMOS.find(x=>x.id===id);
  if(!m){const now=Date.now();m={id:newId(),ti:"",bl:[{t:"p",x:""}],at:now,up:now,by:ME||"",ub:ME||""};MM.fresh=true}else MM.fresh=false;
  MM.open=true;MM.id=m.id;MM.m=JSON.parse(JSON.stringify(m));MM.dirty=false;
  $("mm_bt").textContent=tx("Anteckningar","Notes");$("mm_ti").placeholder=tx("Rubrik","Title");$("mm_chkt").textContent=tx("Att göra","To-do");$("mm_imgt").textContent=tx("Bild","Picture");$("mm_lnkt").textContent=tx("Länk","Link");$("mm_st").textContent="";
  mmPaint();$("mm").classList.add("on");document.body.classList.add("mmopen");$("mm_w").scrollTop=0;
  if(MM.fresh)setTimeout(()=>$("mm_ti").focus(),280)}
function mmChanged(){MM.dirty=true;$("mm_st").textContent=tx("Sparar…","Saving…");clearTimeout(MM.t);MM.t=setTimeout(mmSave,700)}
function mmSave(){clearTimeout(MM.t);if(!MM.open&&!MM.m)return;const m=MM.m;m.ti=$("mm_ti").value;m.bl=mmRead();
  if(!MM.dirty){return}MM.dirty=false;
  if(memoEmpty(m)&&MM.fresh){$("mm_st").textContent="";return}
  m.up=Date.now();m.ub=ME||m.ub;MM.fresh=false;const i=MEMOS.findIndex(x=>x.id===m.id),c=JSON.parse(JSON.stringify(m));if(i>=0)MEMOS[i]=c;else MEMOS.push(c);
  put("memo_"+m.id,memoDoc(m));MM.loadedUp=m.up;mmMeta();$("mm_st").textContent=tx("Sparat","Saved");setTimeout(()=>{if(!MM.dirty)$("mm_st").textContent=""},1400)}
/* Pictures no note uses any more are removed. */
function mmSweep(){const used=new Set(MEMOS.flatMap(m=>m.bl.filter(b=>b.t==="i").map(b=>b.i)));Object.keys(DOCS).filter(k=>k.startsWith("mimg_")&&!used.has(k.slice(5))&&Date.now()-(+(DOCS[k]||{}).at||0)>60000).forEach(k=>{del(k);delete MIMG[k.slice(5)]})}
function closeMM(){if(!MM.open)return;mmSave();const m=MM.m;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen");document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
  if(m&&memoEmpty(m)&&MEMOS.some(x=>x.id===m.id)){MEMOS=MEMOS.filter(x=>x.id!==m.id);del("memo_"+m.id)}
  MM.m=null;setTimeout(mmSweep,1500);renderMemos()}
/* If your partner changes the note you have open and you are not typing, you see their change. */
function mmMaybeRefresh(){const m=MEMOS.find(x=>x.id===MM.id);if(!m){if(!MM.fresh&&MM.m&&!MM.dirty){toast(tx("Anteckningen togs bort","The note was removed"));MM.m=null;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen")}return}
  if(m.up>MM.loadedUp&&!MM.dirty&&!$("mm").contains(document.activeElement)){MM.m=JSON.parse(JSON.stringify(m));const y=$("mm_w").scrollTop;mmPaint();$("mm_w").scrollTop=y}
  else if(!MM.dirty){$("mm_body").querySelectorAll(".mb-i").forEach(d=>{if(d.querySelector(".mbwait")&&MIMG[d.dataset.i])d.replaceWith(mmBlock({t:"i",i:d.dataset.i}))})}}
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
$("mm_del").onclick=async()=>{if(!MM.m)return;const m=MM.m;if(memoEmpty({ti:$("mm_ti").value,bl:mmRead()})){MM.dirty=false;closeMM();return}
  if(!await ask(tx("Radera anteckningen?","Delete the note?"),tx("Den försvinner för er båda.","It disappears for both of you."),tx("Radera","Delete")))return;
  clearTimeout(MM.t);MM.dirty=false;const ids=["memo_"+m.id,...m.bl.filter(b=>b.t==="i").map(b=>"mimg_"+b.i)];MEMOS=MEMOS.filter(x=>x.id!==m.id);MM.m=null;MM.open=false;$("mm").classList.remove("on");document.body.classList.remove("mmopen");
  toast(tx("Anteckningen raderades","The note was deleted"));undoable($("toasts").lastElementChild,ids);renderMemos()};
$("mm_ti").addEventListener("input",mmChanged);
$("mm_ti").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const f=$("mm_body").querySelector(".mb textarea,.mb input");if(f)f.focus()}});
$("mm_tail").onclick=()=>{const L=$("mm_body").lastElementChild;const f=L&&L.querySelector("textarea");if(f){f.focus();const n=f.value.length;f.setSelectionRange(n,n)}else mmInsert({t:"p",x:""},L,true)};
$("mm_body").addEventListener("input",e=>{const d=e.target.closest(".mb");if(!d)return;if(e.target.tagName==="TEXTAREA"){mmGrow(e.target);mmLinks(d)}
  if(e.target.classList.contains("mblin"))return;mmChanged()});
$("mm_body").addEventListener("click",e=>{const d=e.target.closest(".mb");if(!d)return;
  if(e.target.closest(".mbck")){d.classList.toggle("done");e.target.closest(".mbck").classList.toggle("on");mmChanged();return}
  if(e.target.closest(".mbx")){const n=d.previousElementSibling;d.remove();if(!$("mm_body").children.length)$("mm_body").appendChild(mmBlock({t:"p",x:""}));mmChanged();return}
  if(e.target.tagName==="IMG"){$("mv_i").src=e.target.src;$("mv").classList.add("on")}});
$("mm_body").addEventListener("keydown",e=>{const d=e.target.closest(".mb");if(!d)return;
  if(d.dataset.t==="c"&&e.target.tagName==="INPUT"){
    if(e.key==="Enter"){e.preventDefault();const v=e.target.value,pos=e.target.selectionStart;
      /* Enter on an empty item ends the list, like in Notes. */
      if(!v.trim()){const p=mmBlock({t:"p",x:""});d.replaceWith(p);mmGrow(p.querySelector("textarea"));p.querySelector("textarea").focus();mmChanged();return}
      e.target.value=v.slice(0,pos);mmInsert({t:"c",x:v.slice(pos),d:false},d,true).querySelector("input").setSelectionRange(0,0)}
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
