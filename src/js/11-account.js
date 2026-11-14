/* ---------- Account (optional) ----------
   E-mail and password. Creating one upgrades this phone's sign-in, so nothing changes in the calendar.
   Logging in on a newly installed app brings back the calendar and who you are. */
var ASM="up";
function openAS(mode){ASM=mode;const up=mode==="up";
  $("as_t").textContent=up?tx("Skapa konto","Create an account"):tx("Logga in","Log in");
  $("as_p").textContent=up?tx("Med ett konto får du tillbaka kalendern om du installerar om appen eller byter telefon.","With an account you get the calendar back if you reinstall the app or change phones."):hasData()?tx("Kalendern på den här telefonen byts mot den som hör till kontot.","The calendar on this phone is replaced by the one that belongs to the account."):tx("Logga in så hämtas din kalender.","Log in and your calendar is fetched.");
  $("as_el").textContent=tx("E-post","E-mail");$("as_wl").textContent=up?tx("Välj ett lösenord (minst 6 tecken)","Pick a password (at least 6 characters)"):tx("Lösenord","Password");$("as_w").autocomplete=up?"new-password":"current-password";$("as_w").value="";
  $("as_no").textContent=tx("Avbryt","Cancel");$("as_ok").textContent=up?tx("Skapa konto","Create account"):tx("Logga in","Log in");$("as_ok").disabled=false;
  $("as_sw").textContent=up?tx("Jag har redan ett konto","I already have an account"):tx("Skapa ett nytt konto","Create a new account");$("as_fp").textContent=tx("Glömt lösenordet?","Forgot the password?");$("as_fp").classList.toggle("hide",up);
  $("as").classList.add("on");setTimeout(()=>($("as_e").value?$("as_w"):$("as_e")).focus(),80)}
function closeAS(){$("as").classList.remove("on")}
function accErr(e){const c=e&&e.code||"";return c==="auth/operation-not-allowed"?tx("Inloggning med e-post är inte påslagen i Firebase än","E-mail sign-in is not turned on in Firebase yet"):
  c==="auth/email-already-in-use"||c==="auth/credential-already-in-use"?tx("Det finns redan ett konto med den e-posten. Välj Jag har redan ett konto.","There is already an account with that e-mail. Choose I already have an account."):
  c==="auth/weak-password"?tx("Lösenordet behöver minst 6 tecken","The password needs at least 6 characters"):
  c==="auth/invalid-email"?tx("E-postadressen ser inte rätt ut","That e-mail address does not look right"):
  c==="auth/invalid-credential"||c==="auth/wrong-password"||c==="auth/user-not-found"?tx("Fel e-post eller lösenord","Wrong e-mail or password"):
  c==="auth/too-many-requests"?tx("För många försök. Vänta en stund.","Too many tries. Wait a little."):
  c==="kk/no-link"?tx("Kontot har ingen kalender kopplad","That account has no calendar connected"):
  tx("Det gick inte. Kontrollera internet och försök igen.","That did not work. Check the internet and try again.")}
$("as_no").onclick=closeAS;$("as").addEventListener("click",e=>{if(e.target===$("as"))closeAS()});
$("as_sw").onclick=()=>openAS(ASM==="up"?"in":"up");
$("as_fp").onclick=async()=>{const em=$("as_e").value.trim();if(!em){toast(tx("Skriv din e-post först","Write your e-mail first"));$("as_e").focus();return}
  try{await KK.resetPw(em);toast(tx("Om kontot finns har vi skickat ett mejl med en länk för nytt lösenord","If the account exists, we sent an e-mail with a link for a new password"),6000)}catch(e){toast(accErr(e))}};
$("as_ok").onclick=async()=>{const em=$("as_e").value.trim(),pw=$("as_w").value;if(!em){$("as_e").focus();return}if(pw.length<6){toast(tx("Lösenordet behöver minst 6 tecken","The password needs at least 6 characters"));$("as_w").focus();return}
  if(!(window.KK&&KK.signUp)){toast(tx("Ingen kontakt med internet just nu","No internet connection right now"));return}
  $("as_ok").disabled=true;
  try{if(ASM==="up"){await KK.signUp(em,pw);closeAS();toast(tx("Kontot är skapat","The account is created")+" · "+em);renderSettings()}else{await KK.signIn(em,pw)}}
  catch(e){$("as_ok").disabled=false;toast(accErr(e),5000)}};
document.addEventListener("click",e=>{if(!e.target.closest)return;const b=e.target.closest("[data-acc]");if(b)openAS(b.dataset.acc);else if(e.target.closest("#cs_li"))openAS("in")});
