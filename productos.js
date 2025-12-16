let productosCargados = [];

function cargarProductos(categoria) {
  fetch("productos.json?v=" + Date.now())
    .then(res => res.json())
    .then(productos => {
      const contenedor = document.getElementById("products");

      const filtrados = productos.filter(p =>
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
              <img src="${p.imagen}" alt="${p.nombre}">
            </div>

            <div class="product-info">
              <h3>${p.nombre}</h3>
              <p class="price">${p.precio}</p>
              <p class="desc">${p.descripcion}</p>
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

/* ---------- MODAL ---------- */

function abrirModalPorIndice(index) {
  const producto = productosCargados[index];
  abrirModal(producto);
}

function abrirModal(producto) {
  document.getElementById("modal-nombre").innerText = producto.nombre;
  document.getElementById("modal-precio").innerText = producto.precio;
  document.getElementById("modal-desc").innerText = producto.descripcion;

  document.getElementById("modal-buy").href =
    "https://wa.me/5351010895?text=Quiero%20comprar%20" +
    encodeURIComponent(producto.nombre);

  document.getElementById("product-modal").classList.remove("hidden");
  history.pushState({ modal: true }, "");
}

function cerrarModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.add("hidden");

  if (history.state && history.state.modal) {
    history.back();
  }
}

window.addEventListener("popstate", () => {
  const modal = document.getElementById("product-modal");
  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
});

document.addEventListener("click", e => {
  const modal = document.getElementById("product-modal");
  if (!modal || modal.classList.contains("hidden")) return;

  if (e.target === modal) {
    cerrarModal();
  }
});
