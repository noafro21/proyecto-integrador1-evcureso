// ==========================================
// Lógica de Registro de Usuario
// ==========================================

const registerForm = document.getElementById("evcRegisterForm");
const fullNameInput = document.getElementById("regFullName");
const emailInput = document.getElementById("regEmail");
const passwordInput = document.getElementById("regPassword");
const isPromoterInput = document.getElementById("regIsPromotor");

/**
 * Maneja el envío del formulario de registro.
 * @param {Event} event - El objeto del evento de envío.
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();

  const userData = {
    fullName: fullNameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    isPromoter: isPromoterInput.checked,
  };

  try {
    const response = await fetch("http://localhost:3000/usuarios/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    // Si el servidor rechaza el registro (ej. correo duplicado)
    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "No se puede registrar el usuario",
        text: data.mensajeError || "Error 400 al enviar los datos.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Personalizamos el mensaje si solicitó ser promotor
    let successMessage = `Usuario: ${userData.fullName} registrado correctamente.`;
    if (userData.isPromoter) {
      successMessage +=
        " Tu solicitud de Promotor será revisada por un Moderador.";
    }

    // Si el registro es exitoso
    await Swal.fire({
      icon: "success",
      text: successMessage,
      confirmButtonText: "Aceptar",
    });

    window.location.href = "user-login.html";
  } catch (error) {
    console.error("Registration error:", error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No fue posible conectar con el servidor.",
      confirmButtonText: "Aceptar",
    });
  }
}

if (registerForm) {
  registerForm.addEventListener("submit", handleRegisterSubmit);
}
