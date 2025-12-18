let productosCargados = [];
let currentIndex = 0;
let autoplayInterval = null;
let startX = 0;

/* ===============================
   CARGAR PRODUCTOS POR CATEGORÍA
================================ */
function cargarProductos(categoria) {
  fetch("productos.json?v=" + Date.now())
    .then(res => res.json())
    .then(productos => {
      const contenedor = document.getElementById("products");

      const filtrados = productos.filter(p =>
        p.categoria &&
        p.categoria.toLowerCase() === categoria.toLowerCase()
        );

      productosCargados = filtrados;

      if (filtrados.length === 0) {
        contenedor.innerHTML = `
          <div class="empty-state">
            <h2>Próximamente</h2>
            <p>Estamos preparando nuevos productos para esta categoría.</p>
          </div>
        `;
        return;
      }

      contenedor.innerHTML = "";

      filtrados.forEach((p, index) => {
        contenedor.innerHTML += `
          <div class="product-card" onclick="abrirModalPorIndice(${index})">
            <div class="img-wrapper">
              <img src="${p.imagenes && p.imagenes.length ? p.imagenes[0] : ''}" alt="${p.nombre}">
            </div>

            <div class="product-info">
              <h3>${p.nombre}</h3>
              <p class="price">${p.precio}</p>
              <p class="desc">${p.descripcion}</p>

              <a class="buy-btn"
                href="https://wa.me/5351010895?text=Quiero%20comprar%20${encodeURIComponent(p.nombre)}"
                target="_blank">
                Comprar por WhatsApp
              </a>
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      document.getElementById("products").innerHTML =
        "<p>Error cargando productos.</p>";
      console.error(err);
    });
}

/* ===============================
   ABRIR MODAL
================================ */
function abrirModalPorIndice(index) {
  const producto = productosCargados[index];
  abrirModal(producto);
}


function abrirModal(producto) {
  const modal = document.getElementById("product-modal");
  const track = document.getElementById("carousel-track");
  const dotsContainer = document.getElementById("carousel-dots");

  // Texto
  document.getElementById("modal-nombre").innerText = producto.nombre || "";
  document.getElementById("modal-precio").innerText = producto.precio || "";
  document.getElementById("modal-desc").innerText = producto.descripcion || "";

  document.getElementById("modal-buy").href =
    "https://wa.me/5351010895?text=Quiero%20comprar%20" +
    encodeURIComponent(producto.nombre || "");

  // LIMPIAR carrusel anterior
  track.innerHTML = "";
  dotsContainer.innerHTML = "";
  currentIndex = 0;

  const imagenes = Array.isArray(producto.imagenes)
  ? producto.imagenes
  : [];
   if (!imagenes.length) return;

  imagenes.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = producto.nombre || "";
    track.appendChild(img);

    const dot = document.createElement("span");
    dot.addEventListener("click", () => {
      moverCarrusel(i);
      detenerAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  moverCarrusel(0);

  modal.classList.remove("hidden");
  history.pushState({ modal: true }, "");

  if (imagenes.length > 1) iniciarAutoplay();
}

/* ===============================
   CARRUSEL
================================ */
function moverCarrusel(index) {
  const track = document.getElementById("carousel-track");
  const dots = document.querySelectorAll("#carousel-dots span");

  currentIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((d, i) =>
    d.classList.toggle("active", i === index)
  );
}

function iniciarAutoplay() {
  detenerAutoplay();
  autoplayInterval = setInterval(() => {
    const total = document.querySelectorAll("#carousel-track img").length;
    if (total <= 1) return;

    currentIndex = (currentIndex + 1) % total;
    moverCarrusel(currentIndex);
  }, 3000);
}

function detenerAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
}



/* ===============================
   CERRAR MODAL
================================ */
function cerrarModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.add("hidden");
  detenerAutoplay();

  if (history.state && history.state.modal) {
    history.back();
  }
}


/* Cerrar con botón atras */
document.addEventListener("click", e => {
  const modal = document.getElementById("product-modal");
  if (!modal || modal.classList.contains("hidden")) return;

  if (e.target === modal) {
    cerrarModal();
  }
});

/* Cerrar con toque afuera del modal */
window.addEventListener("popstate", () => {
  const modal = document.getElementById("product-modal");
  if (modal && !modal.classList.contains("hidden")) {
    cerrarModal();
  }
});


