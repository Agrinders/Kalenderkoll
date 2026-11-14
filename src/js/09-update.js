/* Installed version: when a newer build is published, offer to update. */
const BUILD=(document.querySelector('meta[name="kal-build"]')||{}).content||"";
async function checkUpdate(){if(!LOCAL||!BUILD||!navigator.onLine)return;try{const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const j=await r.json();
  if(j&&j.b&&j.b!==BUILD){const u=$("upd");u.dataset.v=j.b;$("upd_t").textContent=tx("Ny version finns","New version ready");$("upd_s").textContent=tx("Allt ni lagt in finns kvar.","Everything you added stays.");$("upd_go").textContent=tx("Uppdatera","Update");u.classList.remove("hide")}}catch(e){}}
$("upd").onclick=()=>{location.replace(location.pathname+"?v="+($("upd").dataset.v||Date.now()))};
if(/[?&]v=/.test(location.search))history.replaceState(history.state,"",location.pathname+location.hash);
setTimeout(checkUpdate,4000);setInterval(checkUpdate,15*6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkUpdate()});
