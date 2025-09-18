// === CONFIG ===
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";
const SHOW_ALL_BY_DEFAULT = true;

let DATA = [];

// Normaliza claves/valores
function norm(row){
  const out = {};
  Object.keys(row).forEach(k=>{
    const nk = String(k||"").trim();
    out[nk] = String(row[k] ?? "").trim();
  });
  return out;
}

// Prioridad imagen: del Sheet (Logo1/Logo/logo) -> carpeta por Id -> placeholder
function pickLogo(item){
  const fromSheet = item.Logo1 || item.Logo || item.logo;
  if (fromSheet) return fromSheet;
  if (item.Id)   return `imagenes/${item.Id}/logo.png`;
  return "https://via.placeholder.com/600x400?text=Sin+imagen";
}

// Cargar datos
function loadData(){
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({data})=>{
      DATA = data.map(norm);
      populateFilters();
      renderResults();
    },
    error: (err)=>{
      console.error("PapaParse error:", err);
      document.getElementById("results").innerHTML =
        `<p style="color:red">⚠️ No se pudo cargar la base.</p>`;
    }
  });
}

function unique(a){ return [...new Set(a.filter(Boolean))].sort(); }

function populateFilters(){
  fill("seccionFilter",  unique(DATA.map(i=>i.Seccion)));
  fill("ciudadFilter",   unique(DATA.map(i=>i.Ciudad)));
  fill("categoriaFilter",unique(DATA.map(i=>i.Categoria)));
}
function fill(id, options){
  const sel = document.getElementById(id);
  options.forEach(v=>{
    const o=document.createElement("option"); o.value=v; o.textContent=v; sel.appendChild(o);
  });
}

function renderResults(){
  const q   = document.getElementById("searchInput").value.toLowerCase().trim();
  const sec = document.getElementById("seccionFilter").value;
  const cdd = document.getElementById("ciudadFilter").value;
  const cat = document.getElementById("categoriaFilter").value;

  let list = DATA.filter(it=>{
    const mq = !q || (it.Nombre && it.Nombre.toLowerCase().includes(q)) ||
                     (it.Descripcion && it.Descripcion.toLowerCase().includes(q));
    const ms = !sec || it.Seccion===sec;
    const mc = !cdd || it.Ciudad===cdd;
    const mcat= !cat || it.Categoria===cat;
    return mq && ms && mc && mcat;
  });

  const box = document.getElementById("results");
  box.innerHTML = "";

  if (!SHOW_ALL_BY_DEFAULT && !q && !sec && !cdd && !cat){
    box.innerHTML = `<p style="color:#666">Escribe algo en <b>Buscar</b> o usa los filtros.</p>`;
    return;
  }
  if (!list.length){
    box.innerHTML = `<p style="color:#666">No hay resultados.</p>`;
    return;
  }

  list.forEach(it=>{
    const card = document.createElement("div");
    card.className = "card";
    const logo = pickLogo(it);

    card.innerHTML = `
      <img src="${logo}" alt="logo ${it.Nombre||''}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Sin+imagen'">
      <h3>${it.Nombre||""}</h3>
      <p><b>${it.Categoria||""}</b> - ${it.Ciudad||""}, Sección ${it.Seccion||""}</p>
      <p>${it.Descripcion||""}</p>
      ${it.Id ? `<a class="btn" href="detalle.html?id=${encodeURIComponent(it.Id)}">Ver más</a>` : ``}
    `;
    box.appendChild(card);
  });
}

// eventos
["searchInput","seccionFilter","ciudadFilter","categoriaFilter"].forEach(id=>{
  document.getElementById(id).addEventListener(id==="searchInput"?"input":"change", renderResults);
});

// iniciar
loadData();
