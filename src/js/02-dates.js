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
/* Small drawings for each celebration, used as decoration behind the day and on its banner. */
const FESTA={
 hallo:'<path d="M6 13c3-3.200 6-2.200 8 0 1-2 3-2 4 0 2-2.200 5-3.200 8 0-3 0-4 2-5 4.200-2-1.200-3-.2-5 2-2-2.200-3-3.200-5-2-1-2.200-2-4.200-5-4.200z" fill="#3a2a5c"/><circle cx="53" cy="11" r="6" fill="#ffe08a"/><circle cx="50.500" cy="9.500" r="5" fill="none"/><ellipse cx="32" cy="40" rx="21" ry="16" fill="#f07d1c"/><ellipse cx="21" cy="40" rx="11" ry="15" fill="#ff9838"/><ellipse cx="43" cy="40" rx="11" ry="15" fill="#ff9838"/><ellipse cx="32" cy="40" rx="9" ry="16" fill="#ffad55"/><path d="M30 25c0-4.500 1.200-7.500 5.500-8.500l1.500 3c-2.200 1-2.800 3-2.800 5.500z" fill="#5f7f2c"/><path d="M22 35l5 6.500h-9.500zM42 35l4.500 6.500H37z" fill="#3a1d0c"/><path d="M19 46l4.300 3 4.300-3 4.400 3 4.400-3 4.300 3 4.300-3-3.200 7.500H22.200z" fill="#3a1d0c"/>',
 xmas:'<circle cx="9" cy="14" r="1.800" fill="#fff"/><circle cx="55" cy="22" r="1.800" fill="#fff"/><circle cx="12" cy="40" r="1.400" fill="#fff"/><circle cx="53" cy="46" r="1.400" fill="#fff"/><path d="M32 9l10 14h-5l9 12.500h-6L50 50H14l10-14.500h-6L27 23h-5z" fill="#2f9460"/><path d="M32 9l5 7-5 2.500-5-2.500zM24 30l8 3 8-3 3 4-11 4-11-4z" fill="#3fae74"/><rect x="29" y="50" width="6" height="7" rx="1" fill="#8a5632"/><path d="M32 2.500l1.900 3.900 4.300.6-3.100 3 .7 4.300-3.800-2-3.800 2 .7-4.300-3.100-3 4.300-.6z" fill="#ffd24a"/><circle cx="28" cy="27" r="2.300" fill="#e8404f"/><circle cx="37" cy="33.500" r="2.300" fill="#ffd24a"/><circle cx="25.500" cy="43" r="2.300" fill="#ffd24a"/><circle cx="39.500" cy="44.500" r="2.300" fill="#e8404f"/><circle cx="32" cy="40" r="2" fill="#8fcdf2"/>',
 easter:'<path d="M9 54c4-10 3-22-1-34M9 40c-3-3-5-4-8-4M8.500 30c3-3 5-4 8-4" fill="none" stroke="#9a6b3f" stroke-width="1.800" stroke-linecap="round"/><ellipse cx="2.500" cy="35" rx="3.500" ry="2" fill="#f7a8c4"/><ellipse cx="17.500" cy="25.500" rx="3.500" ry="2" fill="#8fcdf2"/><ellipse cx="8" cy="18" rx="2" ry="3.500" fill="#ffd84d"/><path d="M36 10c9.500 0 17 13 17 26a17 17 0 0 1-34 0c0-13 7.500-26 17-26z" fill="#ffd84d"/><path d="M19.300 32l5.600 4.500 5.500-4.500 5.600 4.500 5.600-4.500 5.500 4.500 5.600-4.500.3 6-5.900 4.800-5.500-4.500-5.600 4.500-5.600-4.500-5.500 4.500-5.800-4.700z" fill="#f7a8c4"/><circle cx="30" cy="21" r="2.500" fill="#8fcdf2"/><circle cx="41" cy="21" r="2.500" fill="#b79cf2"/><circle cx="36" cy="48" r="2.500" fill="#8fcdf2"/><circle cx="27" cy="46" r="1.800" fill="#fff"/><circle cx="45" cy="46" r="1.800" fill="#fff"/><ellipse cx="55" cy="52" rx="5.500" ry="7.500" fill="#b79cf2"/><path d="M49.800 51l2.600 2 2.600-2 2.600 2 2.600-2" fill="none" stroke="#fff" stroke-width="1.400"/>',
 mids:'<path d="M32 3l5 8H27z" fill="#3f9a48"/><rect x="30.500" y="9" width="3" height="50" rx="1.500" fill="#3f9a48"/><rect x="15" y="19" width="34" height="3" rx="1.500" fill="#3f9a48"/><circle cx="20" cy="29.500" r="6" fill="none" stroke="#4fae58" stroke-width="2.800"/><circle cx="44" cy="29.500" r="6" fill="none" stroke="#4fae58" stroke-width="2.800"/><circle cx="20" cy="23.500" r="2" fill="#ffd84d"/><circle cx="14.300" cy="31.500" r="2" fill="#5aa9e6"/><circle cx="25.200" cy="33" r="2" fill="#fff"/><circle cx="44" cy="23.500" r="2" fill="#5aa9e6"/><circle cx="38.500" cy="32" r="2" fill="#fff"/><circle cx="49.600" cy="32" r="2" fill="#ffd84d"/><circle cx="32" cy="15.500" r="2.400" fill="#ffd84d"/><circle cx="32" cy="27" r="2" fill="#fff"/><circle cx="32" cy="38" r="2.200" fill="#5aa9e6"/><circle cx="32" cy="48" r="2" fill="#ffd84d"/><path d="M10 59c2-5 5-7 8-7M54 59c-2-5-5-7-8-7" fill="none" stroke="#4fae58" stroke-width="2" stroke-linecap="round"/><circle cx="18.500" cy="51.500" r="2.200" fill="#f7a8c4"/><circle cx="45.500" cy="51.500" r="2.200" fill="#f7a8c4"/>',
 lucia:'<circle cx="32" cy="20" r="19" fill="#ffd87a" opacity=".35"/><g fill="#fffdf6" stroke="#ecd9b0" stroke-width=".8"><rect x="10" y="32" width="4.500" height="16" rx="1"/><rect x="20" y="27" width="4.500" height="21" rx="1"/><rect x="29.800" y="23" width="4.500" height="25" rx="1"/><rect x="39.500" y="27" width="4.500" height="21" rx="1"/><rect x="49.500" y="32" width="4.500" height="16" rx="1"/></g><g fill="#ffa826"><path d="M12.200 22.500c2 2.300 2.600 3.800 2.600 5a2.600 2.600 0 0 1-5.200 0c0-1.200.6-2.700 2.600-5z"/><path d="M22.200 17.500c2 2.300 2.600 3.800 2.600 5a2.600 2.600 0 0 1-5.200 0c0-1.200.6-2.700 2.600-5z"/><path d="M32 13.500c2 2.300 2.600 3.800 2.600 5a2.600 2.600 0 0 1-5.200 0c0-1.200.6-2.700 2.600-5z"/><path d="M41.800 17.500c2 2.300 2.600 3.800 2.600 5a2.600 2.600 0 0 1-5.200 0c0-1.200.6-2.700 2.600-5z"/><path d="M51.800 22.500c2 2.300 2.600 3.800 2.600 5a2.600 2.600 0 0 1-5.200 0c0-1.200.6-2.700 2.600-5z"/></g><ellipse cx="32" cy="50" rx="26" ry="7.500" fill="#3f8f4a"/><ellipse cx="32" cy="48.500" rx="24" ry="5.500" fill="#57ab62"/><circle cx="14" cy="51" r="1.800" fill="#e8404f"/><circle cx="26" cy="54" r="1.800" fill="#e8404f"/><circle cx="40" cy="54" r="1.800" fill="#e8404f"/><circle cx="51" cy="51" r="1.800" fill="#e8404f"/>',
 ny:'<g fill="none" stroke-linecap="round"><path d="M23 5v9M23 31v9M5.500 22.500h9M31.500 22.500h9M10.600 10.100l6.400 6.400M29 28.500l6.400 6.400M35.400 10.100 29 16.500M17 28.500l-6.400 6.400" stroke="#ffd76a" stroke-width="2.600"/><path d="M45 29v6M45 46v6M33.500 40.500h6M50.500 40.500h6M36.900 32.400l4.200 4.200M48.900 44.400l4.200 4.200M53.100 32.400l-4.200 4.200M41.100 44.400l-4.200 4.200" stroke="#ff9ec7" stroke-width="2.300"/><path d="M52 8v4M52 16v4M46 14h4M54 14h4" stroke="#8fcdf2" stroke-width="1.800"/></g><circle cx="23" cy="22.500" r="2.200" fill="#fff"/><circle cx="45" cy="40.500" r="1.800" fill="#fff"/><circle cx="12" cy="50" r="1.800" fill="#ffd76a"/><circle cx="27" cy="56" r="1.500" fill="#8fcdf2"/><circle cx="58" cy="26" r="1.500" fill="#ffd76a"/><circle cx="8" cy="42" r="1.200" fill="#fff"/>'};
const festArt=k=>`<svg viewBox="0 0 64 64" aria-hidden="true">${FESTA[k]}</svg>`;
const festOf=h=>h&&FESTK[h[1]]||"";
const holsOn=n=>holidays(ymd(n)[0]).filter(h=>h[0]===n);
/* When two fall on the same date (Halloween and All Saints' Day some years), the celebration is the one shown. */
const holOn=n=>{const L=holsOn(n);return L.find(h=>FESTK[h[1]])||L[0]||null};
const isRed=n=>wdOf(n)===6||holsOn(n).some(h=>h[3]);

