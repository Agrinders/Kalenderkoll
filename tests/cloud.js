/* Two phones sharing one calendar through a stand-in for Firebase. Run: node tests/cloud.js
   The stand-in keeps the shared data in this test's server, so separate browsers see the same calendar. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const A=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
let STORE={},writes=0;const ACC={};
const srv=http.createServer((q,r)=>{
  if(q.url.startsWith('/__acc')){let b='';q.on('data',c=>b+=c);q.on('end',()=>{const{op,email,pw,uid}=JSON.parse(b);let o;if(op==='up'){if(ACC[email])o={err:'auth/email-already-in-use'};else{ACC[email]={pw,uid};o={uid}}}else{const a=ACC[email];o=a&&a.pw===pw?{uid:a.uid}:{err:'auth/invalid-credential'}}r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify(o))});return}
  if(q.url.startsWith('/__fs')){if(q.method==='GET'){r.writeHead(200,{'content-type':'application/json'});return r.end(JSON.stringify({v:writes,s:STORE}))}
    let b='';q.on('data',c=>b+=c);q.on('end',()=>{const{op,path:p,data}=JSON.parse(b);if(p.split('/')[1].length<20){r.writeHead(403);return r.end()}if(op==='set')STORE[p]=data;else if(op==='update')STORE[p]={...STORE[p],...data};else delete STORE[p];writes++;r.writeHead(200);r.end('{}')});return}
  let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';fs.readFile(path.join(A,u),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(u)]||'application/octet-stream'});r.end(d)})}).listen(0);
const FAKE={
'firebase-app.js':`export function initializeApp(c){return{c}}`,
'firebase-auth.js':`export function getAuth(a){return{a,user:null,ls:[]}}
export function onAuthStateChanged(au,cb){au.ls.push(cb);if(au.user)setTimeout(()=>cb(au.user),0);return()=>{au.ls=au.ls.filter(f=>f!==cb)}}
export async function signInAnonymously(au){let id=localStorage.getItem('fakeuid');if(!id){id='u'+Math.random().toString(36).slice(2,10);localStorage.setItem('fakeuid',id)}au.user={uid:id};au.cur=au.user;au.ls.forEach(f=>f(au.user));return{user:au.user}}
const acc=async(op,d)=>{const r=await fetch(location.origin+'/__acc',{method:'POST',body:JSON.stringify({op,...d})});const j=await r.json();if(j.err){const e=new Error(j.err);e.code=j.err;throw e}return j};
export const EmailAuthProvider={credential:(email,pw)=>({email,pw})};
export async function linkWithCredential(u,c){await acc('up',{email:c.email,pw:c.pw,uid:u.uid});u.email=c.email;return{user:u}}
export async function signInWithEmailAndPassword(au,email,pw){const j=await acc('in',{email,pw});localStorage.setItem('fakeuid',j.uid);au.user={uid:j.uid,email};return{user:au.user}}
export async function sendPasswordResetEmail(){}`,
'firebase-firestore.js':`const B=location.origin+'/__fs';
export const persistentLocalCache=o=>o,persistentMultipleTabManager=()=>({});
export function initializeFirestore(app){return{app}}export function getFirestore(app){return{app}}
export const collection=(f,...s)=>({path:s.join('/')}),doc=(f,...s)=>({path:s.join('/')});
const send=(op,p,data)=>fetch(B,{method:'POST',body:JSON.stringify({op,path:p,data})}).then(r=>{if(!r.ok)throw new Error('denied')});
export const setDoc=(r,d)=>send('set',r.path,d),updateDoc=(r,d)=>send('update',r.path,d),deleteDoc=r=>send('del',r.path);
const list=(s,p)=>Object.keys(s).filter(k=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')).sort().map(k=>({id:k.slice(p.length+1),data:()=>JSON.parse(JSON.stringify(s[k]))}));
export async function getDocs(c){const j=await (await fetch(B)).json();const d=list(j.s,c.path);return{docs:d,size:d.length,empty:!d.length}}
export function onSnapshot(c,cb){let last=-1,on=true;const tick=async()=>{if(!on)return;try{const j=await (await fetch(B)).json();if(j.v!==last){last=j.v;const d=list(j.s,c.path);cb({docs:d,size:d.length,empty:!d.length,metadata:{fromCache:false}})}}catch(e){}setTimeout(tick,150)};tick();return()=>{on=false}}`};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));const base='http://localhost:'+srv.address().port+'/';
const b=await chromium.launch({executablePath:process.env.CHROME||undefined});let fails=0;const errs=[];
/* Notes: a tap while writing only closes the keyboard, so tests first leave the field like a person would. */
const tap=async(pg,q)=>{await pg.evaluate(()=>{const a=document.activeElement;if(a&&a.blur)a.blur()});await pg.click(q)};
const phone=async(cloud=true)=>{const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await c.newPage();p.setDefaultTimeout(6000);if(process.env.SLOW){const cd=await c.newCDPSession(p);await cd.send('Emulation.setCPUThrottlingRate',{rate:+process.env.SLOW})}p.on('pageerror',e=>errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await p.route(/www\.gstatic\.com\/firebasejs\/[\d.]+\/(firebase-[a-z]+\.js)/,r=>{if(!cloud)return r.abort();const f=r.request().url().match(/(firebase-[a-z]+\.js)/)[1];r.fulfill({contentType:'text/javascript',headers:{'access-control-allow-origin':'*'},body:FAKE[f]})});return p};
const step=async(n,f)=>{try{const r=await f();console.log('ok  ',n,r===undefined?'':JSON.stringify(r))}catch(e){fails++;console.log('FAIL',n,e.message.split('\n')[0])}};
const w=(p,m=300)=>p.waitForTimeout(m),need=(c,m)=>{if(!c)throw new Error(m)};
const waitFor=async(p,fn,arg,ms=5000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return true;await w(p,150)}return false};

const A1=await phone();let invite='';
await step('phone 1 starts in the cloud with a new calendar',async()=>{await A1.goto(base);await waitFor(A1,()=>KK.mode!=='starting');await waitFor(A1,()=>cs.classList.contains('on'));const r=await A1.evaluate(()=>[KK.mode,KK.space().length,!!KK.uid,cs.classList.contains('on')]);need(r[0]==='cloud'&&r[1]>=20&&r[2]&&r[3],'start '+r);return r});
await step('phone 1 sets names and adds an event',async()=>{await A1.fill('#cs_a','Alex');await A1.click('#cs_ok');await w(A1,500);await A1.evaluate(()=>go('k'));await A1.click('#tadd');await w(A1);await A1.fill('#es_n','Middag ihop');await A1.click('#es_ok');await w(A1,600);
  const sp=await A1.evaluate(()=>KK.space());const keys=Object.keys(STORE).filter(k=>k.includes(sp));need(keys.some(k=>k.endsWith('/couple'))&&keys.some(k=>k.includes('/ev_')),'not in the cloud '+keys);return[keys.length,STORE['spaces/'+sp+'/cal/couple'].ua?'claimed':'unclaimed']});
await step('phone 1 invite card and link',async()=>{await A1.evaluate(()=>go('v'));await w(A1);const r=await A1.evaluate(()=>[!!document.querySelector('#v_share'),v_inv.textContent.slice(0,40),KK.inviteUrl()]);invite=r[2];need(r[0]&&/#join=/.test(r[2]),'invite '+r);return r.slice(0,2)});
await step('the invite opens the share sheet or copies the link',async()=>{await A1.evaluate(()=>{navigator.share=async d=>{window.__shared=d}});await A1.click('#v_share');await w(A1);const d=await A1.evaluate(()=>window.__shared);need(d&&d.url===invite,'share '+JSON.stringify(d));return d.text});
const B1=await phone();
await step('phone 2 opens the link and picks their name',async()=>{await B1.goto(invite);await waitFor(B1,()=>KK.mode==='cloud');need(await waitFor(B1,()=>cs.classList.contains('on')),'not asked for a name');const opts=await B1.evaluate(()=>[cs_t.textContent,cs_p.textContent,cs_s.classList.contains('hide')]);await B1.fill('#cs_a','Maya');await B1.click('#cs_ok');await w(B1,600);
  const r=await B1.evaluate(()=>[location.hash,KK.space()===KK.inviteUrl().split('#join=')[1],ME,EV.some(e=>e.n==='Middag ihop'),h_hi.textContent]);need(!r[0]&&r[2]==='b'&&r[3],'join '+JSON.stringify(r));return[opts,...r]});
await step('both are in',async()=>{need(await waitFor(A1,()=>joined()),'phone 1 does not see phone 2 joined');need(await waitFor(B1,()=>joined()),'phone 2');return await A1.evaluate(()=>v_inv.textContent.slice(0,30))});
await step('phone 1 is told phone 2 joined, phone 2 is not told',async()=>{need(await waitFor(A1,()=>/gått med|has joined/.test(toasts.textContent)),'no join notice');const b=await B1.evaluate(()=>/gått med|has joined/.test(toasts.textContent));need(!b,'phone 2 got a notice');return A1.evaluate(()=>toasts.textContent.slice(0,50))});
await step('top bar stays at the top when scrolled',async()=>{await A1.evaluate(()=>go('k'));await w(A1);await A1.evaluate(()=>scrollTo(0,400));await w(A1,200);const r=await A1.evaluate(()=>[main_top.getBoundingClientRect().top,getComputedStyle(main_top).position,scrollY]);need(r[0]===0&&r[1]==='fixed','bar '+r);await A1.evaluate(()=>{go('v');scrollTo(0,0)});await w(A1);return r});
await step('a task from phone 2 shows on phone 1',async()=>{await B1.evaluate(()=>go('t'));await B1.fill('#t_q','Köp blommor');await B1.click('#t_add');need(await waitFor(A1,()=>TODOS.some(x=>x.n==='Köp blommor')),'not synced');return true});
await step('a note from phone 1 shows on phone 2',async()=>{await A1.click('#v_ladd');await w(A1);await A1.fill('#ns_tx','Hej ♥');await A1.click('#ns_ok');need(await waitFor(B1,()=>NOTES.some(x=>x.txt==='Hej ♥'&&x.f==='a')),'note');return true});
await step('opening the link again on phone 1 changes nothing',async()=>{await A1.goto(invite);await waitFor(A1,()=>KK.mode==='cloud');await w(A1,600);return A1.evaluate(()=>[ME,sc.classList.contains('on'),modal.classList.contains('on')])});
const C1=await phone();
await step('old data on a phone is moved up to the cloud',async()=>{await C1.goto(base);await C1.evaluate(()=>{localStorage.setItem('kalenderkoll.data.v1',JSON.stringify({cal:{couple:{kind:'couple',a:'Kim',b:'Lo',ua:'',ub:'',since:''},ev_old:{kind:'ev',id:'old',n:'Gammal händelse',d:'2026-11-20',e:'',t:'',t2:'',r:'o',u:'',skip:[],pl:'',o:'',w:'g'}}}));localStorage.setItem('kalenderkoll.me','a')});await C1.reload();await waitFor(C1,()=>KK.mode==='cloud');await w(C1,800);
  const sp=await C1.evaluate(()=>KK.space());const r=[!!STORE['spaces/'+sp+'/cal/ev_old'],await C1.evaluate(()=>localStorage.getItem('kalenderkoll.data.v1')),await C1.evaluate(()=>EV.some(e=>e.n==='Gammal händelse'))];need(r[0]&&r[1]===null&&r[2],'migrate '+JSON.stringify(r));return r});
await step('joining with a pasted link asks first',async()=>{await C1.evaluate(()=>go('v'));await w(C1);await C1.click('[data-join]');await w(C1);await C1.fill('#js_in','hello');await C1.click('#js_ok');await w(C1,200);need(await C1.evaluate(()=>js.classList.contains('on')),'took a bad link');await C1.fill('#js_in','Here: '+invite);await C1.click('#js_ok');await w(C1);need(await C1.evaluate(()=>modal.classList.contains('on')),'did not ask');
  await Promise.all([C1.waitForNavigation(),C1.click('#m_yes')]);await waitFor(C1,()=>KK.mode==='cloud');need(await waitFor(C1,()=>EV.some(e=>e.n==='Middag ihop')),'not joined');return C1.evaluate(()=>[EV.some(e=>e.n==='Gammal händelse'),ME])});
const D1=await phone(false);
await step('without a connection it still works on the phone',async()=>{await D1.goto(base);await waitFor(D1,()=>KK.mode!=='starting');await waitFor(D1,()=>cs.classList.contains('on'));await D1.fill('#cs_a','A');await D1.click('#cs_ok');await w(D1);const r=await D1.evaluate(()=>[KK.mode,!!JSON.parse(localStorage.getItem('kalenderkoll.data.v1')||'{}').cal?.couple,(go('v'),v_inv.textContent.slice(0,25))]);need(r[0]==='local'&&r[1],'local '+r);return r});
await step('phone 1 gets a notice when phone 2 adds an event',async()=>{await A1.evaluate(()=>{toasts.innerHTML=''});await B1.evaluate(()=>go('k'));await B1.click('#tadd');await w(B1);await B1.fill('#es_n','Bio på fredag');await B1.click('#es_ok');need(await waitFor(A1,()=>/Maya lade till: Bio/.test(toasts.textContent)),'no notice');need(!(await B1.evaluate(()=>/lade till: Bio/.test(toasts.textContent))),'own notice');return A1.evaluate(()=>toasts.textContent.slice(0,60))});
await step('a repeating event uses repeat-until, not a several-day end',async()=>{await A1.evaluate(()=>go('k'));await A1.click('#tadd');await w(A1);await A1.fill('#es_n','Gym');await A1.click('#es_more');await A1.evaluate(()=>{es_e.value=nd(dn(es_d.value)+6);dpLabel(es_e)});await A1.click('#es_r [data-esr="w"]');await w(A1,100);const ui=await A1.evaluate(()=>[es_ew.classList.contains('hide'),es_u.value===nd(dn(es_d.value)+6),es_e.value]);await A1.click('#es_ok');await w(A1,500);const e=await A1.evaluate(()=>{const e=EV.find(z=>z.n==='Gym');return[e.e,e.u,between(dn(e.d),dn(e.d)+30).filter(o=>o.e.id===e.id).length]});need(ui[0]&&ui[1]&&!ui[2]&&!e[0]&&e[1]&&e[2]===1,'repeat '+JSON.stringify([ui,e]));return e});
await step('profile colour and view switch in the top bar',async()=>{const r=await A1.evaluate(()=>{const k=document.querySelector('#main_top #k_v');CP.ca='#ff8800';applyPeople();return[!!k&&!k.classList.contains('hide'),getComputedStyle(document.documentElement).getPropertyValue('--pa').trim()]});await A1.evaluate(()=>go('h'));const h=await A1.evaluate(()=>k_v.classList.contains('hide'));need(r[0]&&r[1]==='#ff8800'&&h,'bar '+r+h);return r});
await step('notes: write, to-do list, link, picture; partner sees it',async()=>{await A1.evaluate(()=>go('t'));await w(A1);await A1.click('#mm_new');await w(A1,400);
  await A1.fill('#mm_ti','Inför resan');await tap(A1,'#mm_body .mb-p textarea');await A1.keyboard.type('Kom ihåg:');await A1.keyboard.press('Enter');await A1.click('#mm_chk');await A1.click('[data-lk="c"]');await A1.keyboard.type('Pass');await A1.keyboard.press('Enter');await A1.keyboard.type('Laddare');await tap(A1,'#mm_body .mb-c .mbck');
  await A1.click('#mm_lnk');await A1.keyboard.type('www.sj.se');await A1.keyboard.press('Enter');await w(A1,200);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR42mP8z8Dwn4GBgYGJgYGBAQAqHgIBkYBrNQAAAABJRU5ErkJggg==','base64');
  await A1.setInputFiles('#mm_in',{name:'a.png',mimeType:'image/png',buffer:png});await w(A1,800);await A1.click('#mm_back');await w(A1,900);
  const m=await A1.evaluate(()=>MEMOS.find(x=>x.ti==='Inför resan'));need(m,'not saved');const types=m.bl.map(b=>b.t).join('');
  need(/p/.test(types)&&m.bl.filter(b=>b.t==='c').length===2&&m.bl.find(b=>b.t==='c'&&b.d)&&m.bl.find(b=>b.t==='l'&&b.u==='https://www.sj.se')&&m.bl.find(b=>b.t==='i'),'blocks '+JSON.stringify(m.bl.map(b=>[b.t,b.x||b.u||b.i,b.d])));
  need(await waitFor(B1,()=>MEMOS.some(x=>x.ti==='Inför resan')&&Object.keys(MIMG).length>0),'partner does not see it');
  const empty=await A1.evaluate(async()=>{const n=MEMOS.length;document.getElementById('mm_new').click();await new Promise(r=>setTimeout(r,400));document.getElementById('mm_back').click();await new Promise(r=>setTimeout(r,500));return MEMOS.length===n});need(empty,'empty note was kept');
  return types});
await step('notes: headings, colour and named lists',async()=>{await A1.evaluate(()=>go('t'));await A1.click('#mm_new');await w(A1,400);await A1.fill('#mm_ti','Helgen');
  await tap(A1,'#mm_body .mb-p textarea');await A1.keyboard.type('Lördag');await A1.click('#mm_aa');await A1.click('[data-sub="s"]');await A1.click('[data-fs="h2"]');await A1.click('[data-fk="r"]');await A1.click('#mm_aa');await tap(A1,'#mm_body .mb-h2 textarea');await A1.keyboard.press('End');await A1.keyboard.press('Enter');await A1.keyboard.type('Sovmorgon');
  await A1.click('#mm_chk');await A1.click('[data-lk="named"]');await A1.keyboard.type('Handla');await A1.keyboard.press('Enter');await A1.keyboard.type('Mjölk');await A1.keyboard.press('Enter');await A1.keyboard.type('Ägg');
  await tap(A1,'#mm_body .mb-c .mbck');await w(A1,100);const pr=await A1.evaluate(()=>document.querySelector('#mm_body .mb-lh em').textContent);
  await A1.click('#mm_back');await w(A1,900);const m=await A1.evaluate(()=>MEMOS.find(x=>x.ti==='Helgen'));need(m,'not saved');
  const h=m.bl.find(b=>b.s==='h2'),lh=m.bl.find(b=>b.t==='lh'),cs=m.bl.filter(b=>b.t==='c');
  need(h&&h.x==='Lördag'&&h.k==='r'&&m.bl.some(b=>b.t==='p'&&!b.s&&b.x==='Sovmorgon')&&lh&&lh.x==='Handla'&&cs.length===2&&cs[0].d&&pr==='1/2','fmt '+JSON.stringify([pr,m.bl]));return pr});
await step('notes: symbols, fonts, numbered list, recently deleted',async()=>{await A1.evaluate(()=>go('t'));await A1.click('#mm_new');await w(A1,400);await A1.fill('#mm_ti','Att köpa');
  await A1.click('#mm_chk');await A1.click('[data-lk="c"]');await A1.keyboard.type('Bröd');await A1.keyboard.press('Enter');await A1.keyboard.type('Ost');
  await A1.click('#mm_sy');await A1.click('[data-sym="❤️"]');await A1.click('#mm_chk');await A1.click('[data-lk="n"]');await A1.click('#mm_aa');await A1.click('[data-sub="f"]');await A1.click('[data-ff="h"]');await w(A1,200);
  const mk=await A1.evaluate(()=>[...document.querySelectorAll('#mm_body .mb-c .mbmk')].map(x=>x.textContent).join(','));
  await A1.click('#mm_more');await A1.click('[data-sco="del"]');await w(A1,700);
  let m=await A1.evaluate(()=>MEMOS.find(x=>x.ti==='Att köpa'));need(m&&m.del,'not in recently deleted');need(m.bl.filter(b=>b.t==='c').every(b=>b.m==='n')&&m.bl.some(b=>b.x==='Ost❤️'&&b.f==='h'),'fmt '+JSON.stringify(m.bl));
  need(await A1.evaluate(()=>!document.querySelector('#t_memos .mml:not(.del) [data-memo]')||![...document.querySelectorAll('#t_memos .mml:not(.del) [data-memo] b')].some(b=>b.textContent==='Att köpa')),'still in the list');
  await A1.click('[data-mmtrash]');await A1.click('[data-mmback="'+m.id+'"]');await w(A1,500);m=await A1.evaluate(()=>MEMOS.find(x=>x.ti==='Att köpa'));need(m&&!m.del,'not restored');return mk});
await step('notes: both write at the same time and nothing is lost',async()=>{await A1.evaluate(()=>go('t'));await A1.click('#mm_new');await w(A1,400);await A1.fill('#mm_ti','Tillsammans');
  await tap(A1,'#mm_body .mb-p textarea');await A1.keyboard.type('Första raden');await A1.keyboard.press('Enter');await A1.click('#mm_chk');await A1.click('[data-lk="c"]');await A1.keyboard.type('Mjölk');await w(A1,1500);
  const id=await A1.evaluate(()=>MM.id);await B1.evaluate(()=>go('t'));need(await waitFor(B1,()=>MEMOS.some(m=>m.ti==='Tillsammans')),'B does not have it');
  await B1.click(`[data-memo="${id}"]`);await w(B1,500);
  /* Both add a point to the same list and change different lines, without waiting for each other. */
  await tap(A1,'#mm_body .mb-c input');await A1.keyboard.press('End');await A1.keyboard.press('Enter');await A1.keyboard.type('Bröd från A');
  await tap(B1,'#mm_body .mb-c input');await B1.keyboard.press('End');await B1.keyboard.press('Enter');await B1.keyboard.type('Ost från B');
  await tap(B1,'#mm_body .mb-p textarea');await B1.keyboard.press('Control+End');await B1.evaluate(()=>{const t=document.querySelector('#mm_body .mb-p textarea');t.setSelectionRange(t.value.length,t.value.length)});await B1.keyboard.type(' och B skrev här');
  await w(A1,3500);await w(B1,1500);
  const rd=pg=>pg.evaluate(()=>mmRead().map(b=>b.x||b.t));const ra=await rd(A1),rb=await rd(B1);
  const all=['Första raden och B skrev här','Mjölk','Bröd från A','Ost från B'];need(all.every(x=>ra.includes(x))&&all.every(x=>rb.includes(x)),'merge '+JSON.stringify([ra,rb]));
  const sv=await A1.evaluate(id=>MEMOS.find(m=>m.id===id).bl.map(b=>b.x),id);need(all.every(x=>sv.includes(x)),'saved '+JSON.stringify(sv));
  await B1.click('#mm_back');await w(B1,400);
  /* A dash at the start of a text line carries on as a list. */
  await tap(A1,'#mm_body .mb-p:last-child textarea');await A1.keyboard.type('- ett');await A1.keyboard.press('Enter');await A1.keyboard.type('två');const tv=await A1.evaluate(()=>[...document.querySelectorAll('#mm_body .mb-p textarea')].map(t=>t.value).find(v=>v.includes('ett')));
  need(tv==='- ett\n- två','dash list '+JSON.stringify(tv));await A1.click('#mm_back');await w(A1,500);return ra});
await step('notes: a named list folds on this phone only',async()=>{const id=await A1.evaluate(()=>MEMOS.find(m=>m.ti==='Helgen').id);await A1.evaluate(()=>go('t'));await A1.click(`[data-memo="${id}"]`);await w(A1,400);
  await tap(A1,'#mm_body .mb-lh .mbfold');await w(A1,800);const vis=await A1.evaluate(()=>[...document.querySelectorAll('#mm_body .mb-c')].filter(c=>c.offsetHeight).length);
  await A1.click('#mm_back');await w(A1,400);await A1.click(`[data-memo="${id}"]`);await w(A1,400);const still=await A1.evaluate(()=>document.querySelector('#mm_body .mb-lh').classList.contains('fold'));
  await tap(A1,'#mm_body .mb-lh .mbfold');await w(A1,200);const vis2=await A1.evaluate(()=>[...document.querySelectorAll('#mm_body .mb-c')].filter(c=>c.offsetHeight).length);await A1.click('#mm_back');await w(A1,400);
  need(vis===0&&still&&vis2===2,'fold '+[vis,still,vis2]);return[vis,still,vis2]});
await step('notes: drag a point, drag a whole list, sort, search',async()=>{await A1.evaluate(()=>{const now=Date.now(),m={id:'dragx',ti:'Dra',bl:[{t:'lh',x:'Handla',b:'h1'},{t:'c',x:'Mjölk',d:true,b:'c1'},{t:'c',x:'Ägg',d:false,b:'c2'},{t:'c',x:'Bröd',d:false,b:'c3'},{t:'p',x:'',b:'gap'},{t:'lh',x:'Packa',b:'h2'},{t:'c',x:'Pass',d:false,b:'c4'},{t:'c',x:'Laddare',d:false,b:'c5'}],at:now,up:now,by:'a',ub:'a'};MEMOS.push(m);put('memo_dragx',memoDoc(m));go('t');openMM('dragx')});await w(A1,600);
  const names=()=>A1.evaluate(()=>[...document.querySelectorAll('#mm_body>.mb')].map(d=>(d.querySelector('input,textarea')||{}).value||d.dataset.t).filter(x=>x!==''));
  const slim=await A1.evaluate(()=>document.querySelector('#mm_body .mb-p').classList.contains('gapline'));
  const drag=async(from,to,dir)=>{const g=await A1.locator(from).boundingBox(),t2=await A1.locator(to).boundingBox();await A1.mouse.move(g.x+g.width/2,g.y+g.height/2);await A1.mouse.down();await A1.waitForTimeout(650);const ty=dir<0?t2.y+4:t2.y+t2.height-4;for(let i=1;i<=12;i++){await A1.mouse.move(g.x+g.width/2,g.y+g.height/2+(ty-(g.y+g.height/2))*i/12);await A1.waitForTimeout(16)}await A1.mouse.up();await A1.waitForTimeout(300)};
  await drag('[data-b="c3"] .mbgrip','[data-b="c1"]',-1);const n1=await names();
  await drag('[data-b="h2"] .mbgrip','[data-b="h1"]',-1);const n2=await names();
  await tap(A1,'#mm_body .mb-lh input');await A1.click('#mm_chk');await A1.click('[data-srt="az"]');await w(A1,300);const n3=await names();
  await A1.click('#mm_find');await A1.fill('#fd_q','ägg');await w(A1,200);const hits=await A1.evaluate(()=>[document.querySelectorAll('#mm_body .hit').length,fd_n.textContent]);await A1.click('#fd_x');
  await A1.click('#mm_back');await w(A1,900);const sv=await A1.evaluate(()=>MEMOS.find(m=>m.id==='dragx').bl.map(b=>b.x).filter(Boolean));
  need(slim,'gap not slim');need(n1.slice(0,4).join()==='Handla,Bröd,Mjölk,Ägg','drag point '+n1);need(n2[0]==='Packa'&&n2.indexOf('Handla')>n2.indexOf('Laddare'),'drag list '+n2);
  need(hits[0]===1&&hits[1]==='1 / 1','search '+hits);need(sv.join()===n3.filter(x=>x!=='p').join(),'saved '+JSON.stringify([sv,n3]));return[n1,n2,n3,hits]});
await step('notes: lists do not multiply, copies are removed, folding is remembered',async()=>{await A1.evaluate(()=>{const now=Date.now(),L=(n,p)=>[{t:'lh',x:n,b:p+'h'},{t:'c',x:n+'1',d:false,b:p+'1'},{t:'c',x:n+'2',d:false,b:p+'2'}];const m={id:'multi',ti:'Flytt',bl:[...L('Kök','k'),...L('Bad','b'),...L('Kök','x'),...L('Sov','s')],at:now,up:now,by:'a',ub:'a'};MEMOS.push(m);put('memo_multi',memoDoc(m));go('t')});await w(A1,500);
  need(await waitFor(B1,()=>MEMOS.some(m=>m.id==='multi')),'B lacks it');await B1.evaluate(()=>{go('t');openMM('multi')});await w(B1,1500);
  const cnt=pg=>pg.evaluate(()=>MEMOS.find(m=>m.id==='multi').bl.filter(b=>b.t==='lh').map(b=>b.x).join());
  need(await waitFor(A1,()=>MEMOS.find(m=>m.id==='multi').bl.filter(b=>b.t==='lh').length===3),'copy not removed '+await cnt(A1));
  for(let i=0;i<3;i++){await A1.evaluate(()=>openMM('multi'));await w(A1,400);await tap(A1,'#mm_body [data-b="b1"] input');await A1.keyboard.type('!');await w(A1,900);
    if(i===0){await tap(A1,'#mm_body [data-b="kh"] .mbfold');await w(A1,500)}
    if(i===1){const g=await A1.locator('[data-b="sh"] .mbgrip').boundingBox(),t2=await A1.locator('[data-b="bh"]').boundingBox();await A1.mouse.move(g.x+9,g.y+9);await A1.mouse.down();await A1.waitForTimeout(650);for(let k=1;k<=10;k++){await A1.mouse.move(g.x+9,g.y+9+(t2.y-g.y-9)*k/10);await A1.waitForTimeout(16)}await A1.mouse.up();await w(A1,900);}
    await A1.click('#mm_back');await w(A1,900);await B1.evaluate(()=>{const t=document.querySelector('#mm_body .mb-c input');t.focus();t.value+='.';t.dispatchEvent(new Event('input',{bubbles:true}))});await w(B1,1500)}
  await A1.evaluate(()=>openMM('multi'));await w(A1,500);const fold=await A1.evaluate(()=>document.querySelector('#mm_body .mb-lh').classList.contains('fold'));await A1.click('#mm_back');await B1.click('#mm_back');await w(A1,900);
  const a=await A1.evaluate(()=>MEMOS.find(m=>m.id==='multi').bl.filter(b=>b.t!=='p').map(b=>b.x)),bb=await B1.evaluate(()=>MEMOS.find(m=>m.id==='multi').bl.filter(b=>b.t!=='p').map(b=>b.x));
  need(a.length===9&&bb.length===9&&a.filter(x=>x==='Kök'||x==='Bad'||x==='Sov').join()==='Kök,Sov,Bad','grew '+JSON.stringify([a,bb]));need(fold,'fold forgotten');return a});
await step('notes: hold a list name to remove the list, with undo',async()=>{const clk=q=>A1.click(q);await A1.evaluate(()=>{go('t');openMM('multi')});await w(A1,500);const n0=await A1.evaluate(()=>document.querySelectorAll('#mm_body .mb-lh').length);
  const hold=async()=>{const L=A1.locator('#mm_body .mb-lh').last();await L.scrollIntoViewIfNeeded();await w(A1,150);const r=await L.boundingBox();await A1.mouse.move(r.x+80,r.y+r.height/2);await A1.mouse.down();await A1.waitForTimeout(1100);await A1.mouse.up();await waitFor(A1,()=>sc.classList.contains('on'));await w(A1,300)};
  await hold();await clk('[data-sco="del"]');await w(A1,300);const n1=await A1.evaluate(()=>document.querySelectorAll('#mm_body .mb-lh').length);await waitFor(A1,()=>!!document.querySelector('#toasts .tundo'));await A1.evaluate(()=>document.querySelector('#toasts .tundo').click());await w(A1,300);const n2=await A1.evaluate(()=>document.querySelectorAll('#mm_body .mb-lh').length);
  await hold();await clk('[data-sco="del"]');await w(A1,1200);await clk('#mm_back');await w(A1,900);const sv=await A1.evaluate(()=>MEMOS.find(m=>m.id==='multi').bl.filter(b=>b.t==='lh').length);
  await A1.evaluate(()=>openMM('multi'));await w(A1,500);for(let i=0;i<2;i++){await hold();await clk('[data-sco="del"]');await w(A1,400)}const blanks=await A1.evaluate(()=>[...document.querySelectorAll('#mm_body>.mb-p')].filter(x=>x.offsetHeight&&!x.querySelector('textarea').value).length);await clk('#mm_back');await w(A1,600);need(blanks<=1,'empty lines '+blanks);
  need(n1===n0-1&&n2===n0&&sv===n0-1,'hold '+[n0,n1,n2,sv]);return[n0,n1,n2,sv]});
await step('the top bar shows Offline without internet',async()=>{await A1.evaluate(()=>go('h'));await A1.context().setOffline(true);await w(A1,300);const r=await A1.evaluate(()=>[sync.hidden,sync.className,sync.textContent]);await A1.context().setOffline(false);await w(A1,400);const r2=await A1.evaluate(()=>sync.className);need(!r[0]&&/off/.test(r[1])&&!/off/.test(r2),'sync '+JSON.stringify([r,r2]));return[r,r2]});
await step('notes: bold word, search and pin in the list; calendar search',async()=>{await A1.evaluate(()=>{go('t');openMM('multi')});await w(A1,500);
  await tap(A1,'#mm_body .mb-p textarea');await A1.keyboard.type('Ring hyresvärden idag');await A1.evaluate(()=>{const t=document.querySelector('#mm_body textarea:focus');t.setSelectionRange(5,16);t.dispatchEvent(new Event('select',{bubbles:true}))});
  await A1.click('#mm_aa');await A1.click('[data-wr="**"]');await A1.click('#mm_ti');await w(A1,300);
  const rich=await A1.evaluate(()=>{const d=[...document.querySelectorAll('#mm_body .mb-p')].find(x=>x.querySelector('textarea').value.includes('hyres'));return[d.querySelector('textarea').value,d.classList.contains('rich'),d.querySelector('.mbv .rb')?.textContent]});
  await A1.click('#mm_back');await w(A1,700);await A1.click('[data-mpin="multi"]');await w(A1,500);
  const first=await A1.evaluate(()=>document.querySelector('#mm_list .mmrow.pinned .mmi b').textContent+(document.querySelector('#mm_list .mmrow').classList.contains('pinned')?'📌':''));await A1.fill('#mm_q','hyresvärden');await w(A1,200);const hits=await A1.evaluate(()=>document.querySelectorAll('#mm_list .mml .mmi').length);await A1.fill('#mm_q','');
  await A1.evaluate(()=>go('k'));await A1.click('#k_cal .srchb');await A1.fill('#ss_q','middag');await w(A1,200);const ev=await A1.evaluate(()=>[...document.querySelectorAll('#ss_r .ssi b')].map(b=>b.textContent));await A1.click('#ss_r .ssi');await w(A1,500);const opened=await A1.evaluate(()=>es.classList.contains('on'));await A1.evaluate(()=>closeES());
  need(rich[0]==='Ring **hyresvärden** idag'&&rich[1]&&rich[2]==='hyresvärden','rich '+JSON.stringify(rich));need(/📌/.test(first),'pin '+first);need(hits===1,'search '+hits);need(ev.some(x=>/Middag/.test(x))&&opened,'event search '+JSON.stringify(ev));return[rich,first,hits,ev]});
await step('notes: descriptions and costs on list points, with a total',async()=>{await A1.evaluate(()=>{const now=Date.now(),m={id:'cost',ti:'Möbler',bl:[{t:'lh',x:'Vardagsrum',b:'h'},{t:'c',x:'Soffa',d:false,b:'a'},{t:'c',x:'Matta',d:false,b:'b'}],at:now,up:now,by:'a',ub:'a'};MEMOS.push(m);put('memo_cost',memoDoc(m));go('t');openMM('cost')});await w(A1,500);
  await tap(A1,'#mm_body [data-b="a"] form input');await A1.click('#mm_chk');await A1.click('[data-flag="op"]');await A1.click('[data-flag="od"]');await w(A1,200);await A1.click('#mm_chk');
  await A1.fill('#mm_body [data-b="a"] .mbpr','4 995');await A1.fill('#mm_body [data-b="b"] .mbpr','1200,50');await tap(A1,'#mm_body [data-b="a"] form input');await A1.fill('#mm_body [data-b="a"] .mbds','Grå, tre sits');await tap(A1,'#mm_body [data-b="b"] .mbck');await A1.click('#mm_ti');await w(A1,300);
  const tot=await A1.evaluate(()=>[document.querySelector('#mm_body .mbtot b').textContent,document.querySelector('#mm_body .mb-lh .mbsum').textContent]);await A1.click('#mm_back');await w(A1,800);
  const sv=await A1.evaluate(()=>MEMOS.find(m=>m.id==='cost').bl.map(b=>[b.t,b.x,b.pr,b.ds,b.op,b.od]));
  need(/6\s?195,5 kr/.test(tot[0])&&/4\s?995 kr kvar/.test(tot[0])&&sv[0][4]===1&&sv[0][5]===1&&sv[1][2]===4995&&sv[2][2]===1200.5&&sv[1][3]==='Grå, tre sits','cost '+JSON.stringify([tot,sv]));return tot});
await step('notes: a tap elsewhere while writing only closes the keyboard',async()=>{await A1.evaluate(()=>{go('t');openMM('cost')});await w(A1,500);
  await A1.click('#mm_body [data-b="a"] form input');const f1=await A1.evaluate(()=>document.activeElement.closest('.mb')?.dataset.b);
  await A1.click('#mm_body [data-b="b"] form input');const f2=await A1.evaluate(()=>document.activeElement.tagName);
  await A1.click('#mm_body [data-b="b"] form input');const f3=await A1.evaluate(()=>document.activeElement.closest('.mb')?.dataset.b);await A1.click('#mm_back');await w(A1,500);
  need(f1==='a'&&f2==='BODY'&&f3==='b','focus '+[f1,f2,f3]);return[f1,f2,f3]});
await step('private notes: only the writer sees them; sharing and making private again',async()=>{const ck=async q=>{try{await A1.click(q,{timeout:4000})}catch(e){console.log('CK',q,await A1.evaluate(q=>{const e=document.querySelector(q);if(!e)return'missing';const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return[r.x,r.y,r.width,r.height,t?t.tagName+'#'+t.id+'.'+t.className:'none']},q));throw e}};await A1.evaluate(()=>{go('t');scrollTo(0,9999)});await w(A1,300);
  need(await A1.evaluate(()=>!$('mm_newp').classList.contains('hide')),'no private button');await ck('#mm_newp');await w(A1,400);await A1.fill('#mm_ti','Julklapp till Maya');await tap(A1,'#mm_body .mb-p textarea');await A1.keyboard.type('Halsband från stan');await w(A1,1200);await ck('#mm_back');await w(A1,900);
  const a=await A1.evaluate(()=>{const m=MEMOS.find(x=>x.ti==='Julklapp till Maya');return[!!m,m&&m.priv,!!document.querySelector('#mm_list .mmrow.priv'),Object.keys(DOCS).some(k=>DOCS[k].ti==='Julklapp till Maya'),Object.keys(PDOCS).length>0]});
  await w(B1,800);const b=await B1.evaluate(()=>MEMOS.some(x=>x.ti==='Julklapp till Maya'));
  const SPACE=await B1.evaluate(()=>KK.space()),inShared=Object.entries(STORE).some(([k,v])=>k.startsWith('spaces/'+SPACE)&&JSON.stringify(v).includes('Julklapp'));
  const id=await A1.evaluate(()=>MEMOS.find(x=>x.ti==='Julklapp till Maya').id);await ck(`[data-memo="${id}"]`);await w(A1,500);await ck('#mm_pv');await ck('#m_yes');await w(A1,900);
  const b2=await waitFor(B1,()=>MEMOS.some(x=>x.ti==='Julklapp till Maya'));await ck('#mm_pv');await ck('#m_yes');await w(A1,900);await ck('#mm_back');
  const b3=await waitFor(B1,()=>!MEMOS.some(x=>x.ti==='Julklapp till Maya'));
  need(a[0]&&a[1]&&a[2]&&!a[3]&&a[4]&&!b&&!inShared,'private '+JSON.stringify([a,b,inShared]));need(b2,'sharing did not reach B');need(b3,'making private did not hide it from B');return[a,b,b2,b3]});
await step('notes: the bottom bar only opens the keyboard for something new to write',async()=>{await A1.evaluate(()=>{go('t');openMM('cost')});await w(A1,500);
  const kb=()=>A1.evaluate(()=>{const a=document.activeElement;return !!(a&&a.closest&&a.closest('#mm_w')&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'))});
  await tap(A1,'#mm_body [data-b="a"] form input');await A1.evaluate(()=>document.activeElement.blur());
  await A1.click('#mm_aa');await A1.click('[data-fk="g"]');const k1=await kb();await A1.click('#mm_sy');await A1.click('[data-sym="❤️"]');const k2=await kb();
  await A1.click('#mm_chk');await A1.click('[data-lk="b"]');const k3=await kb();
  await A1.click('#mm_chk');await A1.click('[data-lk="named"]');const k4=await kb();await A1.click('#mm_back');await w(A1,600);
  need(!k1&&!k2&&!k3&&k4,'keyboard '+[k1,k2,k3,k4]);return[k1,k2,k3,k4]});
await step('notes: who ticked, who is writing, and a notice when the partner changes a list',async()=>{await A1.evaluate(()=>{const now=Date.now(),m={id:'tog',ti:'Inför resan',bl:[{t:'lh',x:'Packa',b:'h'},{t:'c',x:'Pass',d:false,b:'c1'},{t:'c',x:'Laddare',d:false,b:'c2'}],at:now,up:now,by:'a',ub:'a'};MEMOS.push(m);put('memo_tog',memoDoc(m));go('t')});
  need(await waitFor(B1,()=>MEMOS.some(m=>m.id==='tog')),'B did not get it');await B1.evaluate(()=>{go('t');openMM('tog')});await w(B1,500);await B1.click('#mm_body [data-b="c1"] .mbck');await w(B1,1300);
  need(await waitFor(A1,()=>{const m=MEMOS.find(x=>x.id==='tog');const b=m&&m.bl.find(x=>x.x==='Pass');return b&&b.d&&b.db==='b'&&b.dt>0}),'A does not know who ticked');
  await A1.evaluate(()=>openMM('tog'));await w(A1,500);const badge=await A1.evaluate(()=>{const d=[...document.querySelectorAll('#mm_body .mb-c')].find(x=>x.querySelector('form input').value==='Pass');const w=d&&d.querySelector('.mbwho');return w&&w.textContent});
  await A1.click('#mm_body .mbwho');const tt=await A1.evaluate(()=>toasts.textContent);
  await tap(B1,'#mm_body [data-b="c2"] form input');await B1.keyboard.press('End');await B1.keyboard.type(' och kabel');
  const typ=await waitFor(A1,()=>!!document.querySelector('#mm_meta .mmtyp'),6000);await w(B1,1200);
  await A1.click('#mm_back');await w(A1,500);
  await B1.evaluate(()=>{const L=[...document.querySelectorAll('#mm_body .mb-c')];const last=L[L.length-1];mmInsert({t:'c',x:'Solkräm',d:false},last,false)});await w(B1,300);await B1.evaluate(()=>{const d=[...document.querySelectorAll('#mm_body .mb-c')].find(x=>x.querySelector('form input').value==='Solkräm');d.querySelector('form input').value='Solkräm';mmChanged()});await w(B1,1400);
  const pend=await waitFor(A1,()=>Object.values(LPEND).some(p=>p.add>=1),6000);const msg=await A1.evaluate(()=>{listTell();return toasts.textContent});
  need(badge==='M','badge '+badge);need(/Maya bockade av den/.test(tt),'toast '+tt);need(typ,'no "skriver" shown');need(pend&&/Maya lade till/.test(msg)&&/Inför resan/.test(msg),'notice '+msg);
  await B1.click('#mm_back');return[badge,typ,msg.slice(0,80)]});
await step('notes: tags filter the list; duplicate as a template',async()=>{await A1.evaluate(()=>{go('t');openMM('tog')});await w(A1,500);
  await A1.click('#mm_tg [data-tgadd]');await w(A1,250);await A1.keyboard.type('resa');await A1.keyboard.press('Enter');await A1.keyboard.press('Escape');await w(A1,400);
  const t1=await A1.evaluate(()=>[MM.m.tags,[...document.querySelectorAll('#mm_tg .tgc')].map(x=>x.textContent)]);
  const okB=await waitFor(B1,()=>{const m=MEMOS.find(x=>x.id==='tog');return m&&m.tags&&m.tags[0]==='resa'});if(!okB)console.log('DBG',JSON.stringify(t1),await A1.evaluate(()=>[JSON.stringify(MEMOS.find(x=>x.id==='tog').tags),JSON.stringify(DOCS['memo_tog'].tags),MM.dirty]),await B1.evaluate(()=>JSON.stringify(MEMOS.find(x=>x.id==='tog').tags)));need(okB,'B did not get the tag');
  await A1.click('#mm_more');await A1.click('#sc_o [data-sco="dup"]');await w(A1,300);await A1.click('#sc_o [data-sco="tpl"]');await w(A1,900);
  const d=await A1.evaluate(()=>{const m=MEMOS.find(x=>x.id===MM.id);return[MM.id!=='tog',m&&m.ti,m&&m.bl.filter(b=>b.t==='c').map(b=>b.d).join(),m&&(m.tags||[]).join(),new Set(m.bl.map(b=>b.b)).size===m.bl.length,MEMOS.find(x=>x.id==='tog').bl.filter(b=>b.t==='c'&&b.d).length]});
  await A1.click('#mm_back');await w(A1,600);await A1.evaluate(()=>{const m=MEMOS.find(x=>x.ti==='Inför resan'&&x.tags&&x.id!=='tog');m.tags=[];put('memo_'+m.id,memoDoc(m));renderMemos()});await w(A1,300);
  await A1.click('#mm_tagf [data-tgf="resa"]');await w(A1,200);const vis=await A1.evaluate(()=>[...document.querySelectorAll('#mm_list .mmrow')].filter(r=>!r.hidden).map(r=>r.querySelector('.mmit b').textContent));
  await A1.click('#mm_tagf [data-tgf=""]');
  need(t1[0].join()==='resa'&&/resa/.test(t1[1][0]),'tag '+JSON.stringify(t1));need(d[0]&&d[1]==='Inför resan'&&!/true/.test(d[2])&&d[3]==='resa'&&d[4]&&d[5]>=1,'dup '+JSON.stringify(d));if(vis.length!==1)console.log('DBG2',await A1.evaluate(()=>JSON.stringify(MEMOS.filter(m=>!m.del).map(m=>[m.id,m.ti,m.tags]))));need(vis.length===1&&vis[0]==='Inför resan','filter '+JSON.stringify(vis));return[t1[0],d.slice(1,4),vis]});
await step('notes: the bottom bar puts the keyboard away; a tap beside a menu only closes it',async()=>{await A1.evaluate(()=>{go('t');openMM('cost')});await w(A1,500);
  const kb=()=>A1.evaluate(()=>{const a=document.activeElement;return !!(a&&a.closest&&a.closest('#mm_w')&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'))});
  await tap(A1,'#mm_body [data-b="a"] form input');const k0=await kb();await A1.click('#mm_aa');const k1=await kb();await A1.click('[data-fk="b"]');const k2=await kb();const col=await A1.evaluate(()=>document.querySelector('#mm_body [data-b="a"]').dataset.k);
  await A1.click('#mm_aa');const k3=await kb();
  await tap(A1,'#mm_body [data-b="a"] form input');await A1.click('#mm_chk');const k4=await kb();const done0=await A1.evaluate(()=>document.querySelector('#mm_body [data-b="b"]').classList.contains('done'));
  await A1.click('#mm_ti');await w(A1,200);const r=await A1.evaluate(()=>[document.getElementById('mm_lst').hidden,document.querySelector('#mm_body [data-b="b"]').classList.contains('done')]);const k5=await kb();
  await A1.evaluate(()=>{const ta=document.querySelector('#mm_body .mb-p textarea');ta.value='Köp mjölk idag';ta.focus();ta.setSelectionRange(4,9);ta.dispatchEvent(new Event('select',{bubbles:true}))});
  await A1.click('#mm_aa');const s1=await A1.evaluate(()=>{const ta=document.activeElement;return ta.tagName==='TEXTAREA'&&ta.selectionStart===4&&ta.selectionEnd===9});
  await A1.click('#mm_fmt [data-fk="r"]');const s2=await A1.evaluate(()=>{const ta=document.activeElement;return[ta.value,ta.value.slice(ta.selectionStart,ta.selectionEnd),!document.getElementById('mm_fmt').hidden]});await A1.click('#mm_aa');
  await A1.click('#mm_aa');await A1.click('#mm_body [data-b="b"] form input');await w(A1,150);await A1.click('#mm_body [data-b="b"] form input');const t1=await A1.evaluate(()=>[!document.getElementById('mm_fmt').hidden,document.querySelector('#mm_body .mmtgt')?.dataset.b,document.activeElement.tagName,document.querySelector('#mm_body [data-b="b"]').classList.contains('done')]);
    await A1.click('#mm_fmt [data-fk="g"]');const t2=await A1.evaluate(()=>document.querySelector('#mm_body [data-b="b"]').dataset.k);await A1.click('#mm_aa');
  need(t1[0]&&t1[2]==='INPUT','tap a line with a menu open '+t1);
  await A1.evaluate(()=>{const i=document.querySelector('#mm_body [data-b="b"] form input');i.focus();i.setSelectionRange(0,3)});await w(A1,100);await A1.evaluate(()=>{const i=document.activeElement;i.setSelectionRange(3,3)});
  await A1.click('#mm_aa');await A1.click('#mm_fmt [data-wr="**"]');const t3=await A1.evaluate(()=>{const i=document.activeElement;return[i.value,i.value.slice(i.selectionStart,i.selectionEnd),!!document.querySelector('#mm_body [data-b="b"] .mbio .rb')]});await A1.click('#mm_aa');
  need(/^\*\*...\*\*/.test(t3[0])&&t3[1].length===3&&t3[2],'bold on marked words in a list point '+t3);need(t2==='g','colour on the tapped line '+t2);
  await A1.click('#mm_back');await w(A1,500);need(s1,'selection lost at Aa');need(s2[0]==='Köp {r|mjölk} idag'&&s2[1]==='mjölk'&&s2[2],'colour on selection '+s2);
  need(k0&&!k1&&!k2&&!k3&&!k4&&!k5,'keyboard '+[k0,k1,k2,k3,k4,k5]);need(col==='b','colour '+col);need(r[0]&&r[1]===done0,'menu '+r);return[k0,k1,k2,k3,k4,k5,col,r]});
await step('a reinstalled phone gets everything back from a backup file',async()=>{const bk=await A1.evaluate(()=>backupText());const D1=await phone();await D1.goto(base);await waitFor(D1,()=>KK.mode!=='starting');await waitFor(D1,()=>cs.classList.contains('on'));
  need(await D1.evaluate(()=>!cs_rs.classList.contains('hide')),'no restore button on the welcome sheet');
  await D1.setInputFiles('#bk_in',{name:'Kalenderkoll-sakerhetskopia.json',mimeType:'application/json',buffer:Buffer.from(bk)});await w(D1);need(await D1.evaluate(()=>modal.classList.contains('on')),'did not ask');
  await Promise.all([D1.waitForNavigation(),D1.click('#m_yes')]);await waitFor(D1,()=>KK.mode==='cloud');need(await waitFor(D1,()=>EV.some(e=>e.n==='Middag ihop')),'events not back');
  const sa=await A1.evaluate(()=>KK.space());const r=await D1.evaluate(()=>[KK.space(),ME,cs.classList.contains('on'),CP.a]);need(r[0]===sa&&r[1]==='a'&&!r[2],'restore '+JSON.stringify(r));return r.slice(1)});
await step('a phone left without a place after a reinstall can take its name back',async()=>{need(await waitFor(A1,()=>sc.classList.contains('on')),'phone 1 was not asked');const o=await A1.evaluate(()=>[...sc_o.querySelectorAll('[data-sco]')].map(b=>b.textContent));await A1.click('#sc_o [data-sco="a"]');await w(A1,400);const r=await A1.evaluate(()=>[ME,CP.ua===MYID]);need(r[0]==='a'&&r[1],'who '+r);return[o,r]});
await step('an account brings the calendar back on a newly installed phone',async()=>{await B1.evaluate(()=>{go('c')});await w(B1);await B1.click('[data-acc="up"]');await B1.fill('#as_e','maya@example.com');await B1.fill('#as_w','hemligt1');await B1.click('#as_ok');need(await waitFor(B1,()=>KK.email==='maya@example.com'&&/Inloggad som/.test(c_acc.textContent)),'not created');
  const E1=await phone();await E1.goto(base);await waitFor(E1,()=>KK.mode==='cloud');await waitFor(E1,()=>cs.classList.contains('on'));await E1.click('#cs_li');await E1.fill('#as_e','maya@example.com');await E1.fill('#as_w','fel-losen');await E1.click('#as_ok');need(await waitFor(E1,()=>/Fel e-post/.test(toasts.textContent)),'wrong password accepted');
  await E1.fill('#as_w','hemligt1');await Promise.all([E1.waitForNavigation(),E1.click('#as_ok')]);await waitFor(E1,()=>KK.mode==='cloud');need(await waitFor(E1,()=>EV.some(e=>e.n==='Middag ihop')&&ME==='b'),'calendar not back');
  const sb=await B1.evaluate(()=>KK.space());const r=await E1.evaluate(()=>[KK.space(),ME,CP.b,cs.classList.contains('on'),sc.classList.contains('on')]);need(r[0]===sb&&r[1]==='b'&&!r[3]&&!r[4],'account '+JSON.stringify(r));return r.slice(1)});
console.log(errs.length?'PAGE ERRORS: '+errs.join(' | '):'no page errors');if(errs.length)fails++;
await b.close();srv.close();console.log(fails?fails+' failed':'all passed');process.exit(fails?1:0)})();
