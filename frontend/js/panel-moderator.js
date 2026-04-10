// ==========================================
// Lógica para el Panel del Moderador
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  protectModeratorRoute();
});

// 1. SEGURIDAD: Solo Moderadores pueden ver esta página
function protectModeratorRoute() {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) {
    window.location.href = "user-login.html";
    return;
  }

  const currentUser = JSON.parse(storedUser);

  if (currentUser.role !== "Moderador") {
    Swal.fire({
      icon: "error",
      title: "Acceso Denegado",
      text: "No tienes permisos para ver esta página.",
      confirmButtonColor: "#d33",
    }).then(() => {
      window.location.href = "index.html";
    });
    return;
  }

  // Cargamos la información de ambas pestañas
  loadPendingPromoters();
  loadPendingEvents();
}

// 2. CARGAR: Lista de Promotores Pendientes
async function loadPendingPromoters() {
  const container = document.getElementById("pendingPromotersContainer");
  if (!container) return;

  try {
    const response = await fetch("http://localhost:3000/usuarios/pendientes");
    const promoters = await response.json();

    if (promoters.length === 0) {
      container.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay solicitudes pendientes en este momento.</td></tr>`;
      return;
    }

    container.innerHTML = "";

    promoters.forEach((user) => {
      const row = `
                <tr>
                    <td class="fw-bold">${user.fullName}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-warning text-dark px-2 py-1">${user.status}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success fw-bold me-2" onclick="window.approvePromoter('${user._id}')">✔️ Aprobar</button>
                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="window.rejectPromoter('${user._id}')">❌ Rechazar</button>
                    </td>
                </tr>
            `;
      container.innerHTML += row;
    });
  } catch (error) {
    container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar datos del servidor.</td></tr>`;
  }
}

// 3. CARGAR: Eventos Sugeridos Pendientes
async function loadPendingEvents() {
  const container = document.getElementById("pendingEventsContainer");
  if (!container) return;

  try {
    const response = await fetch("http://localhost:3000/eventos/pendientes");

    if (!response.ok) throw new Error("Ruta no encontrada");

    const events = await response.json();

    if (events.length === 0) {
      container.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay eventos sugeridos pendientes de aprobación.</td></tr>`;
      return;
    }

    container.innerHTML = "";

    events.forEach((event) => {
      const eventDate = new Date(event.eventDate).toLocaleDateString("es-ES");
      const creatorName = event.creator
        ? event.creator.fullName
        : "Usuario Desconocido";

      const row = `
                <tr>
                    <td class="fw-bold text-primary">${event.title}</td>
                    <td><span class="badge bg-secondary">${creatorName}</span></td>
                    <td>${eventDate}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success fw-bold me-2" onclick="window.approveEvent('${event._id}')">✔️ Aprobar</button>
                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="window.rejectEvent('${event._id}')">🗑️ Borrar</button>
                    </td>
                </tr>
            `;
      container.innerHTML += row;
    });
  } catch (error) {
    container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Debes crear la ruta /eventos/pendientes en tu backend.</td></tr>`;
  }
}

// ==========================================
// ACCIONES PARA PROMOTORES
// ==========================================
window.approvePromoter = async function (userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/usuarios/${userId}/aprobar`,
      { method: "PUT" },
    );

    if (response.ok) {
      Swal.fire(
        "¡Aprobado!",
        "El usuario ahora es un Promotor activo.",
        "success",
      );
      loadPendingPromoters();
    } else {
      Swal.fire("Error", "No se pudo aprobar al usuario.", "error");
    }
  } catch (error) {
    Swal.fire("Error", "Falla de conexión con el servidor.", "error");
  }
};

window.rejectPromoter = async function (userId) {
  Swal.fire({
    title: "¿Rechazar solicitud?",
    text: "El usuario será convertido en Explorador normal.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, rechazar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Info", "Función de rechazo en construcción", "info");
    }
  });
};

// ==========================================
// ACCIONES PARA EVENTOS
// ==========================================
window.approveEvent = async function (eventId) {
  // Necesitamos el ID del moderador actual para enviarlo al backend
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  try {
    const response = await fetch(
      `http://localhost:3000/eventos/aprobar-comunitario`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId: eventId,
          moderadorId: currentUser.id,
        }),
      },
    );

    if (response.ok) {
      Swal.fire(
        "¡Evento Publicado!",
        "El evento ahora es visible en el catálogo principal.",
        "success",
      );
      loadPendingEvents();
    } else {
      const data = await response.json();
      Swal.fire("Error", data.mensajeError, "error");
    }
  } catch (error) {
    Swal.fire("Error", "Falla de conexión.", "error");
  }
};

window.rejectEvent = function (eventId) {
  Swal.fire(
    "Información",
    "La función para eliminar el evento permanentemente se puede agregar pronto.",
    "info",
  );
};
