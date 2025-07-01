let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let usuario = null;

// Función para mostrar notificaciones Toast
function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336'; // Verde para éxito, Rojo para error
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top", // `top` o `bottom`
        position: "right", // `left`, `center` o `right`
        backgroundColor: backgroundColor,
        stopOnFocus: true, // Evita que se cierre la notificación al pasar el mouse
    }).showToast();
}


window.onload = async () => {
  document.getElementById('productos').innerHTML = '<p>Cargando productos...</p>';
  try {
    const response = await fetch('http://localhost:3000/api/productos');
    if (!response.ok) throw new Error('Respuesta del servidor no fue OK');
    productos = await response.json();
    renderizarCategorias();
    filtrarYOrdenar();
  } catch (error) {
    document.getElementById('productos').innerHTML = '<p>Error al cargar los productos. Intente más tarde.</p>';
    console.error("Error al obtener productos:", error);
  }

  actualizarResumen();
  document.getElementById('btnLogin').onclick = () => abrirModal('modalLogin');
  document.getElementById('btnAbrirCarrito').onclick = () => abrirModal('modalCheckout');
  
  document.getElementById('formLogin').onsubmit = handleLogin;
  document.getElementById('formRegister').onsubmit = handleRegister;
  document.getElementById('formNewsletter').onsubmit = handleNewsletter;
  document.getElementById('formCheckout').onsubmit = handleCheckout;
};

function renderizarCategorias() {
  const container = document.querySelector('.categoria-list');
  container.innerHTML = '';
  const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))];
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.innerText = cat;
    btn.onclick = () => {
      document.querySelectorAll('.categoria-list button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrarYOrdenar();
    };
    if (cat === 'Todas') btn.classList.add('active');
    container.appendChild(btn);
  });
}

function renderizarProductos(productosAMostrar) {
  const grid = document.getElementById('productos');
  grid.innerHTML = '';
  productosAMostrar.forEach(p => {
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}"><h3>${p.nombre}</h3><p class='precio'>$${p.precio.toLocaleString()}</p><button onclick='verProducto(${p.id})'>Ver más</button>`;
    grid.appendChild(card);
  });
}

function filtrarYOrdenar() {
    const categoriaActiva = document.querySelector('.categoria-list button.active').innerText;
    const textoBuscador = document.getElementById('buscador').value.toLowerCase();
    const orden = document.getElementById('orden').value;

    let productosFiltrados = [...productos];

    if (categoriaActiva !== 'Todas') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaActiva);
    }

    if (textoBuscador) {
        productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(textoBuscador));
    }
    
    if (orden === 'precio-asc') productosFiltrados.sort((a, b) => a.precio - b.precio);
    if (orden === 'precio-desc') productosFiltrados.sort((a, b) => b.precio - a.precio);
    if (orden === 'nombre-asc') productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'nombre-desc') productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));

    renderizarProductos(productosFiltrados);
}

document.getElementById('buscador').addEventListener('keyup', filtrarYOrdenar);
document.getElementById('orden').addEventListener('change', filtrarYOrdenar);

function verProducto(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalTitulo').innerText = p.nombre;
  document.getElementById('modalDescripcion').innerText = p.descripcion;
  document.getElementById('modalPrecio').innerText = `$${p.precio.toLocaleString()}`;
  document.getElementById('modalStock').innerText = p.stock;
  document.querySelector('#modalProducto button').onclick = () => agregarAlCarrito(p.id);
  abrirModal('modalProducto');
}

function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

function agregarAlCarrito(id) {
  const productoAAgregar = productos.find(p => p.id === id);
  if (productoAAgregar && productoAAgregar.stock > 0) {
    carrito.push({ id: productoAAgregar.id, nombre: productoAAgregar.nombre, precio: productoAAgregar.precio });
    showToast(`${productoAAgregar.nombre} fue agregado al carrito!`);
    actualizarResumen();
    cerrarModal('modalProducto');
  } else {
    showToast("Producto sin stock!", 'error');
  }
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarResumen();
}

function actualizarResumen() {
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';
  let total = 0;
  if (carrito.length === 0) {
    lista.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    carrito.forEach((item, index) => {
      lista.innerHTML += `<p>${item.nombre} - $${item.precio.toLocaleString()} <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">❌</button></p>`;
      total += item.precio;
    });
  }
  document.getElementById('totalCarrito').innerText = `$${total.toLocaleString()}`;
  document.getElementById('carritoCount').innerText = carrito.length;
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function scrollToSection(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }

function anularCompra() {
  carrito = [];
  actualizarResumen();
  cerrarModal('modalCheckout');
  showToast('Compra anulada', 'error');
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if(response.ok) {
        showToast(result.message, 'success');
        form.reset();
    } else {
        showToast(result.message, 'error');
    }
  } catch (error) {
      showToast('Error de conexión al intentar registrarse.', 'error');
      console.error(error);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if(response.ok) {
        showToast(result.message, 'success');
        usuario = result.user;
        document.getElementById('btnLogin').innerText = `Hola, ${usuario.email.split('@')[0]}`;
        cerrarModal('modalLogin');
      } else {
        showToast(result.message, 'error');
      }
  } catch(error) {
      showToast('Error de conexión al iniciar sesión.', 'error');
      console.error(error);
  }
}

function handleNewsletter(e) {
  e.preventDefault();
  showToast('¡Gracias por suscribirte!');
  e.target.reset();
}

async function handleCheckout(e) {
  e.preventDefault();
  if (!usuario) {
    showToast("Debes iniciar sesión para finalizar la compra.", 'error');
    abrirModal('modalLogin');
    return;
  }
  if (carrito.length === 0) {
    showToast("Tu carrito está vacío.", 'error');
    return;
  }
  const form = e.target;
  const datosPedido = {
    cliente: { nombre: form[0].value, direccion: form[1].value, telefono: form[2].value, email: usuario.email },
    items: carrito.map(item => item.id),
    total: carrito.reduce((sum, item) => sum + item.precio, 0)
  };
  try {
    const response = await fetch('http://localhost:3000/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPedido)
    });
    const resultado = await response.json();
    if (!response.ok) {
        throw new Error(resultado.message);
    }
    showToast(resultado.message);
    carrito = [];
    actualizarResumen();
    cerrarModal('modalCheckout');
    form.reset();
    // No es necesario recargar toda la página, solo actualizamos los productos para ver el stock
    const productosResponse = await fetch('http://localhost:3000/api/productos');
    productos = await productosResponse.json();
    filtrarYOrdenar();

  } catch (error) {
    showToast(error.message || "Hubo un problema al procesar tu pedido.", 'error');
    console.error("Error en checkout:", error);
  }
}