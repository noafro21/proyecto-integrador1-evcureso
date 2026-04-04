document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  try {
    const response = await fetch("./components/navbar.html");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al cargar navbar.html`);
    }

    container.innerHTML = await response.text();

    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");

      const href = (link.getAttribute("href") || "").split("/").pop();
      if (href === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  } catch (error) {
    console.error("Error cargando la barra de navegación:", error);
  }
});
