/* ============================================================
   MISTERIO — Şirkət Admin Paneli (frontend-only, localStorage)
   Məlumatlar və kuponlar hələlik burada simulyasiya olunur.
   Real Misterio bazasına birləşdiriləndə yalnız bu faylı
   uyğun API çağırışları ilə əvəz etmək kifayətdir.
   ============================================================ */
(function(){
  "use strict";
  const AKEY="mist_admin_session";
  const ACCOUNTS_KEY="mist_admin_accounts";
  const ORDERS_KEY="mist_admin_orders";

  /* ---------- DEMO HESABLAR (localStorage-da saxlanılır) ---------- */
  const DEMO_ACCOUNTS=[
    {user:"info@misterio.az", pass:"admin123", company:"Misterio Demo Restoran", email:"info@misterio.az"},
    {user:"dolma@restoran.az", pass:"dolma123", company:"Dolma House", email:"dolma@restoran.az"},
    {user:"brew@coffee.az",    pass:"brew123",  company:"Brew Bros Coffeeshop", email:"brew@coffee.az"}
  ];
  function ensureAccounts(){
    if(!localStorage.getItem(ACCOUNTS_KEY)){
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEMO_ACCOUNTS));
    }
  }
  function accounts(){
    ensureAccounts();
    try{ return JSON.parse(localStorage.getItem(ACCOUNTS_KEY))||[] }catch(e){ return [] }
  }

  /* ---------- AUTH ---------- */
  function adminLogin(user,pass){
    user=(user||"").trim().toLowerCase();
    const list=accounts();
    const found=list.find(a=>a.user.toLowerCase()===user && a.pass===pass);
    if(!found) return false;
    localStorage.setItem(AKEY, JSON.stringify({user:found.user, company:found.company, email:found.email, loginAt:new Date().toISOString()}));
    return true;
  }
  function adminUser(){
    try{ return JSON.parse(localStorage.getItem(AKEY)) }catch(e){ return null }
  }
  function adminLogout(){ localStorage.removeItem(AKEY); }

  /* ---------- KUPON AXTARIŞI (nümunə qovluq) ----------
     Real bazada bu, Misterio-nun couponsbazası ilə əvəz olunacaq.
     Kod formatı: MIST-XXXXXX-DD  (DD = endirim faizi üçün nümunə) */
  const SAMPLE_SHOPS=[
    {code:"MIST-X7Q2K-24", shop:"Şirvanşah",   cat:"Restoran",  disc:24},
    {code:"MIST-AB91C-15", shop:"Brew Bros",   cat:"Coffeeshop",disc:15},
    {code:"MIST-ZP38M-30", shop:"Nar & Bar",   cat:"Restoran",  disc:30},
    {code:"MIST-LK55N-20", shop:"Time Out",    cat:"Anticafe",  disc:20},
    {code:"MIST-RT22B-10", shop:"Libraff",     cat:"Kitab",     disc:10},
    {code:"MIST-CD77F-35", shop:"Chill Zone",  cat:"Anticafe",  disc:35},
    {code:"MIST-MN44P-12", shop:"Coffee Moffie",cat:"Coffeeshop",disc:12},
    {code:"MIST-QW88L-25", shop:"Emerald",     cat:"Restoran",  disc:25}
  ];
  function lookupCoupon(code){
    if(!code) return null;
    // kodu artıq istifadə olunubmu?
    const used=orders().some(o=>o.code===code);
    if(used) return null;
    let c=SAMPLE_SHOPS.find(s=>s.code.toUpperCase()===code.toUpperCase());
    if(c) return {code:c.code, shop:c.shop, cat:c.cat, disc:c.disc};
    // kod formatı uyğundursa, faizi koddan çıxar
    const m=/^MIST-[A-Z0-9]{4,}-(\d{1,2})$/.exec(code.toUpperCase());
    if(m){
      const disc=Math.min(90,parseInt(m[1],10));
      return {code:code.toUpperCase(), shop:"Misterio Partnyoru", cat:"Ümumi", disc};
    }
    return null;
  }

  /* ---------- SİFARİŞLƏR ---------- */
  function orders(){
    try{ return JSON.parse(localStorage.getItem(ORDERS_KEY))||[] }catch(e){ return [] }
  }
  function saveOrders(list){ localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); }
  function addOrder(code,total,disc){
    code=(code||"").toUpperCase();
    if(orders().some(o=>o.code===code)) return false; // təkrar istifadə yox
    const final=+(total*(1-disc/100)).toFixed(2);
    const list=orders();
    list.push({
      id:"O-"+Date.now(),
      code,
      total:+total.toFixed(2),
      disc,
      final,
      ts:new Date().toISOString()
    });
    saveOrders(list);
    return true;
  }

  /* ---------- DASHBOARD HESABLAMALARI ---------- */
  function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
  function startOfWeek(d){ const x=startOfDay(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); return x; }
  function startOfMonth(d){ const x=startOfDay(d); x.setDate(1); return x; }

  function sum(arr){ return arr.reduce((s,o)=>s+o.final,0); }

  function renderDashboard(){
    const list=orders();
    const now=new Date();
    const today=list.filter(o=>new Date(o.ts)>=startOfDay(now));
    const week =list.filter(o=>new Date(o.ts)>=startOfWeek(now));
    const month=list.filter(o=>new Date(o.ts)>=startOfMonth(now));
    const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v.toFixed(2); };
    set("totalEarned", sum(list));
    set("todayEarned", sum(today));
    set("weekEarned",  sum(week));
    set("monthEarned", sum(month));
    const tc=document.getElementById("totalCount");
    if(tc) tc.textContent=list.length+" təsdiqlənmiş sifariş";
  }

  /* ---------- SİFARİŞ CƏDVƏLİ + FİLTR ---------- */
  function inRange(ts,range,from,to){
    const d=new Date(ts);
    const now=new Date();
    if(range==="today") return d>=startOfDay(now);
    if(range==="week")  return d>=startOfWeek(now);
    if(range==="month") return d>=startOfMonth(now);
    if(range==="custom"){
      const f=from?new Date(from+"T00:00:00"):null;
      let t=to?new Date(to+"T23:59:59"):null;
      if(f && d<f) return false;
      if(t && d>t) return false;
      return true;
    }
    return true;
  }
  function renderOrders(){
    const range=document.getElementById("rangeSel").value;
    const from=document.getElementById("fromD").value;
    const to=document.getElementById("toD").value;
    let list=orders().filter(o=>inRange(o.ts,range,from,to));
    list.sort((a,b)=>new Date(b.ts)-new Date(a.ts)); // ən yeni yuxarıda

    const body=document.getElementById("ordersBody");
    const empty=document.getElementById("emptyOrders");
    body.innerHTML="";
    if(!list.length){
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      const fmt=t=>{
        const d=new Date(t);
        const p=n=>String(n).padStart(2,"0");
        return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
      };
      list.forEach(o=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td data-l="Tarix">${fmt(o.ts)}</td>
          <td class="mono" data-l="Kupon">${o.code}</td>
          <td data-l="Əsl məbləğ">${o.total.toFixed(2)} ₼</td>
          <td data-l="End.">%${o.disc}</td>
          <td class="bold" data-l="Yekun">${o.final.toFixed(2)} ₼</td>`;
        body.appendChild(tr);
      });
    }
    const ps=document.getElementById("periodSum");
    if(ps) ps.textContent=list.reduce((s,o)=>s+o.final,0).toFixed(2)+" AZN";
  }

  /* ---------- EXPORT ---------- */
  window.adminLogin=adminLogin;
  window.adminUser=adminUser;
  window.adminLogout=adminLogout;
  window.lookupCoupon=lookupCoupon;
  window.addOrder=addOrder;
  window.orders=orders;
  window.renderDashboard=renderDashboard;
  window.renderOrders=renderOrders;
})();
