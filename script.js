// =====================
// CONFIG
// =====================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";

// Arrancar VACÍO (no mostrar tarjetas hasta buscar/filtrar)
const START_EMPTY = true;

let DATA = [];

// =====================
// HELPERS
// =====================
function norm(row){
  const out = {};
  Object.keys(row).forEach(k=>{
    const nk = String(k||"").trim();
    out[nk] = String(row[k] ?? "").trim();
  });
  return out;
}
const unique = (a)=>[...new Set(a.filter(Boolean))].sort();

function pickLogo(it){
  // Prioridad: URL en Sheet (Logo1/Logo/logo) -> carpeta por Id -> placeholder
  const fromSheet = it.Logo1 || it.Logo || it.logo;
  if (fromSheet) return fromSheet;
  if (it.Id) return `imagenes/${it.Id}/logo.png`;
  return "https://via.placeholder.com/600x400?text=Sin+imagen";
}

// Galería: Logo1/Imagen1..3; si faltan, intenta /imagenes/{Id}/imagenX.jpg
function pickImages(it){
  const id = it.Id || "";
  const imgs = [];
  const logo = it.Logo1 || it.Logo || it.logo || (id ? `imagenes/${id}/logo.png` : "");
  if (logo) imgs.push(logo);
  ["Imagen1","Imagen2","Imagen3","imagen1","imagen2","imagen3"].forEach(k=>{
    const v = it[k]; if (v) imgs.push(v);
  });
  if (id){
    ["imagen1.jpg","imagen2.jpg","imagen3.jpg"].forEach(fn=>{
      imgs.push(`imagenes/${id}/${fn}`);
    });
  }
  return [...new Set(imgs)];
}

// =====================
// CARGA CSV
// =====================
function loadData(){
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({data})=>{
      DATA = data.map(norm);
      populateFilters();
      renderEmptyMessage();     // inicio vacío
      attachListHandlers();     // engancha eventos de filtros/buscador
    },
    error: ()=>{
      document.getElementById("results").innerHTML =
        `<p style="color:red">⚠️ No se pudo cargar la base.</p>`;
    }
  });
}

// =====================
// LISTA (INDEX)
// =====================
function populateFilters(){
  fill("seccionFilter",  unique(DATA.map(i=>i.Seccion)));
  fill("ciudadFilter",   unique(DATA.map(i=>i.Ciudad)));
  fill("categoriaFilter",unique(DATA.map(i=>i.Categoria)));
}
function fill(id, opts){
  const sel = document.getElementById(id);
  opts.forEach(v=>{
    const o=document.createElement("option");
    o.value=v; o.textContent=v; sel.appendChild(o);
  });
}

function getFilters(){
  return {
    q  : document.getElementById("searchInput").value.toLowerCase().trim(),
    sec: document.getElementById("seccionFilter").value,
    cdd: document.getElementById("ciudadFilter").value,
    cat: document.getElementById("categoriaFilter").value
  };
}

function renderEmptyMessage(){
  document.getElementById("results").innerHTML =
    `<p style="color:#666">Escribe algo en <b>Buscar</b> o usa los filtros.</p>`;
}

function renderList(){
  const box = document.getElementById("results");
  const {q,sec,cdd,cat} = getFilters();

  const nothingSelected = !q && !sec && !cdd && !cat;
  if (START_EMPTY && nothingSelected){
    renderEmptyMessage();
    return;
  }

  const list = DATA.filter(it=>{
    const mq  = !q   || (it.Nombre && it.Nombre.toLowerCase().includes(q)) ||
                        (it.Descripcion && it.Descripcion.toLowerCase().includes(q));
    const ms  = !sec || it.Seccion===sec;
    const mc  = !cdd || it.Ciudad===cdd;
    const mcat= !cat || it.Categoria===cat;
    return mq && ms && mc && mcat;
  });

  box.innerHTML = "";

  if (!list.length){
    box.innerHTML = `<p style="color:#666">No hay resultados.</p>`;
    return;
  }

  list.forEach(it=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${pickLogo(it)}" alt="logo ${it.Nombre||''}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Sin+imagen'">
      <h3>${it.Nombre||""}</h3>
      <p><b>${it.Categoria||""}</b> - ${it.Ciudad||""}, Sección ${it.Seccion||""}</p>
      <p>${it.Descripcion||""}</p>
      <a class="btn" href="#" data-id="${it.Id||''}">Ver más</a>
    `;
    box.appendChild(card);
  });

  attachDetailLinks(); // clic en “Ver más”
}

// =====================
// DETALLE EN LA MISMA PÁGINA
// =====================
function renderDetail(it){
  const box = document.getElementById("results");
  const imgs = pickImages(it);

  box.innerHTML = `
    <a class="back" href="#" style="text-decoration:none;color:#374151;display:inline-block;margin-bottom:10px">&larr; Volver</a>
    <div class="detail">
      <h2>${it.Nombre||""}</h2>
      <div class="meta"><b>${it.Categoria||""}</b> — ${it.Ciudad||""}, Sección ${it.Seccion||""}</div>
      <p>${it.Descripcion||""}</p>

      <div class="gallery">
        ${imgs.map(src=>`<img src="${src}" alt="" onerror="this.style.display='none'">`).join("")}
      </div>
    </div>
  `;

  // volver a la lista
  box.querySelector(".back").addEventListener("click",(e)=>{
    e.preventDefault();
    renderList();
  });
}

// =====================
// EVENTOS
// =====================
function attachListHandlers(){
  // cuando cambien buscador o filtros → pintar lista
  ["searchInput","seccionFilter","ciudadFilter","categoriaFilter"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id==="searchInput"?"input":"change", renderList);
  });
}

function attachDetailLinks(){
  document.querySelectorAll('#results .btn[data-id]').forEach(a=>{
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      const id = a.getAttribute("data-id");
      const it = DATA.find(r => (r.Id||"") === id);
      if (it) renderDetail(it);
    });
  });
}

// =====================
// INIT
// =====================
loadData();
