/* Misterio — ortaq: auth, header, storage */
const LS = {
  get:(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  del:k=>localStorage.removeItem(k)
};

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
const SPIN_PRICE = "9.90 ₼";

function requireAuth(){
  const u = Session.user();
  if(!u || !u.verified){ location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop()); return null; }
  return u;
}
function updateUser(patch){
  const u = Session.user(); if(!u) return null;
  Object.assign(u, patch); Users.put(u); return u;
}

/* header aktiv istifadəçi göstəricisi */
document.addEventListener("DOMContentLoaded",()=>{
  const av = document.querySelector(".avatar");
  if(av){
    const u = Session.user();
    if(u && u.verified){
      av.title = u.name || u.email;
      av.classList.add("on");
    }
  }
  const out = document.getElementById("logoutBtn");
  if(out) out.onclick = ()=>{ Session.logout(); location.href="index.html"; };
});
