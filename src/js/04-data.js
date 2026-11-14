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
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const relDay=n=>{const d=n-todayN();return d===0?tx("Idag","Today"):d===1?tx("Imorgon","Tomorrow"):d===-1?tx("Igår","Yesterday"):cap(fmtDay(n))};
const inDays=d=>d===0?tx("idag","today"):d===1?tx("imorgon","tomorrow"):d<0?tx(`för ${-d} dagar sedan`,`${-d} days ago`):tx(`om ${d} dagar`,`in ${d} days`);
const tmin=s=>{if(!s)return -1;const[h,m]=s.split(":").map(Number);return h*60+m};
const fmtT=s=>s||"";

/* ---------- Events ----------
   {id, n: title, d: start date, e: last date (several days, optional), t/t2: start and end time ("" = all day),
    r: repeat o|d|wd|w|2w|m|y, u: repeat until (optional), skip: dates left out, c: category, pl: place, o: note,
    rem: minutes before to remind (-1 = none), cd: show in Countdown} */
let EV=[],BD=[],exampleMode=false;
const REPS=[["o","Aldrig","Never"],["d","Varje dag","Every day"],["wd","Vardagar","Weekdays"],["w","Varje vecka","Every week"],["2w","Varannan vecka","Every other week"],["m","Varje månad","Every month"],["y","Varje år","Every year"]];
const repName=r=>{const x=REPS.find(z=>z[0]===r)||REPS[0];return x[1+li()]};
const evDur=e=>e.e?Math.max(0,dn(e.e)-dn(e.d)):0;
/* Start days of every time an event happens that touches the days A..B. */
function occ(e,A,B){const s0=dn(e.d),dur=evDur(e),U=e.u?dn(e.u):Infinity,lo=A-dur,hi=Math.min(B,U),out=[],sk=e.skip&&e.skip.length?new Set(e.skip):null;
  if(hi<s0)return out;const push=s=>{if(s>=lo&&s<=hi&&s>=s0&&!(sk&&sk.has(nd(s))))out.push(s)};const r=e.r||"o";
  if(r==="o")push(s0);
  else if(r==="d"||r==="wd"){for(let s=Math.max(s0,lo);s<=hi;s++){if(r==="wd"&&wdOf(s)>4)continue;push(s)}}
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
  const L=[[dnOf(y,0,1),"Nyårsdagen","New Year's Day",1],[dnOf(y,0,5),"Trettondagsafton","Twelfth Night",0],[dnOf(y,0,6),"Trettondedag jul","Epiphany",1],[E-2,"Långfredagen","Good Friday",1],[E-1,"Påskafton","Easter Eve",0],[E,"Påskdagen","Easter Sunday",1],[E+1,"Annandag påsk","Easter Monday",1],[dnOf(y,3,30),"Valborgsmässoafton","Walpurgis Night",0],[dnOf(y,4,1),"Första maj","May Day",1],[E+39,"Kristi himmelsfärdsdag","Ascension Day",1],[E+49,"Pingstdagen","Whit Sunday",1],[dnOf(y,5,6),"Sveriges nationaldag","National Day of Sweden",1],[fri(5,19),"Midsommarafton","Midsummer Eve",0],[sat(5,20),"Midsommardagen","Midsummer Day",1],[sat(9,31),"Alla helgons dag","All Saints' Day",1],[dnOf(y,11,24),"Julafton","Christmas Eve",0],[dnOf(y,11,25),"Juldagen","Christmas Day",1],[dnOf(y,11,26),"Annandag jul","Boxing Day",1],[dnOf(y,11,31),"Nyårsafton","New Year's Eve",0]];
  return HOLC[y]=L.sort((a,b)=>a[0]-b[0])}
const holOn=n=>holidays(ymd(n)[0]).find(h=>h[0]===n)||null;
const isRed=n=>{if(wdOf(n)===6)return true;const h=holOn(n);return !!(h&&h[3])};
const EVES=["Midsommarafton","Julafton","Nyårsafton"];
const offDay=n=>wdOf(n)>4||isRed(n)||(()=>{const h=holOn(n);return !!(h&&EVES.includes(h[1]))})();
/* A bridge day: a weekday squeezed between a day off and a weekend or another day off. */
function bridges(y){const out=[];for(let n=dnOf(y,0,1);n<=dnOf(y,11,31);n++){if(offDay(n))continue;if(offDay(n-1)&&offDay(n+1)&&(holOn(n-1)||holOn(n+1)))out.push(n)}return out}

/* ---------- Saving ---------- */
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const PEND=new Map();
function later(key,fn,ms){const old=PEND.get(key);if(old)clearTimeout(old.t);const e={fn,t:setTimeout(()=>{PEND.delete(key);fn()},ms)};PEND.set(key,e)}
function flushSaves(){PEND.forEach(e=>{clearTimeout(e.t);e.fn()});PEND.clear()}
addEventListener("pagehide",flushSaves);addEventListener("beforeunload",flushSaves);document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSaves()});
const evDoc=e=>({kind:"ev",id:e.id,n:e.n,d:e.d,e:e.e||"",t:e.t||"",t2:e.t2||"",r:e.r||"o",u:e.u||"",skip:e.skip||[],c:e.c||"o",pl:e.pl||"",o:e.o||"",rem:typeof e.rem==="number"?e.rem:-1,cd:!!e.cd});
const bdDoc=b=>({kind:"bd",id:b.id,n:b.n,md:b.md,y:b.y||0,ty:b.ty||"b"});
function saveEv(e){leaveExample();const i=EV.findIndex(z=>z.id===e.id);if(i>=0)EV[i]=e;else EV.push(e);if(col)col.doc("ev_"+e.id).set(evDoc(e)).catch(()=>toast(t("tFail")))}
function dropEv(e){leaveExample();EV=EV.filter(z=>z.id!==e.id);if(col)col.doc("ev_"+e.id).delete().catch(()=>{})}
function saveBd(b){leaveExample();const i=BD.findIndex(z=>z.id===b.id);if(i>=0)BD[i]=b;else BD.push(b);if(col)col.doc("bd_"+b.id).set(bdDoc(b)).catch(()=>toast(t("tFail")))}
function dropBd(b){leaveExample();BD=BD.filter(z=>z.id!==b.id);if(col)col.doc("bd_"+b.id).delete().catch(()=>{})}
/* The example becomes your own calendar the moment you change something in it. */
function leaveExample(){if(!exampleMode)return;exampleMode=false;if(!col)return;histMute++;try{col.doc("started").set({kind:"started"}).catch(()=>{});EV.forEach(e=>col.doc("ev_"+e.id).set(evDoc(e)).catch(()=>{}));BD.forEach(b=>col.doc("bd_"+b.id).set(bdDoc(b)).catch(()=>{}))}finally{histMute--}}
const hasData=()=>!exampleMode&&(EV.length>0||BD.length>0);

/* ---------- The example: a believable week around today ---------- */
function seedExample(){const n=todayN(),wd=wdOf(n),mon=n-wd,sv=!li(),I=x=>nd(x),[y,m]=ymd(n),md=x=>{const[,mm,dd]=ymd(x);return pad(mm+1)+"-"+pad(dd)};
  const nextWd=k=>{let s=mon+k;if(s<n)s+=7;return s};
  EV=[
    {id:"x1",n:sv?"Teammöte":"Team meeting",d:I(mon),t:"09:00",t2:"09:30",r:"wd",c:"w",pl:sv?"Konferensrum Ek":"Room Oak",rem:10},
    {id:"x2",n:sv?"Gym":"Gym",d:I(nextWd(1)),t:"18:00",t2:"19:00",r:"w",c:"p",rem:-1},
    {id:"x3",n:sv?"Fika med Sara":"Coffee with Sara",d:I(n+1),t:"15:00",t2:"16:00",r:"o",c:"l",pl:sv?"Café Saturnus":"Café Saturnus",rem:60},
    {id:"x4",n:sv?"Tandläkare":"Dentist",d:I(n+3),t:"10:30",t2:"11:15",r:"o",c:"p",rem:1440,o:sv?"Ta med frikortet.":"Bring the card."},
    {id:"x5",n:sv?"Lönedag":"Payday",d:y+"-"+pad(m+1)+"-25",r:"m",c:"o",rem:-1},
    {id:"x6",n:sv?"Städa":"Cleaning",d:I(nextWd(5)),t:"10:00",t2:"11:00",r:"2w",c:"h",rem:-1},
    {id:"x7",n:sv?"Föräldramöte":"Parents' evening",d:I(n+9),t:"18:30",t2:"20:00",r:"o",c:"f",pl:sv?"Skolan":"The school",rem:60},
    {id:"x8",n:sv?"Konsert":"Concert",d:I(n+23),t:"19:30",r:"o",c:"l",cd:true,rem:1440},
    {id:"x9",n:sv?"Fjällresa":"Mountain trip",d:I(n+52),e:I(n+57),r:"o",c:"l",cd:true,rem:-1}
  ].map(e=>({e:"",t:"",t2:"",u:"",skip:[],pl:"",o:"",...e}));
  BD=[{id:"b1",n:sv?"Mamma":"Mum",md:md(n+12),y:y-61,ty:"b"},{id:"b2",n:"Erik",md:md(n+40),y:y-8,ty:"b"},{id:"b3",n:sv?"Bröllopsdag":"Wedding day",md:md(n+70),y:y-6,ty:"a"},{id:"b4",n:"Lina",md:md(n+150),y:0,ty:"b"}];
  exampleMode=true}
