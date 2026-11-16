/* ---------- Inline formatting in notes ----------
   Words can be **bold**, *italic*, ~~struck~~ or {r|coloured}. While you write on a line you see these marks;
   when you leave the line it shows the finished look. Tapping the finished text puts you back where you tapped. */
var RICH_RE=/\*\*\S|~~\S|(^|[^*\w])\*[^\s*]|\{[roygbvps]\|/;
function richRanges(raw){const R=[],M=new Set();const take=(re,st,open,close,k)=>{let m;re.lastIndex=0;while((m=re.exec(raw))){const a=m.index,i0=a+open,i1=a+m[0].length-close;
    for(let i=a;i<i0;i++)if(M.has(i))return;R.push({a:i0,b:i1,st,k:k?k(m):""});for(let i=a;i<i0;i++)M.add(i);for(let i=i1;i<a+m[0].length;i++)M.add(i)}};
  take(/\{([roygbvps])\|([^{}\n]*?)\}/g,"k",3,1,m=>m[1]);take(/\*\*(?=\S)([^\n]*?\S)\*\*/g,"b",2,2);take(/~~(?=\S)([^\n]*?\S)~~/g,"s",2,2);
  let m;const it=/(^|[^*\w])(\*(?=[^\s*])([^*\n]*?[^\s*])\*)(?![*\w])/g;while((m=it.exec(raw))){const a=m.index+m[1].length;if(M.has(a))continue;R.push({a:a+1,b:a+m[2].length-1,st:"i"});M.add(a);M.add(a+m[2].length-1)}
  return{R,M}}
function richHTML(raw,offsets){const{R,M}=richRanges(raw);let h="",seg="",key=null,o0=0;
  const style=i=>R.filter(r=>i>=r.a&&i<r.b).map(r=>r.st==="k"?"k"+r.k:r.st).sort().join(" ");
  const flush=()=>{if(!seg)return;const cls=key.split(" ").filter(Boolean),k=cls.find(c=>c[0]==="k"&&c.length===2);
    h+=`<span${offsets?` data-o="${o0}"`:""} class="${cls.filter(c=>c[0]!=="k").map(c=>"r"+c).join(" ")}"${k?` style="color:${MCOL[k[1]]}"`:""}>${esc(seg)}</span>`;seg=""};
  for(let i=0;i<raw.length;i++){if(M.has(i)){flush();key=null;continue}const s=style(i);if(s!==key){flush();key=s;o0=i}seg+=raw[i]}flush();return h}
const richPlain=raw=>{const{M}=richRanges(raw);let t="";for(let i=0;i<raw.length;i++)if(!M.has(i))t+=raw[i];return t};
function richUpd(d){if(!d||d.dataset.t!=="p")return;const ta=d.querySelector("textarea");if(!ta)return;let v=d.querySelector(".mbv");
  const on=RICH_RE.test(ta.value)&&document.activeElement!==ta;
  if(on){if(!v){v=document.createElement("div");v.className="mbv";ta.after(v)}v.innerHTML=richHTML(ta.value,true)}
  d.classList.toggle("rich",on)}
const _mbRich=mmBlock;mmBlock=function(b){const d=_mbRich(b);if(b.t==="p")queueMicrotask(()=>richUpd(d));return d};
$("mm_body").addEventListener("focusin",e=>{if(e.target.tagName==="TEXTAREA"){const d=e.target.closest(".mb");if(d&&d.classList.contains("rich")){d.classList.remove("rich");mmGrow(e.target)}}});
$("mm_body").addEventListener("focusout",e=>{if(e.target.tagName==="TEXTAREA")setTimeout(()=>richUpd(e.target.closest(".mb")),0)});
$("mm_body").addEventListener("click",e=>{const v=e.target.closest(".mbv");if(!v||e.target.closest("a"))return;const d=v.closest(".mb"),ta=d.querySelector("textarea");
  let pos=ta.value.length;try{const r=document.caretRangeFromPoint?document.caretRangeFromPoint(e.clientX,e.clientY):null;if(r){const sp=r.startContainer.parentElement&&r.startContainer.parentElement.closest("[data-o]");if(sp)pos=+sp.dataset.o+r.startOffset}}catch(err){}
  d.classList.remove("rich");mmGrow(ta);ta.focus();try{ta.setSelectionRange(pos,pos)}catch(err){}});
/* The Aa panel: B, I, S and colours work on the words you have selected (or start a styled word where you are). */
function wrapSel(open,close){const S3=mmSel,t=S3&&S3.el;if(!t||!t.isConnected||t.tagName!=="TEXTAREA"){toast(tx("Markera några ord i en textrad först","Select some words in a text line first"));return false}
  const v=t.value,a=Math.min(S3.s,S3.e),b=Math.max(S3.s,S3.e);t.value=v.slice(0,a)+open+v.slice(a,b)+close+v.slice(b);const na=a+open.length,nb=b+open.length;t.focus();t.setSelectionRange(na,nb);mmSel={el:t,s:na,e:nb};mmGrow(t);mmChanged();return true}
const _fmtPaint2=mmFmtPaint;mmFmtPaint=function(){_fmtPaint2();const f=$("mm_fmt");const S3=mmSel,sel=S3&&S3.el&&S3.el.tagName==="TEXTAREA"&&S3.el.isConnected&&S3.s!==S3.e;
  f.insertAdjacentHTML("afterbegin",`<div class="mmfs mmin"><button type="button" data-wr="**" aria-label="${tx("Fet","Bold")}"><b>B</b></button><button type="button" data-wr="*" aria-label="${tx("Kursiv","Italic")}"><i>I</i></button><button type="button" data-wr="~~" aria-label="${tx("Genomstruken","Strike")}"><s>S</s></button><span>${sel?tx("Gäller de markerade orden","For the selected words"):tx("Markera ord för fet, kursiv, struken eller färg på bara dem","Select words to make just them bold, italic, struck or coloured")}</span></div>`);
  f.classList.toggle("selmode",!!sel)};
$("mm_fmt").addEventListener("click",e=>{const b=e.target.closest("[data-wr]");if(b){wrapSel(b.dataset.wr,b.dataset.wr);return}
  const c=e.target.closest("[data-fk]");const S3=mmSel;if(c&&c.dataset.fk&&S3&&S3.el&&S3.el.tagName==="TEXTAREA"&&S3.s!==S3.e){e.stopImmediatePropagation();wrapSel("{"+c.dataset.fk+"|","}")}},true);
/* Exports and previews show the finished text without the marks. */
const _plain2=mmPlain;mmPlain=function(){return richPlain(_plain2())};

/* ---------- Notes list: search, sort, pin, and a clean summary ---------- */
let MSORT="up";try{MSORT=localStorage.getItem("kalenderkoll.msort")||"up"}catch(e){}
function memoSum(m){const T=m.bl,txt=b=>richPlain(b.x||"").replace(/\s+/g," ").trim();let title=m.ti.trim(),used=null;
  if(!title){used=T.find(b=>(b.t==="p"||b.t==="lh"||b.t==="c")&&txt(b));title=used?txt(used):tx("Ny anteckning","New note")}
  const p=T.find(b=>b!==used&&b.t==="p"&&txt(b)),C=T.filter(b=>b.t==="c"&&!b.m),LH=T.filter(b=>b.t==="lh"),I=T.filter(b=>b.t==="i"&&MIMG[b.i]),lk=T.find(b=>b.t==="l");
  const lists=LH.length?LH.length+" "+tx(LH.length===1?"lista":"listor",LH.length===1?"list":"lists"):"";
  return{title,text:p?txt(p).slice(0,110):LH.length?LH.slice(0,4).map(txt).filter(Boolean).join(" · "):"",C,done:C.filter(b=>b.d).length,lists,I,lk}}
function memoHay(m){return(m.ti+" "+m.bl.map(b=>richPlain(b.x||"")+" "+(b.u||"")).join(" ")).toLocaleLowerCase()}
renderMemos=function(){const el=$("t_memos");if(!el)return;
  if(!el.dataset.v2){el.dataset.v2="1";el.innerHTML=`<div class="mmlh"><h3>${tx("Anteckningar","Notes")}</h3><button class="btn sm" id="mm_new" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>${tx("Ny","New")}</button></div>
    <div class="mmtools hide" id="mm_tools"><label class="mmq"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg><input id="mm_q" type="search" placeholder="${esc(tx("Sök i anteckningar","Search notes"))}" autocomplete="off"></label><button type="button" class="mmsort" id="mm_sort"></button></div><div id="mm_list"></div>`;
    $("mm_q").addEventListener("input",()=>renderMemos());
    $("mm_sort").onclick=async()=>{const v=await askOpts(tx("Sortera anteckningar","Sort notes"),"",[["up",tx("Senast ändrad","Last edited"),""],["at",tx("Senast skapad","Newest first"),""],["az",tx("A–Ö","A–Z"),""]]);if(v){MSORT=v;try{localStorage.setItem("kalenderkoll.msort",v)}catch(e){}renderMemos()}}}
  const all=MEMOS.filter(m=>!m.del),D=MEMOS.filter(m=>m.del).sort((a,b)=>b.del-a.del),q=($("mm_q").value||"").trim().toLocaleLowerCase();
  $("mm_tools").classList.toggle("hide",all.length<3&&!q);$("mm_sort").innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14M4 16l3 3 3-3M14 7h6M14 12h4M14 17h2"/></svg>${MSORT==="az"?"A–Ö":MSORT==="at"?tx("Nyast","Newest"):tx("Ändrad","Edited")}`;
  const sorter=MSORT==="az"?(a,b)=>memoSum(a).title.localeCompare(memoSum(b).title,S.lang==="en"?"en":"sv"):MSORT==="at"?(a,b)=>b.at-a.at:(a,b)=>b.up-a.up;
  const L=all.filter(m=>!q||memoHay(m).includes(q)).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||(a.pin&&b.pin?b.pin-a.pin:0)||sorter(a,b));
  let h="";
  if(!all.length)h=`<div class="mmempty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7.5L19 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5V8h5M9 12.5h6M9 16h4"/></svg><p>${tx("Skriv ner idéer, listor, länkar och bilder. Ni ser dem båda.","Write down ideas, lists, links and pictures. You both see them.")}</p></div>`;
  else if(!L.length)h=`<p class="muted mmnone">${tx("Inga anteckningar matchar","No notes match")} "${esc(q)}"</p>`;
  else h=`<div class="mml">${L.map(m=>{const s=memoSum(m),img=s.I[0];
      const tags=[s.C.length?`<i class="${s.done===s.C.length?"ok":""}">☑ ${s.done}/${s.C.length}</i>`:"",s.lists?`<i>${s.lists}</i>`:"",s.I.length?`<i>🖼 ${s.I.length}</i>`:"",s.lk?`<i>↗ ${esc(host(s.lk.u))}</i>`:""].filter(Boolean).join("");
      return `<div class="mmrow${m.pin?" pinned":""}"><button class="mmi" data-memo="${esc(m.id)}" type="button"><span class="mmit"><b>${esc(s.title)}</b><small><em>${esc(whenTxt(m.up))}</em>${esc(s.text)}</small>${tags?`<span class="mmtags">${tags}</span>`:""}</span>${img?`<span class="mmth" style="background-image:url('${MIMG[img.i]}')"></span>`:""}</button><button class="mmpinb${m.pin?" on":""}" type="button" data-mpin="${esc(m.id)}" aria-pressed="${!!m.pin}" aria-label="${m.pin?tx("Lossa","Unpin"):tx("Fäst överst","Pin to the top")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 3.5h5l-.8 5.3 3.3 3.2v1.6H7v-1.6l3.3-3.2z"/><path d="M12 13.6v6.9"/></svg></button></div>`}).join("")}</div>`;
  if(D.length){h+=`<button class="mmtrash" data-mmtrash type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>${tx("Nyligen raderade","Recently deleted")} (${D.length})<span>${MMDEL?"▴":"▾"}</span></button>`;
    if(MMDEL)h+=`<div class="mml del">${D.map(m=>{const left=Math.max(1,30-Math.floor((Date.now()-m.del)/864e5));return `<div class="mmi"><span class="mmit"><b>${esc(m.ti.trim()||tx("Utan rubrik","Untitled"))}</b><small>${tx(`Raderas för alltid om ${left} dagar`,`Deleted for good in ${left} days`)}</small></span><button class="btn sm ghost" data-mmback="${esc(m.id)}" type="button">${tx("Återställ","Restore")}</button><button class="lnk bad" data-mmgone="${esc(m.id)}" type="button">${tx("Radera","Delete")}</button></div>`}).join("")}</div>`}
  $("mm_list").innerHTML=h;if(MM&&MM.open)mmMaybeRefresh();mmPurge()};

/* ---------- The ⋯ menu: pin, save as a picture, save as a page, copy, delete ---------- */
$("mm_more").onclick=async()=>{if(!MM.m)return;mmSave();
  const v=await askOpts(MM.m.ti.trim()||tx("Anteckning","Note"),"",[["saveas",tx("Spara som…","Save as…"),tx("PDF, bild eller webbsida i Dokument › Kalenderkoll","PDF, picture or web page in Documents › Kalenderkoll")],["copy",tx("Kopiera texten","Copy the text"),""],["del",tx("Radera","Delete"),tx("Hamnar i Nyligen raderade i 30 dagar","Goes to Recently deleted for 30 days"),true]]);
  if(v==="copy")mmCopy();else if(v==="del")mmTrash();
  else if(v==="saveas"){const f=await askOpts(tx("Spara som","Save as"),"",[["pdf","PDF",tx("Sidor i A4, bra att skriva ut eller skicka","A4 pages, good to print or send")],["img",tx("Bild","Picture"),tx("En lång bild, lätt att dela i en chatt","One long picture, easy to share in a chat")],["html",tx("Webbsida","Web page"),tx("Öppnas i webbläsaren, med länkar som går att trycka på","Opens in the browser, with links you can tap")]]);
    if(f){toast(tx("Sparar…","Saving…"),1500);if(f==="pdf")mmPdf();else if(f==="img")mmImage();else mmExport()}}};
/* The picture is drawn line by line on a canvas: title, text with its styles, lists, links and photos. */
async function mmCanvas(){const cuts=[];const ti=$("mm_ti").value.trim(),bl=mmRead(),W=1080,P=72,cw=W-2*P,dark=false;
  const fam={sf:"Fraunces, Georgia, serif",h:"Caveat, cursive",r:"Nunito, sans-serif",m:"'DM Mono', monospace"},UI="Figtree, system-ui, sans-serif";
  const c=document.createElement("canvas"),g=c.getContext("2d");const ops=[];let y=P;
  const wrap=(text,font,size,lh,color,x0,width,deco)=>{g.font=font;const words=String(text).split(/(\s+)/);let line="";const lines=[];
    for(const w of words){const t=line+w;if(g.measureText(t).width>width&&line.trim()){lines.push(line);line=w.trimStart()}else line=t}if(line||!lines.length)lines.push(line);
    lines.forEach(l=>{const yy=y+size;ops.push(()=>{g.font=font;g.fillStyle=color;g.fillText(l,x0,yy);if(deco){const w2=g.measureText(l).width;g.fillRect(x0,yy-size*.32,w2,2.5)}});y+=lh;cuts.push(y)})};
  if(ti){wrap(ti,`500 64px Fraunces, Georgia, serif`,64,80,"#2a2530",P,cw);y+=10}
  ops.push(((yy)=>()=>{g.font=`500 26px ${UI}`;g.fillStyle="#867d8c";g.fillText("Kalenderkoll · "+new Date().toLocaleDateString(S.lang==="en"?"en-GB":"sv-SE"),P,yy)})(y+26));y+=60;
  /* The last point of a list with costs gets the list's total under it. */
  const tot=new Map();for(let i=0;i<bl.length;i++){if(bl[i].t!=="c"||(bl[i+1]&&bl[i+1].t==="c"))continue;let j=i;while(j>0&&bl[j-1].t==="c")j--;const run=bl.slice(j,i+1);if(run.some(x=>x.pr!==undefined))tot.set(bl[i],run.reduce((a,x)=>a+(x.pr||0),0))}
  let n=0;
  for(const b of bl){if(b.t!=="c")n=0;const col=b.k?MCOL[b.k]:"#2a2530",ff=b.f?fam[b.f]:UI;
    if(b.t==="p"){if(!b.x.trim()){y+=20;continue}const sz=b.s==="h1"?52:b.s==="h2"?40:34,wt=b.s==="h2"?700:b.s==="h1"?500:400,font=`${wt} ${sz}px ${b.s==="h1"&&!b.f?"Fraunces, Georgia, serif":ff}`;
      if(b.s)y+=16;richPlain(b.x).split("\n").forEach(line=>wrap(line,font,sz,Math.round(sz*1.42),col,P,cw));y+=10}
    else if(b.t==="lh"){y+=24;const yy=y;ops.push(()=>{g.fillStyle=(b.k?MCOL[b.k]:"#8a72ee")+"22";g.beginPath();g.roundRect(P-14,yy-4,cw+28,64,18);g.fill()});wrap(b.x,`700 36px ${ff}`,36,56,b.k?MCOL[b.k]:"#2a2530",P+6,cw-12);y+=12}
    else if(b.t==="c"){const yy=y,x0=P+56;n++;
      ops.push(()=>{g.lineWidth=3;if(b.m==="n"){g.font=`700 32px ${UI}`;g.fillStyle=b.k?col:"#8a72ee";g.fillText(n+".",P,yy+34)}else if(b.m==="b"){g.fillStyle=b.k?col:"#8a72ee";g.beginPath();g.arc(P+16,yy+24,7,0,7);g.fill()}
        else{g.strokeStyle=b.d?"#8a72ee":"#bdb4c0";g.fillStyle="#8a72ee";g.beginPath();g.arc(P+18,yy+24,17,0,7);if(b.d){g.fill();g.strokeStyle="#fff";g.beginPath();g.moveTo(P+10,yy+25);g.lineTo(P+16,yy+31);g.lineTo(P+27,yy+18);g.stroke()}else g.stroke()}});
      const prW=b.pr!==undefined?170:0;wrap(b.x,`400 34px ${ff}`,34,52,b.d&&!b.m?"#9a92a0":col,x0,cw-56-prW,b.d&&!b.m);
      if(prW){const t=fmtKr(b.pr);ops.push(()=>{g.font=`600 32px ${UI}`;g.fillStyle="#2a2530";g.textAlign="right";g.fillText(t,P+cw,yy+34);g.textAlign="left"})}
      if(b.ds){wrap(b.ds,`400 28px ${UI}`,28,40,"#867d8c",x0,cw-56);y+=4}
      if(tot.has(b)){y+=8;const yy=y,t=fmtKr(tot.get(b));ops.push(()=>{g.fillStyle="#e3dce6";g.fillRect(P,yy,cw,2);g.font=`500 28px ${UI}`;g.fillStyle="#867d8c";g.fillText(tx("Totalt","Total"),P,yy+40);g.font=`700 32px ${UI}`;g.fillStyle="#2a2530";g.textAlign="right";g.fillText(t,P+cw,yy+40);g.textAlign="left"});y+=56;cuts.push(y)}}
    else if(b.t==="l"){wrap("↗ "+b.u,`600 30px ${UI}`,30,46,"#8a72ee",P,cw);y+=6}
    else if(b.t==="i"&&MIMG[b.i]){const im=new Image();im.src=MIMG[b.i];try{await im.decode()}catch(e){continue}const h=Math.round(cw*im.height/im.width),yy=y+10;
      ops.push(()=>{g.save();g.beginPath();g.roundRect(P,yy,cw,h,28);g.clip();g.drawImage(im,P,yy,cw,h);g.restore()});y+=h+30}}
  y+=P;c.width=W;c.height=Math.min(y,30000);g.fillStyle="#fffcfd";g.fillRect(0,0,W,c.height);g.textBaseline="alphabetic";ops.forEach(f=>f());
  const name=(ti||tx("Anteckning","Note")).replace(/[\\/:*?"<>|]+/g," ").trim().slice(0,60);return{c,cuts,name}}
async function mmImage(){const r=await mmCanvas();saveB64(r.name+".png",r.c.toDataURL("image/png"))}
/* A PDF in A4: the picture of the note, split into pages between lines, never through one. */
async function mmPdf(){const{c,cuts,name}=await mmCanvas(),W=595.28,H=841.89,k=W/c.width,pageH=Math.floor(H/k);
  /* Pages after the first get a margin at the top, like the first one has. */
  const parts=[];let top=0;while(top<c.height-2){const pad=top>0?72:0;let end=Math.min(c.height,top+pageH-pad);if(end<c.height){const ok=cuts.filter(y=>y>top+pageH*.4&&y<=end);if(ok.length)end=ok[ok.length-1]+6}
    const pc=document.createElement("canvas");pc.width=c.width;pc.height=end-top+pad;const g=pc.getContext("2d");g.fillStyle="#fffcfd";g.fillRect(0,0,pc.width,pc.height);g.drawImage(c,0,top,c.width,end-top,0,pad,c.width,end-top);
    const bin=atob(pc.toDataURL("image/jpeg",.9).split(",")[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);parts.push({u,w:pc.width,h:pc.height});top=end}
  const enc=s=>new TextEncoder().encode(s),chunks=[],offs=[];let len=0;const add=x=>{const b=typeof x==="string"?enc(x):x;chunks.push(b);len+=b.length};
  const n=parts.length,obj=(i,body)=>{offs[i]=len;add(`${i} 0 obj\n`);body();add("\nendobj\n")};
  add("%PDF-1.4\n%\u00e2\u00e3\n");
  obj(1,()=>add("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2,()=>add(`<< /Type /Pages /Count ${n} /Kids [${parts.map((_,i)=>`${3+i*3} 0 R`).join(" ")}] >>`));
  parts.forEach((p,i)=>{const pg=3+i*3,im=pg+1,ct=pg+2,ph=(p.h*k).toFixed(2),draw=`q ${W.toFixed(2)} 0 0 ${ph} 0 ${(H-p.h*k).toFixed(2)} cm /Im0 Do Q`;
    obj(pg,()=>add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
    obj(im,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.u.length} >>\nstream\n`);add(p.u);add("\nendstream")});
    obj(ct,()=>add(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`))});
  const total=3+n*3,xref=len;add(`xref\n0 ${total}\n0000000000 65535 f \n`);for(let i=1;i<total;i++)add(String(offs[i]).padStart(10,"0")+" 00000 n \n");
  add(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const all=new Uint8Array(len);let o=0;chunks.forEach(b=>{all.set(b,o);o+=b.length});let bs="";for(let i=0;i<all.length;i+=8192)bs+=String.fromCharCode.apply(null,all.subarray(i,i+8192));
  saveB64(name+".pdf","data:application/pdf;base64,"+btoa(bs))}

/* ---------- Searching the calendar ---------- */
function openSearch(){let s=$("ss");if(!s){s=document.createElement("div");s.id="ss";s.className="sh";s.setAttribute("role","dialog");s.setAttribute("aria-modal","true");
    s.innerHTML=`<div class="box"><div class="bh"><b class="title">${tx("Sök i kalendern","Search the calendar")}</b><button class="ib" type="button" id="ss_x" aria-label="${tx("Stäng","Close")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><label class="mmq big"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg><input id="ss_q" type="search" autocomplete="off" placeholder="${esc(tx("Händelse, plats eller anteckning","Event, place or note"))}"></label><div id="ss_r"></div></div>`;
    document.body.appendChild(s);$("ss_q").addEventListener("input",ssRun);$("ss_x").onclick=closeSS;s.addEventListener("click",e=>{if(e.target===s)closeSS();const r=e.target.closest("[data-ssd]");if(r){closeSS();go("k");pickDay(+r.dataset.ssd);if(r.dataset.sse)setTimeout(()=>openES(r.dataset.sse,+r.dataset.ssd),250)}})}
  s.classList.add("on");$("ss_q").value="";ssRun();setTimeout(()=>$("ss_q").focus(),120)}
function closeSS(){const s=$("ss");if(s)s.classList.remove("on")}
function ssRun(){const q=$("ss_q").value.trim().toLocaleLowerCase(),n0=todayN(),out=[];
  if(q.length>=1){for(const e of EV){if(!(e.n+" "+(e.pl||"")+" "+(e.o||"")).toLocaleLowerCase().includes(q))continue;
      /* The next time it happens; if it is over, the last time it did. */
      const nx=occ(e,n0,n0+800)[0],pv=nx===undefined?occ(e,n0-3650,n0-1).pop():undefined,d=nx!==undefined?nx:pv;if(d===undefined)continue;out.push({e,d,past:nx===undefined})}
    BD.forEach(b=>{if(b.n.toLocaleLowerCase().includes(q)){const d=bdNext(b);out.push({b,d,past:false})}})}
  out.sort((a,b)=>a.past-b.past||(a.past?b.d-a.d:a.d-b.d));
  $("ss_r").innerHTML=!q?`<p class="muted ssh">${tx("Skriv för att söka bland alla händelser, även de som upprepas.","Type to search all events, also repeating ones.")}</p>`:!out.length?`<p class="muted ssh">${tx("Inget hittades","Nothing found")}</p>`:
    out.slice(0,60).map((o,i)=>{const prevPast=i>0&&out[i-1].past;const head=o.past&&!prevPast?`<p class="ssg">${tx("Tidigare","Earlier")}</p>`:"";const [y,m,dd]=ymd(o.d);
      return head+(o.b?`<button class="ssi" data-ssd="${o.d}" type="button"><span class="ssdt"><b>${dd}</b><small>${MNS[li()][m].slice(0,3)}</small></span><span class="sst"><b>♥ ${esc(o.b.n)}</b><small>${esc(bdText(o.b,o.d))}</small></span></button>`
      :`<button class="ssi${o.past?" past":""}" data-ssd="${o.d}" data-sse="${esc(o.e.id)}" type="button" style="--c:${evCol(o.e)}"><span class="ssdt"><b>${dd}</b><small>${MNS[li()][m].slice(0,3)}${y!==ymd(n0)[0]?" "+y:""}</small></span><span class="sst"><b>${esc(o.e.n)}</b><small>${esc([cap(fmtDay(o.d)),o.e.t?o.e.t+(o.e.t2?"–"+o.e.t2:""):tx("Heldag","All day"),o.e.pl].filter(Boolean).join(" · "))}${o.e.r&&o.e.r!=="o"?" · ↻":""}</small></span></button>`)}).join("")}
(()=>{const add=sel=>{const nv=document.querySelector(sel);if(!nv)return;const b=document.createElement("button");b.type="button";b.className="srchb";b.setAttribute("aria-label",tx("Sök","Search"));b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>';b.onclick=openSearch;nv.appendChild(b)};
  ["#k_cal .mnav","#k_wv .mnav","#k_dv .mnav"].forEach(add)})();

/* ---------- Loading: placeholder shapes until the calendar has arrived ---------- */
(()=>{const m=document.querySelector("main");if(!m||$("skel"))return;const s=document.createElement("div");s.id="skel";s.setAttribute("aria-hidden","true");
  s.innerHTML='<div class="sk sk1"><i></i><i></i></div><div class="sk sk2"><i></i><i></i><i></i></div><div class="sk sk3"><i></i><i></i><i></i></div>';
  const first=m.querySelector("section");if(first)first.before(s);else m.appendChild(s);document.body.classList.add("loading");setTimeout(()=>document.body.classList.remove("loading"),6000)})();

/* ---------- Home: the date sits in the top bar instead of twice ---------- */
function homeTitle(){if(typeof tab!=="undefined"&&tab==="h"){const n=todayN();$("ttl").textContent=cap(fmtDay(n))}}
const _go2=go;go=function(x){_go2(x);homeTitle()};
const _rh=renderHome;renderHome=function(){_rh();$("h_hi").textContent="";$("h_hi").classList.add("hide");$("h_date").textContent=tx("Vecka ","Week ")+isoWeek(todayN());homeTitle()};

/* ---------- Celebrations in week view and the widget ---------- */
const FEMO={easter:"🥚",mids:"🌸",hallo:"🎃",lucia:"🕯️",xmas:"🎄",ny:"🎆",adv1:"🕯️",adv2:"🕯️",adv3:"🕯️",adv4:"🕯️"};
const FCOL={easter:"#d99a00",mids:"#2f8a3a",hallo:"#ef7a1a",lucia:"#e08a12",xmas:"#c5303c",ny:"#6a55c9",adv1:"#b8892f",adv2:"#b8892f",adv3:"#b8892f",adv4:"#b8892f"};
const _wv=renderWeekView;renderWeekView=function(){_wv();if(!S.hol)return;document.querySelectorAll("#wv_head .wvh [data-gwd]").forEach(b=>{const d=+b.dataset.gwd,k=festOf(holOn(d));if(!k)return;b.classList.add("wfest","fest-"+k);b.title=holOn(d)[1+li()];b.insertAdjacentHTML("beforeend",`<span class="wfi">${FEMO[k]}</span>`)});
  const n=todayN(),mon=SEL-wdOf(SEL);document.querySelectorAll("#wv_body .wvcol").forEach((c,i)=>{const k=festOf(holOn(mon+i));if(k){c.classList.add("wfest","fest-"+k);c.insertAdjacentHTML("afterbegin",`<span class="fart wvart">${festArt(k)}</span>`)}})};
const _wsync=widgetSync;widgetSync=function(){_wsync();const F=FSP();if(!F||!S.hol)return;setTimeout(async()=>{try{const r=await F.readFile({path:"widget.json",directory:"DATA",encoding:"utf8"}),w=JSON.parse(r.data),days=w.days||{},n=todayN();let ch=false;
  for(let d=n-21;d<=n+120;d++){const h=holOn(d),k=festOf(h);if(!k)continue;const key=nd(d),L=days[key]=days[key]||[],nm=FEMO[k]+" "+h[1+li()];if(!L.some(x=>x.n===nm)){L.unshift({n:nm,t:"",w:"g",c:FCOL[k]});ch=true}}
  if(ch){w.days=days;const txt=JSON.stringify(w);await F.writeFile({path:"widget.json",data:txt,directory:"DATA",encoding:"utf8"});wgPrev=txt}}catch(e){}},900)};

/* Pinning from the list: the pin at the top right of each note. Pinned notes stay first. */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-mpin]");if(!b)return;e.stopPropagation();const m=MEMOS.find(x=>x.id===b.dataset.mpin);if(!m)return;
  m.pin=m.pin?0:Date.now();put("memo_"+m.id,memoDoc(m));try{if(navigator.vibrate)navigator.vibrate(8)}catch(err){}
  /* The list moves with a short glide so you can see where the note went. */
  const L=$("mm_list"),R=new Map([...L.querySelectorAll(".mmrow")].map(r=>[r.querySelector("[data-memo]").dataset.memo,r.getBoundingClientRect().top]));renderMemos();
  L.querySelectorAll(".mmrow").forEach(r=>{const id=r.querySelector("[data-memo]").dataset.memo,t0=R.get(id);if(t0===undefined)return;const dy=t0-r.getBoundingClientRect().top;if(dy)r.animate([{transform:`translateY(${dy}px)`},{transform:"none"}],{duration:280,easing:"cubic-bezier(.22,.9,.3,1)"})});
  toast(m.pin?tx("Fäst överst","Pinned to the top"):tx("Lossad","Unpinned"),1600)},true);
