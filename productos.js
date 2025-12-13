function cargarProductos(categoria) {
  fetch("productos.json")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("lista-productos");
      contenedor.innerHTML = "";

      data
        .filter(p => p.categoria.toLowerCase() === categoria)
        .forEach(p => {
          const div = document.createElement("div");
          div.className = "product";

          div.innerHTML = `
            <img src="${p.imagen}">
            <h3>${p.nombre}</h3>
            <p>${p.descripcion}</p>
            <strong>${p.precio}</strong><br><br>
            <a href="https://wa.me/5351010895" target="_blank"
               style="background:#25D366;color:white;padding:8px 12px;border-radius:8px;text-decoration:none;">
               Contactar por WhatsApp
            </a>
          `;

          contenedor.appendChild(div);
        });
    });
}
