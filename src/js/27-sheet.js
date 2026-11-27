/* ---------- The event sheet: whose it is sits up by the title ----------
   Båda / Oliver / Elin is a small switch right of "Ny händelse" / "Ändra", like Månad / Vecka / Dag,
   with no heading of its own. The chosen one shows its name; the others show only their picture. */
(()=>{const w=$("es_w"),x=$("es_x");if(!w||!x)return;x.before(w);w.classList.add("esw");const l=$("es_wl");if(l)l.classList.add("hide")})();
