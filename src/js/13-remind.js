/* ---------- Reminders ----------
   In the Android app, reminders for the next three weeks are handed to the phone, which shows them even when the app
   is closed. Every change to the calendar redoes the list, so moved or deleted events never remind at the old time.
   Only events that are yours or for both of you remind you. */
var remTimer=0;
function remId(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)%2000000000+1}
function remSched(){const N=NATIVE()&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(!N||!ME)return;clearTimeout(remTimer);remTimer=setTimeout(async()=>{
  const now=Date.now(),n0=todayN(),L=[];
  for(const o of between(n0-1,n0+21)){const e=o.e;if(!(e.rm>=0)||(e.w!=="g"&&e.w!==ME))continue;
    const [y,m,d]=ymd(o.s),st=e.t?tmin(e.t):9*60,base=new Date(y,m,d,Math.floor(st/60),st%60).getTime(),at=e.t?base-e.rm*60000:base-(e.rm===1440?864e5:0);
    if(at<now+5000)continue;
    const when=e.t?(e.rm===0?tx("Nu","Now"):e.rm===1440?tx("Imorgon ","Tomorrow ")+e.t:tx(`Om ${e.rm===60?"1 timme":e.rm+" min"}`,`In ${e.rm===60?"1 hour":e.rm+" min"}`)+" · "+e.t+(e.t2&&e.t2!==e.t?"–"+e.t2:"")):(e.rm===1440?tx("Imorgon","Tomorrow"):tx("Idag","Today"));
    L.push({id:remId(e.id+"@"+o.s),title:(e.ic?"":"")+e.n,body:when+(e.pl?" · "+e.pl:""),schedule:{at:new Date(at),allowWhileIdle:true},extra:{d:nd(o.s),ev:e.id}})}
  L.sort((a,b)=>a.schedule.at-b.schedule.at);const keep=L.slice(0,60);
  let old=[];try{old=JSON.parse(localStorage.getItem("kalenderkoll.rems")||"[]")}catch(e){}
  const ids=new Set(keep.map(x=>x.id)),gone=old.filter(i=>!ids.has(i));
  try{if(gone.length)await N.cancel({notifications:gone.map(id=>({id}))});if(keep.length)await N.schedule({notifications:keep});localStorage.setItem("kalenderkoll.rems",JSON.stringify([...ids]))}catch(e){}},1500)}
/* Tapping a reminder opens that day. */
try{const N=NATIVE()&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(N)N.addListener("localNotificationActionPerformed",a=>{const x=a&&a.notification&&a.notification.extra;if(x&&x.d){go("k");pickDay(dn(x.d))}})}catch(e){}

/* ---------- Hand-over to the background check (Android app) ----------
   The app leaves the calendar's code, who you are and what it has already seen in bg.json; the background job
   reads it while the app is closed. What the job has already told you about is not announced again here. */
var bgTimer=0,bgPrev="",TOLD=new Set();
function bgSync(){const F=FSP();if(!F||!window.KK||KK.mode!=="cloud"||!KK.cfg)return;clearTimeout(bgTimer);bgTimer=setTimeout(()=>{
  const txt=JSON.stringify({space:KK.space(),me:ME||"",names:{a:CP.a||"",b:CP.b||""},lang:S.lang,key:KK.cfg.key,project:KK.cfg.project,seen:Object.keys(DOCS).filter(k=>/^(ev|note|todo|bd|memo)_/.test(k))});
  if(txt===bgPrev)return;F.writeFile({path:"bg.json",data:txt,directory:"DATA",encoding:"utf8"}).then(()=>{bgPrev=txt}).catch(()=>{})},800)}
(async()=>{const F=FSP();if(!F)return;try{const r=await F.readFile({path:"bg_told.json",directory:"DATA",encoding:"utf8"});JSON.parse(r.data).forEach(x=>TOLD.add(x))}catch(e){}})();

/* ---------- Sync status in the top bar ----------
   Offline: a crossed cloud and "Offline". Saving for more than a moment: "Sparar…". When it is done: a brief tick. */
var syncT=0,syncWas=0;
function syncShow(){const b=$("sync");if(!b)return;const cloud=window.KK&&KK.mode==="cloud",off=!navigator.onLine,local=window.KK&&KK.mode==="local"&&SHARED();
  clearTimeout(syncT);let st="";if(!cloud&&!local){b.hidden=true;return}
  if(off||local)st="off";else if(WAIT>0)st="busy";else if(syncWas)st="done";
  const set=s=>{b.hidden=!s;b.className="sync "+s;b.querySelector("span").textContent=s==="off"?tx("Offline","Offline"):s==="busy"?tx("Sparar…","Saving…"):s==="done"?tx("Sparat","Saved"):""};
  if(st==="busy"){syncWas=1;syncT=setTimeout(()=>set("busy"),700);return}
  if(st==="done"){syncWas=0;set("done");syncT=setTimeout(()=>set(""),1600);return}set(st)}
addEventListener("online",syncShow);addEventListener("offline",syncShow);setTimeout(syncShow,3000);
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#sync")){const off=!navigator.onLine||(window.KK&&KK.mode==="local");
  toast(off?tx("Ingen internetanslutning · Det du gör sparas på telefonen och skickas när du är online igen.","No internet · What you do is kept on the phone and sent when you are back online."):tx("Allt är sparat och delat.","Everything is saved and shared."),5000)}});
