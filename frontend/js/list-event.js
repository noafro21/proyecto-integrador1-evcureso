// ==========================================
// Lógica para Listar Eventos en el Catálogo
// ==========================================

const eventsContainer = document.getElementById("eventsContainer");
const eventsCounter = document.getElementById("eventsCounter");

async function fetchAndRenderEvents() {
  try {
    const response = await fetch("http://localhost:3000/eventos");

    if (!response.ok) {
      throw new Error("Error al cargar la lista de eventos");
    }

    const eventsList = await response.json();
    renderEvents(eventsList);
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

function renderEvents(events) {
  if (!eventsContainer) return;

  eventsContainer.innerHTML = "";

  // Actualizamos el contador de eventos en la pantalla
  if (eventsCounter) {
    eventsCounter.innerText = `${events.length} eventos encontrados`;
  }

  if (events.length === 0) {
    eventsContainer.innerHTML =
      '<div class="col-12 text-center text-muted py-5">No hay eventos activos en este momento.</div>';
    return;
  }

  events.forEach((eventData) => {
    // Formatear la fecha
    const eventDate = new Date(eventData.eventDate);
    const formattedDate = eventDate.toLocaleDateString("es-ES", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Definir estilos según el tipo de evento
    const isOfficial = eventData.sourceType === "Oficial";
    const badgeClass = isOfficial
      ? "evc-badge-official text-bg-primary"
      : "evc-badge-community text-bg-success";
    const badgeText = isOfficial ? "Oficial" : "Comunitario";

    // Cargar las categorías seleccionadas
    let tagsHtml = "";
    if (eventData.categories && eventData.categories.length > 0) {
      eventData.categories.forEach((tag) => {
        tagsHtml += `<span class="badge evc-tag me-1">${tag}</span>`;
      });
    }

    // Cargamos la imagen desde la BD, si no hay, mostramos un placeholder usando el título
    const imgSource = eventData.imageUrl
      ? eventData.imageUrl
      : `https://via.placeholder.com/400x200?text=${encodeURIComponent(eventData.title)}`;

    // Construimos la tarjeta HTML
    const cardHtml = `
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

    eventsContainer.innerHTML += cardHtml;
  });
}

function saveToPlan(eventId) {
  alert(`Pronto podrás guardar el evento ID: ${eventId} en tu plan.`);
}

document.addEventListener("DOMContentLoaded", () => {
  // Cuando cargue la página, solo buscar eventos si existe el contenedor de lista
  if (eventsContainer) {
    eventsContainer.innerHTML =
      '<div class="col-12 text-center py-5">Cargando eventos...</div>';
    fetchAndRenderEvents();
  }
});
