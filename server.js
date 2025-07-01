const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Herramienta para hablar con Telegram

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DEL BOT DE TELEGRAM ---
// Tus nuevas claves ya están puestas aquí
const TELEGRAM_TOKEN = '7906264447:AAHLjyAPPDFNROzpZXwVk7I9Lm2aU71bBuw';
const TELEGRAM_CHAT_ID = '6684879596';

// --- BASES DE DATOS SIMULADAS (CON IMÁGENES CORREGIDAS Y ESTABLES) ---
let productos_db = [
  { id: 1, nombre: "Té Verde Detox", descripcion: "Infusión antioxidante para limpiar tu cuerpo.", precio: 4990, stock: 12, categoria: "Infusiones", imagen: "https://i.ibb.co/2gtvVjV/te-verde.jpg" },
  { id: 2, nombre: "Maca Andina", descripcion: "Suplemento energizante natural de los Andes.", precio: 7500, stock: 8, categoria: "Suplementos", imagen: "https://i.ibb.co/HCrX1fV/maca-andina.jpg" },
  { id: 3, nombre: "Mix Semillas", descripcion: "Snack saludable con chía, linaza y maravilla.", precio: 3200, stock: 20, categoria: "Snacks", imagen: "https://i.ibb.co/b3vTQbL/mix-semillas.jpg" },
  { id: 4, nombre: "Aceite de Coco", descripcion: "Orgánico, prensado en frío, multiusos.", precio: 6800, stock: 15, categoria: "Suplementos", imagen: "https://i.ibb.co/kQw5S2h/aceite-coco.jpg" },
  { id: 5, nombre: "Barra Energética", descripcion: "Barra de cereal con frutos secos y miel.", precio: 1500, stock: 30, categoria: "Snacks", imagen: "https://i.ibb.co/6y4nKc0/barra-energetica.jpg" }
];
let users_db = [];

// --- FUNCIÓN PARA ENVIAR NOTIFICACIONES ---
async function enviarMensajeTelegram(mensaje) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: mensaje,
      parse_mode: 'Markdown'
    });
    console.log('Mensaje de notificación enviado a Telegram.');
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram:', error.response ? error.response.data : error.message);
  }
}

// --- RUTAS DE PRODUCTOS Y PEDIDOS ---
app.get('/api/productos', (req, res) => {
  res.json(productos_db);
});

app.post('/api/pedidos', (req, res) => {
  const pedido = req.body;
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    return res.status(400).json({ message: "El pedido es inválido o no tiene productos." });
  }
  let errores = [];
  let compraRealizada = true;

  // Verificamos el stock
  pedido.items.forEach(itemId => {
    const productoEnDB = productos_db.find(p => p.id === itemId);
    if (!productoEnDB) {
        errores.push(`El producto con ID ${itemId} no fue encontrado.`);
        compraRealizada = false;
    } else if (productoEnDB.stock <= 0) {
        errores.push(`El producto "${productoEnDB.nombre}" está fuera of stock.`);
        compraRealizada = false;
    }
  });

  if (!compraRealizada) {
    return res.status(400).json({ message: "No se pudo procesar el pedido.", errores: errores });
  }

  // Descontamos el stock
  pedido.items.forEach(itemId => {
    const productoEnDB = productos_db.find(p => p.id === itemId);
    productoEnDB.stock--;
  });
  
  console.log("¡Nuevo pedido procesado! Stock actualizado:", productos_db.map(p => ({nombre: p.nombre, stock: p.stock})));

  // --- NOTIFICACIÓN A TELEGRAM ---
  let detallePedido = "";
  pedido.items.forEach(itemId => {
      const producto = productos_db.find(p => p.id === itemId);
      if(producto) detallePedido += `\n- 1x ${producto.nombre}`;
  });

  const mensajeNotificacion = `
*🎉 ¡Nuevo Pedido en VerdeVital!*

*Cliente:* ${pedido.cliente.nombre}
*Email:* ${pedido.cliente.email}
*Total:* $${pedido.total.toLocaleString()}

*Detalle:*${detallePedido}
  `;
  
  enviarMensajeTelegram(mensajeNotificacion);
  // --- FIN DE LA NOTIFICACIÓN ---

  res.status(201).json({ message: "Pedido creado con éxito. ¡Gracias por tu compra!" });
});


// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos." });
  }
  const userExists = users_db.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: "El correo electrónico ya está registrado." });
  }
  const newUser = { id: Date.now(), email, password };
  users_db.push(newUser);
  console.log("Nuevo usuario registrado:", users_db);
  res.status(201).json({ message: "Usuario registrado con éxito." });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos." });
  }
  const user = users_db.find(user => user.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Credenciales incorrectas." });
  }
  res.status(200).json({ message: "Inicio de sesión exitoso.", user: { email: user.email } });
});

app.listen(PORT, () => {
  console.log(`Servidor VerdeVital corriendo en http://localhost:${PORT}`);
});