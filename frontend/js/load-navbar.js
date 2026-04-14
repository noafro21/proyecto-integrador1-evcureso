// ==========================================
// 1. CONFIGURACIÓN DE ACCESIBILIDAD
// ==========================================

// Leer preferencias guardadas o usar valores por defecto
let currentFontSize = parseInt(localStorage.getItem("evcFontSize")) || 16;
let currentTheme = localStorage.getItem("evcTheme") || "light";

// Aplicar estilos inmediatamente al cargar
document.documentElement.style.fontSize = currentFontSize + "px";
document.documentElement.setAttribute("data-theme", currentTheme);
//Activa el Modo Oscuro nativo del framework
document.documentElement.setAttribute("data-bs-theme", currentTheme);

window.toggleTheme = function () {
  currentTheme = currentTheme === "light" ? "dark" : "light";

  // Actualizar atributos en el HTML para activar el tema oscuro en todo el sitio
  document.documentElement.setAttribute("data-theme", currentTheme);
  document.documentElement.setAttribute("data-bs-theme", currentTheme);
  localStorage.setItem("evcTheme", currentTheme);

  // Solución al contraste: Quitamos la clase 'bg-light' de Bootstrap en modo oscuro
  if (currentTheme === "dark") {
    document.body.classList.remove("bg-light");
  } else {
    document.body.classList.add("bg-light");
  }
};

window.changeFontSize = function (step) {
  currentFontSize += step;
  if (currentFontSize < 12) currentFontSize = 12;
  if (currentFontSize > 24) currentFontSize = 24;
  document.documentElement.style.fontSize = currentFontSize + "px";
  localStorage.setItem("evcFontSize", currentFontSize);
};

window.resetFontSize = function () {
  currentFontSize = 16;
  document.documentElement.style.fontSize = "16px";
  localStorage.setItem("evcFontSize", 16);
};

// ==========================================
// 2. INYECCIÓN DEL HTML (NAVBAR Y FOOTER)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const isIndexPage =
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/";

  // Ajustar el body al iniciar por si el usuario ya tenía el modo oscuro guardado
  if (currentTheme === "dark") {
    document.body.classList.remove("bg-light");
  }

  // Inyectar FontAwesome dinámicamente se olvida ponerlo en algún HTML
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement("link");
    faLink.rel = "stylesheet";
    faLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    document.head.appendChild(faLink);
  }

  const navbarContainer = document.getElementById("navbar-container");

  if (navbarContainer) {
    navbarContainer.innerHTML = `
            <nav class="evc-nav navbar navbar-expand-lg navbar-dark container-fluid" aria-label="Navegación principal de Evcureso">
                <a class="navbar-brand d-flex align-items-center" href="index.html" aria-label="Ir a la página de inicio">
                    <img src="./assets/images/logo-1.png" alt="Logo de Evcureso" width="120" height="40" class="me-2"
                        onerror="this.src='https://via.placeholder.com/40x40?text=E'">
                    <span class="evc-brand-name fw-bold"></span>
                </a>
                
                <button class="navbar-toggler shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#evcMainNav"
                    aria-controls="evcMainNav" aria-expanded="false" aria-label="Abrir menú de navegación">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="evcMainNav">
                    <form class="evc-search-form d-flex mx-auto my-2 my-lg-0 w-50" role="search" id="globalSearchForm">
                        <label for="mainSearchInput" class="visually-hidden">Buscar eventos</label>
                        <input class="form-control me-2 evc-search-input shadow-none" type="search" id="mainSearchInput"
                            placeholder="Buscar eventos (Ej. Concierto, Feria...)" aria-label="Buscar">
                        <button class="btn evc-btn-search text-white rounded" type="submit" aria-label="Botón buscar">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </form>

                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        
                        <!--VISTA ESCRITORIO -->
                      <li class="nav-item d-flex align-items-center ms-lg-2 me-lg-3 mb-2 mb-lg-0 border-end border-secondary pe-3 d-none d-lg-flex" role="none">
                            <button type="button" class="btn text-white p-1" onclick="window.changeFontSize(-2)" title="Reducir tamaño de letra" aria-label="Reducir tamaño de letra">
                                <i class="fa-solid fa-minus border rounded p-2 mx-1 evc-hover-shadow"></i>
                            </button>
                            <button type="button" class="btn text-white p-1" onclick="window.resetFontSize()" title="Restaurar tamaño original" aria-label="Restaurar tamaño original">
                                <i class="fa-solid fa-a border rounded p-2 mx-1 evc-hover-shadow"></i>
                            </button>
                            <button type="button" class="btn text-white p-1 me-2" onclick="window.changeFontSize(2)" title="Aumentar tamaño de letra" aria-label="Aumentar tamaño de letra">
                                <i class="fa-solid fa-plus border rounded p-2 mx-1 evc-hover-shadow"></i>
                            </button>
                            <button type="button" class="btn text-white p-1" onclick="window.toggleTheme()" title="Cambiar contraste visual" aria-label="Cambiar contraste visual">
                                <i class="fa-solid fa-circle-half-stroke border rounded p-2 evc-hover-shadow"></i>
                            </button>
                          </li>

                        <!--VISTA MÓVIL -->
                          <li class="nav-item d-flex align-items-center justify-content-center mb-3 d-lg-none w-100 mt-3" role="none">
                            <button type="button" class="btn text-white p-1" onclick="window.changeFontSize(-2)" aria-label="Reducir tamaño de letra">
                                <i class="fa-solid fa-minus border rounded p-2 mx-1"></i>
                            </button>
                            <button type="button" class="btn text-white p-1" onclick="window.resetFontSize()" aria-label="Restaurar tamaño original">
                                <i class="fa-solid fa-a border rounded p-2 mx-1"></i>
                            </button>
                            <button type="button" class="btn text-white p-1 me-2" onclick="window.changeFontSize(2)" aria-label="Aumentar tamaño de letra">
                                <i class="fa-solid fa-plus border rounded p-2 mx-1"></i>
                            </button>
                            <button type="button" class="btn text-white p-1" onclick="window.toggleTheme()" aria-label="Cambiar contraste visual">
                                <i class="fa-solid fa-circle-half-stroke border rounded p-2"></i>
                            </button>
                          </li>

                        <li class="nav-item">
                          ${
                            isIndexPage
                              ? '<span class="nav-link active" aria-current="page">Explorar</span>'
                              : '<a class="nav-link" href="index.html">Explorar</a>'
                          }
                        </li>
                        
                        <li id="authLinksContainer" class="nav-item d-flex align-items-center ms-lg-3 flex-wrap justify-content-center mt-2 mt-lg-0" role="none">
                            <!-- Se llena dinámicamente -->
                        </li>
                    </ul>
                </div>
            </nav>
        `;
  }

  // Comportamiento del buscador
  const searchForm = document.getElementById("globalSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof applyFilters === "function") {
        applyFilters();
      } else {
        const q = document.getElementById("mainSearchInput").value;
        window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // INYECTAR EL FOOTER DE FORMA GLOBAL
  const footerHTML = `
    <footer class="evc-footer text-white mt-5 py-4 w-100">
        <div class="container text-center">
        <p class="mb-2 fw-bold text-white h5">Evcureso - Conectando</p>
            <p class="small mb-3 text-light opacity-75">Descubre, comparte y vive los mejores eventos de tu comunidad.</p>
            <div class="d-flex justify-content-center gap-4 fs-4 mt-3">
          <a href="#facebook" class="text-white text-decoration-none evc-social-icon" title="Facebook" aria-label="Ir a Facebook"><i class="fa-brands fa-facebook"></i></a>
          <a href="#instagram" class="text-white text-decoration-none evc-social-icon" title="Instagram" aria-label="Ir a Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#twitter" class="text-white text-decoration-none evc-social-icon" title="Twitter" aria-label="Ir a Twitter"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="#whatsapp" class="text-white text-decoration-none evc-social-icon" title="WhatsApp" aria-label="Ir a WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
            <hr class="border-light opacity-25 my-4">
            <small class="evc-footer-copy">&copy; 2026 Evcureso. Todos los derechos reservados.</small>
        </div>
    </footer>
  `;
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  setTimeout(window.updateNavbarState, 100);
});

// ==========================================
// 3. ESTADO DE SESIÓN (BOTONES Y ENLACES)
// ==========================================
window.updateNavbarState = function () {
  const authLinksContainer = document.getElementById("authLinksContainer");
  if (!authLinksContainer) return;

  const storedUser = localStorage.getItem("currentUser");

  if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    let roleButtons = "";

    if (currentUser.role === "Promotor") {
      roleButtons += `<a href="event-register.html" class="btn btn-success btn-sm fw-bold m-1"><i class="fa-solid fa-bullhorn me-1"></i> Publicar Oficial</a>`;
    } else if (currentUser.role === "Moderador") {
      roleButtons += `<a href="event-register.html" class="btn btn-success btn-sm fw-bold m-1"><i class="fa-solid fa-bullhorn me-1"></i> Publicar Evento</a>`;
      roleButtons += `<a href="panel-moderator.html" class="btn btn-sm fw-bold m-1 evc-btn-moderator"><i class="fa-solid fa-shield-halved me-1"></i> Panel Moderador</a>`;
    } else {
      roleButtons += `<a href="event-register.html" class="btn evc-btn-suggest text-white btn-sm fw-bold m-1"><i class="fa-solid fa-lightbulb me-1"></i> Sugerir Evento</a>`;
    }

    roleButtons += `<a href="my-profile.html" class="btn btn-outline-light btn-sm fw-bold m-1"><i class="fa-solid fa-user me-1"></i> Mi Perfil</a>`;

    authLinksContainer.innerHTML = `
            <span class="nav-link fw-bold text-light me-3 d-none d-xl-inline">¡Hola, ${currentUser.fullName}!</span>
            ${roleButtons}
            <button class="btn btn-outline-danger btn-sm fw-bold m-1" onclick="window.handleLogout()"><i class="fa-solid fa-right-from-bracket me-1"></i> Salir</button>
        `;
  } else {
    authLinksContainer.innerHTML = `
            <a href="user-login.html" class="nav-link fw-bold text-light me-3"><i class="fa-solid fa-user me-1"></i> Ingresar</a>
            <a href="user-register.html" class="btn evc-btn-submit text-white fw-bold"><i class="fa-solid fa-user-plus me-1"></i> Registrarse</a>
        `;
  }
};

window.handleLogout = function () {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};
