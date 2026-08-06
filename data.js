/* Misterio — kateqoriya və məkan məlumatları */
const BASE_DATA = {
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

/* mystery palitrası — tünd fon üzərində parlaq, lakin premium tonlar */
const COLORS = ["#6d3bff","#a855ff","#c026d3","#ff4d8d","#ff7a45","#ffcf5c",
                "#3ddcff","#2d9bf0","#7c4dff","#e0479e","#f59e0b","#4dd4ac"];

/* istifadəçilərin əlavə etdiyi şirkətlər — localStorage */
function customCompanies(){
  try{ return JSON.parse(localStorage.getItem("mist_companies")) || [] }catch(e){ return [] }
}
function addCompany(c){
  const list = customCompanies();
  list.push(c);
  localStorage.setItem("mist_companies", JSON.stringify(list));
}

/* DATA = baza + əlavə edilmiş şirkətlər, hər sektora unikal ID verilir */
function buildData(){
  const d = JSON.parse(JSON.stringify(BASE_DATA));
  Object.keys(d).forEach(k=>{
    d[k].shops = d[k].shops.map((s,i)=>({...s, id:`${k}-${i}`, catKey:k}));
  });
  customCompanies().forEach((c,i)=>{
    if(!d[c.cat]) return;
    d[c.cat].shops.push({n:c.name, d:c.disc, phone:c.phone, id:`custom-${c.id||i}`, catKey:c.cat, custom:true});
  });
  /* "Hamısı" — bütün kateqoriyaların cəmi */
  const all = [];
  Object.keys(d).forEach(k=> d[k].shops.forEach(s=> all.push({...s})));
  const out = { all:{ icon:"✨", name:"Hamısı", shops:all, isAll:true } };
  Object.keys(d).forEach(k=> out[k]=d[k]);
  return out;
}

let DATA = buildData();
function refreshData(){ DATA = buildData(); return DATA; }

const CATEGORY_LIST = [
  {key:"restoran",  icon:"🍽️", name:"Restoran"},
  {key:"anticafe",  icon:"🕹️", name:"Anticafe"},
  {key:"coworking", icon:"💼", name:"Co-working"},
  {key:"kurslar",   icon:"🎓", name:"Kurslar"},
  {key:"coffee",    icon:"☕", name:"Coffeeshop"},
  {key:"kitab",     icon:"📚", name:"Kitab mağazaları"}
];
