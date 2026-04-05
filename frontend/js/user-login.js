// ==========================================
// Lógica de Inicio de Sesión (Login)
// ==========================================

const loginForm = document.getElementById("evcLoginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");

/**
 * Maneja el evento de envío del formulario de inicio de sesión.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const response = await fetch("http://localhost:3000/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Si el servidor responde con error (400, 401, 403, 404)
    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "No se puede iniciar sesión",
        text: data.mensajeError || "Credenciales incorrectas.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Si el login es exitoso
    localStorage.setItem("currentUser", JSON.stringify(data.usuario));

    // Esperamos a que el usuario presione "Aceptar" antes de cambiar de página
    await Swal.fire({
      icon: "success",
      text: data.mensaje,
      confirmButtonText: "Entrar",
    });

    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No fue posible conectar con el servidor.",
      confirmButtonText: "Aceptar",
    });
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLoginSubmit);
}
