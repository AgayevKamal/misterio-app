/* Misterio — çarx məntiqi (hesab tələb olunur) */
(function(){
  let user = requireAuth();
  if(!user) return;

  const q=id=>document.getElementById(id);
  q("welcome").innerHTML = `Xoş gəldin, <b>${user.name||user.email}</b> · <a class="link" href="profile.html">Profilim</a>`;
  q("payAcc").textContent = user.email;

  const catsEl=q("cats"), sec=q("wheelSec"), title=q("wheelTitle"),
        btn=q("spinBtn"), lock=q("lockMsg"), hint=q("hint"),
        cv=q("wheel"), ctx=cv.getContext("2d"), payModal=q("payModal");
  let curKey=null, spinning=false, angle=0;

  Object.entries(DATA).forEach(([k,v])=>{
    const d=document.createElement("div");
    d.className="cat"; d.dataset.k=k;
    d.innerHTML=`<div class="ic">${v.icon}</div><div class="nm">${v.name}</div><div class="cnt">${v.shops.length} məkan</div>`;
    d.onclick=()=>select(k);
    catsEl.appendChild(d);
  });

  function select(k){
    curKey=k;
    document.querySelectorAll(".cat").forEach(c=>c.classList.toggle("active",c.dataset.k===k));
    title.textContent="2. "+DATA[k].name+" çarxını fırlat";
    sec.classList.add("show");
    draw(DATA[k].shops);
    sec.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function draw(shops){
    const n=shops.length,R=cv.width/2,step=2*Math.PI/n;
    ctx.clearRect(0,0,cv.width,cv.height);
    shops.forEach((s,i)=>{
      const a0=i*step-Math.PI/2,a1=a0+step;
      ctx.beginPath();ctx.moveTo(R,R);ctx.arc(R,R,R-4,a0,a1);ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();
      ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.stroke();
      ctx.save();ctx.translate(R,R);ctx.rotate(a0+step/2);
      ctx.fillStyle="#fff";ctx.textAlign="right";ctx.textBaseline="middle";
      ctx.font="bold 15px Segoe UI, sans-serif";ctx.fillText(s.n,R-22,-6);
      ctx.font="bold 17px Segoe UI, sans-serif";ctx.fillText("-"+s.d+"%",R-22,14);
      ctx.restore();
    });
    ctx.beginPath();ctx.arc(R,R,32,0,2*Math.PI);ctx.fillStyle="#fff";ctx.fill();
    ctx.strokeStyle="#7b2ff7";ctx.lineWidth=5;ctx.stroke();
    ctx.fillStyle="#7b2ff7";ctx.font="bold 15px Segoe UI";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText("SPIN",R,R);
  }

  function refreshState(){
    user = Session.user();
    if(user.freeUsed){
      lock.classList.remove("hidden");
      btn.textContent="💳 Ödə və fırlat — 9.90 ₼";
      hint.textContent="Bu hesabın pulsuz fırlatma haqqı istifadə olunub.";
    } else {
      lock.classList.add("hidden");
      btn.textContent="🎁 Hədiyyə əldə et";
      hint.textContent="Bu hesabda 1 pulsuz fırlatma haqqınız var.";
    }
  }
  refreshState();

  btn.onclick=()=>{
    if(!curKey){alert("Əvvəlcə kateqoriya seçin");return}
    if(spinning) return;
    if(Session.user().freeUsed){ payModal.classList.remove("hidden"); return; }
    updateUser({freeUsed:true});
    spin();
  };
  q("payCancel").onclick=()=>payModal.classList.add("hidden");
  q("payGo").onclick=()=>{payModal.classList.add("hidden");spin()};

  function spin(){
    spinning=true; btn.disabled=true;
    const shops=DATA[curKey].shops,n=shops.length;
    const idx=Math.floor(Math.random()*n);
    const step=360/n;
    angle += 360*6 + (360-(idx*step+step/2));
    cv.style.transform=`rotate(${angle}deg)`;
    setTimeout(()=>{
      spinning=false; btn.disabled=false;
      const s=shops[idx];
      const c={id:Date.now(),shop:s.n,disc:s.d,cat:DATA[curKey].name,
        code:"MIST-"+Math.random().toString(36).slice(2,7).toUpperCase()+"-"+Math.floor(Math.random()*90+10),
        date:new Date().toLocaleDateString("az-AZ")};
      const u=Session.user();
      const list=(u.coupons||[]).concat([c]);
      updateUser({coupons:list});
      q("winTxt").textContent=`${s.n} — ${s.d}% endirim`;
      q("modal").classList.remove("hidden");
      refreshState();
    },5200);
  }
  q("closeModal").onclick=()=>q("modal").classList.add("hidden");
})();
