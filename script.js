// =====================
// CONFIGURACIÓN
// =====================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBaU4l9D25rUcPCyLnn_6mDe8_hRRQHG1GLf2QqW708j0W8lmVj10Z6oLK0jh9nPKcXk7Y_VSuRj/pub?gid=0&single=true&output=csv";

// Si quieres mostrar todos los negocios al inicio = true
// Si quieres que aparezcan solo cuando buscan = false
const SHOW_ALL_BY_DEFAULT = true;

// Estado
let DATA = [];

// =====================
// FUNCIONES
// =====================

// Cargar la base desde Google Sheets
function loadData() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    complete: function (results) {
      DATA = results.data;
      populateFilters();
      renderResults();
    },
    error: function () {
      document.getElementById("results").innerHTML =
        `<p style="color:red">⚠️ No se pudo cargar la base.</p>`;
    }
  });
}

// Llenar selects dinámicamente
function populateFilters() {
  fillSelect("seccionFilter", [...new Set(DATA.map(item => item.Seccion).filter(Boolean))]);
  fillSelect("ciudadFilter", [...new Set(DATA.map(item => item.Ciudad).filter(Boolean))]);
  fillSelect("categoriaFilter", [...new Set(DATA.map(item => item.Categoria).filter(Boolean))]);
}

function fillSelect(id, options) {
  const select = document.getElementById(id);
  options.sort().forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

// Renderizar resultados
function renderResults() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const seccion = document.getElementById("seccionFilter").value;
  const ciudad = document.getElementById("ciudadFilter").value;
  const categoria = document.getElementById("categoriaFilter").value;

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  let filtered = DATA.filter(item => {
    const matchesQuery =
      item.Nombre?.toLowerCase().includes(query) ||
      item.Descripcion?.toLowerCase().includes(query);
    const matchesSeccion = seccion ? item.Seccion === seccion : true;
    const matchesCiudad = ciudad ? item.Ciudad === ciudad : true;
    const matchesCategoria = categoria ? item.Categoria === categoria : true;
    return matchesQuery && matchesSeccion && matchesCiudad && matchesCategoria;
  });

  if (!SHOW_ALL_BY_DEFAULT && !query && !seccion && !ciudad && !categoria) {
    resultsContainer.innerHTML =
      `<p style="color:gray">Escribe algo en <b>Buscar</b> o elige <b>Sección/Ciudad/Categoría</b> para ver resultados.</p>`;
    return;
  }

  if (filtered.length === 0) {
    resultsContainer.innerHTML =
      `<p style="color:gray">⚠️ No se encontraron resultados.</p>`;
    return;
  }

  filtered.forEach(item => {
    // Construcción de ruta de imagen:
    // Se asume que en tu Google Sheet hay un campo "Carpeta" (ejemplo: cleanpisimo)
    // y que en GitHub tienes /imagenes/<Carpeta>/logo.png
    let imgPath = "";
    if (item.Carpeta) {
      imgPath = `imagenes/${item.Carpeta}/logo.png`;
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${imgPath ? `<img src="${imgPath}" alt="logo" class="logo">` : ""}
      <h2>${item.Nombre}</h2>
      <p><b>${item.Categoria}</b> - ${item.Ciudad}, Sección ${item.Seccion}</p>
      <p>${item.Descripcion || ""}</p>
      <a href="#">Ver más</a>
    `;

    resultsContainer.appendChild(card);
  });
}

// =====================
// EVENTOS
// =====================
document.getElementById("searchInput").addEventListener("input", renderResults);
document.getElementById("seccionFilter").addEventListener("change", renderResults);
document.getElementById("ciudadFilter").addEventListener("change", renderResults);
document.getElementById("categoriaFilter").addEventListener("change", renderResults);

// =====================
// INICIO
// =====================
loadData();
