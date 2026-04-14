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

  // Se llama la información de las ambas pestañas
  loadPendingPromoters();
  loadPendingEvents();
  loadAllUserPromoters();
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
                    <td><span class="badge evc-badge-pending px-2 py-1">${user.status}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success fw-bold me-2" onclick="window.approvePromoter('${user._id}')">✔️ Aprobar</button>
                      <button class="btn btn-sm fw-bold evc-btn-reject" onclick="window.rejectPromoter('${user._id}')">❌ Rechazar</button>
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
                    <td class="fw-bold evc-event-title-cell">${event.title}</td>
                    <td><span class="badge bg-secondary">${creatorName}</span></td>
                    <td>${eventDate}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success fw-bold me-2" onclick="window.approveEvent('${event._id}')">✔️ Aprobar</button>
                      <button class="btn btn-sm fw-bold evc-btn-reject" onclick="window.rejectEvent('${event._id}')">🗑️ Borrar</button>
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
  const result = await Swal.fire({
    title: "¿Rechazar solicitud?",
    text: "El usuario será convertido en Explorador normal.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, rechazar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(
      `http://localhost:3000/usuarios/${userId}/sancionar`,
      { method: "PUT" },
    );

    const data = await response.json();

    if (response.ok) {
      Swal.fire(
        "Solicitud rechazada",
        "El usuario fue convertido a Explorador.",
        "success",
      );
      loadPendingPromoters();
      loadAllUserPromoters();
    } else {
      Swal.fire(
        "Error",
        data.mensajeError || "No se pudo rechazar la solicitud.",
        "error",
      );
    }
  } catch (error) {
    Swal.fire("Error", "Falla de conexión con el servidor.", "error");
  }
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
// ==========================================
// PESTAÑA 3: GESTIÓN DE TODOS LOS USUARIOS
// ==========================================
async function loadAllUserPromoters() {
  // ⚠️ Importante: Usamos el ID exacto de tu HTML
  const container = document.getElementById("allUserPromotersContainer");
  if (!container) return;

  try {
    // Hacemos la petición a la BD usando 127.0.0.1
    const response = await fetch("http://127.0.0.1:3000/usuarios");
    const users = await response.json();

    container.innerHTML = "";

    // Filtramos para no mostrar al Moderador (así evitamos que se degrade a sí mismo por error)
    const filteredUsers = users.filter((user) => user.role !== "Moderador");

    if (filteredUsers.length === 0) {
      container.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios registrados en el sistema.</td></tr>`;
      return;
    }

    filteredUsers.forEach((user) => {
      let badgeClass = user.role === "Promotor" ? "bg-primary" : "bg-secondary";

      // Botón de sanción: Solo habilitado si el usuario es "Promotor"
      let actionBtn = "";
      if (user.role === "Promotor") {
        actionBtn = `<button class="btn btn-sm fw-bold evc-btn-reject" onclick="window.downgradeUser('${user._id}', '${user.fullName}')">Sancionar</button>`;
      } else {
        actionBtn = `<span class="small text-muted">Sancionado</span>`;
      }

      const row = `<tr>
                <td>
                    <strong>${user.fullName}</strong><br>
                    <small class="text-muted">${user.email}</small>
                </td>
                <td><span class="badge ${badgeClass}">${user.role}</span></td>
                <td>${user.status}</td>
                <td class="text-end">${actionBtn}</td>
            </tr>`;

      container.innerHTML += row;
    });
  } catch (error) {
    container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar usuarios.</td></tr>`;
  }
}

// ==========================================
// ACCIÓN: Degradar (Sancionar a un Promotor)
// ==========================================
window.downgradeUser = async function (userId, userName) {
  const result = await Swal.fire({
    title: `¿Degradar a ${userName}?`,
    text: "Perderá sus privilegios de publicación directa y volverá a ser un Explorador.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, degradar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/usuarios/${userId}/degradar`,
        {
          method: "PUT",
        },
      );

      if (response.ok) {
        Swal.fire(
          "Sancionado",
          "El usuario ha perdido el rol de Promotor.",
          "success",
        );
        // Refrescamos la tabla para ver el cambio inmediato
        loadAllUserPromoters();
      } else {
        const data = await response.json();
        Swal.fire(
          "Error",
          data.mensajeError || "No se pudo cambiar el rol.",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Error", "Falla de conexión con el servidor.", "error");
    }
  }
};
