/* ---------- .ics files, which every phone calendar, Google and Outlook can read ---------- */
const icsEsc=s=>String(s).replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/[,;]/g,m=>"\\"+m);
const icsD=iso=>iso.replace(/-/g,""),icsDT=(iso,tm)=>icsD(iso)+"T"+tm.replace(":","")+"00";
function icsFold(l){const out=[];while(l.length>74){out.push(l.slice(0,74));l=" "+l.slice(74)}out.push(l);return out.join("\r\n")}
const RR={d:"FREQ=DAILY",wd:"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",w:"FREQ=WEEKLY","2w":"FREQ=WEEKLY;INTERVAL=2",m:"FREQ=MONTHLY",y:"FREQ=YEARLY"};
function icsText(evs,bds){const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kalenderkoll//SV","CALSCALE:GREGORIAN","X-WR-CALNAME:Kalenderkoll"],stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
  evs.forEach(e=>{const last=e.e||e.d;L.push("BEGIN:VEVENT","UID:"+e.id+"@kalenderkoll","DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(e.n));
    if(e.t)L.push("DTSTART:"+icsDT(e.d,e.t),"DTEND:"+icsDT(last,e.t2&&(e.e||tmin(e.t2)>tmin(e.t))?e.t2:addMin(e.t,60)));else L.push("DTSTART;VALUE=DATE:"+icsD(e.d),"DTEND;VALUE=DATE:"+icsD(nd(dn(last)+1)));
    if(e.r&&e.r!=="o")L.push("RRULE:"+RR[e.r]+(e.r==="w"&&e.wd&&e.wd.length>1?";BYDAY="+e.wd.map(i=>["MO","TU","WE","TH","FR","SA","SU"][i]).join(","):"")+(e.u?";UNTIL="+icsD(e.u)+(e.t?"T235959":""):""));(e.skip||[]).forEach(x=>L.push(e.t?"EXDATE:"+icsDT(x,e.t):"EXDATE;VALUE=DATE:"+icsD(x)));
    if(e.pl)L.push("LOCATION:"+icsEsc(e.pl));if(e.o)L.push("DESCRIPTION:"+icsEsc(e.o));L.push("END:VEVENT")});
  bds.forEach(b=>{const d=nd(bdOnYear(b,b.y||NOW.getFullYear()));L.push("BEGIN:VEVENT","UID:bd-"+b.id+"@kalenderkoll","DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(b.ty==="b"?tx(b.n+" har födelsedag",b.n+"'s birthday"):b.n),"DTSTART;VALUE=DATE:"+icsD(d),"DTEND;VALUE=DATE:"+icsD(nd(dn(d)+1)),"RRULE:FREQ=YEARLY","TRANSP:TRANSPARENT","END:VEVENT")});
  L.push("END:VCALENDAR");return L.map(icsFold).join("\r\n")+"\r\n"}
async function icsSave(evs,bds,name){const fn=String(name||"kalenderkoll").replace(/[^\wåäöÅÄÖ\- ]+/g,"").trim().replace(/\s+/g,"-").toLowerCase()+".ics",txt=icsText(evs,bds);
  saveFile(fn,txt,"text/calendar;charset=utf-8")}
$("ics_out").onclick=()=>{if(!EV.length&&!BD.length){toast(tx("Det finns inget att spara än","There is nothing to save yet"));return}icsSave(EV,BD,"kalenderkoll-"+isoOf(new Date()))};
