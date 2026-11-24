/* Checks the date maths with known answers. Run: node tests/features.js */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const A=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';fs.readFile(path.join(A,u),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(u)]||'application/octet-stream'});r.end(d)})}).listen(0);
let fails=0;const norm=v=>JSON.stringify(v);const check=(name,got,want)=>{const ok=norm(got)===norm(want);if(!ok)fails++;console.log(ok?'ok  ':'FAIL',name,ok?'':`got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));
const b=await chromium.launch({executablePath:process.env.CHROME||undefined});const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await c.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com\/firebasejs/,r=>r.abort());await p.addInitScript(()=>{try{localStorage.setItem('kalenderkoll.me','a')}catch(e){}});
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
// Birthdays
check('age and next birthday',await ev(()=>{const b={id:'t',n:'A',md:'02-29',y:2000,ty:'b'},s=bdNext(b,dn('2027-01-10'));return[nd(s),bdAge(b,s)]}),['2027-02-28',27]);
// .ics export keeps repeats, skips and times
check('ics export',await ev(()=>{const t=icsText([{id:'r1',n:'Kör; test',d:'2026-11-17',e:'',t:'18:00',t2:'19:30',r:'2w',u:'2027-01-31',skip:['2026-12-01'],pl:'Kyrkan',o:'',w:'g'}],[{id:'b',n:'Maya',md:'04-13',y:1997,ty:'b'}]);return['DTSTART:20261117T180000','DTEND:20261117T193000','RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=20270131T235959','EXDATE:20261201T180000','SUMMARY:Kör\\; test','SUMMARY:Maya har födelsedag','DTSTART;VALUE=DATE:19970413'].map(x=>t.includes(x))}),[true,true,true,true,true,true,true]);
// The month on the whole screen
check('big month',await (async()=>{await ev(()=>{for(let i=1;i<=6;i++)saveEv({id:'fs'+i,n:'Sak '+i,d:'2026-11-12',t:'1'+i+':00',r:'o',w:'g'});go('k');if(KV!=='month'){KV='month'}P={y:2026,m:10};render()});
  await ev(()=>{if(typeof closeCS==='function'&&document.getElementById('cs').classList.contains('on'))document.getElementById('cs').classList.remove('on');document.getElementById('k_fs').click()});await p.waitForTimeout(350);const a=await ev(()=>{const c=document.getElementById('k_cal').getBoundingClientRect(),d=[...document.querySelectorAll('#k_gr [data-cday]')].find(x=>+x.dataset.cday===dn('2026-11-12')),em=d.querySelector('.cev em');return[document.body.classList.contains('calfs'),Math.round(c.top)<=0&&Math.round(c.height)>=840,d.querySelectorAll('.cev u:not([style*="display: none"])').length+(em?+em.textContent.slice(1):0)]});
  await ev(()=>document.querySelector('#k_gr [data-cday]:nth-child(20)').click());await p.waitForTimeout(300);const ds=await ev(()=>document.getElementById('ds').classList.contains('on'));
  await ev(()=>history.back());await p.waitForTimeout(300);await ev(()=>history.back());await p.waitForTimeout(300);const b2=await ev(()=>[document.getElementById('ds').classList.contains('on'),document.body.classList.contains('calfs')]);
  await ev(()=>{for(let i=1;i<=6;i++)EV=EV.filter(e=>e.id!=='fs'+i);render()});return[...a,ds,...b2]})(),[true,true,6,true,false,false]);
await b.close();srv.close();console.log(fails?fails+' failed':'all passed');process.exit(fails?1:0)})();
