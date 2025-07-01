Proyecto: VerdeVital - Integración Full-Stack
Integrantes: Gamalier Flores, Renato Pasten, Wiston Godoy

Carrera: Analista Programador

Institución: IP Santo Tomás, Sede Ovalle

Fecha: 09-06-2025

1. Análisis de Requisitos y Descripción del Proyecto
El presente proyecto aborda el caso de "VerdeVital", una tienda de productos naturales en crecimiento que necesitaba urgentemente digitalizar sus operaciones para superar las ineficiencias de su sistema manual. El requerimiento principal era desarrollar una solución web full-stack que no solo presentara los productos a los clientes, sino que también gestionara la lógica de negocio subyacente, como el control de inventario y la recepción de pedidos, de manera automatizada y fiable.

El objetivo fue transformar una maqueta estática en una aplicación web dinámica y funcional, integrando un frontend interactivo con un backend robusto, capaz de manejar datos y procesos en tiempo real.

2. Funcionalidades Implementadas
Para satisfacer los requisitos, se implementó un conjunto de funcionalidades clave que conforman una experiencia de e-commerce completa:

Catálogo de Productos Dinámico: Los productos se cargan desde el servidor backend, asegurando que el frontend siempre muestre la información más actualizada (nombre, precio, stock, imagen).

Filtrado y Ordenamiento: El usuario puede filtrar el catálogo por categorías y ordenar los productos por precio o nombre, mejorando la usabilidad de la tienda.

Sistema de Autenticación de Usuarios: Se desarrolló un sistema completo de registro y login. El backend gestiona una base de datos de usuarios (simulada) y valida las credenciales, permitiendo una experiencia personalizada y segura.

Carrito de Compras Persistente: Utilizando localStorage del navegador, el carrito de compras retiene los productos agregados aunque el usuario cierre o recargue la página, mejorando la experiencia de compra.

Checkout y Procesamiento de Pedidos: Los usuarios autenticados pueden finalizar su compra. El pedido se envía al backend, que valida la disponibilidad de los productos.

Gestión de Stock en Tiempo Real: Tras una compra exitosa, el stock de los productos correspondientes se descuenta automáticamente en la base de datos del servidor, previniendo la venta de productos agotados.

Notificaciones al Negocio vía Telegram: Se integró un bot de Telegram que, de forma automática, envía un mensaje detallado al equipo de operaciones de VerdeVital cada vez que se concreta un nuevo pedido, optimizando la logística interna.

Experiencia de Usuario (UX) Moderna: Se reemplazaron las alertas nativas de JavaScript por notificaciones "Toast" (usando la librería Toastify.js), ofreciendo feedback visual no invasivo para acciones como "inicio de sesión exitoso", "producto agregado" o "error en el formulario".

3. Arquitectura y Componentes Seleccionados
La arquitectura del proyecto sigue un modelo cliente-servidor clásico, donde el frontend (cliente) y el backend (servidor) operan de forma independiente pero se comunican a través de una API REST.

Frontend (Lado del Cliente):

HTML5 y CSS3: Para la estructura semántica y el diseño visual de la aplicación.

JavaScript (ES6+): Responsable de la interactividad, la manipulación del DOM, y la comunicación asíncrona (fetch) con el backend.

Toastify.js: Librería externa seleccionada por su ligereza y facilidad de uso para mejorar las notificaciones al usuario.

Backend (Lado del Servidor):

Node.js: Entorno de ejecución que permite utilizar JavaScript para la lógica del servidor.

Express.js: Framework minimalista elegido para construir la API REST, definir las rutas (/api/productos, /api/auth/login, etc.) y gestionar las peticiones HTTP.

Axios: Cliente HTTP utilizado para realizar las peticiones desde nuestro servidor hacia la API de Telegram de forma fiable.

CORS: Middleware de Express.js implementado para gestionar las políticas de "Intercambio de Recursos de Origen Cruzado", permitiendo que el frontend (en localhost:5500) pueda solicitar recursos al backend (en localhost:3000) de forma segura.

4. Configuración del Ambiente y Ejecución
Para ejecutar el proyecto en un entorno de desarrollo local, se deben seguir los siguientes pasos:

Descargar el Proyecto: Obtener todos los archivos del proyecto.

Abrir Terminal: Navegar a la carpeta raíz del proyecto desde una terminal de comandos.

Instalar Dependencias del Backend: Ejecutar el comando npm install para instalar Express, CORS y Axios.

Iniciar el Servidor Backend: Ejecutar el comando node server.js. La terminal mostrará el mensaje "Servidor VerdeVital corriendo en http://localhost:3000".

Iniciar el Frontend: En VS Code, hacer clic derecho en el archivo index.html y seleccionar "Open with Live Server" para lanzarlo en un navegador web.

5. Desafíos Técnicos y Decisiones Clave
Durante el desarrollo, se presentaron varios desafíos que requirieron la toma de decisiones técnicas específicas:

Desafío 1: Bloqueo de Comunicación (CORS)

Problema: El navegador bloqueaba las solicitudes fetch del frontend al backend por operar en puertos diferentes.

Solución: Se investigó y se tomó la decisión de implementar el paquete cors en el servidor Express. Esta es la solución estándar de la industria, que configura las cabeceras HTTP necesarias para que el navegador confíe en la comunicación entre ambos orígenes.

Desafío 2: Enlaces de Imágenes Rotos

Problema: Las imágenes de los productos y de la sección principal no se cargaban, mostrando un ícono de imagen rota.

Solución: Se diagnosticó que los enlaces originales no eran estables. Se tomó la decisión de buscar y reemplazar todas las URLs de imágenes por enlaces fiables de servicios de alojamiento de imágenes reconocidos (como ibb.co o unsplash.com) directamente en la "base de datos" del server.js, garantizando la integridad visual de la aplicación.

Desafío 3: Mejora de la Experiencia de Usuario

Problema: El uso de alert() era funcional pero tosco e interrumpía el flujo del usuario.

Solución: Se decidió integrar la librería externa Toastify.js. Esta elección se basó en su bajo peso, nulas dependencias y la facilidad para personalizar notificaciones de éxito y error, lo que se alinea con el objetivo de crear una interfaz moderna y respetuosa con el usuario.