let verAll=false;
function renderVersion(){const q=li(),c=CHANGELOG[0],arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',old=CHANGELOG.slice(1),show=verAll?old:old.slice(0,3);
  $("n").innerHTML=`<div class="sheet"><div class="lbl">${t("verNow")}</div><div class="big">${c.v}</div><div class="lbl">${c.d}</div></div>`
  +`<div class="sheet"><p class="head">${t("verNew")}</p>${c.i.map(x=>`<div class="vn"><b>${x[2][q]}</b><p>${x[3][q]}</p>${x[0]==="n"?"":`<button class="take" data-go="${x[0]}" data-to="${x[1]}">${t("takeMe")}${arrow}</button>`}</div>`).join("")}</div>`
  +(old.length?`<div class="sheet"><p class="head">${tx("Tidigare versioner","Earlier versions")}</p>${show.map(r=>`<div class="vold"><div class="vh"><b>${r.v}</b><span>${r.d}</span></div><ul>${r.i.map(x=>`<li>${x[2][q]}</li>`).join("")}</ul></div>`).join("")}${old.length>3?`<button class="lnk" id="ver_more">${verAll?tx("Visa färre","Show fewer"):tx(`Visa alla ${old.length} tidigare versioner`,`Show all ${old.length} earlier versions`)}</button>`:""}</div>`:"")}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#ver_more")){verAll=!verAll;renderVersion()}});
const onOff=(k,v)=>[["1","on"],["0","off"]].map(([x,l])=>`<button class="chip ${(v?"1":"0")===x?"on":""}" data-${k}="${x}">${t(l)}</button>`).join("");
function renderSettings(){
  $("c_th").innerHTML=["auto","light","dark"].map(v=>`<button class="chip ${S.theme===v?"on":""}" data-th="${v}">${t(v)}</button>`).join("");
  $("c_tm").innerHTML=THEMES.map(x=>`<button class="opt tm ${S.theme===x[0]?"on":""}" data-th="${x[0]}"><u style="background:linear-gradient(135deg,${TCOL[x[0]].join(",")})"></u><span>${x[1+li()]}<small>${x[3+li()]}</small></span><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg></i></button>`).join("");
  $("c_tg").innerHTML=onOff("tg",S.toasts);$("c_ck").innerHTML=onOff("ck",S.click);$("c_sn").innerHTML=onOff("sn",S.sound);$("c_mo").innerHTML=onOff("mo",S.motion);
  $("c_kh").textContent=tx("Kalendern","The calendar");
  $("c_wnl").textContent=tx("Veckonummer","Week numbers");$("c_wnh").textContent=tx("Visar vecka 1–53 till vänster i månadsvyn.","Shows week 1–53 on the left of the month view.");$("c_wn").innerHTML=onOff("wn",S.wkno);
  $("c_hol").textContent=tx("Helgdagar","Public holidays");$("c_hoh").textContent=tx("Svenska röda dagar och aftnar syns i kalendern.","Swedish public holidays and eves show in the calendar.");$("c_ho").innerHTML=onOff("ho",S.hol);
  $("c_rml").textContent=tx("Påminnelser","Reminders");$("c_rmh").textContent=tx("Påminner med en notis när appen är öppen. Vill du bli påmind även när den är stängd, öppna händelsen och tryck Lägg i telefonens kalender.","Reminds you with a notification while the app is open. To be reminded when it is closed too, open the event and tap Add to your phone's calendar.");$("c_rm").innerHTML=onOff("rm",S.rem);
  const np="Notification" in window?Notification.permission:"denied";$("c_perm").classList.toggle("hide",!S.rem||np!=="default");$("c_perm").textContent=tx("Tillåt notiser från appen","Allow notifications from the app");
  $("c_icl").textContent=tx("Telefonens kalender","Your phone's calendar");$("c_ich").textContent=tx("Spara allt som en .ics-fil som telefonens kalender, Google eller Outlook kan läsa, eller läs in en .ics-fil härifrån.","Save everything as an .ics file that your phone's calendar, Google or Outlook can read, or load an .ics file from there.");
  $("ics_out").textContent=tx("Exportera .ics","Export .ics");$("ics_in").textContent=tx("Importera .ics","Import .ics");
  $("c_st").textContent=col?t("dStore"):t("dOff");renderRead();renderBk();
}
function applyTheme(){S.theme==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",S.theme)}
function applyLang(){document.documentElement.lang=S.lang;document.querySelectorAll(".langs [data-lang]").forEach(b=>{b.classList.toggle("sel",b.dataset.lang===S.lang);b.setAttribute("aria-pressed",b.dataset.lang===S.lang)});$("empty").textContent=tx("Börja med en tom kalender","Start with an empty calendar");document.querySelectorAll("[data-i]").forEach(e=>{e.textContent=t(e.dataset.i)});document.querySelectorAll("[data-p]").forEach(e=>{e.placeholder=t(e.dataset.p)});$("reset").textContent=t("reset");$("tadd_t").textContent=tx("Ny","New");$("tadd").setAttribute("aria-label",tx("Ny händelse","New event"));render();if(typeof fitNav==="function")fitNav()}
function render(){NOW=new Date();$("ttl").textContent=t("ttl"+tab.toUpperCase());renderHome();renderMonth();renderAgenda();renderBirthdays();renderCountdown();renderHolidays();renderHist();renderSettings();renderVersion();FX.sync(fxWeights())}
function persist(){if(!col)return;later("plan",()=>col.doc("plan").set({bg2:S.bgPick?S.bg:null,zoom:S.zoom,hc:S.hc,lang:S.lang,theme:S.theme,toasts:S.toasts,motion:S.motion,sound:S.sound,click:S.click,wkno:S.wkno,hol:S.hol,rem:S.rem}).catch(()=>{}),150)}
/* The three colours in the background follow how full this week is: plans, birthdays and free days. */
function fxWeights(){const n=todayN(),mon=n-wdOf(n);let busy=0,free=0;for(let d=mon;d<mon+7;d++){const c=onDay(d).length;busy+=c;if(!c)free++}const bd=BD.filter(b=>bdNext(b)-n<=30).length;return[busy+1,bd*1.5+.6,free+.6]}
const yrOpen=()=>$("yrs").classList.contains("on");
function closeYears(){$("yrs").classList.remove("on")}
addEventListener("scroll",()=>{if(yrOpen())closeYears()},{passive:true});
function openYears(anchor){const y0=NOW.getFullYear(),ys=[];for(let y=y0-10;y<=y0+10;y++)ys.push(y);
  $("yr_list").innerHTML=ys.reverse().map(y=>`<button class="${y===P.y?"on":""}" data-yr="${y}">${y}</button>`).join("");
  const a=anchor.getBoundingClientRect(),w=$("yrs").offsetWidth;$("yrs").style.left=Math.max(12,Math.min(innerWidth-w-12,a.left+a.width/2-w/2))+"px";$("yrs").style.top=(a.bottom+10)+"px";
  const on=$("yr_list").querySelector(".on");if(on)$("yr_list").scrollTop=on.offsetTop-$("yr_list").offsetTop-96;
  $("yrs").classList.add("on")}
const TABS=["h","k","a","f","d","x","u","n","c"];
function go(x){if(!TABS.includes(x))x="h";tab=x;if(x==="u")renderHist();try{sessionStorage.setItem("kalenderkoll.tab",x)}catch(e){}closeYears();FX.tab(x);TABS.forEach(s=>$(s).classList.toggle("hide",s!==x));document.querySelectorAll("nav button,#drawer>button").forEach(b=>b.classList.toggle("on",b.dataset.go===x));$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("ttl").textContent=t("ttl"+x.toUpperCase());$("tadd").classList.toggle("hide",["u","n","c","x"].includes(x));window.scrollTo(0,0)}
$("menu").onclick=()=>{$("drawer").classList.add("on");$("scrim").classList.add("on")};$("scrim").onclick=()=>{$("drawer").classList.remove("on");$("scrim").classList.remove("on")};
