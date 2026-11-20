/* Always tries the network first, so a published change shows up the next time the app opens. Falls back to the saved copy offline. */
const V="kalenderkoll-01e5b8db4923",FILES=['./', 'index.html', 'version.json', 'app-shell.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("kalenderkoll-")&&x!==V&&x!=="kalenderkoll-fonts"&&x!=="kalenderkoll-fb").map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){e.respondWith(caches.open("kalenderkoll-fonts").then(c=>c.match(r).then(m=>m||fetch(r).then(x=>{c.put(r,x.clone());return x}))));return}
  if(u.hostname==="www.gstatic.com"&&u.pathname.startsWith("/firebasejs/")){e.respondWith(caches.open("kalenderkoll-fb").then(c=>c.match(r).then(m=>m||fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}))));return}
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(r,{cache:"no-cache"}).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(r,y))}return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("./"):Response.error()))))});
