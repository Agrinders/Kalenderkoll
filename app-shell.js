/* Storage for the installed app. The calendar is kept in Firebase so two phones share it.
   Each calendar has a long secret code (the "space"); the invite link carries it to the other phone.
   If Firebase cannot be reached at all, everything is kept on this phone and sent up the next time it can. */
(function(){
  const CFG={apiKey:"AIzaSyB8eRlAhEDJywi1MzBDC55-J1TwLLwqa0c",authDomain:"kalenderkoll.firebaseapp.com",projectId:"kalenderkoll",storageBucket:"kalenderkoll.firebasestorage.app",messagingSenderId:"1050992291700",appId:"1:1050992291700:web:9165f1d2364e1c3e618621"};
  const SDK="https://www.gstatic.com/firebasejs/13.3.0/";
  const KEY="kalenderkoll.data.v1",SKEY="kalenderkoll.space";
  const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
  const okCode=c=>typeof c==="string"&&/^[A-Za-z0-9_-]{20,64}$/.test(c);
  const newCode=()=>{const a="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",r=new Uint32Array(24);crypto.getRandomValues(r);return Array.from(r,x=>a[x%a.length]).join("")};
  /* A code from an invite link (…#join=CODE) or pasted on its own. */
  const codeIn=s=>{s=String(s||"").trim();const m=s.match(/join=([A-Za-z0-9_-]{20,64})/);return m?m[1]:okCode(s)?s:""};
  let joinCode="";{const c=codeIn(location.hash);if(c){joinCode=c;history.replaceState(history.state,"",location.pathname+location.search)}}
  let space=okCode(ls.get(SKEY))?ls.get(SKEY):"";

  /* On this phone only: the same shape as the shared storage, kept in the browser. */
  const read=()=>{try{return JSON.parse(ls.get(KEY)||"{}")||{}}catch(e){return{}}};
  let data=read();const fresh=()=>{data=read()},write=()=>ls.set(KEY,JSON.stringify(data));
  const subs={},copy=v=>JSON.parse(JSON.stringify(v));
  const snap=p=>{const m=data[p]||{},docs=Object.keys(m).sort().map(id=>({id,exists:true,data:()=>copy(m[id])}));return{docs,size:docs.length,empty:!docs.length}};
  const fire=p=>setTimeout(()=>(subs[p]||[]).forEach(f=>f(snap(p))),0);
  const localDb={collection:p=>({doc:id=>({id,set:async d=>{fresh();(data[p]=data[p]||{})[id]=copy(d);write();fire(p)},update:async d=>{fresh();data[p][id]={...data[p][id],...copy(d)};write();fire(p)},delete:async()=>{fresh();if(data[p])delete data[p][id];write();fire(p)}}),onSnapshot:n=>{(subs[p]=subs[p]||[]).push(n);setTimeout(()=>n(snap(p)),0);return()=>{subs[p]=subs[p].filter(f=>f!==n)}}})};
  addEventListener("storage",e=>{if(e.key===KEY){fresh();Object.keys(subs).forEach(fire)}});
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});

  const KK=window.KK={mode:"starting",uid:"",space:()=>space,cfg:{key:CFG.apiKey,project:CFG.projectId},
    /* Inside the Android app the page lives on the phone, so the link points to the website. */
    inviteUrl:()=>(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()?"https://agrinders.github.io/Kalenderkoll/":location.origin+location.pathname)+"#join="+space,
    codeIn,
    /* Switch this phone to another calendar (from a pasted link or code). */
    /* Set while a phone has just joined and not yet picked which of the two names is theirs. */
    joining:()=>ls.get("kalenderkoll.joining")==="1",joinDone:()=>ls.del("kalenderkoll.joining"),
    join(c){c=codeIn(c);if(!c)return false;ls.set(SKEY,c);ls.del(KEY);ls.set("kalenderkoll.joining","1");location.replace(location.pathname);return true},
    /* Bring back a calendar from a backup file: which calendar it was, who you are, and everything in it. */
    restore(b){if(!b||typeof b.docs!=="object")return false;const sp=okCode(b.space)?b.space:"";
      if(sp)ls.set(SKEY,sp);else ls.del(SKEY);ls.set(KEY,JSON.stringify({cal:b.docs}));ls.set("kalenderkoll.restore","1");
      if(b.me==="a"||b.me==="b"){ls.set("kalenderkoll.me",b.me);ls.set("kalenderkoll.reclaim","1")}ls.del("kalenderkoll.partner");location.replace(location.pathname);return true}};
  const timeout=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms));
  const ready=(async()=>{
    if(window.KK_NO_CLOUD)throw new Error("off");
    const[A,Au,F]=await Promise.race([Promise.all([import(SDK+"firebase-app.js"),import(SDK+"firebase-auth.js"),import(SDK+"firebase-firestore.js")]),timeout(12000)]);
    const app=A.initializeApp(CFG),auth=Au.getAuth(app);
    const user=await Promise.race([new Promise((res,rej)=>{const un=Au.onAuthStateChanged(auth,u=>{if(u){un();res(u)}});Au.signInAnonymously(auth).catch(rej)}),timeout(15000)]);
    let fs;try{fs=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})})}catch(e){fs=F.getFirestore(app)}
    /* Joining from a link. If this phone already has its own calendar, the app asks first. */
    if(joinCode&&joinCode!==space){const ok=!space||(window.KK_askJoin?await window.KK_askJoin():true);if(ok){space=joinCode;ls.set(SKEY,space);ls.set("kalenderkoll.joining","1")}}
    const fresh2=!space;if(!space){space=newCode();ls.set(SKEY,space)}
    const ref=p=>F.collection(fs,"spaces",space,p);
    /* Anything saved only on this phone is sent up, without overwriting what is already shared. */
    const local=(read().cal)||{},ids=Object.keys(local);
    /* After a restore the shared copy wins; the file only fills in a calendar that is empty in the cloud. */
    const rest=ls.get("kalenderkoll.restore")==="1";ls.del("kalenderkoll.restore");
    if(ids.length&&!joinCode){try{const have=new Set((await F.getDocs(ref("cal"))).docs.map(d=>d.id));await Promise.all(ids.filter(id=>rest?!have.size:!have.has(id)||fresh2).map(id=>F.setDoc(F.doc(fs,"spaces",space,"cal",id),local[id])));ls.set("kalenderkoll.data.sent",JSON.stringify(local));ls.del(KEY)}catch(e){}}
    else if(ids.length&&joinCode){ls.set("kalenderkoll.data.sent",JSON.stringify(local));ls.del(KEY)}
    KK.mode="cloud";KK.uid=user.uid;
    /* An optional account (e-mail and password). The phone's sign-in is upgraded in place, so who you are stays the same,
       and the account remembers which calendar is yours. After a reinstall you log in and everything is back. */
    const link=u=>["spaces","acct_"+u.uid+"_kalenderkoll","cal"];
    KK.email=user.email||"";if(user.email)F.setDoc(F.doc(fs,...link(user),"link"),{kind:"link",space}).catch(()=>{});
    KK.signUp=async(email,pw)=>{const r=await Au.linkWithCredential(auth.currentUser||user,Au.EmailAuthProvider.credential(email,pw));await F.setDoc(F.doc(fs,...link(r.user),"link"),{kind:"link",space});KK.email=r.user.email||email};
    KK.signIn=async(email,pw)=>{const r=await Au.signInWithEmailAndPassword(auth,email,pw);const d=(await F.getDocs(F.collection(fs,...link(r.user)))).docs.find(x=>x.id==="link"),sp=d&&d.data().space;
      if(!okCode(sp)){const e=new Error("no calendar");e.code="kk/no-link";throw e}
      ls.set(SKEY,sp);ls.del(KEY);["me","partner","seen","joining","nudge"].forEach(k=>ls.del("kalenderkoll."+k));location.replace(location.pathname)};
    KK.resetPw=email=>Au.sendPasswordResetEmail(auth,email);
    return{collection:p=>({doc:id=>{const r=F.doc(fs,"spaces",space,p,id);return{id,set:d=>F.setDoc(r,d),update:d=>F.updateDoc(r,d),delete:()=>F.deleteDoc(r)}},
      onSnapshot:(n,err)=>F.onSnapshot(ref(p),s=>n({docs:s.docs.map(x=>({id:x.id,exists:true,data:()=>x.data()})),size:s.size,empty:s.empty,metadata:{fromCache:s.metadata.fromCache}}),err)})}
  })().catch(()=>{KK.mode="local";return localDb});
  window.claude={use:async n=>n==="db"?ready:n==="user"?(await ready,KK.uid?{id:async()=>KK.uid}:null):null};
  window.KK_LOCAL=true;
})();
