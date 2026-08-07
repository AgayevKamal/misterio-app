/* ============================================================
   MISTERIO — Şirkət Admin Paneli (SUPABASE)
   Şirkət hesabları  → companies cədvəli
   Kupon axtarışı    → coupons cədvəli (real istifadəçi kuponları)
   Sifarişlər        → orders cədvəli
   localStorage yalnız admin sessiyasını saxlayır.
   ============================================================ */
(function(){
  "use strict";
  const AKEY="mist_admin_session";
  let ORDERS=[];          // yaddaşda kəş
  let CURRENT_COUPON=null;

  /* ---------- AUTH (companies cədvəli) ---------- */
  async function adminLogin(user,pass){
    const email=(user||"").trim().toLowerCase();
    try{
      const c=await DB.companyByEmail(email);
      if(!c) return false;
      if(c.pass_hash !== await sha256(pass)) return false;
      localStorage.setItem(AKEY, JSON.stringify({
        id:c.id, user:c.email, company:c.name, email:c.email,
        loginAt:new Date().toISOString()
      }));
      return true;
    }catch(e){ console.error("admin login", e); return false; }
  }
  function adminUser(){
    try{ return JSON.parse(localStorage.getItem(AKEY)) }catch(e){ return null }
  }
  function adminLogout(){ localStorage.removeItem(AKEY); }

  /* ---------- KUPON AXTARIŞI (real baza) ---------- */
  async function lookupCoupon(code){
    if(!code) return null;
    try{
      const c=await DB.couponByCode(code.trim().toUpperCase());
      if(!c) return null;
      if(c.status==="used") return null;
      CURRENT_COUPON=c;
      return {id:c.id, code:c.code, shop:c.shop, cat:c.cat||"Ümumi", disc:c.disc};
    }catch(e){ console.error("lookup", e); return null; }
  }

  /* ---------- SİFARİŞLƏR ---------- */
  async function loadOrders(){
    const a=adminUser(); if(!a) return [];
    try{ ORDERS=await DB.orders(a.id); }
    catch(e){ console.error("orders", e); ORDERS=[]; }
    return ORDERS;
  }
  function orders(){ return ORDERS; }

  async function addOrder(code,total,disc){
    const a=adminUser(); if(!a) return false;
    code=(code||"").toUpperCase();
    try{
      const existing=await DB.couponByCode(code);
      if(!existing || existing.status==="used") return false;
      const final=+(total*(1-disc/100)).toFixed(2);
      await DB.addOrder({companyId:a.id, companyEmail:a.email, code,
                         shop:existing.shop, total:+total.toFixed(2), disc, final});
      await DB.useCoupon(existing.id);
      await loadOrders();
      return true;
    }catch(e){ console.error("addOrder", e); return false; }
  }

  /* ---------- DASHBOARD ---------- */
  const ts=o=>o.created_at;
  function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
  function startOfWeek(d){ const x=startOfDay(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); return x; }
  function startOfMonth(d){ const x=startOfDay(d); x.setDate(1); return x; }
  function sum(arr){ return arr.reduce((s,o)=>s+Number(o.final),0); }

  function renderDashboard(){
    const list=ORDERS;
    const now=new Date();
    const today=list.filter(o=>new Date(ts(o))>=startOfDay(now));
    const week =list.filter(o=>new Date(ts(o))>=startOfWeek(now));
    const month=list.filter(o=>new Date(ts(o))>=startOfMonth(now));
    const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v.toFixed(2); };
    set("totalEarned", sum(list));
    set("todayEarned", sum(today));
    set("weekEarned",  sum(week));
    set("monthEarned", sum(month));
    const tc=document.getElementById("totalCount");
    if(tc) tc.textContent=list.length+" təsdiqlənmiş sifariş";
  }

  /* ---------- CƏDVƏL + FİLTR ---------- */
  function inRange(t,range,from,to){
    const d=new Date(t), now=new Date();
    if(range==="today") return d>=startOfDay(now);
    if(range==="week")  return d>=startOfWeek(now);
    if(range==="month") return d>=startOfMonth(now);
    if(range==="custom"){
      const f=from?new Date(from+"T00:00:00"):null;
      const tt=to?new Date(to+"T23:59:59"):null;
      if(f && d<f) return false;
      if(tt && d>tt) return false;
      return true;
    }
    return true;
  }
  function renderOrders(){
    const range=document.getElementById("rangeSel").value;
    const from=document.getElementById("fromD").value;
    const to=document.getElementById("toD").value;
    let list=ORDERS.filter(o=>inRange(ts(o),range,from,to));
    list.sort((a,b)=>new Date(ts(b))-new Date(ts(a)));

    const body=document.getElementById("ordersBody");
    const empty=document.getElementById("emptyOrders");
    body.innerHTML="";
    if(!list.length){
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      const fmt=t=>{
        const d=new Date(t), p=n=>String(n).padStart(2,"0");
        return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
      };
      list.forEach(o=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td data-l="Tarix">${fmt(ts(o))}</td>
          <td class="mono" data-l="Kupon">${o.code}</td>
          <td data-l="Əsl məbləğ">${Number(o.total).toFixed(2)} ₼</td>
          <td data-l="End.">%${o.disc}</td>
          <td class="bold" data-l="Yekun">${Number(o.final).toFixed(2)} ₼</td>`;
        body.appendChild(tr);
      });
    }
    const ps=document.getElementById("periodSum");
    if(ps) ps.textContent=sum(list).toFixed(2)+" AZN";
  }

  /* ---------- EXPORT ---------- */
  window.adminLogin=adminLogin;
  window.adminUser=adminUser;
  window.adminLogout=adminLogout;
  window.lookupCoupon=lookupCoupon;
  window.addOrder=addOrder;
  window.orders=orders;
  window.loadOrders=loadOrders;
  window.renderDashboard=renderDashboard;
  window.renderOrders=renderOrders;
})();
