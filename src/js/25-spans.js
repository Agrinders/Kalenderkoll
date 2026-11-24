/* ---------- Events over several days: one bar through the days ----------
   An event that lasts several days sits at the top of each of its days, always on the same line,
   and the bar runs unbroken from its first day to its last. The name is written once per week row. */
/* The same event on days next to each other (every Saturday and Sunday, every day, overlapping times)
   is drawn as one bar, just like an event that lasts several days. */
function runs(O){const by=new Map(),out=[];O.forEach(o=>{const k=o.e.id;if(!by.has(k))by.set(k,[]);by.get(k).push(o)});
  by.forEach(L=>{L.sort((x,y)=>x.s-y.s);let cur=null;L.forEach(o=>{if(cur&&o.s<=cur.end+1){cur.end=Math.max(cur.end,o.end)}else{cur={e:o.e,s:o.s,end:o.end};out.push(cur)}})});
  return out.sort(byTime)}
function monthPaint(){const g=$("k_gr");if(!g)return;const cells=[...g.querySelectorAll("button[data-cday]")];if(!cells.length)return;
  const wide=CALFS&&cells[0].clientWidth>=84;
  for(let r=0;r<cells.length;r+=7){const row=cells.slice(r,r+7),a=+row[0].dataset.cday,b=+row[row.length-1].dataset.cday,O=runs(between(a,b));
    /* Longer bars first, each on the first free line, so a bar keeps its line through the whole week. */
    const multi=O.filter(o=>o.end>o.s).sort((x,y)=>Math.max(x.s,a)-Math.max(y.s,a)||(y.end-y.s)-(x.end-x.s)),lanes=[];
    multi.forEach(o=>{const from=Math.max(o.s,a);let k=lanes.findIndex(e=>e<from);if(k<0){k=lanes.length;lanes.push(0)}lanes[k]=o.end;o.lane=k});
    row.forEach(bt=>{const d=+bt.dataset.cday,here=multi.filter(o=>o.s<=d&&o.end>=d),top=here.reduce((m,o)=>Math.max(m,o.lane+1),0);
      let sp="";for(let k=0;k<top;k++){const o=here.find(x=>x.lane===k);if(!o){sp+=`<u class="spc"></u>`;continue}
        const st=o.s===d||d===a,en=o.end===d||d===b,run=Math.min(o.end,b)-d+1,cl=stMini(o.e);
        sp+=`<u class="${cl==="gl"?"gl":cl==="sp"?"str":""}${st?" s0":""}${en?" s1":""}" style="--c:${evCol(o.e)};--n:${run}">${st?`<span>${wide&&o.e.t&&o.s===d?`<i>${esc(o.e.t)}</i> `:""}${esc(o.e.n)}</span>`:""}</u>`}
      let cs=bt.querySelector(".cspan");const c=bt.querySelector(".cev");
      if(top){if(!cs){cs=document.createElement("span");cs.className="cspan";if(c)bt.insertBefore(cs,c);else bt.appendChild(cs)}cs.innerHTML=sp}else if(cs)cs.remove();
      if(!c)return;
      const S=[...bdOn(d).map(x=>({h:`<u style="--c:var(--acc)">♥ ${esc(x.n)}</u>`,n:x.n})),...O.filter(o=>o.end===o.s&&o.s===d).map(o=>({h:`<u class="${stMini(o.e)}" style="--c:${evCol(o.e)}">${wide&&o.e.t?`<i>${esc(o.e.t)}</i> `:""}${esc(o.e.n)}</u>`,n:o.e.n}))];
      let A=S;if(!CALFS){const cap0=S.slice(0,3).some(x=>x.n.length>7)?2:3,cap=Math.max(1,cap0-top);if(S.length>cap){c.innerHTML=S.slice(0,cap).map(x=>x.h).join("")+`<em>+${S.length-cap}</em>`;return}}
      c.innerHTML=A.map(x=>x.h).join("")})}
  requestAnimationFrame(calFsFit)}
calFsPaint=function(){monthPaint()};
const _renderMonth25=renderMonth;renderMonth=function(){_renderMonth25.apply(this,arguments);if(!CALFS)monthPaint()};
/* A "+2" already counts what did not fit; the fit only adds to it. */
calFsFit=function(){document.querySelectorAll("#k_gr .cev").forEach(c=>{const K=[...c.children].filter(x=>x.tagName==="U");if(!K.length)return;
  K.forEach(u=>{u.style.display=""});const old=c.querySelector("em.fit");if(old)old.remove();
  const H=c.clientHeight;if(!H||c.scrollHeight<=H+1)return;
  let em=c.querySelector("em");const base=em?+em.textContent.slice(1)||0:0;if(!em){em=document.createElement("em");em.className="fit";c.appendChild(em)}let n=0;
  for(let i=K.length-1;i>0&&c.scrollHeight>H+1;i--){K[i].style.display="none";n++;em.textContent="+"+(base+n)}})};
