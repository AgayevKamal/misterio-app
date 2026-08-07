/* ============================================================
   MISTERIO — Supabase data qatı (saf REST, build yoxdur)
   Bütün istifadəçi, kupon, sifariş və şirkət məlumatları
   artıq localStorage-də deyil, Supabase-də saxlanılır.
   localStorage yalnız aktiv sessiya id-sini saxlayır.
   ============================================================ */
const SUPABASE_URL  = "https://exmsmowqmpxmyeyvioes.supabase.co";
const SUPABASE_ANON  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bXNtb3dxbXB4bXlleXZpb2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwODczNTAsImV4cCI6MjEwMTY2MzM1MH0.2XjtAXS2wHj8y6JgNcni505aAyzHvRexN6rpERynbrc";

const SB_HEADERS = {
  "apikey": SUPABASE_ANON,
  "Authorization": "Bearer " + SUPABASE_ANON,
  "Content-Type": "application/json"
};

async function sb(path, opts={}){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { ...SB_HEADERS, ...(opts.headers||{}) }
  });
  const txt = await res.text();
  let data = null;
  try{ data = txt ? JSON.parse(txt) : null; }catch(e){ data = txt; }
  if(!res.ok) throw new Error((data && data.message) || res.status + " " + txt);
  return data;
}
const sbGet    = (t,q="")   => sb(`${t}?${q}`);
const sbInsert = (t,row)    => sb(t, {method:"POST", body:JSON.stringify(row),
                                      headers:{Prefer:"return=representation"}});
const sbUpdate = (t,q,row)  => sb(`${t}?${q}`, {method:"PATCH", body:JSON.stringify(row),
                                      headers:{Prefer:"return=representation"}});
const sbDelete = (t,q)      => sb(`${t}?${q}`, {method:"DELETE"});

/* SHA-256 parol hash (brauzerdə WebCrypto) */
async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

/* ---------------- İSTİFADƏÇİLƏR ---------------- */
const DB = {
  async userByEmail(email){
    const r = await sbGet("users", `email=eq.${encodeURIComponent(String(email).toLowerCase())}&limit=1`);
    return (r && r[0]) || null;
  },
  async createUser(u){
    const row = {
      name:u.name, email:String(u.email).toLowerCase(), phone:u.phone||null,
      pass_hash: await sha256(u.pass), verified:false, code:u.code,
      sub:{}, payments:[]
    };
    const r = await sbInsert("users", row);
    return r[0];
  },
  async updateUser(id, patch){
    const r = await sbUpdate("users", `id=eq.${id}`, patch);
    return r[0];
  },
  async checkPass(user, pass){
    return user.pass_hash === await sha256(pass);
  },

  /* ---------------- KUPONLAR ---------------- */
  async coupons(userId){
    return await sbGet("coupons", `user_id=eq.${userId}&status=eq.active&order=created_at.desc`);
  },
  async addCoupon(userId, c){
    const r = await sbInsert("coupons", {
      user_id:userId, seg_id:c.segId||null, shop:c.shop, disc:c.disc,
      cat:c.cat, code:c.code, status:"active"
    });
    return r[0];
  },
  async couponByCode(code){
    const r = await sbGet("coupons", `code=eq.${encodeURIComponent(code)}&limit=1`);
    return (r && r[0]) || null;
  },
  async useCoupon(id){
    return await sbUpdate("coupons", `id=eq.${id}`, {status:"used", used_at:new Date().toISOString()});
  },
  async removeCoupon(id){ return await sbDelete("coupons", `id=eq.${id}`); },

  /* ---------------- ŞİRKƏTLƏR ---------------- */
  async companies(){ return await sbGet("companies", "order=created_at.desc"); },
  async companyByEmail(email){
    const r = await sbGet("companies", `email=eq.${encodeURIComponent(String(email).toLowerCase())}&limit=1`);
    return (r && r[0]) || null;
  },
  async addCompany(c){
    const r = await sbInsert("companies", {
      name:c.name, email:c.email, pass_hash: await sha256(c.pass||"misterio123"),
      cat:c.cat, disc:c.disc, phone:c.phone,
      contract_id:c.contractId||null, signed_at:c.signedAt||new Date().toISOString()
    });
    return r[0];
  },

  /* ---------------- SİFARİŞLƏR ---------------- */
  async orders(companyId){
    const q = companyId ? `company_id=eq.${companyId}&order=created_at.desc` : "order=created_at.desc";
    return await sbGet("orders", q);
  },
  async addOrder(o){
    const r = await sbInsert("orders", {
      company_id:o.companyId||null, company_email:o.companyEmail||null,
      code:o.code, shop:o.shop||null, total:o.total, disc:o.disc, final:o.final
    });
    return r[0];
  }
};
window.DB = DB;
