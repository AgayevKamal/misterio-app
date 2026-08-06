/* Misterio — profil, abunəlik və kuponlar */
(function(){
  let user = requireAuth();
  if(!user) return;
  const q=id=>document.getElementById(id);

  function maskName(name){
    const s=(name||"İstifadəçi").trim();
    const parts=s.split(/\s+/);
    if(parts.length>1){
      const last=parts[parts.length-1];
      parts[parts.length-1]=last.slice(0,Math.min(2,last.length))+"***";
      return parts.join(" ");
    }
    return s.slice(0,Math.max(2,Math.ceil(s.length/2)))+"***";
  }
  const initial = s => (s||"?").trim().charAt(0).toUpperCase();

  function head(){
    user=Session.user();
    const s=subInfo();
    q("pfAv").textContent=initial(user.name||user.email);
    q("pfName").textContent=user.name||"—";
    q("pfMail").textContent=user.email;
    q("pfSpin").textContent = s.active ? `🎡 ${s.spinsLeft} sirr qalıb` : "🔒 Abunəlik deaktiv";
  }

  function renderSub(){
    const s=subInfo();
    const box=q("subCard");
    if(!s.active){
      box.innerHTML=`
        <div class="sub-row">
          <div><div class="sub-state off">Deaktiv</div>
          <p class="sub">Sirri açmaq üçün aylıq abunəliyi aktivləşdirin — 9.90 AZN, ayda 3 sirr.</p></div>
          <a class="btn" href="pricing.html">Abunə ol</a>
        </div>`;
      return;
    }
    box.innerHTML=`
      <div class="sub-row">
        <div>
          <div class="sub-state on">Aktiv</div>
          <div class="sub-grid">
            <div><span>Plan</span><b>Misterio Aylıq · 9.90 AZN</b></div>
            <div><span>Qalan sirr</span><b>${s.spinsLeft} / 3</b></div>
            <div><span>Növbəti yenilənmə</span><b>${s.renewText}</b></div>
          </div>
          ${s.canSpin?"":'<p class="warn">⚠️ Bu ayki sirlərin bitib.</p>'}
        </div>
        <div class="sub-actions">
          ${s.canSpin?'<a class="btn" href="spin.html">Sirri aç 🔮</a>'
                     :'<a class="btn" href="pricing.html">Əlavə sirr al</a>'}
          <button class="btn ghost" id="cancelSub">Abunəliyi ləğv et</button>
        </div>
      </div>`;
    const cb=q("cancelSub");
    if(cb) cb.onclick=()=>{
      if(confirm("Abunəliyi ləğv etmək istədiyinizə əminsiniz? Növbəti ay ödəniş alınmayacaq.")){
        cancelSubscription(); head(); renderSub();
      }
    };
  }

  head(); renderSub();

  q("pName").value=user.name||"";
  q("pEmail").value=user.email;
  q("pPhone").value=user.phone||"";
  q("pCity").value=user.city||"";

  q("profForm").onsubmit=e=>{
    e.preventDefault();
    updateUser({name:q("pName").value.trim(),phone:q("pPhone").value.trim(),city:q("pCity").value.trim()});
    head(); render();
    const s=q("saved"); s.classList.remove("hidden"); setTimeout(()=>s.classList.add("hidden"),2000);
  };

  const box=q("coupons"), cm=q("cModal");
  let openId=null;

  /* KART: yalnız baş hərf + status + Bax — mətn kəsilmə problemi yoxdur */
  function render(){
    user=Session.user();
    const list=user.coupons||[];
    if(!list.length){
      box.innerHTML='<div class="empty">🔮 Hələ sirrin açılmayıb. <a class="link" href="spin.html">Çarxı fırlat</a> və ilk kuponunu qazan.</div>';
      return;
    }
    box.innerHTML="";
    list.slice().reverse().forEach(c=>{
      const d=document.createElement("div");
      d.className="coupon";
      d.innerHTML=`
        <div class="c-initial">${initial(c.shop)}</div>
        <div class="c-status">✦ Aktiv</div>
        <button class="btn">Sirri aç</button>`;
      d.querySelector("button").onclick=()=>openC(c);
      box.appendChild(d);
    });
  }

  function openC(c){
    openId=c.id;
    q("cInitial").textContent=initial(c.shop);
    q("cTitle").textContent=c.shop;
    q("cDisc").textContent=c.disc+"% endirim";
    q("cCode").textContent=c.code;
    q("cOwner").textContent=maskName(Session.user().name);
    q("cTerms").innerHTML=`
      <li>Kupon yalnız 1 dəfə istifadə oluna bilər.</li>
      <li>Digər kampaniya və endirimlərlə birləşdirilmir.</li>
      <li>Qazanılma tarixi: ${c.date} · Kateqoriya: ${c.cat}</li>
      <li>Qazanıldığı tarixdən 30 gün ərzində istifadə edilməlidir.</li>
      <li>Kodu kassada təqdim edin, şəxsiyyət vəsiqəsi tələb oluna bilər.</li>`;
    cm.classList.remove("hidden");
  }

  q("cDismiss").onclick=()=>cm.classList.add("hidden");
  q("cClose").onclick=()=>{
    const u=Session.user();
    updateUser({coupons:(u.coupons||[]).filter(x=>x.id!==openId)});
    cm.classList.add("hidden"); render();
  };
  render();
})();
