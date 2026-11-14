const $=id=>document.getElementById(id);
/* Settings. Saved in the "plan" record, so they follow a backup. */
const S={bg:"mist",bgPick:false,zoom:1,hc:false,lang:"sv",theme:"auto",toasts:true,sound:true,click:true,motion:true,wkno:true,hol:true,rem:true};
let NOW=new Date();
const MNS=[["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],["January","February","March","April","May","June","July","August","September","October","November","December"]];
const DNS=[["Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag","Söndag"],["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]];
const li=()=>S.lang==="sv"?0:1,mn=i=>MNS[li()][i],ms=i=>mn(i).slice(0,3),loc=()=>S.lang==="sv"?"sv-SE":"en-GB",tx=(a,b)=>li()?b:a;
const dname=i=>DNS[li()][i],dshort=i=>li()?DNS[1][i].slice(0,3):["Mån","Tis","Ons","Tor","Fre","Lör","Sön"][i];
/* Categories: a key, a name and a colour from the theme. */
const CATS=[["w","Jobb","Work"],["h","Hem","Home"],["f","Familj","Family"],["p","Hälsa","Health"],["l","Fritid","Leisure"],["o","Övrigt","Other"]];
const catName=k=>{const c=CATS.find(x=>x[0]===k)||CATS[5];return c[1+li()]};
const catVar=k=>"var(--k"+(CATS.some(x=>x[0]===k)?k:"o")+")";
