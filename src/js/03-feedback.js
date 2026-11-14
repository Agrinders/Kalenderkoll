/* ---------- Short notices at the top. A second line goes after " · ". ---------- */
let lastToast=null;
function dropToast(e){if(!e||e._going)return;e._going=1;clearTimeout(e._t);if(RM()||!e.animate){e.remove();return}e.animate([{opacity:1},{opacity:0,transform:"translateY(-8px)"}],{duration:220,fill:"forwards"}).onfinish=()=>e.remove()}
function toast(msg,ms){const box=$("toasts"),[a,...b]=String(msg).split(" · "),e=document.createElement("div");e.className="toast";e.setAttribute("role","status");
  e.innerHTML=`<span>${esc(a)}${b.length?`<small>${esc(b.join(" · "))}</small>`:""}</span>`;e.onclick=()=>dropToast(e);
  const live=[...box.querySelectorAll(".toast")].filter(x=>!x._going);if(live.length>=2)dropToast(live[0]);box.appendChild(e);lastToast=e;e._t=setTimeout(()=>dropToast(e),ms||3200);return e}
/* A question with two answers, in the page's own dialog. */
function ask(title,text,yes){return new Promise(res=>{$("m_t").textContent=title;$("m_p").textContent=text;$("m_yes").textContent=yes||tx("Ja","Yes");$("m_no").textContent=tx("Avbryt","Cancel");$("modal").classList.add("on");const done=v=>{$("modal").classList.remove("on");$("m_yes").onclick=$("m_no").onclick=null;res(v)};$("m_yes").onclick=()=>done(true);$("m_no").onclick=()=>done(false)})}
/* A row slides away before it is removed. */
function animOut(el,fn){if(!el||RM()||!el.animate){fn();return}el.style.pointerEvents="none";const h=el.offsetHeight;el.style.overflow="hidden";
  el.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateX(-24px)"}],{duration:180,fill:"forwards"}).onfinish=()=>{el.animate([{height:h+"px"},{height:"0px"}],{duration:160,fill:"forwards"}).onfinish=fn}}
/* Delete in two taps: the first tap turns the cross red, the second deletes. */
let armK=null,armT=0;
document.addEventListener("click",e=>{const x=e.target.closest&&e.target.closest(".x");if(!x){if(armK){armK=null;document.querySelectorAll(".x.arm").forEach(z=>z.classList.remove("arm"))}return}
  const k=x.dataset.tdel||"";if(k===armK){armK=null;return}e.stopImmediatePropagation();e.preventDefault();document.querySelectorAll(".x.arm").forEach(z=>z.classList.remove("arm"));armK=k;x.classList.add("arm");clearTimeout(armT);armT=setTimeout(()=>{armK=null;x.classList.remove("arm")},4000)},true);
