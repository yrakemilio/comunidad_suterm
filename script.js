// =====================
// CONFIG
// =====================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";
const SHOW_ALL_BY_DEFAULT = true; // muestra todo al inicio

let DATA = [];

// =====================
// HELPERS
// =====================
function normKeys(row) {
  const out = {};
  Object.keys(row).forEach(k => {
    const nk = String(k || "").trim();
    out[nk] = String(row[k] ?? "").trim();
  });
  return out;
}

// Prioridad de imagen:
// 1) URL del Sheet (Logo1 / Logo / logo)
// 2) Carpeta por Id en GitHub: imagenes/{Id}/logo.png
// 3) Placeholder
function pickLogo(item) {
  const fromSheet =
    item.Logo1 || item.Logo || item.logo || "";
  if (fromSheet) return fromSheet;
  if (item.Id) return `imagenes/${item.Id}/logo.png`;
  return "https://via.placeholder.com/600x400?text=Sin+imagen";
}

// =====================
// CARGA DE DATOS
// =====================
function loadData() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({ data }) => {
      DATA = data.map(normKeys);
      populateFilters();
      renderResults();
    },
    error: (err) => {
      console.error(err);
      document.getElementById("results").innerHTML =
        `<p style="color:red">⚠️ No se pudo cargar la base.</p>`;
    }
  });
}

// =====================
// FILTROS DINÁMICOS
// =====================
function unique(list) {
  return [...new Set(list.filter(Boolean))].sort();
}

function populateFilters() {
  fillSelect("seccionFilter", unique(DATA.map(i => i.Seccion)));
  fillSelect("ciudadFilter", unique(DATA.map(i => i.Ciudad)));
  fillSelect("categoriaFilter", unique(DATA.map(i => i.Categoria)));
}

function fillSelect(id, options) {
  const sel = document.getElementById(id);
  options.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

// =====================
// RENDER RESULTADOS
// =====================
function renderResults() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const sec = document.getElementById("seccionFilter").value;
  const cdd = document.getElementById("ciudadFilter").value;
  const cat = document.getElementById("categoriaFilter").value;

  let list = DATA.filter(it => {
    const matchQ = !q ||
      (it.Nombre && it.Nombre.toLowerCase().includes(q)) ||
      (it.Descripcion && it.Descripcion.toLowerCase().includes(q));
    const matchS = !sec || it.Seccion === sec;
    const matchC = !cdd || it.Ciudad === cdd;
    const matchCat = !cat || it.Categoria === cat;
    return matchQ && matchS && matchC && matchCat;
  });

  const box = document.getElementById("results");
  box.innerHTML = "";

  if (!SHOW_ALL_BY_DEFAULT && !q && !sec && !cdd && !cat) {
    box.innerHTML = `<p style="color:#666">Escribe algo en <b>Buscar</b> o elige <b>Sección/Ciudad/Categoría</b> para ver resultados.</p>`;
    return;
  }

  if (list.length === 0) {
    box.innerHTML = `<p style="color:#666">No hay resultados.</p>`;
    return;
  }

  list.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";

    const logo = pickLogo(it);

    card.innerHTML = `
      <img src="${logo}" alt="logo ${it.Nombre || ''}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Sin+imagen'">
      <h3>${it.Nombre || ""}</h3>
      <p><b>${it.Categoria || ""}</b> - ${it.Ciudad || ""}, Sección ${it.Seccion || ""}</p>
      <p>${it.Descripcion || ""}</p>
      ${it.link_pagina ? `<a class="btn" target="_blank" rel="noopener" href="${it.link_pagina}">Ver más</a>` : ``}
    `;
    box.appendChild(card);
  });
}

// =====================
// EVENTOS
// =====================
["searchInput","seccionFilter","ciudadFilter","categoriaFilter"].forEach(id => {
  document.getElementById(id).addEventListener(id==="searchInput"?"input":"change", renderResults);
});

// =====================
// INIT
// =====================
loadData();
