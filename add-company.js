
const q=id=>document.getElementById(id);
const sel=q("cCat");
MA.sirketFormu();
loadCompanies().then(()=>renderList());
CATEGORY_LIST.forEach(c=>{
  const o=document.createElement("option"); o.value=c.key; o.textContent=c.icon+" "+c.name; sel.appendChild(o);
});

/* ---------- Müqavilə mətni (real Müqavilə Final) ---------- */
function fmtDate(d){ return (d||new Date()).toLocaleDateString("az-AZ"); }
function catName(k){ return (CATEGORY_LIST.find(x=>x.key===k)||{}).name || k; }

function contractHTML(c){
  const today = fmtDate();
  return `
  <p style="text-align:center"><b>TƏRƏFDAŞLIQ VƏ ENDİRİM TƏMİNATI MÜQAVİLƏSİ</b><br>
  ("Misterio" Şəxs1 ilə Tərəfdaş arasında)</p>
  <p>Bu Müqavilə aşağıda göstərilən tərəflər arasında, Misterio rəqəmsal endirim platforması çərçivəsində əməkdaşlığın şərtlərini müəyyən etmək məqsədilə bağlanır.</p>
  <p><b>Bağlanma tarixi:</b> ${today}</p>

  <p><b>TƏRƏFLƏR</b></p>
  <p><b>1.</b> Misterio platformasının təmsilçisi Kamal Ağayev (bundan sonra — "Şəxs1"):<br>
  &nbsp;&nbsp;• Fiziki şəxsin adı: Kamal Ağayev<br>
  &nbsp;&nbsp;• VÖEN / şəxsiyyət vəsiqəsi №: 1203626292<br>
  &nbsp;&nbsp;• Təmsil edən şəxs, vəzifəsi: Təsisçi</p>
  <p><b>2.</b> Tərəfdaş müəssisə (bundan sonra — "Tərəfdaş"):<br>
  &nbsp;&nbsp;• Müəssisənin adı: <b>${c.name}</b><br>
  &nbsp;&nbsp;• Fəaliyyət kateqoriyası: <b>${catName(c.cat)}</b><br>
  &nbsp;&nbsp;• Ünvan: <b>${c.addr}</b><br>
  &nbsp;&nbsp;• Əlaqə telefonu / e-mail: <b>${c.phone}</b> / <b>${c.email}</b></p>

  <p><b>1. Müqavilənin predmeti</b></p>
  <p>1. Şəxs1 öz rəqəmsal tətbiqi (Misterio) vasitəsilə istifadəçilərə (bundan sonra — "Müştəri") Tərəfdaşın müəyyən etdiyi endirim faizini təqdim edən elektron kupon kodları təqdim edir.</p>
  <p>2. Tərəfdaş bu Müqaviləni imzalamaqla, aşağıdakı 2-ci bənddə göstərilən endirim şərtlərini Şəxs1 vasitəsilə gələn hər bir Müştəriyə tətbiq etməyi öhdəsinə götürür.</p>
  <p>3. Bu Müqavilə Tərəfdaşın Şəxs1-in platformasında qeydiyyatının rəsmi təsdiqi hesab olunur və Tərəfdaşın Misterio çarxında (spin) iştirak etməsi üçün əsasdır.</p>

  <p><b>2. Razılaşdırılmış endirim şərtləri</b></p>
  <p>Təklif edilən endirim faizi (%): <b>${c.disc}%</b></p>
  <p>1. Tərəfdaş yuxarıda göstərilən endirim faizini, Müştəri tərəfindən etibarlı Misterio kupon kodu təqdim edildiyi hər halda, heç bir istisna qoymadan tətbiq etməyi təəhhüd edir.</p>
  <p>2. Endirimin məbləği tamamilə Tərəfdaşın öz hesabına aiddir — Şəxs1 endirimin maliyyə yükünü Tərəfdaşa kompensasiya etmir.</p>

  <p><b>3. Tərəfdaşın öhdəlikləri</b></p>
  <p>1. Kupon kodu təqdim edən hər bir Müştəriyə, kodun etibarlılığını yoxladıqdan sonra, razılaşdırılmış faiz həcmində endirim tətbiq etmək.</p>
  <p>2. Kupon kodunun etibarlılığını əsassız şəkildə rədd etməmək və ya süni maneələr yaratmamaq. Belə bir hal yarandığı halda isə müştəriyə alternativlər təqdim etmək.</p>
  <p>3. Hər təsdiqlənmiş sifarişi Şəxs1 tərəfindən təqdim olunan admin panel vasitəsilə (sifariş məbləği, tətbiq olunan endirim, yekun məbləğ) qeydə almaq.</p>
  <p>4. Endirim şərtlərində hər hansı dəyişiklik etmək istədikdə, bunu qabaqcadan (ən azı 7 (yeddi) təqvim günü əvvəl) Şəxs1-ə yazılı şəkildə bildirmək.</p>

  <p><b>4. Öhdəliyin pozulması və məsuliyyət</b></p>
  <p>1. Əgər Tərəfdaş bu Müqavilədə razılaşdırılmış endirimi əsassız olaraq tətbiq etməzsə və ya imtina edərsə, bu, Müqavilənin bilavasitə pozulması sayılır.</p>
  <p>2. Bu cür pozuntu nəticəsində Müştəriyə dəyən hər hansı maddi və ya mənəvi zərər tamamilə Tərəfdaşın öz məsuliyyətinə aiddir.</p>
  <p>3. Şəxs1, Tərəfdaşın öhdəliyi pozması nəticəsində yaranan birbaşa maddi zərərə görə məsuliyyət daşımır, lakin belə halların araşdırılmasında Müştəriyə dəstək məqsədilə sübut materiallarını (kupon istifadəsi tarixçəsi, admin panel qeydləri) təqdim edə bilər.</p>
  <p>4. Tərəfdaş tərəfindən 3 (üç) və ya daha çox təsdiqlənmiş pozuntu halının qeydə alınması Şəxs1-ə yazılı bildiriş göndərməklə Tərəfdaşı birtərəfli qaydada platformadan çıxarmaq hüququ verir.</p>

  <p><b>5. Müqavilənin qüvvədə olma müddəti və ləğvi</b></p>
  <p>1. Bu Müqavilə imzalandığı tarixdən qüvvəyə minir və qarşılıqlı razılaşma olmadıqda müddətsiz olaraq bağlanır.</p>
  <p>2. Hər bir Tərəf, digər Tərəfə ən azı 14 (on dörd) təqvim günü əvvəl yazılı bildiriş göndərməklə, əsas göstərmədən Müqaviləni birtərəfli qaydada ləğv edə bilər.</p>
  <p>3. Müqavilənin ləğvi, ləğvdən əvvəl yaranmış öhdəliklərə (o cümlədən artıq təqdim edilmiş, lakin hələ istifadə olunmamış kuponlara) təsir etmir — bu cür kuponlar öz etibarlılıq müddəti bitənə qədər qüvvədə qalır.</p>

  <p><b>6. Digər şərtlər</b></p>
  <p>1. Bu Müqavilə Azərbaycan Respublikasının qüvvədə olan qanunvericiliyinə uyğun tənzimlənir.</p>
  <p>2. Tərəflər arasında yaranan mübahisələr ilk növbədə danışıqlar yolu ilə həll edilməyə çalışılır; nəticə əldə olunmadıqda, mübahisə Azərbaycan Respublikasının müvafiq məhkəməsinə göndərilir.</p>
  <p>3. Bu Müqavilə 2 (iki) əsl nüsxədə, hər bir Tərəf üçün bir nüsxə olmaqla tərtib edilmişdir və hər iki nüsxə bərabər hüquqi qüvvəyə malikdir.</p>
  <p>4. Bu Müqaviləyə hər hansı əlavə və dəyişiklik yalnız yazılı formada və hər iki Tərəfin imzası ilə edildikdə qüvvəyə minir.</p>

  <p><b>7. Tərəflərin imzaları</b></p>
  <p><b>ŞƏXS1:</b> Ad, Soyad: Kamal Ağayev | Vəzifə: Təsisçi | Tarix: ${today}</p>
  <p><b>TƏRƏFDAŞ:</b> Ad, Soyad: ${c.sign || "____________"} | Tarix: ${today}</p>
  `;
}

/* ---------- Form submit → müqavilə modalı ---------- */
let pending = null;
q("compForm").onsubmit=e=>{
  e.preventDefault();
  const err=q("cErr"); err.classList.add("hidden");
  const name=q("cName").value.trim();
  const cat=sel.value;
  const addr=q("cAddr").value.trim();
  const sign=q("cSign").value.trim();
  const disc=parseInt(q("cDisc").value,10);
  const phone=q("cPhone").value.trim();
  if(name.length<2){ err.textContent="Şirkət adı çox qısadır."; err.classList.remove("hidden"); return; }
  if(addr.length<3){ err.textContent="Ünvan daxil edin."; err.classList.remove("hidden"); return; }
  if(sign.length<3){ err.textContent="Tərəfdaşın adı və soyadını daxil edin."; err.classList.remove("hidden"); return; }
  if(!(disc>=5&&disc<=90)){ err.textContent="Endirim faizi 5-90 aralığında olmalıdır."; err.classList.remove("hidden"); return; }
  if(phone.replace(/\D/g,"").length<7){ err.textContent="Əlaqə nömrəsi düzgün deyil."; err.classList.remove("hidden"); return; }
  const email=(q("cEmail")?q("cEmail").value.trim().toLowerCase():"");
  const pass=(q("cPass")?q("cPass").value:"");
  if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)){ err.textContent="Admin paneli üçün düzgün email daxil edin."; err.classList.remove("hidden"); return; }
  if(pass.length<6){ err.textContent="Admin paneli şifrəsi ən azı 6 simvol olmalıdır."; err.classList.remove("hidden"); return; }
  pending={name,cat,addr,sign,disc,phone,email,pass};
  q("contractText").innerHTML=contractHTML(pending);
  q("agreeChk").checked=false;
  q("signBtn").disabled=true;
  q("contractErr").classList.add("hidden");
  q("contractModal").classList.remove("hidden");
};

q("agreeChk").onchange=e=>{ q("signBtn").disabled=!e.target.checked; };
q("contractCancel").onclick=()=>q("contractModal").classList.add("hidden");

/* ---------- İmzala → sistem prosesi (simulyasiya) ---------- */
let lastContract=null;
q("signBtn").onclick=async()=>{
  if(!q("agreeChk").checked || !pending) return;
  q("signBtn").disabled=true;
  const ts=new Date();
  const rec={
    id:"C-"+ts.getTime(),
    companyName:pending.name,
    cat:pending.cat, disc:pending.disc, phone:pending.phone,
    address:pending.addr, sign:pending.sign, email:pending.email,
    signedAt:ts.toISOString(),
    ip:clientIp(),
    version:CONTRACT_VERSION,
    status:"aktiv"
  };
  try{
    const r = await addCompany({
      name:pending.name, cat:pending.cat, disc:pending.disc, phone:pending.phone,
      address:pending.addr, email:pending.email, password:pending.pass
    });
    if(r && r.company){ rec.companyId = r.company.id; MA.sirketElaveEtdi(pending.cat); }
  }catch(e){
    q("contractErr").textContent="Baza xətası: "+e.message+" (bu email artıq qeydiyyatdadır?)";
    q("contractErr").classList.remove("hidden");
    q("signBtn").disabled=false;
    return;
  }
  rec.pdf = makePdf(rec);
  lastContract=rec;

  q("contractModal").classList.add("hidden");
  q("okTxt").textContent=`${pending.name} — ${pending.disc}%`;
  q("okSub").textContent=`"${(CATEGORY_LIST.find(x=>x.key===pending.cat)||{}).name}" kateqoriyasına və çarxa əlavə olundu. Ümumi seqment: ${DATA[pending.cat].shops.length}`;
  q("okMeta").innerHTML=
    `<div>📄 Müqavilə: <b>${rec.id}</b> · ${CONTRACT_VERSION}</div>
     <div>🕒 İmzalanma: ${ts.toLocaleString("az-AZ")}</div>
     <div>🌐 IP: ${rec.ip}</div>
     <div>✅ Supabase <code>companies</code> cədvəlinə yazıldı · ID: <b>${rec.companyId}</b></div>
     <div>🔐 Admin paneli girişi: <b>${pending.email}</b> · şifrə: təyin etdiyiniz şifrə</div>
     <div id="mailStatus" style="color:#ffcf5c">📧 Müqavilə email-ə göndərilir…</div>`;
  q("okModal").classList.remove("hidden");
  q("compForm").reset();
  renderList();

  /* ---------- Müştəriyə email + PDF göndər ---------- */
  if(rec.pdf){
    try{
      const mr = await fetch("/api/company", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ action:"contract", email:pending.email, companyName:pending.name, id:rec.id, pdf:rec.pdf })
      });
      const mj = await mr.json().catch(()=>({}));
      const ms = q("mailStatus");
      if(mr.ok && mj.ok){ ms.textContent="✅ Müqavilə PDF şəklində "+pending.email+" ünvanına göndərildi."; }
      else { ms.textContent="⚠️ Müqavilə yaradıldı, amma email göndərilmədi: "+(mj.error||"xəta"); }
    }catch(err){ const ms=q("mailStatus"); ms.textContent="⚠️ Email göndərmə xətası: "+err.message; }
  }
};

/* ---------- PDF (jsPDF + DejaVuSans üçün Azərbaycan hərfləri) ---------- */
function ensureFont(doc){
  if(doc.__fontReady) return;
  try{
    if(window.DEJAVU_SANS_BASE64){
      doc.addFileToVFS("DejaVuSans.ttf", window.DEJAVU_SANS_BASE64);
      doc.addFont("DejaVuSans.ttf","DejaVuSans","normal");
      doc.setFont("DejaVuSans","normal");
    }
  }catch(e){ /* fallback standart şrift */ }
  doc.__fontReady = true;
}

function makePdf(rec){
  if(!window.jspdf || !window.jspdf.jsPDF){ return null; }
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({unit:"pt",format:"a4"});
  ensureFont(doc);
  const L=doc.splitTextToSize.bind(doc);
  const W=515; let y=56;
  const title=(t,sz=18)=>{ doc.setFontSize(sz); doc.text(t,40,y); y+=sz+8; };
  const h=(t)=>{ doc.setFontSize(12.5); doc.text(t,40,y); y+=18; };
  const p=(t)=>{ doc.setFontSize(10.5); L(t,W).forEach(ln=>{ if(y>790){doc.addPage();y=56;} doc.text(ln,40,y); y+=14; }); y+=4; };
  const today=(new Date()).toLocaleDateString("az-AZ");
  const cn=(CATEGORY_LIST.find(x=>x.key===rec.cat)||{}).name||rec.cat;

  title("Misterio — Tərəfdaşlıq və Endirim Təminatı Müqaviləsi");
  p(`Müqavilə nömrəsi: ${rec.id}   ·   Versiya: ${rec.version}   ·   Bağlanma tarixi: ${today}`);
  h("TƏRƏFLƏR");
  p("1. Misterio platformasının təmsilçisi Kamal Ağayev (Şəxs1): Fiziki şəxsin adı: Kamal Ağayev · VÖEN / şəxsiyyət vəsiqəsi №: 1203626292 · Vəzifəsi: Təsisçi.");
  p(`2. Tərəfdaş müəssisə: Müəssisənin adı: ${rec.companyName} · Fəaliyyət kateqoriyası: ${cn} · Ünvan: ${rec.address||"—"} · Əlaqə: ${rec.phone} / ${rec.email}.`);
  h("1. Müqavilənin predmeti");
  p("1. Şəxs1 öz rəqəmsal tətbiqi (Misterio) vasitəsilə istifadəçilərə (Müştəri) Tərəfdaşın müəyyən etdiyi endirim faizini təqdim edən elektron kupon kodları təqdim edir.");
  p("2. Tərəfdaş bu Müqaviləni imzalamaqla, aşağıdakı 2-ci bənddə göstərilən endirim şərtlərini Şəxs1 vasitəsilə gələn hər bir Müştəriyə tətbiq etməyi öhdəsinə götürür.");
  p("3. Bu Müqavilə Tərəfdaşın Şəxs1-in platformasında qeydiyyatının rəsmi təsdiqi hesab olunur və Misterio çarxında (spin) iştirakı üçün əsasdır.");
  h("2. Razılaşdırılmış endirim şərtləri");
  p(`Təklif edilən endirim faizi (%): ${rec.disc}%. Tərəfdaş bu faizi, Müştəri tərəfindən etibarlı Misterio kupon kodu təqdim edildiyi hər halda heç bir istisna qoymadan tətbiq edir. Endirimin məbləği tamamilə Tərəfdaşın öz hesabına aiddir.`);
  h("3. Tərəfdaşın öhdəlikləri");
  p("1. Kupon təqdim edən hər Müştəriyə kodun etibarlılığını yoxladıqdan sonra razılaşdırılmış faiz həcmində endirim tətbiq etmək. 2. Kodu əsassız rədd etməmək. 3. Hər sifarişi admin panel vasitəsilə qeydə almaq. 4. Dəyişiklik etməzdən ən azı 7 gün əvvəl yazılı bildirmək.");
  h("4. Öhdəliyin pozulması və məsuliyyət");
  p("1. Endirimin əsassız tətbiq edilməməsi Müqavilənin pozulması sayılır. 2. Müştəriyə dəyən zərər Tərəfdaşın məsuliyyətindədir. 4. 3 və ya daha çox təsdiqlənmiş pozuntu Şəxs1-ə Tərəfdaşı birtərəfli çıxarmaq hüququ verir.");
  h("5. Müqavilənin qüvvədə olma müddəti və ləğvi");
  p("1. İmzalandığı tarixdən qüvvəyə minir, müddətsizdir. 2. Hər Tərəf 14 gün əvvəl bildirişlə birtərəfli ləğv edə bilər. 3. Ləğv artıq verilmiş kuponlara təsir etmir.");
  h("6. Digər şərtlər");
  p("Azərbaycan Respublikası qanunvericiliyinə uyğundur. Mübahisələr danışıqlarla həll olunur, olmasa məhkəməyə göndərilir. 2 əsl nüsxədə, bərabər hüquqludur. Əlavələr yalnız yazılı və hər iki tərəfin imzası ilə qüvvəyə minir.");
  h("7. Tərəflərin imzaları");
  p(`ŞƏXS1: Kamal Ağayev, Təsisçi — Tarix: ${today}.`);
  p(`TƏRƏFDAŞ: ${rec.sign||"________________"} — Tarix: ${today}.`);
  p(`İmzalanma: ${(new Date(rec.signedAt)).toLocaleString("az-AZ")} · IP: ${rec.ip} · Status: ${rec.status}`);
  return doc.output("datauristring");
}
q("dlPdf").onclick=()=>{
  if(lastContract && window.jspdf){
    const fresh = makePdf(lastContract) || lastContract.pdf;
    if(fresh){
      // datauristring-i blob-a çevirib yüklə
      const a=document.createElement("a");
      a.href=fresh; a.download=`misterio-muqavile-${lastContract.id}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      alert("PDF modulu yüklənməyib (offline?). Səhifəni yeniləyin.");
    }
  } else {
    alert("PDF modulu yüklənməyib (offline?). Səhifəni yeniləyin.");
  }
};

q("okMore").onclick=()=>q("okModal").classList.add("hidden");

function renderList(){
  const list=customCompanies();
  const box=q("compList");
  if(!list.length){ box.innerHTML='<p class="sub">Hələ əlavə edilmiş şirkət yoxdur.</p>'; return; }
  box.innerHTML="";
  list.slice().reverse().forEach(c=>{
    const cat=CATEGORY_LIST.find(x=>x.key===c.cat);
    const d=document.createElement("div");
    d.className="comp-row";
    d.innerHTML=`<div><b>${c.name}</b><div class="sub">${cat?cat.icon+" "+cat.name:c.cat} · ${c.phone||"—"}</div></div>
                 <span class="disc-pill">-${c.disc}%</span>`;
    box.appendChild(d);
  });
}
renderList();
