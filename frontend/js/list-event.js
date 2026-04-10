// ==========================================
// Lógica para Listar Eventos y Estado de Sesión
// ==========================================

const eventsContainer = document.getElementById("eventsContainer");
const eventsCounter = document.getElementById("eventsCounter");

// Variable global para guardar todos los eventos y filtrarlos sin volver a consultar al backend
let allEvents = [];

// NOTA: Las funciones updateNavbarState y handleLogout han sido eliminadas
// de este archivo porque ya están definidas globalmente en load-navbar.js.
// Esto evita conflictos y sigue el principio DRY (Don't Repeat Yourself).

async function fetchAndRenderEvents() {
  try {
    const response = await fetch("http://localhost:3000/eventos");

    if (!response.ok) {
      throw new Error("Error al cargar la lista de eventos");
    }

    const data = await response.json();

    // Validamos que la respuesta sea un arreglo antes de asignar
    allEvents = Array.isArray(data) ? data : [];

    applyFilters();
  } catch (error) {
    console.error("Fetch events error:", error);
    if (eventsContainer) {
      eventsContainer.innerHTML = `
                <div class="col-12 text-center text-danger py-5">
                    <h4>No pudimos conectar con el servidor.</h4>
                    <p>Verifica que el backend esté corriendo en el puerto 3000.</p>
                </div>
            `;
    }
  }
}

// ==========================================
// FILTRADO (Categorías y Fechas)
// ==========================================
function applyFilters() {
  if (!allEvents || allEvents.length === 0) return;

  const selectedDate =
    document.getElementById("dateFilter")?.value || "cualquiera";

  // 1. Diccionario para traducir el HTML a la Base de Datos
  const categoryMap = {
    aire_libre: "#AireLibre",
    cultura: "#Cultura",
    gastronomia: "#Gastronomía",
    ecoturismo: "#Ecoturismo",
    musica: "#Música",
  };

  // 2. Obtener las categorías marcadas y "traducirlas"
  const categoryCheckboxes = document.querySelectorAll(
    ".evc-checkbox-input:checked",
  );
  const selectedCategories = Array.from(categoryCheckboxes).map(
    (cb) => categoryMap[cb.value] || cb.value,
  );

  // 3. Filtrar el arreglo en memoria
  const filteredEvents = allEvents.filter((evento) => {
    const eventDate = new Date(evento.eventDate);
    const today = new Date();

    let dateMatch = true;
    let categoryMatch = true;

    // --- Filtro de Fecha ---
    if (selectedDate === "hoy") {
      dateMatch =
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear();
    } else if (selectedDate === "manana") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateMatch =
        eventDate.getDate() === tomorrow.getDate() &&
        eventDate.getMonth() === tomorrow.getMonth() &&
        eventDate.getFullYear() === tomorrow.getFullYear();
    } else if (selectedDate === "fin-semana") {
      const dayOfWeek = eventDate.getDay();
      dateMatch = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    }

    // --- Filtro de Categoría ---
    if (selectedCategories.length > 0) {
      // Verifica si el evento tiene AL MENOS UNA de las categorías seleccionadas exactas
      categoryMatch = selectedCategories.some((cat) =>
        evento.categories.includes(cat),
      );
    }

    return dateMatch && categoryMatch;
  });

  // 4. Mandar a dibujar solo los que pasaron el filtro
  renderEvents(filteredEvents);
}

// Función para limpiar filtros
function clearFilters() {
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) dateFilter.value = "cualquiera";

  const categoryCheckboxes = document.querySelectorAll(".evc-checkbox-input");
  categoryCheckboxes.forEach((cb) => (cb.checked = false));

  applyFilters();
}

function renderEvents(events) {
  if (!eventsContainer) return;

  if (eventsCounter) {
    eventsCounter.innerText = `${events.length} eventos encontrados`;
  }

  if (events.length === 0) {
    eventsContainer.innerHTML =
      '<div class="col-12 text-center text-muted py-5">No hay eventos para esta búsqueda. Intenta con otros filtros.</div>';
    return;
  }

  // Optimizamos el renderizado construyendo un solo string antes de tocar el DOM (Cumple RNF-02)
  const htmlContent = events
    .map((eventData) => {
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
      const badgeText = isOfficial ? "Oficial" : "Comunitario";

      let tagsHtml = "";
      if (eventData.categories && eventData.categories.length > 0) {
        eventData.categories.forEach((tag) => {
          tagsHtml += `<span class="badge evc-tag me-1">${tag}</span>`;
        });
      }

      const imgSource = eventData.imageUrl
        ? eventData.imageUrl
        : `https://via.placeholder.com/400x200?text=${encodeURIComponent(eventData.title)}`;

      return `
            <div class="col" role="listitem">
                <article class="evc-event-card card h-100 shadow-sm">
                    <img src="${imgSource}" class="card-img-top evc-event-image" alt="Imagen del evento" onerror="this.src='https://via.placeholder.com/400x200?text=Error+de+Imagen'">
                    <div class="card-body d-flex flex-column">
                        <header class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge ${badgeClass}">${badgeText}</span>
                            <time class="small text-muted fw-bold evc-event-date">${formattedDate}</time>
                        </header>
                        <h4 class="card-title h6 fw-bold evc-event-title">${eventData.title}</h4>
                        <p class="card-text small text-muted evc-event-desc mb-auto">${eventData.description}</p>
                        <address class="small text-muted mt-3 mb-2 border-top pt-2">
                            📍 ${eventData.location.addressName}
                        </address>
                        <div class="evc-event-tags mt-2">
                            ${tagsHtml}
                        </div>
                    </div>
                    <footer class="card-footer bg-white border-top-0 d-grid gap-2">
                        <button type="button" class="btn btn-outline-success evc-btn-save-plan" onclick="saveToPlan('${eventData._id}')">
                            + Plan finde
                        </button>
                    </footer>
                </article>
            </div>
        `;
    })
    .join("");

  eventsContainer.innerHTML = htmlContent;
}

// ==========================================
// GUARDAR EN PLAN FINDE
// ==========================================
async function saveToPlan(eventId) {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) {
    Swal.fire({
      icon: "warning",
      title: "¡Ups!",
      text: "Debes iniciar sesión para guardar eventos en tu Plan del Finde.",
      confirmButtonText: "Ir al Login",
    }).then((result) => {
      if (result.isConfirmed) window.location.href = "user-login.html";
    });
    return;
  }

  const currentUser = JSON.parse(storedUser);

  try {
    const response = await fetch(
      `http://localhost:3000/usuarios/agregar-plan`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          eventoId: eventId,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: "El evento se añadió a tu Plan del Finde.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({ icon: "info", title: "Atención", text: data.mensajeError });
    }
  } catch (error) {
    console.error("Error al guardar evento:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No pudimos conectar con el servidor.",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // No es necesario llamar a updateNavbarState aquí si load-navbar.js ya lo hace.

  // Escuchar cambios en los filtros para actualizar en tiempo real
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) dateFilter.addEventListener("change", applyFilters);

  const categoryCheckboxes = document.querySelectorAll(".evc-checkbox-input");
  categoryCheckboxes.forEach((cb) =>
    cb.addEventListener("change", applyFilters),
  );

  const clearBtn = document.querySelector(".evc-btn-clear-filters");
  if (clearBtn) clearBtn.addEventListener("click", clearFilters);

  if (eventsContainer) {
    eventsContainer.innerHTML =
      '<div class="col-12 text-center py-5">Cargando eventos...</div>';
    fetchAndRenderEvents();
  }
});
