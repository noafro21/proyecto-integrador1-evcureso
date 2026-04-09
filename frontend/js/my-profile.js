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
    profileAvatar.innerText = currentUser.fullName.charAt(0).toUpperCase();
  }

  if (profileGreeting) {
    const primerNombre = currentUser.fullName.split(" ")[0];
    profileGreeting.innerText = `¡Hola, ${primerNombre}!`;
  }

  if (profileRoleDesc) {
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
    const puntos = currentUser.discoveryPoints || 0;
    profilePoints.innerText = `🏆 ${puntos} pts`;
  }

  // 4. Preparar los contenedores para futuras llamadas al Backend
  loadSavedEventsPlaceholder();
  loadUserSuggestionsPlaceholder(currentUser.role);
}

// ==========================================
// CARGAR: Eventos guardados del usuario (Plan Finde)
// ==========================================
async function loadSavedEventsPlaceholder() {
  const savedEventsContainer = document.getElementById("savedEventsContainer");
  if (!savedEventsContainer) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  try {
    const response = await fetch(
      `http://localhost:3000/usuarios/${currentUser.id}/eventos-guardados`,
    );

    if (!response.ok) throw new Error("Error al obtener los eventos");

    const savedEvents = await response.json();

    if (savedEvents.length === 0) {
      savedEventsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">Aún no has guardado ningún evento para el finde.</p>
                    <a href="index.html" class="btn btn-outline-primary fw-bold mt-2">Explorar el catálogo</a>
                </div>
            `;
      return;
    }

    savedEventsContainer.innerHTML = "";

    savedEvents.forEach((eventData) => {
      const eventDate = new Date(eventData.eventDate);
      const formattedDate = eventDate.toLocaleDateString("es-ES", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const isOfficial = eventData.sourceType === "Oficial";
      const badgeClass = isOfficial
        ? "evc-badge-official text-bg-primary"
        : "evc-badge-community text-bg-success";
      const imgSource = eventData.imageUrl
        ? eventData.imageUrl
        : `https://via.placeholder.com/400x200?text=${encodeURIComponent(
            eventData.title,
          )}`;

      const cardHtml = `
                <div class="col" role="listitem">
                    <article class="evc-event-card card h-100 shadow-sm">
                        <img src="${imgSource}" class="card-img-top evc-event-image" alt="Imagen del evento" onerror="this.src='https://via.placeholder.com/400x200?text=Error'">
                        <div class="card-body d-flex flex-column">
                            <header class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge ${badgeClass}">${eventData.sourceType}</span>
                                <time class="small text-muted fw-bold evc-event-date">${formattedDate}</time>
                            </header>
                            <h4 class="card-title h6 fw-bold evc-event-title">${eventData.title}</h4>
                            <address class="small text-muted mt-3 mb-2 border-top pt-2">📍 ${eventData.location.addressName}</address>
                        </div>
                        <footer class="card-footer bg-white border-top-0 d-grid gap-2">
                            <button class="btn btn-outline-danger fw-bold btn-sm" onclick="window.removeFromPlan('${eventData._id}')">
                                ❌ Quitar del Plan
                            </button>
                        </footer>
                    </article>
                </div>
            `;
      savedEventsContainer.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error("Error cargando plan finde:", error);
    savedEventsContainer.innerHTML = `<div class="col-12 text-center text-danger">No se pudo cargar tu plan.</div>`;
  }
}

// ==========================================
// FUNCIÓN GLOBAL: Quitar evento del Plan
// ==========================================
window.removeFromPlan = async function (eventId) {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) return;

  const currentUser = JSON.parse(storedUser);

  // SweetAlert para confirmar la acción
  const result = await Swal.fire({
    title: "¿Quitar evento?",
    text: "Este evento desaparecerá de tu plan para el finde.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, quitar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `http://localhost:3000/usuarios/quitar-plan`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            eventoId: eventId,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("¡Removido!", "El evento ya no está en tu plan.", "success");
        // Recargamos la lista para que la tarjeta desaparezca visualmente
        loadSavedEventsPlaceholder();
      } else {
        const data = await response.json();
        Swal.fire("Error", data.mensajeError, "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  }
};

// ==========================================
// CARGAR: Sugerencias del usuario (Próximamente)
// ==========================================
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
    suggestionsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Como ${role}, tus eventos se publican directamente de forma Oficial en el catálogo.
                </td>
            </tr>
        `;
  }
}
