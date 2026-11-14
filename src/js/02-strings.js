/* every UI string: [Swedish, English]; functions take values */
const T={
nH:["Idag","Today"],nK:["Kalender","Calendar"],nA:["Agenda","Agenda"],nF:["Födelsedagar","Birthdays"],nFs:["Födelsed.","Birthd."],nD:["Nedräkning","Countdown"],nDs:["Nedräkn.","Countd."],
ttlH:["Idag","Today"],ttlK:["Kalender","Calendar"],ttlA:["Agenda","Agenda"],ttlF:["Födelsedagar","Birthdays"],ttlD:["Nedräkning","Countdown"],ttlX:["Helgdagar","Holidays"],ttlU:["Historik","History"],ttlN:["Version","Version"],ttlC:["Inställningar","Settings"],
toolsH:["Verktyg","Tools"],disc:["Allt sparas bara på den här enheten.","Everything is saved on this device only."],pickYear:["Välj år","Pick a year"],
verNow:["Nuvarande version","Current version"],verNew:["Det här är nytt","What is new"],takeMe:["Ta mig dit","Take me there"],
exBadge:["Exempel","Example"],exNote:["Händelserna och födelsedagarna är påhittade. Ändrar du eller lägger till något blir exemplet din egen kalender.","These events and birthdays are made up. If you change or add something, the example becomes your own calendar."],exEmpty:["Börja med en tom kalender","Start with an empty calendar"],exGo:["Öppna kalendern →","Open the calendar →"],
aSearch:["Sök händelse, plats eller anteckning","Search event, place or note"],
theme:["Tema","Theme"],auto:["Auto","Auto"],light:["Ljust","Light"],dark:["Mörkt","Dark"],themesL:["Fler teman","More themes"],motion:["Rörlig bakgrund","Moving background"],
notif:["Notiser i appen","In-app notifications"],sound:["Ljud för notiser","Notification sounds"],clickL:["Knappljud och vibration","Button sounds and vibration"],on:["På","On"],off:["Av","Off"],
yourData:["Din data","Your data"],dStore:["Allt sparas på den här enheten.","Everything is saved on this device."],dOff:["Inte ansluten: inget sparas när sidan stängs.","Not connected: nothing is saved when the page closes."],
reset:["Radera all data","Delete all data"],resetAgain:["Tryck igen för att radera allt","Tap again to delete everything"],
cancel:["Avbryt","Cancel"],saveW:["Spara","Save"],del:["Ta bort","Remove"],pYes:["Gör det ändå","Do it anyway"],pNo:["Avbryt","Cancel"],
tFail:["Kunde inte spara. Försök igen.","Could not save. Try again."],tDel:["All data raderades","All data was deleted"],tDelFail:["Kunde inte radera allt. Försök igen.","Could not delete everything. Try again."],tNotif:["Notiser på","Notifications on"],
tAdd:[n=>`${n} tillagd`,n=>`${n} added`],tSave:["Sparat","Saved"],tRem:["Borttagen","Removed"],tNeedName:["Skriv vad det gäller först","Write what it is first"],tNeedDate:["Välj ett datum först","Pick a date first"],tRemind:["Påminnelse","Reminder"]
};
let lastKey="";
const t=(k,...a)=>{lastKey=k;const v=T[k][li()];return typeof v==="function"?v(...a):v};
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let col=null,tab="h",allIds=[];
