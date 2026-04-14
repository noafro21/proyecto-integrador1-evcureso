// ==========================================
// Lógica para Listar Eventos y Filtros
// ==========================================

const eventsContainer = document.getElementById("eventsContainer");
const eventsCounter = document.getElementById("eventsCounter");
let allEvents = []; // Aquí guardaremos los eventos en memoria

// ==========================================
// CARGAR EVENTOS DESDE EL BACKEND
// ==========================================
async function fetchAndRenderEvents() {
  try {
    const response = await fetch("http://127.0.0.1:3000/eventos");

    if (!response.ok) throw new Error("Error al cargar la lista de eventos");

    allEvents = await response.json();
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
// LÓGICA DE FILTRADO (Búsqueda, Categorías y Fechas)
// ==========================================
window.applyFilters = function () {
  if (!allEvents || allEvents.length === 0) return;

  const selectedDate =
    document.getElementById("dateFilter")?.value || "cualquiera";
  const searchInput = document.getElementById("mainSearchInput");
  const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";

  // Traductor exacto de las categorías del index.html a la BD
  const categoryMap = {
    "aire-libre": "#AireLibre",
    cultura: "#Cultura",
    gastronomia: "#Gastronomía",
    ecoturismo: "#Ecoturismo",
    musica: "#Música",
  };

  const categoryCheckboxes = document.querySelectorAll(
    ".evc-checkbox-input:checked",
  );
  const selectedCategories = Array.from(categoryCheckboxes).map(
    (cb) => categoryMap[cb.value] || cb.value,
  );

  const filteredEvents = allEvents.filter((evento) => {
    const eventDate = new Date(evento.eventDate);
    const today = new Date();

    let dateMatch = true;
    let categoryMatch = true;
    let searchMatch = true;

    // --- Filtro Búsqueda Texto ---
    if (searchQuery !== "") {
      searchMatch =
        evento.title.toLowerCase().includes(searchQuery) ||
        evento.description.toLowerCase().includes(searchQuery);
    }

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
      categoryMatch = selectedCategories.some((cat) =>
        evento.categories.includes(cat),
      );
    }

    return dateMatch && categoryMatch && searchMatch;
  });

  renderEvents(filteredEvents);
};

window.clearFilters = function () {
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) dateFilter.value = "cualquiera";

  const categoryCheckboxes = document.querySelectorAll(".evc-checkbox-input");
  categoryCheckboxes.forEach((cb) => (cb.checked = false));

  const searchInput = document.getElementById("mainSearchInput");
  if (searchInput) searchInput.value = "";

  applyFilters();
};

// ==========================================
// DIBUJAR TARJETAS EN EL HTML
// ==========================================
function renderEvents(events) {
  if (!eventsContainer) return;
  eventsContainer.innerHTML = "";

  if (eventsCounter) {
    eventsCounter.innerText = `${events.length} eventos encontrados`;
  }

  if (events.length === 0) {
    eventsContainer.innerHTML =
      '<div class="col-12 text-center text-muted py-5">No hay eventos para esta búsqueda. Intenta con otros filtros.</div>';
    return;
  }

  events.forEach((eventData) => {
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
    const imageAlt = `Imagen del evento: ${eventData.title}`;

    const cardHtml = `
            <div class="col" role="listitem">
                <article class="evc-event-card card h-100 shadow-sm">
                <img src="${imgSource}" class="card-img-top evc-event-image" alt="${imageAlt}" onerror="this.src='https://via.placeholder.com/400x200?text=Error'">
                    <div class="card-body d-flex flex-column">
                        <header class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge ${badgeClass}">${badgeText}</span>
                            <time class="small text-muted fw-bold evc-event-date">${formattedDate}</time>
                        </header>
                        <h4 class="card-title h6 fw-bold evc-event-title">${eventData.title}</h4>
                        <p class="card-text small text-muted evc-event-desc mb-auto">${eventData.description}</p>
                        <address class="small text-muted mt-3 mb-2 border-top pt-2">📍 ${eventData.location.addressName}</address>
                        <div class="evc-event-tags mt-2">${tagsHtml}</div>
                    </div>
                    <footer class="card-footer card-bg-dynamic border-top-0 d-grid gap-2">
                        <button type="button" class="btn btn-outline-success evc-btn-save-plan" onclick="window.saveToPlan('${eventData._id}')">
                            + Plan finde
                        </button>
                    </footer>
                </article>
            </div>
        `;
    eventsContainer.innerHTML += cardHtml;
  });
}

// ==========================================
// GUARDAR EN PLAN FINDE
// ==========================================
window.saveToPlan = async function (eventId) {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "¡Ups!",
        text: "Debes iniciar sesión para guardar eventos.",
        confirmButtonText: "Ir al Login",
      }).then((result) => {
        if (result.isConfirmed) window.location.href = "user-login.html";
      });
    } else {
      alert("Debes iniciar sesión para guardar eventos.");
      window.location.href = "user-login.html";
    }
    return;
  }

  const currentUser = JSON.parse(storedUser);
  try {
    const response = await fetch(
      `http://127.0.0.1:3000/usuarios/agregar-plan`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, eventoId: eventId }),
      },
    );
    const data = await response.json();

    if (typeof Swal !== "undefined") {
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Guardado!",
          text: "Se añadió a tu Plan del Finde.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "info", title: "Atención", text: data.mensajeError });
      }
    } else {
      alert(response.ok ? "¡Guardado con éxito!" : data.mensajeError);
    }
  } catch (error) {
    if (typeof Swal !== "undefined")
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No pudimos conectar con el servidor.",
      });
    else alert("Error de conexión con el servidor.");
  }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
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
