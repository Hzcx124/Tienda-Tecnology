// ============================================
//   TIENDA TECH - index.js
// ============================================

let carrito = [];
let total = 0;
let catActual = 'all';

// ============================================
//   MOSTRAR SECCIÓN (productos o carrito)
// ============================================
function showSection(sec) {
    document.getElementById('productos').classList.add('hidden');
    document.getElementById('carrito').classList.add('hidden');
    document.getElementById(sec).classList.remove('hidden');
}

// Para compatibilidad con los botones del HTML original
function mostrarProductos() { showSection('productos'); }
function mostrarCarrito()   { showSection('carrito'); }

// ============================================
//   FILTRO POR CATEGORÍA
// ============================================
function setCat(btn, cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    catActual = cat;
    filtrarProductos();
}

// ============================================
//   BUSCAR / FILTRAR PRODUCTOS
// ============================================
function filtrarProductos() {
    const busqueda = document.getElementById('searchInput').value.toLowerCase();
    const columnas = document.querySelectorAll('#productosGrid .col');
    let visibles = 0;

    columnas.forEach(col => {
        const nombre = col.querySelector('.card-nombre').textContent.toLowerCase();
        const marca  = col.querySelector('.card-marca').textContent.toLowerCase();
        const cat    = col.getAttribute('data-cat');

        const okCat   = (catActual === 'all' || cat === catActual);
        const okBusq  = nombre.includes(busqueda) || marca.includes(busqueda);

        if (okCat && okBusq) {
            col.classList.remove('hidden');
            visibles++;
        } else {
            col.classList.add('hidden');
        }
    });

    const noRes = document.getElementById('noResultados');
    if (visibles === 0) {
        noRes.classList.remove('hidden');
    } else {
        noRes.classList.add('hidden');
    }
}

// ============================================
//   AGREGAR AL CARRITO
// ============================================
function agregarCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    total += precio;
    actualizarCarrito();

    // Feedback visual: pequeña animación en botón
    event.target.textContent = '✓ Agregado';
    event.target.style.background = 'var(--accent)';
    event.target.style.color = 'var(--dark)';
    setTimeout(() => {
        event.target.textContent = '+ Agregar al carrito';
        event.target.style.background = '';
        event.target.style.color = '';
    }, 1200);
}

// ============================================
//   ACTUALIZAR VISTA DEL CARRITO
// ============================================
function actualizarCarrito() {
    const lista    = document.getElementById('listaCarrito');
    const vacio    = document.getElementById('carritoVacio');
    const totalBox = document.getElementById('totalBox');
    const badge    = document.getElementById('badge-count');

    // Badge en botón
    if (carrito.length === 0) {
        badge.classList.add('hidden');
        vacio.classList.remove('hidden');
        totalBox.style.opacity = '0.4';
    } else {
        badge.classList.remove('hidden');
        badge.textContent = carrito.length;
        vacio.classList.add('hidden');
        totalBox.style.opacity = '1';
    }

    // Renderizar lista
    lista.innerHTML = '';
    carrito.forEach((p, i) => {
        const li = document.createElement('li');
        li.className = 'item-carrito';
        li.innerHTML = `
            <span class="item-nombre">${p.nombre}</span>
            <span class="item-precio">S/ ${p.precio.toLocaleString()}</span>
            <button class="btn-eliminar" onclick="eliminarProducto(${i})">✕</button>
        `;
        lista.appendChild(li);
    });

    document.getElementById('total').textContent = total.toLocaleString();
}

// ============================================
//   ELIMINAR PRODUCTO DEL CARRITO
// ============================================
function eliminarProducto(index) {
    total -= carrito[index].precio;
    carrito.splice(index, 1);
    actualizarCarrito();
}

// ============================================
//   ENVIAR POR WHATSAPP
// ============================================
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert('El carrito está vacío 🛒');
        return;
    }

    let mensaje = 'Hola, quiero comprar:\n';
    carrito.forEach(p => {
        mensaje += `- ${p.nombre} (S/${p.precio})\n`;
    });
    mensaje += `\nTotal: S/${total.toLocaleString()}`;

    const numero = '51902947710'; // <-- CAMBIA TU NÚMERO AQUÍ
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ============================================
//   INIT
// ============================================
actualizarCarrito();