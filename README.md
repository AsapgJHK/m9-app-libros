# 📚 Book Store: Aplicación de Gestión de Inventario de Libros

Este proyecto es una aplicación web full-stack diseñada para la gestión de un inventario de libros, permitiendo a los usuarios autenticarse, visualizar el stock y simular la compra de artículos. El frontend utiliza HTML, CSS (Bootstrap) y JavaScript puro, mientras que el backend está basado en Node.js con Express.

## 🚀 Características Principales

### Frontend (Cliente)
* **Autenticación:** Sistema simple de inicio de sesión y registro de usuarios basado en `localStorage`.
* **Gestión de Inventario:** Visualización de la lista de libros con sus cantidades disponibles.
* **Simulación de Compra:** Modal interactivo para simular la compra de libros, actualizando la cantidad disponible en el frontend.
* **Estilo:** Interfaz limpia y responsiva gracias al framework Bootstrap 5.

### Backend (API)
* **Estructura Inicial:** Servidor Express configurado con middlewares esenciales (`helmet`, `cors`, `morgan`).
* **Configuración:** Uso de variables de entorno para el puerto y secretos (`dotenv`).
* **Ruta Raíz (`/`):** Endpoint de prueba para verificar el estado del servidor.
* **Manejo de Errores:** Middleware para gestionar rutas 404 no encontradas.

## 🛠 Tecnologías Utilizadas

| Categoría | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 | Estructura y Estilos. |
| **Framework CSS** | Bootstrap 5 | Componentes de UI y Responsividad. |
| **Lógica Frontend** | JavaScript (Puro) | Gestión del DOM, Lógica de Autenticación (JWT simple), y manipulación del inventario. |
| **Backend** | Node.js | Entorno de ejecución del servidor. |
| **Framework Backend** | Express.js | Desarrollo de la API RESTful. |
| **Seguridad/Dev** | Helmet, CORS, Morgan | Middlewares de seguridad, manejo de peticiones de origen cruzado y logging. |

## 🏗 Estructura del Proyecto

El proyecto se divide en las siguientes carpetas y archivos clave:

```

book-store/
├── node\_modules/           \# Dependencias de Node.js
├── .env.example            \# Ejemplo de variables de entorno
├── app.js                  \# ⬅️ Backend: Archivo principal del servidor Express.
├── package.json
├── package-lock.json
└── public/
├── index.html          \# ⬅️ Frontend: Estructura principal de la interfaz de usuario.
├── css/
│   └── style.css       \# Estilos personalizados (sobre Bootstrap).
└── js/
└── book\_store.js   \# ⬅️ Frontend: Lógica de la aplicación (Autenticación, Inventario, Compras).

````

## ⚙️ Configuración y Ejecución

### 1. Requisitos
* Node.js (versión 16+)
* npm (o yarn)

### 2. Instalación de Dependencias (Backend)
```bash
npm install express cors helmet morgan dotenv
````

### 3\. Configuración de Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto y define las siguientes variables:

```.env
PORT=8080
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_aqui
```

### 4\. Inicialización del Servidor (Backend)

Ejecuta el servidor de Express:

```bash
node app.js
```

El servidor se iniciará en `http://localhost:8080` (o el puerto que definiste en `.env`).

### 5\. Acceso a la Aplicación (Frontend)

El frontend (`public/index.html`) se debe abrir directamente en un navegador.

**Nota:** Actualmente, la lógica del inventario (`book_store.js`) utiliza datos locales y autenticación simulada (`localStorage` y JWT simple sin validación completa en el backend). Para una aplicación de producción, la gestión de datos y la autenticación deberían migrarse a una base de datos real (como PostgreSQL o MongoDB) y un sistema de autenticación robusto (ej. Firebase Auth o un sistema basado en tokens HTTP).

## 💡 Próximos Pasos de Desarrollo

1.  **Conexión a Base de Datos:** Integrar un ORM (ej. Sequelize o Mongoose) para persistir datos de usuarios y libros.
2.  **Rutas de API:** Crear endpoints CRUD (`/api/libros`) en `app.js` para gestionar el inventario desde el backend.
3.  **Refactorización de Autenticación:** Mover la lógica de registro/login a la API para usar tokens JWT validados y persistir usuarios de forma segura.
4.  **Integración Frontend-Backend:** Modificar `book_store.js` para usar `fetch` o `axios` para comunicarse con la API RESTful.

