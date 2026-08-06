/* Misterio — çarx məntiqi
   BUG FIX: qalib əvvəlcə seçilir (single source of truth), animasiya bucağı
   həmin qalibə görə hesablanır. Mütləq bucaqla işləyirik, ona görə
   təkrar fırlatmalarda da ox həmişə düz qazanan sektorun üstündə dayanır. */
(function(){
  let user = requireAuth();
  if(!user) return;

  const q=id=>document.getElementById(id);
  q("welcome").innerHTML = `Xoş gəldin, <b>${user.name||user.email}</b> · <a class="link" href="profile.html">Profilim</a>`;

  const catsEl=q("cats"), sec=q("wheelSec"), title=q("wheelTitle"),
        btn=q("spinBtn"), hint=q("hint"),
        cv=q("wheel"), ctx=cv.getContext("2d");
  let curKey=null, spinning=false;
  let absAngle=0;            // çarxın mütləq bucağı (dərəcə)
  let currentShops=[];       // ekranda göstərilən sektorlar — qalibin mənbəyi

  /* ---- giriş şərti: aktiv abunəlik + qalan fırlatma ---- */
  function gate(){
    const s=subInfo();
    const bb=q("blockBox"), area=q("spinArea");
    if(!s.active){
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent="🔒";
      q("bbTitle").textContent="Abunəlik tələb olunur";
      q("bbText").textContent="Çarxı fırlatmaq üçün aylıq abunəliyi aktivləşdirin — 9.90 AZN, ayda 3 fırlatma.";
      q("bbBtn").textContent="Abunə ol — 9.90 AZN/ay";
      return false;
    }
    if(!s.canSpin){
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent="⏳";
      q("bbTitle").textContent="Bu ayki fırlatma haqqınız bitib";
      q("bbText").innerHTML=`Yeniləmə tarixi: <b>${s.renewText}</b>. O tarixdə hesabınıza yenidən 3 fırlatma əlavə olunacaq.`;
      q("bbBtn").textContent="Əlavə fırlatma al — 9.90 AZN";
      return false;
    }
    bb.classList.add("hidden"); area.classList.remove("hidden");
    hint.textContent=`Bu ay ${s.spinsLeft} fırlatma haqqınız qalıb.`;
    return true;
  }

  /* ---- kateqoriyalar ---- */
  refreshData();
  Object.entries(DATA).forEach(([k,v])=>{
    const d=document.createElement("div");
    d.className="cat"+(v.isAll?" all":""); d.dataset.k=k;
    d.innerHTML=`<div class="ic">${v.icon}</div><div class="nm">${v.name}</div><div class="cnt">${v.shops.length} məkan</div>`;
    d.onclick=()=>select(k);
    catsEl.appendChild(d);
  });

  function select(k){
    if(spinning) return;
    curKey=k;
    currentShops = DATA[k].shops.slice();
    document.querySelectorAll(".cat").forEach(c=>c.classList.toggle("active",c.dataset.k===k));
    title.textContent="2. "+DATA[k].name+" çarxını fırlat";
    sec.classList.add("show");
    absAngle = 0;
    cv.style.transition="none";
    cv.style.transform="rotate(0deg)";
    void cv.offsetWidth;
    cv.style.transition="";
    draw();
    sec.scrollIntoView({behavior:"smooth",block:"center"});
  }

  /* ---- çarxı çək: sektor i-nin mərkəzi bucağı = i*step + step/2, 0° yuxarıdan ---- */
  function draw(){
    const n=currentShops.length, R=cv.width/2, step=2*Math.PI/n;
    const big = n>10;
    ctx.clearRect(0,0,cv.width,cv.height);
    currentShops.forEach((s,i)=>{
      const a0=i*step-Math.PI/2, a1=a0+step;
      ctx.beginPath(); ctx.moveTo(R,R); ctx.arc(R,R,R-4,a0,a1); ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth= big?2:3; ctx.stroke();
      ctx.save(); ctx.translate(R,R); ctx.rotate(a0+step/2);
      ctx.fillStyle="#fff"; ctx.textAlign="right"; ctx.textBaseline="middle";
      const fs = big?11:15, fs2 = big?12:17;
      let nm=s.n; const maxLen = big?14:18;
      if(nm.length>maxLen) nm=nm.slice(0,maxLen-1)+"…";
      ctx.font=`bold ${fs}px Segoe UI, sans-serif`;
      ctx.fillText(nm, R-16, big?-5:-6);
      ctx.font=`bold ${fs2}px Segoe UI, sans-serif`;
      ctx.fillText("-"+s.d+"%", R-16, big?9:14);
      ctx.restore();
    });
    const hr = big?26:32;
    ctx.beginPath(); ctx.arc(R,R,hr,0,2*Math.PI); ctx.fillStyle="#fff"; ctx.fill();
    ctx.strokeStyle="#7b2ff7"; ctx.lineWidth=5; ctx.stroke();
    ctx.fillStyle="#7b2ff7"; ctx.font=`bold ${big?12:15}px Segoe UI`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("SPIN",R,R);
  }

  if(gate()) hint.textContent=`Bu ay ${subInfo().spinsLeft} fırlatma haqqınız qalıb.`;

  btn.onclick=()=>{
    if(spinning) return;
    if(!curKey){ alert("Əvvəlcə kateqoriya seçin"); return; }
    if(!gate()) return;
    spin();
  };

  function spin(){
    /* 1) QALİBİ ƏVVƏLCƏ SEÇ — tək mənbə */
    const n=currentShops.length;
    const winnerIdx = Math.floor(Math.random()*n);
    const winner = currentShops[winnerIdx];

    /* 2) ANİMASİYANI QALİBƏ GÖRƏ HESABLA (mütləq bucaq) */
    const step = 360/n;
    const winnerCenter = winnerIdx*step + step/2;     // sektorun mərkəzi, 0° = yuxarı
    const jitter = (Math.random()-0.5)*step*0.6;      // sektor daxilində kiçik sapma
    const targetMod = (360 - winnerCenter - jitter + 360) % 360;
    const turns = 6 + Math.floor(Math.random()*2);
    const currentMod = ((absAngle % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if(delta < 0) delta += 360;
    absAngle += turns*360 + delta;

    spinning=true; btn.disabled=true;
    consumeSpin();
    cv.style.transform = `rotate(${absAngle}deg)`;

    setTimeout(()=>{
      spinning=false; btn.disabled=false;
      /* 3) KUPON — həmin qalibdən, ID ilə bağlı */
      const catName = winner.catKey && DATA[winner.catKey] ? DATA[winner.catKey].name : DATA[curKey].name;
      const c={ id:Date.now(), segId:winner.id, shop:winner.n, disc:winner.d, cat:catName,
        code:"MIST-"+Math.random().toString(36).slice(2,7).toUpperCase()+"-"+Math.floor(Math.random()*90+10),
        date: fmtDate(new Date()) };
      const u=Session.user();
      updateUser({coupons:(u.coupons||[]).concat([c])});
      q("winTxt").textContent=`${winner.n} — ${winner.d}% endirim`;
      q("winCat").textContent=catName;
      q("modal").classList.remove("hidden");
      const s=subInfo();
      hint.textContent = s.canSpin
        ? `Bu ay ${s.spinsLeft} fırlatma haqqınız qalıb.`
        : `Bu ayki fırlatma haqqınız bitdi. Yeniləmə: ${s.renewText}`;
    },5200);
  }

  q("closeModal").onclick=()=>{
    q("modal").classList.add("hidden");
    gate();
  };
})();
