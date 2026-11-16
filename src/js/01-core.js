const $=id=>document.getElementById(id);
/* Settings follow the shared "plan" record, except the theme, which each phone keeps for itself. */
const S={lang:"sv",theme:"auto",wkno:true,hol:true};
let NOW=new Date(),col=null,tab="h",allIds=[];
const LOCAL=!!window.KK_LOCAL;
/* Shared between the two of you: the Claude version always, the installed version when Firebase is reachable. */
const SHARED=()=>!LOCAL||!!(window.KK&&KK.mode==="cloud");
/* The shared version of the app, for inviting each other. */
const ART_URL="https://claude.ai/artifact/8vDeWGtrcxYDKvrjkKX1cj";
const MNS=[["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],["January","February","March","April","May","June","July","August","September","October","November","December"]];
const DSH=[["Mån","Tis","Ons","Tor","Fre","Lör","Sön"],["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]];
const li=()=>S.lang==="sv"?0:1,mn=i=>MNS[li()][i],loc=()=>S.lang==="sv"?"sv-SE":"en-GB",tx=(a,b)=>li()?b:a,dshort=i=>DSH[li()][i];
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const T={nH:["Idag","Today"],nK:["Kalender","Calendar"],nT:["Att göra","To do"],nV:["Vi","Us"],ttlH:["Idag","Today"],ttlK:["Kalender","Calendar"],ttlT:["Att göra","To do"],ttlV:["Vi två","The two of us"],ttlC:["Inställningar","Settings"],ttlO:["Om Kalenderkoll","About Kalenderkoll"]};
const t=k=>T[k][li()];

/* The two of you: a and b, and g for things you do together. ua/ub tie a name to a signed-in person. */
let CP={a:"",b:"",ua:"",ub:"",since:"",ca:"",cb:""},ME="",MYID="";
try{const m=localStorage.getItem("kalenderkoll.me");if(m==="a"||m==="b")ME=m}catch(e){}
const other=w=>w==="a"?"b":"a",me=()=>ME||"a";
const pname=w=>w==="g"?tx("Båda","Both"):(CP[w]||(w==="a"?tx("Du","You"):tx("Din partner","Your partner")));
const initial=w=>(pname(w).trim()[0]||"?").toUpperCase();
const pvar=w=>w==="a"?"var(--pa)":w==="b"?"var(--pb)":"var(--pg)";
/* Profile pictures (small, saved with the calendar) and each person's own colour. */
let PICS={a:"",b:""};
const okPic=s=>typeof s==="string"&&s.length<90000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
const ava1=(w,sz)=>`<i class="ava${sz?" "+sz:""}${PICS[w]?" pic":""}" style="--p:${pvar(w)}${PICS[w]?`;--img:var(--pic${w})`:""}">${esc(initial(w))}</i>`;
const ava=(w,sz)=>w==="g"?`<span class="ava2">${ava1("a")}${ava1("b")}</span>`:ava1(w,sz);
function applyPeople(){const r=document.documentElement.style;for(const w of["a","b"]){const c=CP["c"+w];if(/^#[0-9a-f]{6}$/i.test(c||""))r.setProperty("--p"+w,c);else r.removeProperty("--p"+w);if(PICS[w])r.setProperty("--pic"+w,`url("${PICS[w]}")`);else r.removeProperty("--pic"+w)}}
function setMe(w){ME=w;try{localStorage.setItem("kalenderkoll.me",w)}catch(e){}}
const RM=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
/* Icons for events and days: simple line drawings. */
const ICONS={heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  car:'<path d="M5 16.5V12l1.8-4.4A2 2 0 0 1 8.6 6.3h6.8a2 2 0 0 1 1.8 1.3L19 12v4.5"/><path d="M4 16.5h16v2H4zM5 12h14"/><circle cx="8" cy="15" r=".6"/><circle cx="16" cy="15" r=".6"/>',
  cake:'<path d="M4 20.5h16M5.5 20.5v-7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v7"/><path d="M5.5 15.5c1.6 1 2.6 1 4.1 0s2.6-1 4.1 0 2.6 1 4.1 0"/><path d="M12 11.5V8.3M12 3.8c1 1.1 1 2 0 2.8-1-.8-1-1.7 0-2.8z"/>',
  plane:'<path d="M10.5 13.5 4 11l1.5-1.5 7 1 4-4a2 2 0 0 1 3 3l-4 4 1 7L16 22l-2.5-6.5-3 3V21l-1.5 1-1-3.5L4.5 17.5 5.5 16h2.5z"/>',
  food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
  sport:'<path d="M6.5 8v8M17.5 8v8M4 10v4M20 10v4M6.5 12h11"/>',
  work:'<rect x="3.5" y="7" width="17" height="12.5" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  home:'<path d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M9.5 20.5v-5h5v5"/>',
  music:'<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  coffee:'<path d="M4.5 9h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.8M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>',
  gift:'<rect x="4" y="8.5" width="16" height="4" rx="1"/><path d="M5.5 12.5v8h13v-8M12 8.5v12M12 8.5S10.5 4 8.5 4.5 7 8.5 12 8.5zM12 8.5s1.5-4.5 3.5-4 1.5 4-3.5 4z"/>',
  star:'<path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/>',
  doctor:'<path d="M12 4.5v15M4.5 12h15"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon:'<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
  party:'<path d="m4 20 4.5-12 7.5 7.5z"/><path d="M14 4.5c.5 1.5-.5 2.5 1 3.5M18.5 9.5c1.5-.5 2.5.5 2-1M16.5 3.5v.01M20.5 5.5v.01M20 13v.01"/>'};
const icon=k=>ICONS[k]?`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`:"";
/* Effects a day can have around it. In day view, that day's events get it too. */
/* The three looks an event can have, and the short class used for its small labels. */
const stOf=e=>e.st==="glass"||e.st==="stripe"?e.st:"fill",stMini=e=>e.st==="glass"?"gl":e.st==="stripe"?"sp":"";
/* Reminder choices, in minutes before the start (-1 is none). */
const REMS=[-1,0,10,30,60,1440];
const FX=[["glow","Glöd","Glow"],["rainbow","Regnbåge","Rainbow"],["sparkle","Gnistor","Sparkle"],["hearts","Hjärtan","Hearts"]];
const fxCls=k=>FX.some(x=>x[0]===k)?" fx fx-"+k:"";
/* Event colours. Any colour works; these are the quick ones. */
const COLORS=["#a996f7","#7dd6b0","#82c3f5","#f5a3c7","#f8b98a","#f3d679","#f2928a","#9cc3a8","#c9c1bb"];
