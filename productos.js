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

      // ESTADO SIN PRODUCTOS (MEJORADO)
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

function abrirModal(producto) {
  document.getElementById("modal-img").src = producto.imagen;
  document.getElementById("modal-nombre").innerText = producto.nombre;
  document.getElementById("modal-precio").innerText = producto.precio;
  document.getElementById("modal-desc").innerText = producto.descripcion;

  document.getElementById("modal-buy").href =
    "https://wa.me/5351010895?text=Quiero%20comprar%20" +
    encodeURIComponent(producto.nombre);

  document.getElementById("product-modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

function abrirModalPorIndice(index) {
  const producto = productosCargados[index];
  abrirModal(producto);
}
