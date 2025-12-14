function cargarProductos(categoria) {
  fetch("productos.json")
    .then(res => res.json())
    .then(productos => {
      const contenedor = document.getElementById("products");

      const filtrados = productos.filter(p =>
        p.categoria.toLowerCase() === categoria.toLowerCase()
      );

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

      filtrados.forEach(p => {
        contenedor.innerHTML += `
          <div class="product-card">
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
