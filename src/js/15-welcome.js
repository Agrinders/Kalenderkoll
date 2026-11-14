/* First start: ask whether to begin with an empty calendar or look at the example first, so example events never quietly become your calendar. */
let wlAsked=false;
function startEmpty(){exampleMode=false;EV=[];BD=[];if(col)col.doc("started").set({kind:"started"}).catch(()=>{});
  render();go("k");toast(tx("Klart. Tryck Ny för att lägga till din första händelse.","Done. Tap New to add your first event."),"ok")}
function maybeWelcome(){if(wlAsked)return;if(!document.documentElement.classList.contains("reveal")||$("intro")){setTimeout(maybeWelcome,300);return}
  wlAsked=true;if(!exampleMode||lsN("kalenderkoll.welcome"))return;
  $("wl_t").textContent=tx("Välkommen till Kalenderkoll","Welcome to Kalenderkoll");
  $("wl_p").textContent=tx("Hur vill du börja?","How do you want to start?");
  $("wl_e1").textContent=tx("Börja med en tom kalender","Start with an empty calendar");
  $("wl_e2").textContent=tx("Du lägger in dina händelser och födelsedagar själv.","You add your own events and birthdays.");
  $("wl_x1").textContent=tx("Titta på ett exempel först","Look at an example first");
  $("wl_x2").textContent=tx("Påhittade händelser som visar hur appen fungerar. Du kan tömma kalendern när du vill.","Made-up events that show how the app works. You can empty the calendar whenever you like.");
  $("wl_n").textContent=tx("Allt sparas bara på den här enheten.","Everything is saved on this device only.");
  $("wl").classList.add("on");setTimeout(()=>$("wl_empty").focus(),50)}
function wlPick(k){lsSet("kalenderkoll.welcome",1);$("wl").classList.remove("on");if(k==="empty")startEmpty();else{go("h");render()}}
$("wl_empty").onclick=()=>wlPick("empty");$("wl_ex").onclick=()=>wlPick("ex");
$("h_exe").onclick=startEmpty;
