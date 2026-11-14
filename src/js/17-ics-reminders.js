/* ---------- .ics files: the format every phone calendar, Google and Outlook can read ---------- */
const icsEsc=s=>String(s).replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/[,;]/g,m=>"\\"+m);
const icsD=iso=>iso.replace(/-/g,""),icsDT=(iso,tm)=>icsD(iso)+"T"+tm.replace(":","")+"00";
function icsFold(l){const out=[];while(l.length>74){out.push(l.slice(0,74));l=" "+l.slice(74)}out.push(l);return out.join("\r\n")}
const RR={d:"FREQ=DAILY",wd:"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",w:"FREQ=WEEKLY","2w":"FREQ=WEEKLY;INTERVAL=2",m:"FREQ=MONTHLY",y:"FREQ=YEARLY"};
function icsText(evs,bds){const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kalenderkoll//Kalenderkoll//SV","CALSCALE:GREGORIAN","X-WR-CALNAME:Kalenderkoll"],stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
  evs.forEach(e=>{const last=e.e||e.d;L.push("BEGIN:VEVENT","UID:"+e.id+"@kalenderkoll","DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(e.n));
    if(e.t)L.push("DTSTART:"+icsDT(e.d,e.t),"DTEND:"+icsDT(last,e.t2&&(e.e||tmin(e.t2)>tmin(e.t))?e.t2:addMin(e.t,60)));
    else L.push("DTSTART;VALUE=DATE:"+icsD(e.d),"DTEND;VALUE=DATE:"+icsD(nd(dn(last)+1)));
    if(e.r&&e.r!=="o")L.push("RRULE:"+RR[e.r]+(e.u?";UNTIL="+icsD(e.u)+(e.t?"T235959":""):""));
    (e.skip||[]).forEach(x=>L.push(e.t?"EXDATE:"+icsDT(x,e.t):"EXDATE;VALUE=DATE:"+icsD(x)));
    if(e.pl)L.push("LOCATION:"+icsEsc(e.pl));if(e.o)L.push("DESCRIPTION:"+icsEsc(e.o));L.push("CATEGORIES:"+icsEsc(catName(e.c)));
    if(e.rem>=0)L.push("BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsEsc(e.n),"TRIGGER:"+(e.t?(e.rem?"-PT"+e.rem+"M":"PT0M"):(e.rem>=1440?"-PT16H":"PT8H")),"END:VALARM");
    L.push("END:VEVENT")});
  bds.forEach(b=>{const y=b.y||NOW.getFullYear(),d=nd(bdOnYear(b,y));L.push("BEGIN:VEVENT","UID:bd-"+b.id+"@kalenderkoll","DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(b.ty==="b"?tx(b.n+" har födelsedag",b.n+"'s birthday"):b.n),"DTSTART;VALUE=DATE:"+icsD(d),"DTEND;VALUE=DATE:"+icsD(nd(dn(d)+1)),"RRULE:FREQ=YEARLY","TRANSP:TRANSPARENT","END:VEVENT")});
  L.push("END:VCALENDAR");return L.map(icsFold).join("\r\n")+"\r\n"}
function icsDownload(evs,bds,name){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([icsText(evs,bds)],{type:"text/calendar;charset=utf-8"}));a.download=String(name||"kalenderkoll").replace(/[^\wåäöÅÄÖ\- ]+/g,"").trim().replace(/\s+/g,"-").toLowerCase()+".ics";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
$("ics_out").onclick=()=>{if(!EV.length&&!BD.length){toast(tx("Det finns inget att exportera än","There is nothing to export yet"),"warn");return}icsDownload(EV,BD,"kalenderkoll-"+isoOf(new Date()));toast(tx(`Exporterade ${EV.length} händelser och ${BD.length} födelsedagar`,`Exported ${EV.length} events and ${BD.length} birthdays`),"ok")};
function icsParse(txt){const lines=txt.replace(/\r?\n[ \t]/g,"").split(/\r?\n/),out=[];let cur=null,alarm=false;
  for(const ln of lines){if(ln==="BEGIN:VEVENT"){cur={};continue}if(ln==="END:VEVENT"){if(cur)out.push(cur);cur=null;continue}if(!cur)continue;if(ln==="BEGIN:VALARM"){alarm=true;continue}if(ln==="END:VALARM"){alarm=false;continue}
    const i=ln.indexOf(":");if(i<0)continue;const[name,...ps]=ln.slice(0,i).split(";"),P={},N=name.toUpperCase(),v=ln.slice(i+1);ps.forEach(p=>{const[k,x]=p.split("=");P[(k||"").toUpperCase()]=x});
    if(alarm){if(N==="TRIGGER"&&!cur.trig)cur.trig=v;continue}
    if(N==="EXDATE"){(cur.ex=cur.ex||[]).push(...v.split(",").map(x=>({v:x,P})));continue}
    if(!cur[N])cur[N]={v,P}}
  return out}
const icsUn=s=>s.replace(/\\n/gi,"\n").replace(/\\([,;\\])/g,"$1");
function icsWhen(x){const v=x.v.trim();if(/^\d{8}$/.test(v))return{d:v.slice(0,4)+"-"+v.slice(4,6)+"-"+v.slice(6,8),t:""};const m=v.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?(Z)?$/);if(!m)return null;
  if(m[7]){const d=new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]));return{d:isoOf(d),t:pad(d.getHours())+":"+pad(d.getMinutes())}}return{d:`${m[1]}-${m[2]}-${m[3]}`,t:`${m[4]}:${m[5]}`}}
function icsToEv(x){const s=x.DTSTART&&icsWhen(x.DTSTART);if(!s)return null;const en=x.DTEND&&icsWhen(x.DTEND);
  const e={id:newId(),n:(x.SUMMARY?icsUn(x.SUMMARY.v).trim():"")||tx("Händelse","Event"),d:s.d,e:"",t:s.t,t2:"",r:"o",u:"",skip:[],c:"o",pl:x.LOCATION?icsUn(x.LOCATION.v).trim():"",o:x.DESCRIPTION?icsUn(x.DESCRIPTION.v).trim().slice(0,600):"",rem:-1,cd:false};
  if(en){if(!s.t){const last=nd(dn(en.d)-1);if(last>s.d)e.e=last}else{if(en.d>s.d)e.e=en.d;if(en.t&&(e.e||tmin(en.t)>tmin(s.t)))e.t2=en.t}}
  if(x.RRULE){const R={};x.RRULE.v.split(";").forEach(p=>{const[k,v]=p.split("=");R[(k||"").toUpperCase()]=v});const iv=+R.INTERVAL||1;
    e.r=R.FREQ==="DAILY"&&iv===1?"d":R.FREQ==="WEEKLY"&&R.BYDAY==="MO,TU,WE,TH,FR"?"wd":R.FREQ==="WEEKLY"&&iv<=2?(iv===2?"2w":"w"):R.FREQ==="MONTHLY"&&iv===1?"m":R.FREQ==="YEARLY"&&iv===1?"y":"o";
    if(e.r!=="o"){if(R.UNTIL){const u=icsWhen({v:R.UNTIL,P:{}});if(u)e.u=u.d}else if(R.COUNT){const L=occ(e,dn(e.d),dn(e.d)+366*40),c=+R.COUNT;if(L[c-1]!=null)e.u=nd(L[c-1])}}}
  (x.ex||[]).forEach(z=>{const w=icsWhen(z);if(w)e.skip.push(w.d)});
  if(x.trig){const m=x.trig.match(/^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);if(m){const mins=(+m[2]||0)*10080+(+m[3]||0)*1440+(+m[4]||0)*60+(+m[5]||0),b=m[1]?mins:-mins;e.rem=e.t?[0,10,60,1440].reduce((a,x)=>Math.abs(x-Math.max(0,b))<Math.abs(a-Math.max(0,b))?x:a,0):(b>=8*60?1440:0)}}
  return e}
const icsF=$("ics_file");$("ics_in").onclick=()=>icsF.click();
icsF.onchange=async()=>{const f=icsF.files[0];icsF.value="";if(!f)return;let L=[];try{L=icsParse(await f.text()).map(icsToEv).filter(Boolean)}catch(e){L=[]}
  if(!L.length){toast(tx("Hittade inga händelser i filen. Välj en .ics-fil.","No events found in the file. Choose an .ics file."),"bad");return}
  const key=e=>e.n+"|"+e.d+"|"+e.t,have=new Set(exampleMode?[]:EV.map(key)),add=L.filter(e=>!have.has(key(e))),dup=L.length-add.length;
  if(!add.length){toast(tx("Allt i filen finns redan i kalendern","Everything in the file is already in the calendar"),"info");return}
  if(!await ask(tx(`Läsa in ${add.length} händelser?`,`Load ${add.length} events?`),(exampleMode?tx("Exemplet tas bort och dina händelser läggs in. ","The example is removed and your events are added. "):"")+(dup?tx(`${dup} som redan finns hoppas över. `,`${dup} that already exist are skipped. `):"")+tx("Du kan ångra det under Historik.","You can undo it under History.")))return;
  if(exampleMode){exampleMode=false;EV=[];BD=[];if(col)col.doc("started").set({kind:"started"}).catch(()=>{})}
  add.forEach(saveEv);render();toast(tx(`${add.length} händelser inlästa`,`${add.length} events loaded`),"ok")};

/* ---------- Reminders: a notification when the app is open ---------- */
const FKEY="kalenderkoll.fired";let FIRED={};try{FIRED=JSON.parse(localStorage.getItem(FKEY)||"{}")||{}}catch(e){FIRED={}}
function remAt(o){const e=o.e;if(typeof e.rem!=="number"||e.rem<0)return null;if(e.t)return startMs(o)-e.rem*6e4;const d=dOf(o.s);return new Date(d.getFullYear(),d.getMonth(),d.getDate()-(e.rem>=1440?1:0),8).getTime()}
function remind(o){const e=o.e,n=todayN(),when=(o.s===n?tx("Idag","Today"):relDay(o.s))+(e.t?" "+e.t:""),tb=toast(e.n+" · "+when+(e.pl?" · "+e.pl:""),"rem");if(tb){clearTimeout(tb._t);tb._t=setTimeout(()=>dropToast(tb),12000)}
  if("Notification" in window&&Notification.permission==="granted"){const opt={body:when+(e.pl?" · "+e.pl:""),icon:"icons/icon-192.png",tag:e.id+"@"+nd(o.s)};(navigator.serviceWorker?navigator.serviceWorker.getRegistration().then(r=>{if(!r)throw 0;return r.showNotification(e.n,opt)}):Promise.reject()).catch(()=>{try{new Notification(e.n,opt)}catch(err){}})}}
function remCheck(){if(!S.rem||exampleMode)return;const now=Date.now(),n=todayN();let ch=false;
  between(n-1,n+2).forEach(o=>{const at=remAt(o);if(at==null)return;const k=o.e.id+"@"+nd(o.s);if(now>=at&&now-at<20*6e4&&endMs(o)>now&&!FIRED[k]){FIRED[k]=now;ch=true;remind(o)}});
  if(ch){const cut=now-4*864e5;Object.keys(FIRED).forEach(k=>{if(FIRED[k]<cut)delete FIRED[k]});try{localStorage.setItem(FKEY,JSON.stringify(FIRED))}catch(e){}}}
setInterval(remCheck,3e4);setTimeout(remCheck,3000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)remCheck()});
