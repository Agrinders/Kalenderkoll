/* ---------- Backups ----------
   A backup is one small file with everything in the calendar, plus which shared calendar it is and who you are.
   In the Android app a fresh copy is written to Documents › Kalenderkoll after every change.
   After a reinstall you pick that file under Restore, and the app joins the same shared calendar again. */
function NATIVE(){return!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform())}
function FSP(){return NATIVE()&&Capacitor.Plugins&&Capacitor.Plugins.Filesystem||null}
/* Plain var and function so the settings page can use these while the app is still starting. */
var BKN="Kalenderkoll-sakerhetskopia.json",BKK="kalenderkoll.backup";
function bkInfo(){try{return JSON.parse(localStorage.getItem(BKK)||"{}")||{}}catch(e){return{}}}
function bkLast(){const t=bkInfo().at;if(!t)return"";const d=new Date(t);return isNaN(d)?"":fmtD(dnOf(d))+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function backupText(){return JSON.stringify({app:"kalenderkoll",v:1,at:new Date().toISOString(),space:window.KK&&KK.space?KK.space():"",me:ME||"",docs:DOCS},null,1)}
/* Saves a file where the person can find it: Documents › Kalenderkoll in the Android app, a download elsewhere. */
async function saveFile(name,text,mime){const F=FSP();
  if(F){try{await F.writeFile({path:"Kalenderkoll/"+name,data:text,directory:"DOCUMENTS",encoding:"utf8",recursive:true});toast(tx("Sparad i Dokument › Kalenderkoll","Saved in Documents › Kalenderkoll")+" · "+name);return true}
    catch(e){try{const n2=name.replace(/(\.\w+)$/,"-"+Date.now()+"$1");await F.writeFile({path:"Kalenderkoll/"+n2,data:text,directory:"DOCUMENTS",encoding:"utf8",recursive:true});toast(tx("Sparad i Dokument › Kalenderkoll","Saved in Documents › Kalenderkoll")+" · "+n2);return true}catch(e2){toast(tx("Kunde inte spara filen","Could not save the file"));return false}}}
  if(!LOCAL){try{const dl=await claude.use("downloads");if(dl){await dl.save({filename:name,data:text});return true}}catch(e){return false}}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return true}
/* Automatic copy in the Android app. If a file from an earlier install is in the way, this install keeps its own file. */
var bkTimer=0,bkPrev="";
function autoBackup(){const F=FSP();if(!F||!hasData())return;clearTimeout(bkTimer);bkTimer=setTimeout(async()=>{
  const body=JSON.stringify(DOCS);if(body===bkPrev)return;const info=bkInfo(),name=info.name||BKN,txt=backupText();
  const w=n=>F.writeFile({path:"Kalenderkoll/"+n,data:txt,directory:"DOCUMENTS",encoding:"utf8",recursive:true});
  try{await w(name)}catch(e){const n2="Kalenderkoll-sakerhetskopia-"+isoOf(new Date())+".json";try{await w(n2);info.name=n2}catch(e2){return}}
  bkPrev=body;info.at=new Date().toISOString();try{localStorage.setItem(BKK,JSON.stringify(info))}catch(e){}if(tab==="c")renderSettings()},3000)}
async function restoreFrom(file){let b;try{b=JSON.parse(await file.text())}catch(e){b=null}
  if(!b||b.app!=="kalenderkoll"||typeof b.docs!=="object"){toast(tx("Det där är ingen säkerhetskopia från Kalenderkoll","That is not a Kalenderkoll backup"));return}
  const n=Object.values(b.docs).filter(v=>v&&v.kind==="ev").length,when=b.at?fmtD(dnOf(new Date(b.at))):"";
  if(!await ask(tx("Återställa kalendern?","Restore the calendar?"),tx(`Säkerhetskopian${when?" från "+when:""} har ${n} händelser. Är ni ihop kopplas du till er delade kalender igen.`,`The backup${when?" from "+when:""} has ${n} events. If you are a couple, you are connected to your shared calendar again.`),tx("Återställ","Restore")))return;
  if(window.KK&&KK.restore)KK.restore(b)}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#bk_save,#bk_load,#cs_rs");if(!t)return;
  if(t.id==="bk_save"){if(!hasData()){toast(tx("Det finns inget att spara än","There is nothing to save yet"));return}saveFile(NATIVE()?BKN.replace(".json","-"+isoOf(new Date())+".json"):"kalenderkoll-sakerhetskopia-"+isoOf(new Date())+".json",backupText(),"application/json")}
  else{$("bk_in").value="";$("bk_in").click()}});
$("bk_in").addEventListener("change",()=>{const f=$("bk_in").files[0];if(f)restoreFrom(f)});

/* ---------- Home-screen widget (Android app) ----------
   The widget cannot run the app, so the app writes a small file with the coming days for it to read. */
var wgTimer=0,wgPrev="";
function widgetSync(){const F=FSP();if(!F)return;clearTimeout(wgTimer);wgTimer=setTimeout(()=>{
  const n=todayN(),def={a:"#5cc79f",b:"#9d86f4",g:"#f19ab9"},hex=x=>/^#[0-9a-f]{6}$/i.test(x||"")?x:"",pc=w=>w==="g"?def.g:hex(CP["c"+w])||def[w],days={};
  for(const o of between(n-21,n+120))for(let d=Math.max(o.s,n-21);d<=Math.min(o.end,n+120);d++){const e=o.e,first=d===o.s;(days[nd(d)]=days[nd(d)]||[]).push({n:e.n,t:e.t&&first?e.t+(e.t2?"–"+e.t2:""):"",w:e.w||"g",c:hex(e.col)||pc(e.w||"g")})}
  for(let d=n-21;d<=n+120;d++){const B=bdOn(d);if(B.length)(days[nd(d)]=days[nd(d)]||[]).unshift(...B.map(b=>({n:"♥ "+bdText(b,d),t:"",w:"g",c:"#8a72ee"})))}
  for(const k in days)days[k].sort((x,y)=>(x.t||"")<(y.t||"")?-1:(x.t||"")>(y.t||"")?1:0);
  const txt=JSON.stringify({v:1,lang:S.lang,names:{a:CP.a||"",b:CP.b||""},cols:{a:pc("a"),b:pc("b")},days});
  if(txt===wgPrev)return;F.writeFile({path:"widget.json",data:txt,directory:"DATA",encoding:"utf8"}).then(()=>{wgPrev=txt}).catch(()=>{})},500)}
