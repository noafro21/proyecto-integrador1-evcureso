// ==========================================
// Lógica para el Perfil de Usuario
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});

function loadUserProfile() {
  const storedUser = localStorage.getItem("currentUser");

  // 1. PROTECCIÓN DE RUTA: Redirigir al login si no hay usuario en sesión
  if (!storedUser) {
    window.location.href = "user-login.html";
    return;
  }

  const currentUser = JSON.parse(storedUser);

  // 2. Referencias a los elementos del DOM en el HTML
  const profileAvatar = document.getElementById("profileAvatar");
  const profileGreeting = document.getElementById("profileGreeting");
  const profileRoleDesc = document.getElementById("profileRoleDesc");
  const profilePoints = document.getElementById("profilePoints");

  // 3. Actualizar la interfaz con los datos del usuario logueado
  if (profileAvatar) {
    // Extraemos la primera letra del nombre y la ponemos en mayúscula para el Avatar
    profileAvatar.innerText = currentUser.fullName.charAt(0).toUpperCase();
  }

  if (profileGreeting) {
    // Dividimos el nombre completo para saludar solo con el primer nombre (Ej: "Juan")
    const primerNombre = currentUser.fullName.split(" ")[0];
    profileGreeting.innerText = `¡Hola, ${primerNombre}!`;
  }

  if (profileRoleDesc) {
    // Modificamos la descripción según el Rol del usuario
    if (currentUser.role === "Explorador") {
      profileRoleDesc.innerText =
        "Explorador de Evcureso. Descubre y sugiere eventos a la comunidad.";
    } else if (currentUser.role === "Promotor") {
      profileRoleDesc.innerText =
        "Promotor Oficial. Publica y gestiona eventos para la comunidad.";
    } else if (currentUser.role === "Moderador") {
      profileRoleDesc.innerText =
        "Moderador del Sistema. Mantén la calidad de los eventos de Copalchi.";
    }
  }

  if (profilePoints) {
    // En un futuro, discoveryPoints vendrá de la Base de Datos. Por ahora mostramos 0.
    const puntos = currentUser.discoveryPoints || 0;
    profilePoints.innerText = `🏆 ${puntos} pts`;
  }

  // 4. Preparar los contenedores para futuras llamadas al Backend
  loadSavedEventsPlaceholder();
  loadUserSuggestionsPlaceholder(currentUser.role);
}

// ==========================================
// FUNCIONES TEMPORALES (Hasta conectar con Backend)
// ==========================================

function loadSavedEventsPlaceholder() {
  const savedEventsContainer = document.getElementById("savedEventsContainer");
  if (!savedEventsContainer) return;

  // Aquí irá el fetch('http://localhost:3000/usuarios/.../eventos-guardados')
  // Por ahora, mostramos que no hay eventos guardados.
  savedEventsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <p class="text-muted fs-5">Aún no has guardado ningún evento para el finde.</p>
            <a href="index.html" class="btn btn-outline-primary fw-bold mt-2">Explorar el catálogo</a>
        </div>
    `;
}

function loadUserSuggestionsPlaceholder(role) {
  const suggestionsContainer = document.getElementById("suggestionsContainer");
  if (!suggestionsContainer) return;

  if (role === "Explorador") {
    suggestionsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Aún no has sugerido ningún evento. ¡Anímate a compartir lo que pasa en Copalchi!
                </td>
            </tr>
        `;
  } else {
    // Promotores y Moderadores no "sugieren", ellos "publican" directamente.
    suggestionsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Como ${role}, tus eventos se publican directamente de forma Oficial en el catálogo.
                </td>
            </tr>
        `;
  }
}
