// Google Sheet publicado en CSV
// ⚠️ Cambia por tu URL pública CSV
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";

let DATA = [];
let FILTERS = { q: "", seccion: "", ciudad: "", categoria: "" };

const $ = (sel) => document.querySelector(sel);

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
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
      ${it.logo ? `<img class="card-logo" src="${it.logo}" alt="Logo ${it.nombre}">` : ''}
      <div class="card-body">
        <h3 class="card-title">${it.nombre}</h3>
        <p class="card-meta">${[it.categoria,it.ciudad,it.seccion].filter(Boolean).join(" • ")}</p>
        <p class="card-desc">${(it.descripcion||"").slice(0,120)}…</p>
        <a class="card-link" href="detalle.html?id=${it.id}">Ver más</a>
      </div>
    </article>
  `).join("");
}

// ✅ NUEVA FUNCIÓN: Llenar dinámicamente los selectores de los filtros
function populateFilters(){
  const secciones = [...new Set(DATA.map(d=>d.seccion))].filter(Boolean);
  const ciudades = [...new Set(DATA.map(d=>d.ciudad))].filter(Boolean);
  const categorias = [...new Set(DATA.map(d=>d.categoria))].filter(Boolean);

  const renderOptions = (items, id) => {
    const selector = $(`#${id}`);
    selector.innerHTML = `<option value="">Todas</option>` + items.map(item => `<option value="${item}">${item}</option>`).join("");
  };

  renderOptions(secciones, "seccion");
  renderOptions(ciudades, "ciudad");
  renderOptions(categorias, "categoria");
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
    // ✅ CORRECCIÓN: Llamamos a la nueva función para llenar los filtros después de cargar los datos
    populateFilters();
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
