/* Checks the date maths with known answers. Run: node tests/features.js */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const A=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';fs.readFile(path.join(A,u),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(u)]||'application/octet-stream'});r.end(d)})}).listen(0);
let fails=0;const norm=v=>JSON.stringify(v);const check=(name,got,want)=>{const ok=norm(got)===norm(want);if(!ok)fails++;console.log(ok?'ok  ':'FAIL',name,ok?'':`got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));
const b=await chromium.launch({executablePath:process.env.CHROME||undefined});const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await c.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await p.addInitScript(()=>{try{localStorage.setItem('kalenderkoll.welcome','1')}catch(e){}});
await p.goto('http://localhost:'+srv.address().port+'/');await p.waitForTimeout(900);const ev=(f,a)=>p.evaluate(f,a);
const days=(e,a,b)=>ev(([e,a,b])=>occ({skip:[],e:"",u:"",...e},dn(a),dn(b)).map(nd),[e,a,b]);
// Repeats
check('monthly on the 31st falls back in short months',await days({d:'2027-01-31',r:'m'},'2027-01-01','2027-05-31'),['2027-01-31','2027-02-28','2027-03-31','2027-04-30','2027-05-31']);
check('yearly on 29 Feb',await days({d:'2028-02-29',r:'y'},'2028-01-01','2032-12-31'),['2028-02-29','2029-02-28','2030-02-28','2031-02-28','2032-02-29']);
check('weekdays skip the weekend',await days({d:'2026-11-13',r:'wd'},'2026-11-13','2026-11-18'),['2026-11-13','2026-11-16','2026-11-17','2026-11-18']);
check('every other week',await days({d:'2026-11-02',r:'2w'},'2026-11-01','2026-12-31'),['2026-11-02','2026-11-16','2026-11-30','2026-12-14','2026-12-28']);
check('repeat until and skipped day',await days({d:'2026-11-01',r:'d',u:'2026-11-05',skip:['2026-11-03']},'2026-10-01','2026-12-01'),['2026-11-01','2026-11-02','2026-11-04','2026-11-05']);
check('a 3-day event touching the range',await days({d:'2026-11-10',e:'2026-11-12',r:'o'},'2026-11-12','2026-11-20'),['2026-11-10']);
check('weekly event that started years ago',await days({d:'2020-01-06',r:'w'},'2026-11-16','2026-11-22'),['2026-11-16']);
// Week numbers (ISO 8601)
check('week numbers',await ev(()=>['2026-01-01','2026-11-14','2026-12-31','2027-01-01','2027-01-04','2020-12-31'].map(x=>isoWeek(dn(x)))),[1,46,53,53,1,53]);
// Swedish public holidays
const hol=y=>ev(y=>holidays(y).filter(h=>h[3]).map(h=>nd(h[0])+' '+h[1]),y);
check('red days 2026',await hol(2026),['2026-01-01 Nyårsdagen','2026-01-06 Trettondedag jul','2026-04-03 Långfredagen','2026-04-05 Påskdagen','2026-04-06 Annandag påsk','2026-05-01 Första maj','2026-05-14 Kristi himmelsfärdsdag','2026-05-24 Pingstdagen','2026-06-06 Sveriges nationaldag','2026-06-20 Midsommardagen','2026-10-31 Alla helgons dag','2026-12-25 Juldagen','2026-12-26 Annandag jul']);
check('Easter and Midsummer 2027',await ev(()=>{const h=holidays(2027);const f=n=>nd(h.find(x=>x[1]===n)[0]);return[f('Påskdagen'),f('Midsommarafton'),f('Alla helgons dag'),f('Kristi himmelsfärdsdag')]}),['2027-03-28','2027-06-25','2027-11-06','2027-05-06']);
check('bridge days 2026',await ev(()=>bridges(2026).map(nd)),['2026-01-02','2026-01-05','2026-05-15']);
// Birthdays
check('age and next birthday',await ev(()=>{const b={id:'t',n:'A',md:'02-29',y:2000,ty:'b'},s=bdNext(b,dn('2027-01-10'));return[nd(s),bdAge(b,s)]}),['2027-02-28',27]);
// Reminder time for an all-day event the day before
check('all-day reminder the day before at 08',await ev(()=>{const o={e:{t:'',rem:1440},s:dn('2026-12-24'),end:dn('2026-12-24')};const d=new Date(remAt(o));return[d.getDate(),d.getHours()]}),[23,8]);
// .ics round trip keeps repeats, skips and times
check('ics round trip',await ev(()=>{const e={id:'r1',n:'Kör; test, ok',d:'2026-11-17',e:'',t:'18:00',t2:'19:30',r:'2w',u:'2027-01-31',skip:['2026-12-01'],c:'l',pl:'Kyrkan',o:'Rad 1\nRad 2',rem:60,cd:false};const x=icsToEv(icsParse(icsText([e],[]))[0]);return[x.n,x.d,x.t,x.t2,x.r,x.u,x.skip,x.pl,x.o,x.rem]}),['Kör; test, ok','2026-11-17','18:00','19:30','2w','2027-01-31',['2026-12-01'],'Kyrkan','Rad 1\nRad 2',60]);
await b.close();srv.close();console.log(fails?fails+' failed':'all passed');process.exit(fails?1:0)})();
