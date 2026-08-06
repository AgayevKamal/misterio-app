/* Misterio — ortaq: auth, abunəlik, storage */
const LS = {
  get:(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  del:k=>localStorage.removeItem(k)
};

const PLAN = { price:"9.90 AZN", priceNum:9.90, spins:3, period:"ay" };

const Users = {
  all: ()=>LS.get("mist_users",{}),
  save: u=>LS.set("mist_users",u),
  get: e=>Users.all()[String(e).toLowerCase()] || null,
  put: u=>{const a=Users.all(); a[u.email.toLowerCase()]=u; Users.save(a)}
};
const Session = {
  email: ()=>LS.get("mist_session",null),
  login: e=>LS.set("mist_session",String(e).toLowerCase()),
  logout: ()=>LS.del("mist_session"),
  user: ()=>{const e=Session.email(); return e?Users.get(e):null}
};

/* ---------- abunəlik ---------- */
function addMonth(d){
  const n=new Date(d); const day=n.getDate();
  n.setMonth(n.getMonth()+1);
  if(n.getDate()<day) n.setDate(0);
  return n;
}
const AZ_MONTHS=["yanvar","fevral","mart","aprel","may","iyun",
                 "iyul","avqust","sentyabr","oktyabr","noyabr","dekabr"];
const fmtDate = d => {
  const x=new Date(d);
  return `${x.getDate()} ${AZ_MONTHS[x.getMonth()]} ${x.getFullYear()}`;
};

/* abunəliyi normallaşdır: dövr bitibsə fırlatmaları yenilə */
function syncSubscription(u){
  if(!u) return u;
  if(!u.sub || !u.sub.active) return u;
  const now = new Date();
  let renew = new Date(u.sub.renewAt);
  if(now >= renew){
    /* aylıq təkrarlanan ödəniş — demo: avtomatik yenilənir */
    while(now >= renew){ renew = addMonth(renew); }
    u.sub.renewAt = renew.toISOString();
    u.sub.spinsLeft = PLAN.spins;
    Users.put(u);
  }
  return u;
}

function activateSubscription(){
  const u = Session.user(); if(!u) return null;
  const now = new Date();
  u.sub = {
    active:true,
    startedAt: now.toISOString(),
    renewAt: addMonth(now).toISOString(),
    spinsLeft: PLAN.spins,
    price: PLAN.priceNum
  };
  u.payments = (u.payments||[]).concat([{amount:PLAN.priceNum, date:now.toISOString(), type:"subscription"}]);
  Users.put(u); return u;
}
function cancelSubscription(){
  const u = Session.user(); if(!u || !u.sub) return null;
  u.sub.active=false; u.sub.canceledAt=new Date().toISOString();
  Users.put(u); return u;
}
function buyExtraSpin(){
  const u = Session.user(); if(!u) return null;
  u.sub = u.sub || {active:false, spinsLeft:0, renewAt:addMonth(new Date()).toISOString()};
  u.sub.spinsLeft = (u.sub.spinsLeft||0) + 1;
  u.payments = (u.payments||[]).concat([{amount:PLAN.priceNum, date:new Date().toISOString(), type:"extra"}]);
  Users.put(u); return u;
}
function consumeSpin(){
  const u = Session.user(); if(!u || !u.sub) return null;
  u.sub.spinsLeft = Math.max(0,(u.sub.spinsLeft||0)-1);
  u.sub.totalSpins = (u.sub.totalSpins||0)+1;
  Users.put(u); return u;
}
function subInfo(){
  let u = Session.user(); if(!u) return null;
  u = syncSubscription(u);
  const s = u.sub || {};
  return {
    active: !!s.active,
    spinsLeft: s.spinsLeft||0,
    renewAt: s.renewAt || null,
    renewText: s.renewAt ? fmtDate(s.renewAt) : "—",
    canSpin: (s.spinsLeft||0) > 0
  };
}

function requireAuth(){
  const u = Session.user();
  if(!u || !u.verified){ location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop()||"index.html"); return null; }
  return syncSubscription(u);
}
function updateUser(patch){
  const u = Session.user(); if(!u) return null;
  Object.assign(u, patch); Users.put(u); return u;
}

/* header */
document.addEventListener("DOMContentLoaded",()=>{
  const av=document.querySelector(".avatar");
  if(av){
    const u=Session.user();
    if(u&&u.verified){ av.title=u.name||u.email; av.classList.add("on"); }
  }
  const out=document.getElementById("logoutBtn");
  if(out) out.onclick=()=>{ Session.logout(); location.href="index.html"; };
});
