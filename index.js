// Google Sheet publicado en CSV
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1UEe7H53Sshc_xuHx-9JYMD8F6eECQg4czay-54cMQvM/edit?usp=sharing";

let DATA = [];
let FILTERS = { q: "", seccion: "", ciudad: "", categoria: "" };

const $ = (sel) => document.querySelector(sel);

function parseCSV(text){
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h=>h.trim().toLowerCase());
  return lines.map(l=>{
    const cells = l.split(",");
    const obj={};
    headers.forEach((h,i)=>obj[h]=cells[i]?.trim());
    return obj;
  });
}

function renderCards(items){
  $("#results").innerHTML = items.map(it=>`
    <article class="card">
      <img class="card-logo" src="${it.logo}" alt="Logo ${it.nombre}" onerror="this.style.display='none'">
      <div class="card-body">
        <h3 class="card-title">${it.nombre}</h3>
        <p class="card-meta">${[it.categoria,it.ciudad,it.seccion].filter(Boolean).join(" • ")}</p>
        <p class="card-desc">${(it.descripcion||"").slice(0,120)}…</p>
        <a class="card-link" href="detalle.html?id=${it.id}">Ver más</a>
      </div>
    </article>
  `).join("");
}

function applyFilters(){
  const q = FILTERS.q.toLowerCase();
  let list = DATA.filter(r=>{
    return (!q || r.nombre.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q)) &&
           (!FILTERS.seccion || r.seccion===FILTERS.seccion) &&
           (!FILTERS.ciudad || r.ciudad===FILTERS.ciudad) &&
           (!FILTERS.categoria || r.categoria===FILTERS.categoria);
  });
  $("#empty").classList.add("hidden");
  $("#noResults").classList.toggle("hidden", list.length!==0);
  renderCards(list);
}

async function loadData(){
  $("#loading").classList.remove("hidden");
  try{
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    DATA = parseCSV(text);
    $("#loading").classList.add("hidden");
    $("#empty").classList.remove("hidden");
  }catch(e){
    console.error(e);
    $("#loading").classList.add("hidden");
    $("#error").classList.remove("hidden");
  }
}

$("#btnBuscar").addEventListener("click",()=>{ FILTERS.q=$("#q").value; applyFilters(); });
["seccion","ciudad","categoria"].forEach(id=>{
  $("#"+id).addEventListener("change",e=>{ FILTERS[id]=e.target.value; applyFilters(); });
});

loadData();
