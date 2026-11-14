/* ---------- Dates. Days are counted as whole numbers (days since 1970) so the maths never trips on summer time. ---------- */
const pad=n=>String(n).padStart(2,"0");
const isoOf=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const dn=iso=>{const[y,m,d]=iso.split("-").map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5)};
const nd=n=>{const d=new Date(n*864e5);return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate())};
const dOf=n=>{const d=new Date(n*864e5);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};
const ymd=n=>{const d=new Date(n*864e5);return[d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()]};
const dnOf=(y,m,d)=>Math.round(Date.UTC(y,m,d)/864e5);
const todayN=()=>dn(isoOf(new Date()));
const wdOf=n=>(new Date(n*864e5).getUTCDay()+6)%7;/* 0 = Monday */
const dim=(y,m)=>new Date(y,m+1,0).getDate();
function isoWeek(n){const th=n-wdOf(n)+3,y=new Date(th*864e5).getUTCFullYear();return 1+Math.floor((th-dnOf(y,0,1))/7)}
const fmtD=(n,o)=>dOf(n).toLocaleDateString(loc(),o||{day:"numeric",month:"long"});
const fmtDay=n=>{const[y]=ymd(n);return dOf(n).toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long",...(y!==NOW.getFullYear()?{year:"numeric"}:{})})};
const relDay=n=>{const d=n-todayN();return d===0?tx("Idag","Today"):d===1?tx("Imorgon","Tomorrow"):d===-1?tx("Igår","Yesterday"):cap(fmtDay(n))};
const inDays=d=>d===0?tx("idag","today"):d===1?tx("imorgon","tomorrow"):d<0?tx(`för ${-d} dagar sedan`,`${-d} days ago`):tx(`om ${d} dagar`,`in ${d} days`);
const tmin=s=>{if(!s)return -1;const[h,m]=s.split(":").map(Number);return h*60+m};
const fmtT=s=>s||"";


/* ---------- Events ----------
   {id, n: title, d: start date, e: last date (several days), t/t2: start and end time ("" = all day),
    r: repeat o|d|wd|w|2w|m|y, u: repeat until, skip: dates left out, pl: place, o: note, w: whose, a|b|g} */
let EV=[],BD=[],TODOS=[],NOTES=[];
const REPS=[["o","Aldrig","Never"],["d","Varje dag","Every day"],["w","Varje vecka","Every week"],["2w","Varannan vecka","Every other week"],["m","Varje månad","Every month"],["y","Varje år","Every year"]];
const REPALL=[...REPS,["wd","Vardagar","Weekdays"]];
const repName=r=>{const x=REPALL.find(z=>z[0]===r)||REPS[0];return x[1+li()]};
const evDur=e=>e.e?Math.max(0,dn(e.e)-dn(e.d)):0;
/* Start days of every time an event happens that touches the days A..B. */
function occ(e,A,B){const s0=dn(e.d),dur=evDur(e),U=e.u?dn(e.u):Infinity,lo=A-dur,hi=Math.min(B,U),out=[],sk=e.skip&&e.skip.length?new Set(e.skip):null;
  if(hi<s0)return out;const push=s=>{if(s>=lo&&s<=hi&&s>=s0&&!(sk&&sk.has(nd(s))))out.push(s)};const r=e.r||"o";
  if(r==="o")push(s0);
  else if(r==="d"||r==="wd"){for(let s=Math.max(s0,lo);s<=hi;s++){if(r==="wd"&&wdOf(s)>4)continue;push(s)}}
  else if(r==="w"&&e.wd&&e.wd.length>1){for(let s=Math.max(s0,lo);s<=hi;s++)if(e.wd.includes(wdOf(s)))push(s)}
  else if(r==="w"||r==="2w"){const st=r==="w"?7:14;for(let s=s0+Math.max(0,Math.ceil((lo-s0)/st))*st;s<=hi;s+=st)push(s)}
  else{const[y,m,d]=e.d.split("-").map(Number),step=r==="m"?1:12,[ly,lm]=ymd(Math.max(lo,s0));let i=Math.max(0,Math.floor(((ly-y)*12+(lm-(m-1)))/step)-1);
    for(;i<6000;i++){const k=m-1+i*step,Y=y+Math.floor(k/12),M=k%12,s=dnOf(Y,M,Math.min(d,dim(Y,M)));if(s>hi)break;push(s)}}
  return out}
const byTime=(a,b)=>a.s-b.s||(a.e.t?1:0)-(b.e.t?1:0)||tmin(a.e.t)-tmin(b.e.t)||a.e.n.localeCompare(b.e.n);
/* Every occurrence touching A..B, sorted by start. */
function between(A,B){const L=[];EV.forEach(e=>occ(e,A,B).forEach(s=>L.push({e,s,end:s+evDur(e)})));return L.sort(byTime)}
/* What is on one day: events (including ones spanning it), sorted with all-day first. */
function onDay(n){return between(n,n).sort((a,b)=>(a.e.t&&a.s===n?1:0)-(b.e.t&&b.s===n?1:0)||tmin(a.s===n?a.e.t:"")-tmin(b.s===n?b.e.t:"")||a.e.n.localeCompare(b.e.n))}
/* Minutes since midnight the occurrence starts (all-day = -1), and its start as a time stamp. */
const startMs=o=>{const d=dOf(o.s),m=o.e.t?tmin(o.e.t):-1;return new Date(d.getFullYear(),d.getMonth(),d.getDate(),m<0?0:Math.floor(m/60),m<0?0:m%60).getTime()};
const endMs=o=>{const d=dOf(o.end);if(!o.e.t)return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();const m=o.e.t2?tmin(o.e.t2):tmin(o.e.t)+60;return new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,m).getTime()};
const timeLbl=(o,n)=>{const e=o.e;if(o.end>o.s){if(n==null||n===o.s)return e.t?tx("från ","from ")+e.t:tx("Heldag","All day");if(n===o.end)return e.t&&e.t2?tx("till ","until ")+e.t2:tx("Sista dagen","Last day");return tx("Hela dagen","All day")}return e.t?e.t+(e.t2?"–"+e.t2:""):tx("Heldag","All day")};

/* ---------- Birthdays and other yearly days: {id, n, md: "MM-DD", y: year or 0, ty: b|a|o} ---------- */
const BTY=[["b","Födelsedag","Birthday"],["a","Årsdag","Anniversary"],["o","Annan dag","Other day"]];
const bdOnYear=(b,y)=>{const[m,d]=b.md.split("-").map(Number);return dnOf(y,m-1,Math.min(d,dim(y,m-1)))};
function bdNext(b,from){const f=from==null?todayN():from,[y]=ymd(f);let s=bdOnYear(b,y);if(s<f)s=bdOnYear(b,y+1);return s}
const bdAge=(b,s)=>b.y?ymd(s)[0]-b.y:0;
const bdOn=n=>BD.filter(b=>bdOnYear(b,ymd(n)[0])===n);
const bdText=(b,s)=>{const a=bdAge(b,s);if(b.ty==="a")return a?tx(`${b.n}: ${a} år`,`${b.n}: ${a} years`):b.n;if(b.ty==="o")return b.n+(a?tx(` (${a} år)`,` (${a} years)`):"");return a?tx(`${b.n} fyller ${a}`,`${b.n} turns ${a}`):tx(`${b.n} har födelsedag`,`${b.n}'s birthday`)};

/* ---------- Swedish public holidays, worked out for any year ---------- */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return dnOf(y,mo-1,da)}
const HOLC={};
/* [day, Swedish name, English name, red day] — eves are not red days, but most people are off. */
function holidays(y){if(HOLC[y])return HOLC[y];const E=easter(y),sat=(m,d1)=>{for(let d=d1;d<d1+7;d++){const n=dnOf(y,m,d);if(wdOf(n)===5)return n}},fri=(m,d1)=>sat(m,d1+1)-1;
  const L=[[dnOf(y,0,1),"Nyårsdagen","New Year's Day",1],[dnOf(y,0,5),"Trettondagsafton","Twelfth Night",0],[dnOf(y,0,6),"Trettondedag jul","Epiphany",1],[E-2,"Långfredagen","Good Friday",1],[E-1,"Påskafton","Easter Eve",0],[E,"Påskdagen","Easter Sunday",1],[E+1,"Annandag påsk","Easter Monday",1],[dnOf(y,3,30),"Valborgsmässoafton","Walpurgis Night",0],[dnOf(y,4,1),"Första maj","May Day",1],[E+39,"Kristi himmelsfärdsdag","Ascension Day",1],[E+49,"Pingstdagen","Whit Sunday",1],[dnOf(y,5,6),"Sveriges nationaldag","National Day of Sweden",1],[fri(5,19),"Midsommarafton","Midsummer Eve",0],[sat(5,20),"Midsommardagen","Midsummer Day",1],[sat(9,31),"Alla helgons dag","All Saints' Day",1],[dnOf(y,9,31),"Halloween","Halloween",0],[dnOf(y,11,13),"Lucia","St Lucia's Day",0],[dnOf(y,11,24),"Julafton","Christmas Eve",0],[dnOf(y,11,25),"Juldagen","Christmas Day",1],[dnOf(y,11,26),"Annandag jul","Boxing Day",1],[dnOf(y,11,31),"Nyårsafton","New Year's Eve",0]];
  return HOLC[y]=L.sort((a,b)=>a[0]-b[0])}
/* The big celebrations get their own look: an icon and a themed card. */
const FESTK={"Påskafton":"easter","Påskdagen":"easter","Midsommarafton":"mids","Midsommardagen":"mids","Halloween":"hallo","Lucia":"lucia","Julafton":"xmas","Juldagen":"xmas","Nyårsafton":"ny","Nyårsdagen":"ny"};
const FESTI={easter:'<path d="M12 3.5c3 0 6 4.6 6 9.2a6 6 0 0 1-12 0c0-4.6 3-9.2 6-9.2z"/><path d="M6.5 11.4l2.3 1.8 3.2-2.4 3.2 2.4 2.3-1.8"/>',
  mids:'<circle cx="12" cy="8.6" r="1.6"/><circle cx="12" cy="4.6" r="1.9"/><circle cx="15.8" cy="7.4" r="1.9"/><circle cx="14.4" cy="11.8" r="1.9"/><circle cx="9.6" cy="11.8" r="1.9"/><circle cx="8.2" cy="7.4" r="1.9"/><path d="M12 13.8V21M12 18.2c1.6-.2 3-1 3.6-2.6"/>',
  hallo:'<path d="M12 7.2c-1.9-1.4-7.6-.6-7.6 5.5S9.5 20 12 19c2.5 1 7.6-.2 7.6-6.3S13.9 5.8 12 7.2z"/><path d="M12 7.2c-.2-1.7.4-2.9 1.9-3.6"/><path d="M8.4 11.4l1.5 1.7H7.9zM15.6 11.4l-1.5 1.7h2z"/><path d="M8.6 15.6l1.7-.9 1.7.9 1.7-.9 1.7.9"/>',
  lucia:'<path d="M12 3c1.7 1.9 2.1 3.1 2.1 4a2.1 2.1 0 0 1-4.2 0c0-.9.4-2.1 2.1-4z"/><rect x="9.6" y="10.6" width="4.8" height="9.6" rx="1"/><path d="M6.8 20.2h10.4"/>',
  xmas:'<path d="M12 3l3.6 4.8h-1.9l3.4 4.4h-2.2l3.3 4.6H5.8l3.3-4.6H6.9l3.4-4.4H8.4z"/><path d="M12 16.8v3.7"/>',
  ny:'<path d="M12 2.8v4.4M12 12.8v4.4M4.8 10h4.4M14.8 10h4.4M6.9 4.9 10 8M14 12l3.1 3.1M17.1 4.9 14 8M10 12l-3.1 3.1"/><path d="M12 17.2c0 1.8-.9 2.9-2.4 3.8"/>'};
const festOf=h=>h&&FESTK[h[1]]||"";
const holOn=n=>holidays(ymd(n)[0]).find(h=>h[0]===n)||null;
const isRed=n=>{if(wdOf(n)===6)return true;const h=holOn(n);return !!(h&&h[3])};

