// ==========================================
// Lógica Global de la Barra de Navegación
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");

  // 1. Inyectar el HTML base de la barra de navegación en cualquier página que lo solicite
  if (navbarContainer) {
    navbarContainer.innerHTML = `
            <nav class="evc-nav navbar navbar-expand-lg navbar-dark container-fluid" aria-label="Navegación principal de Evcureso">
                <a class="navbar-brand d-flex align-items-center" href="index.html" aria-label="Ir a la página de inicio">
                    <img src="assets/images/logo-1.png" alt="Logo de Evcureso" width="100" height="40" class="me-2"
                        onerror="this.src='https://via.placeholder.com/40x40?text=E'">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#evcMainNav"
                    aria-controls="evcMainNav" aria-expanded="false" aria-label="Abrir menú de navegación">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="evcMainNav">
                    <form class="evc-search-form d-flex mx-auto my-2 my-lg-0 w-50" role="search">
                        <label for="mainSearchInput" class="visually-hidden">Buscar eventos, lugares o categorías</label>
                        <input class="form-control me-2 evc-search-input" type="search" id="mainSearchInput"
                            placeholder="Buscar eventos (Ej. Concierto, Feria...)" aria-label="Buscar">
                        <button class="btn evc-btn-search text-white btn-primary" type="submit">Buscar</button>
                    </form>
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="index.html">Explorar</a>
                        </li>
                        <!-- Contenedor dinámico mágico para los botones -->
                        <div id="authLinksContainer" class="d-flex align-items-center ms-lg-3">
                            <!-- Se llena dinámicamente con JavaScript -->
                        </div>
                    </ul>
                </div>
            </nav>
        `;
  }

  // 2. Ejecutar la actualización visual de los botones después de pintar el HTML
  setTimeout(window.updateNavbarState, 100);
});

// ==========================================
// FUNCIONES GLOBALES (Disponibles en toda la app)
// ==========================================

window.updateNavbarState = function () {
  const authLinksContainer = document.getElementById("authLinksContainer");
  if (!authLinksContainer) return;

  const storedUser = localStorage.getItem("currentUser");

  if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    let roleButtons = "";

    // Renderizado dinámico de botones según el rol
    if (currentUser.role === "Promotor") {
      roleButtons += `<a href="./event-register.html" class="btn btn-success btn-sm fw-bold me-2">Publicar Oficial</a>`;
    } else if (currentUser.role === "Moderador") {
      roleButtons += `<a href="./event-register.html" class="btn btn-success btn-sm fw-bold me-2">Publicar Evento</a>`;
      roleButtons += `<a href="panel-moderator.html" class="btn btn-warning btn-sm fw-bold me-2 text-dark">🛡️ Panel Moderador</a>`;
    } else {
      roleButtons += `<a href="./event-register.html" class="btn evc-btn-suggest text-white btn-sm fw-bold me-2">+ Sugerir Evento</a>`;
    }

    roleButtons += `<a href="my-profile.html" class="btn btn-outline-light btn-sm fw-bold me-3">Mi Perfil</a>`;

    authLinksContainer.innerHTML = `
            <span class="nav-link fw-bold text-light me-3 d-none d-md-inline">¡Hola, ${currentUser.fullName}!</span>
            ${roleButtons}
            <button class="btn btn-outline-danger btn-sm fw-bold" onclick="window.handleLogout()">Salir</button>
        `;
  } else {
    // Enlaces correctos apuntando a login.html (tu archivo actual)
    authLinksContainer.innerHTML = `
            <a href="user-login.html" class="nav-link fw-bold text-light me-3">Ingresar</a>
            <a href="user-register.html" class="btn evc-btn-submit text-white fw-bold">Registrarse</a>
        `;
  }
};

window.handleLogout = function () {
  // 1. Limpiamos la memoria
  localStorage.removeItem("currentUser");
  // 2. Obligamos al navegador a volver al inicio y recargar la página limpiamente
  window.location.href = "index.html";
};
