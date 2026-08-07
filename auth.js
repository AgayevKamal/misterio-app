/* Misterio — ortaq: auth, abunəlik (Supabase backed)
   localStorage yalnız aktiv sessiyanın user id-sini saxlayır. */
const SESSION_KEY = "mist_uid";
const PLAN = { price:"9.90 AZN", priceNum:9.90, spins:3, period:"ay" };

let CURRENT_USER = null;

const Session = {
  uid: ()=>localStorage.getItem(SESSION_KEY),
  login: id=>localStorage.setItem(SESSION_KEY, id),
  logout: ()=>{ localStorage.removeItem(SESSION_KEY); CURRENT_USER=null; },
  user: ()=>CURRENT_USER
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

/* dövr bitibsə fırlatmaları yenilə (Supabase-də) */
async function syncSubscription(u){
  if(!u || !u.sub || !u.sub.active) return u;
  const now = new Date();
  let renew = new Date(u.sub.renewAt);
  if(now >= renew){
    while(now >= renew){ renew = addMonth(renew); }
    u.sub.renewAt = renew.toISOString();
    u.sub.spinsLeft = PLAN.spins;
    await DB.updateUser(u.id, {sub:u.sub});
  }
  return u;
}

async function loadSession(){
  const id = Session.uid();
  if(!id){ CURRENT_USER=null; return null; }
  try{
    const r = await sbGet("users", `id=eq.${id}&limit=1`);
    CURRENT_USER = (r && r[0]) || null;
    if(CURRENT_USER){
      CURRENT_USER.sub = CURRENT_USER.sub || {};
      await syncSubscription(CURRENT_USER);
    }
  }catch(e){ console.error("session load", e); CURRENT_USER=null; }
  return CURRENT_USER;
}

async function activateSubscription(){
  const u = CURRENT_USER; if(!u) return null;
  const now = new Date();
  u.sub = { active:true, startedAt:now.toISOString(), renewAt:addMonth(now).toISOString(),
            spinsLeft:PLAN.spins, price:PLAN.priceNum, totalSpins:(u.sub&&u.sub.totalSpins)||0 };
  u.payments = (u.payments||[]).concat([{amount:PLAN.priceNum, date:now.toISOString(), type:"subscription"}]);
  await DB.updateUser(u.id, {sub:u.sub, payments:u.payments});
  return u;
}
async function cancelSubscription(){
  const u = CURRENT_USER; if(!u || !u.sub) return null;
  u.sub.active=false; u.sub.canceledAt=new Date().toISOString();
  await DB.updateUser(u.id, {sub:u.sub});
  return u;
}
async function buyExtraSpin(){
  const u = CURRENT_USER; if(!u) return null;
  u.sub = u.sub || {active:false, spinsLeft:0, renewAt:addMonth(new Date()).toISOString()};
  u.sub.spinsLeft = (u.sub.spinsLeft||0) + 1;
  u.payments = (u.payments||[]).concat([{amount:PLAN.priceNum, date:new Date().toISOString(), type:"extra"}]);
  await DB.updateUser(u.id, {sub:u.sub, payments:u.payments});
  return u;
}
async function consumeSpin(){
  const u = CURRENT_USER; if(!u || !u.sub) return null;
  u.sub.spinsLeft = Math.max(0,(u.sub.spinsLeft||0)-1);
  u.sub.totalSpins = (u.sub.totalSpins||0)+1;
  await DB.updateUser(u.id, {sub:u.sub});
  return u;
}
function subInfo(){
  const u = CURRENT_USER; if(!u) return null;
  const s = u.sub || {};
  return {
    active: !!s.active,
    spinsLeft: s.spinsLeft||0,
    renewAt: s.renewAt || null,
    renewText: s.renewAt ? fmtDate(s.renewAt) : "—",
    canSpin: (s.spinsLeft||0) > 0
  };
}

/* səhifə girişi: sessiyanı Supabase-dən yüklə, yoxdursa auth-a at */
async function requireAuth(){
  const u = await loadSession();
  if(!u || !u.verified){
    location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop()||"index.html");
    return null;
  }
  return u;
}
async function updateUser(patch){
  const u = CURRENT_USER; if(!u) return null;
  Object.assign(u, patch);
  await DB.updateUser(u.id, patch);
  return u;
}

/* header */
document.addEventListener("DOMContentLoaded", async ()=>{
  const av=document.querySelector(".avatar");
  if(av && Session.uid()){
    const u = CURRENT_USER || await loadSession();
    if(u && u.verified){ av.title=u.name||u.email; av.classList.add("on"); }
  }
  const out=document.getElementById("logoutBtn");
  if(out) out.onclick=()=>{ Session.logout(); location.href="index.html"; };
});
