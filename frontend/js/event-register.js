// ==========================================
// Lógica para Registrar un Nuevo Evento
// ==========================================

const createEventForm = document.getElementById("evcCreateEventForm");

document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("currentUser");
  const sourceTypeInput = document.getElementById("eventSourceType");

  if (!storedUser || !sourceTypeInput) return;

  const currentUser = JSON.parse(storedUser);

  if (currentUser.role === "Explorador") {
    sourceTypeInput.value = "Comunitaria";
    const officialOption = sourceTypeInput.querySelector(
      'option[value="Oficial"]',
    );
    if (officialOption) officialOption.disabled = true;
  } else {
    sourceTypeInput.value = "Oficial";
  }
});

/**
 * Maneja el envío del formulario para crear un evento.
  @param {Event} event - El evento de envío.
 */
async function handleCreateEventSubmit(event) {
  event.preventDefault();

  // Obtener el usuario logueado para asignar el 'creator'
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    Swal.fire({
      icon: "error",
      title: "Sesión expirada",
      text: "Debes iniciar sesión para publicar.",
    }).then(() => {
      window.location.href = "user-login.html";
    });
    return;
  }
  const currentUser = JSON.parse(storedUser);

  // Capturar valores de los inputs de texto y selects
  const title = document.getElementById("eventTitle").value;
  const description = document.getElementById("eventDescription").value;
  const eventDate = document.getElementById("eventDate").value;
  const addressName = document.getElementById("eventAddress").value;
  const imageUrl = document.getElementById("eventImageUrl").value;
  const sourceType = document.getElementById("eventSourceType").value;

  // ==========================================
  // VALIDACIÓN DE SEGURIDAD (Frontend)
  // ==========================================
  // Verificar si un Explorador intenta publicar un evento Oficial
  if (sourceType === "Oficial" && currentUser.role === "Explorador") {
    Swal.fire({
      icon: "warning",
      title: "Acceso Restringido",
      text: 'Como Explorador, solo puedes sugerir eventos de tipo "Comunitaria". Los eventos "Oficiales" son exclusivos para Promotores y Moderadores.',
      confirmButtonText: "Entendido",
      confirmButtonColor: "#FF8C42", // Naranja de la marca
    });
    return; // Detiene la ejecución, no se envía la petición al servidor
  }

  // Capturar las categorías seleccionadas (Checkboxes)
  const categoryCheckboxes = document.querySelectorAll(
    ".category-checkbox:checked",
  );
  const selectedCategories = Array.from(categoryCheckboxes).map(
    (checkbox) => checkbox.value,
  );

  // Crear el objeto según tu modelo de Mongoose
  const eventData = {
    title,
    description,
    eventDate,
    location: {
      type: "Point",
      coordinates: [-84.08, 9.93], // Coordenadas fijas temporalmente sin mapa
      addressName,
    },
    categories: selectedCategories,
    sourceType: sourceType, // Enviamos "Oficial" o "Comunitaria" directo al backend
    creator: currentUser.id,
    imageUrl: imageUrl || null,
  };

  try {
    // ⚠️ SOLUCIÓN: Usar 127.0.0.1 en lugar de localhost para evitar bloqueos de red
    const response = await fetch("http://127.0.0.1:3000/eventos/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: "success",
        title: "¡Evento publicado!",
        text:
          eventData.sourceType === "Comunitaria"
            ? "Tu sugerencia ha sido enviada a revisión por un moderador."
            : "El evento ya está disponible en el catálogo.",
        confirmButtonText: "Genial",
      });
      window.location.href = "index.html"; // Lo enviamos a ver el catálogo de eventos
    } else {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear el evento",
        text: data.mensajeError || "Verifica los datos enviados.",
      });
    }
  } catch (error) {
    console.error("Create event error:", error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No fue posible conectar con el servidor.",
    });
  }
}

if (createEventForm) {
  createEventForm.addEventListener("submit", handleCreateEventSubmit);
}
