Café Nube — Menú interactivo para cafetería DOMINIO DE DEMOSTRACION https://cafenube-28w7ka43.manus.space/login

Café Nube es una aplicación web frontend para presentar la carta digital de una cafetería y administrar sus productos desde una interfaz privada. El proyecto combina una experiencia pública orientada al cliente con un panel operativo para actualizar nombres, categorías, precios, descripciones, características y disponibilidad.


Estado actual: aplicación frontend estática validada y publicada en Manus. Los datos de productos, la sesión administrativa de prototipo y los comentarios se gestionan localmente en el navegador.

Características principales

Área
Funcionalidad
Carta pública
Presentación editorial de Café Nube con hero gastronómico, mensaje de marca y acceso directo a la carta.
Productos
Lista vertical de solo texto con numeración, nombre, precio, descripción y etiquetas de características.
Categorías
Filtros para Todo, Café, Fríos, Matcha y Panadería. En móvil quedan visibles únicamente las pestañas de categorías antes del listado.
Administración
Alta, edición, eliminación, disponibilidad y gestión de productos desde un panel privado.
Acceso
Ruta /login con usuario y contraseña, sesión local y protección frontend de /admin.
Calificaciones
Botón “Califícanos” con formulario emergente, nombre, estrellas de 1 a 5, comentario y validación.
Comentarios
Los comentarios enviados se guardan localmente y se muestran bajo la carta, del más reciente al más antiguo, en una franja horizontal.
Responsive
Composiciones específicas para escritorio y celular, incluyendo hero móvil compacto y navegación simplificada.
Identidad
Dirección visual “Tostado editorial” con marfil de papel, espresso, terracota, salvia y tipografía serif expresiva.




Tecnología utilizada

Tecnología
Uso dentro del proyecto
React 19
Construcción de la interfaz mediante componentes reutilizables y estado reactivo.
TypeScript
Tipado estático para productos, comentarios, estados de sesión y propiedades de componentes.
Vite
Servidor de desarrollo, recarga rápida y compilación de producción.
Tailwind CSS 4
Sistema de estilos utilitario, responsive y tokens visuales.
Radix UI
Primitivas accesibles para diálogos y componentes interactivos.
Lucide React
Iconografía consistente para acciones, categorías, estrellas y navegación.
Wouter
Enrutamiento ligero para las rutas públicas, de login y administración.
Sonner
Notificaciones de confirmación y mensajes de estado.
Web Storage API
Persistencia local de productos, sesión administrativa y comentarios.
Manus WebDev
Entorno administrado de desarrollo, preview y publicación.


Lenguajes

El lenguaje principal de la aplicación es TypeScript, utilizado dentro de archivos .tsx para componentes React. La estructura visual se expresa mediante clases de Tailwind CSS y CSS global en client/src/index.css. El HTML base se encuentra en client/index.html.

No existe un backend de aplicación en esta versión. Aunque el repositorio incluye una carpeta server/ por compatibilidad con la plantilla, la funcionalidad actual de Café Nube se ejecuta en el frontend.

Arquitectura de la aplicación

La aplicación utiliza un punto de entrada React y un componente raíz que decide qué vista renderizar según la ruta y el estado de sesión:

Plain Text



La mayor parte de la experiencia se encuentra en client/src/pages/Home.tsx, que contiene la carta pública, el login frontend, el panel administrativo, el formulario de calificación y el feed de comentarios. Los componentes visuales reutilizables de la plantilla se encuentran en client/src/components/ui/.


Si una persona intenta visitar /admin sin sesión, la aplicación muestra el login. Al cerrar sesión, se elimina la marca de sesión local y el usuario vuelve a la carta pública.

Panel administrativo

El panel permite trabajar con el catálogo sin cambiar el código de la aplicación. Sus operaciones principales son crear un producto, editar sus datos, cambiar la disponibilidad, eliminarlo con confirmación y revisar el total de artículos visibles. Cada producto puede contener nombre, categoría, precio, descripción y etiquetas de características.

La autenticación actual es deliberadamente frontend-only y sirve para prototipo o demostración. Las credenciales se validan dentro del cliente y la sesión se guarda con localStorage; por este motivo, este mecanismo no debe considerarse una protección adecuada para producción.

Calificaciones y comentarios

El botón “Califícanos” abre un diálogo en la misma página. El formulario solicita nombre, una calificación de 1 a 5 estrellas amarillas y un comentario. El contenido se valida antes de guardarse y se presenta debajo de la carta ordenado por fecha descendente.

La versión actual no incluye reseñas, valoraciones ni testimonios ficticios. Si todavía no existen envíos, se muestra un estado vacío honesto. Como la aplicación es estática, los comentarios se almacenan únicamente en el navegador donde fueron enviados y no se comparten entre dispositivos.

Persistencia local

La aplicación utiliza las siguientes claves de almacenamiento local:

Clave
Contenido
cafe-nube-products
Catálogo de productos administrado desde el panel.
cafe-nube-admin-session
Estado local de sesión administrativa.
cafe-nube-public-reviews
Comentarios y calificaciones enviados desde el formulario público.




