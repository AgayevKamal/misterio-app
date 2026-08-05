/* Misterio — vanilla JS */
const DATA = {
  restoran:  { icon:"🍽️", name:"Restoran", shops:[
    {n:"Şirvanşah",d:15},{n:"Nar & Bar",d:20},{n:"Emerald",d:10},
    {n:"Zeytun",d:25},{n:"Dolma House",d:30},{n:"Chinar",d:12}]},
  anticafe:  { icon:"🕹️", name:"Anticafe", shops:[
    {n:"Time Out",d:20},{n:"Cube Anticafe",d:15},{n:"Loft 21",d:25},
    {n:"Play Room",d:10},{n:"Chill Zone",d:35},{n:"Board Bay",d:18}]},
  coworking: { icon:"💼", name:"Co-working", shops:[
    {n:"Innoland",d:20},{n:"The Space",d:15},{n:"Hub Baku",d:25},
    {n:"Nest Co",d:12},{n:"Focus Point",d:30},{n:"Desk&Co",d:10}]},
  kurslar:   { icon:"🎓", name:"Kurslar", shops:[
    {n:"Code Academy",d:25},{n:"Lingua Pro",d:15},{n:"Design Lab",d:20},
    {n:"Math Star",d:10},{n:"IELTS Center",d:30},{n:"Robotech",d:18}]},
  coffee:    { icon:"☕", name:"Coffeeshop", shops:[
    {n:"Coffee Moffie",d:15},{n:"Brew Bros",d:20},{n:"Espresso Lab",d:10},
    {n:"Latte Land",d:25},{n:"Bean Street",d:30},{n:"Cup&Co",d:12}]},
  kitab:     { icon:"📚", name:"Kitab mağazaları", shops:[
    {n:"Libraff",d:15},{n:"Ali & Nino",d:20},{n:"Kitabevim",d:10},
    {n:"Akademkitab",d:25},{n:"Qanun Nəşr",d:30},{n:"Book Point",d:18}]}
};
const COLORS = ["#7b2ff7","#ff5f6d","#ffc371","#22c1c3","#fd6585","#845ec2","#00c9a7","#ff9671"];

const LS = {
  get:(k,f)=>{try{return JSON.parse(localStorage.getItem(k)) ?? f}catch(e){return f}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const coupons = ()=>LS.get("mist_coupons",[]);
const saveCoupons = c=>LS.set("mist_coupons",c);
const code = ()=> "MIST-"+Math.random().toString(36).slice(2,7).toUpperCase()+"-"+Math.floor(Math.random()*90+10);

/* ---------- HOME ---------- */
const catsEl = document.getElementById("cats");
if (catsEl) {
  let curKey=null, spinning=false, angle=0;
  const cv=document.getElementById("wheel"), ctx=cv.getContext("2d");
  const sec=document.getElementById("wheelSec"), title=document.getElementById("wheelTitle");
  const btn=document.getElementById("spinBtn"), lock=document.getElementById("lockMsg"), hint=document.getElementById("hint");

  Object.entries(DATA).forEach(([k,v])=>{
    const d=document.createElement("div");
    d.className="cat"; d.dataset.k=k;
    d.innerHTML=`<div class="ic">${v.icon}</div><div class="nm">${v.name}</div>`;
    d.onclick=()=>select(k);
    catsEl.appendChild(d);
  });

  function select(k){
    curKey=k;
    document.querySelectorAll(".cat").forEach(c=>c.classList.toggle("active",c.dataset.k===k));
    title.textContent = DATA[k].name+" çarxı";
    sec.classList.add("show");
    draw(DATA[k].shops);
    refreshState();
    sec.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function draw(shops){
    const n=shops.length, R=cv.width/2, step=2*Math.PI/n;
    ctx.clearRect(0,0,cv.width,cv.height);
    shops.forEach((s,i)=>{
      const a0=i*step-Math.PI/2, a1=a0+step;
      ctx.beginPath(); ctx.moveTo(R,R); ctx.arc(R,R,R-4,a0,a1); ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth=3; ctx.stroke();
      ctx.save(); ctx.translate(R,R); ctx.rotate(a0+step/2);
      ctx.fillStyle="#fff"; ctx.textAlign="right"; ctx.textBaseline="middle";
      ctx.font="bold 15px Segoe UI, sans-serif";
      ctx.fillText(s.n, R-22, -6);
      ctx.font="bold 17px Segoe UI, sans-serif";
      ctx.fillText("-"+s.d+"%", R-22, 14);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(R,R,32,0,2*Math.PI); ctx.fillStyle="#fff"; ctx.fill();
    ctx.strokeStyle="#7b2ff7"; ctx.lineWidth=5; ctx.stroke();
    ctx.fillStyle="#7b2ff7"; ctx.font="bold 15px Segoe UI"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("SPIN",R,R);
  }

  const freeUsed = ()=>LS.get("mist_free_used",false);
  function refreshState(){
    if(freeUsed()){
      lock.classList.remove("hidden");
      btn.textContent="💳 Ödə və fırlat";
      hint.textContent="Pulsuz fırlatma haqqınız istifadə olunub.";
    } else {
      lock.classList.add("hidden");
      btn.textContent="🎁 Hədiyyə əldə et";
      hint.textContent="Sizdə 1 pulsuz fırlatma haqqı var.";
    }
  }
  refreshState();

  const payModal=document.getElementById("payModal");
  btn.onclick=()=>{
    if(!curKey){alert("Əvvəlcə kateqoriya seçin");return}
    if(spinning) return;
    if(freeUsed()){ payModal.classList.remove("hidden"); return; }
    LS.set("mist_free_used",true);
    spin();
  };
  document.getElementById("payCancel").onclick=()=>payModal.classList.add("hidden");
  document.getElementById("payGo").onclick=()=>{payModal.classList.add("hidden");spin()};

  function spin(){
    spinning=true; btn.disabled=true;
    const shops=DATA[curKey].shops, n=shops.length;
    const idx=Math.floor(Math.random()*n);          // əsl təsadüfi nəticə
    const step=360/n;
    const target = 360*6 + (360 - (idx*step + step/2)); // seçilən sektor yuxarı göstəriciyə
    angle += target;
    cv.style.transform=`rotate(${angle}deg)`;
    setTimeout(()=>{
      spinning=false; btn.disabled=false;
      const s=shops[idx];
      const c={id:Date.now(),shop:s.n,disc:s.d,cat:DATA[curKey].name,code:code(),date:new Date().toLocaleDateString("az-AZ")};
      const all=coupons(); all.push(c); saveCoupons(all);
      document.getElementById("winTxt").textContent=`${s.n} — ${s.d}% endirim`;
      document.getElementById("modal").classList.remove("hidden");
      refreshState();
    },5200);
  }
  document.getElementById("closeModal").onclick=()=>document.getElementById("modal").classList.add("hidden");
}

/* ---------- PROFILE ---------- */
const form=document.getElementById("profForm");
if(form){
  const F=["pName","pEmail","pPhone","pCity"];
  const p=LS.get("mist_profile",{});
  F.forEach(id=>{ if(p[id]) document.getElementById(id).value=p[id]; });
  form.onsubmit=e=>{
    e.preventDefault();
    const o={}; F.forEach(id=>o[id]=document.getElementById(id).value);
    LS.set("mist_profile",o);
    const s=document.getElementById("saved");
    s.classList.remove("hidden"); setTimeout(()=>s.classList.add("hidden"),2000);
  };

  const box=document.getElementById("coupons");
  const cm=document.getElementById("cModal");
  let openId=null;
  function render(){
    const list=coupons();
    if(!list.length){box.innerHTML='<div class="empty">Hələ kuponunuz yoxdur. Ana səhifədə çarxı fırladın 🎁</div>';return}
    box.innerHTML="";
    list.forEach(c=>{
      const d=document.createElement("div");
      d.className="coupon";
      d.innerHTML=`<div class="cat-l">${c.cat}</div><div class="shop">${c.shop}</div>
        <div class="disc">-${c.disc}%</div><button class="btn">Bax</button>`;
      d.querySelector("button").onclick=()=>open(c);
      box.appendChild(d);
    });
  }
  function open(c){
    openId=c.id;
    document.getElementById("cTitle").textContent=c.shop;
    document.getElementById("cDisc").textContent=`${c.disc}% endirim`;
    document.getElementById("cCode").textContent=c.code;
    document.getElementById("cTerms").innerHTML=`
      <li>Kupon yalnız 1 dəfə istifadə oluna bilər.</li>
      <li>Digər kampaniyalarla birləşdirilmir.</li>
      <li>Qazanılma tarixi: ${c.date} · Kateqoriya: ${c.cat}</li>
      <li>Kodu kassada təqdim edin.</li>`;
    cm.classList.remove("hidden");
  }
  document.getElementById("cDismiss").onclick=()=>cm.classList.add("hidden");
  document.getElementById("cClose").onclick=()=>{
    saveCoupons(coupons().filter(x=>x.id!==openId));
    cm.classList.add("hidden"); render();
  };
  render();
}
