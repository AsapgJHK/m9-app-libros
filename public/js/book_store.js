let BOOKS = []; // Ahora solo contendrá la data cargada de la DB


const USERS_DB = JSON.parse(localStorage.getItem('app_users')) || [
    { username: 'admin', password: '123' } 
];


const JWT_SECRET = "super_secreto_dev";
const TOKEN_KEY = 'authToken';


let isRegisterMode = false;
let loggedInUser = null;



function generateJWT(username) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: username, iat: Date.now() }));
    
    // NOTA DE SEGURIDAD: En un entorno real, la firma debe ser criptográfica y no esta simple concatenación.
    const signature = btoa(username + JWT_SECRET); 
    return `${header}.${payload}.${signature}`;
}


function validateJWT(token) {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        
        return payload.sub; 
    } catch (e) {
        return false;
    }
}


function showAlert(message, type = 'success') {
    const container = document.getElementById('message-container');
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
    container.innerHTML = alertHtml;
    
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) alert.remove();
    }, 5000);
}


function register(username, password) {
    if (USERS_DB.find(u => u.username === username)) {
        showAlert('Error: El nombre de usuario ya está registrado.', 'danger');
        return false;
    }
    USERS_DB.push({ username, password });
    localStorage.setItem('app_users', JSON.stringify(USERS_DB));
    showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
    return true;
}


function login(username, password) {
    const user = USERS_DB.find(u => u.username === username && u.password === password);
    if (user) {
        const token = generateJWT(username);
        localStorage.setItem(TOKEN_KEY, token);
        loggedInUser = username;
        showAlert(`Bienvenido, ${username}! Sesión iniciada correctamente.`, 'success');
        return true;
    } else {
        showAlert('Error: Nombre de usuario o contraseña incorrectos.', 'danger');
        return false;
    }
}


function logout() {
    localStorage.removeItem(TOKEN_KEY);
    loggedInUser = null;
    showAlert('Sesión cerrada.', 'info');
    renderApp();
}

/**
 * Llama a la API para realizar la compra y actualiza la lista.
 * @param {number} bookId 
 * @param {string|number} quantity 
 */
async function purchaseBook(bookId, quantity) {
    if (!loggedInUser) {
        showAlert('Debe iniciar sesión para realizar una compra.', 'danger');
        return false;
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
        showAlert('Error: La cantidad a comprar debe ser positiva.', 'danger');
        return false;
    }

    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId, quantity: qty, user: loggedInUser }) // Enviamos data a la API
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
            // Recargamos el inventario desde el servidor para reflejar el nuevo stock
            await loadBooks();
            renderBookList();
            showAlert(result.message, 'success');
            return true;
        } else {
            // Mostramos errores de stock, 404, o validación del servidor
            showAlert(`Error de compra: ${result.message}`, 'danger');
            return false;
        }

    } catch (e) {
        showAlert('Error de red: No se pudo conectar con el servidor para la compra.', 'danger');
        return false;
    }
}


/**
 * Carga el inventario de libros desde la API (DB).
 */
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error('Error al cargar el inventario.');
        }
        BOOKS = await response.json(); 
    } catch (e) {
        showAlert('Error: No se pudo conectar al servidor para obtener el inventario.', 'danger');
        BOOKS = []; 
    }
}


function renderBookList() {
    const container = document.getElementById('books-container');
    container.innerHTML = ''; 

    if (BOOKS.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No se pudo cargar el inventario o no hay libros disponibles.</p>';
        return;
    }

    BOOKS.forEach(book => {
        const isAvailable = book.cantidad_disponible > 0;
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100 card-book ${isAvailable ? '' : 'border-danger'}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${book.nombre}</h5>
                    <p class="card-text">
                        Cantidad Disponible: 
                        <span class="fw-bold ${isAvailable ? 'text-success' : 'text-danger'}">
                            ${book.cantidad_disponible}
                        </span>
                    </p>
                    ${loggedInUser ? `
                        <button class="btn btn-sm btn-primary btn-custom w-100" 
                            ${isAvailable ? '' : 'disabled'}
                            onclick="showPurchaseModal(${book.id}, '${book.nombre}')">
                            ${isAvailable ? 'Comprar' : 'Agotado'}
                        </button>
                    ` : `
                        <small class="text-muted">Inicie sesión para comprar</small>
                    `}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}


function showPurchaseModal(bookId, bookTitle) {
    if (!loggedInUser) {
        showAlert('Debe iniciar sesión para comprar.', 'danger');
        return;
    }
    
    
    document.getElementById('purchase-book-id').value = bookId;
    document.getElementById('book-title-to-buy').textContent = bookTitle;
    document.getElementById('purchase-quantity').value = 1; 
    
    
    const purchaseModal = new bootstrap.Modal(document.getElementById('purchase-modal'));
    purchaseModal.show();
}


function showAuthModal(mode) {
    isRegisterMode = mode === 'register';
    updateAuthModalUI();
    document.getElementById('auth-modal-overlay').classList.remove('d-none');
    document.getElementById('auth-modal-overlay').classList.add('d-flex');
}


function closeAuthModal() {
    document.getElementById('auth-modal-overlay').classList.add('d-none');
    document.getElementById('auth-modal-overlay').classList.remove('d-flex');
    
    document.getElementById('auth-form').reset();
}


function updateAuthModalUI() {
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('toggle-auth-mode');

    if (isRegisterMode) {
        title.textContent = 'Registro de Usuario';
        submitBtn.textContent = 'Registrarse';
        toggleLink.innerHTML = '¿Ya tienes cuenta? Inicia Sesión aquí.';
    } else {
        title.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Entrar';
        toggleLink.innerHTML = '¿No tienes cuenta? Regístrate aquí.';
    }
}


function renderAuthControls() {
    const controls = document.getElementById('auth-controls');
    if (loggedInUser) {
        controls.innerHTML = `
            <span class="me-3 text-success">¡Hola, <strong>${loggedInUser}</strong>!</span>
            <button class="btn btn-outline-danger btn-custom btn-sm" onclick="logout()">Cerrar Sesión</button>
        `;
    } else {
        controls.innerHTML = `
            <button class="btn btn-primary btn-custom btn-sm" onclick="showAuthModal('login')">
                Iniciar Sesión
            </button>
            <button class="btn btn-outline-secondary btn-custom btn-sm ms-2" onclick="showAuthModal('register')">
                Registrarse
            </button>
        `;
    }
}

/**
 * Función principal para renderizar la aplicación.
 */
async function renderApp() {
    
    const token = localStorage.getItem(TOKEN_KEY);
    loggedInUser = validateJWT(token);
    
    
    renderAuthControls();
    
    // Cargar y renderizar la lista de libros desde la DB
    await loadBooks(); 
    renderBookList();

    
    const listView = document.getElementById('book-list-view');
    const authOverlay = document.getElementById('auth-modal-overlay');

    if (loggedInUser) {
        listView.classList.remove('d-none');
        authOverlay.classList.add('d-none');
    } else {
        listView.classList.remove('d-none'); 
        showAuthModal('login'); 
    }
}


document.getElementById('auth-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    let success = false;
    if (isRegisterMode) {
        success = register(username, password);
        if (success) {
            
            isRegisterMode = false;
            updateAuthModalUI();
            
        }
    } else {
        success = login(username, password);
        if (success) {
            closeAuthModal();
            renderApp(); 
        }
    }
});


document.getElementById('toggle-auth-mode').addEventListener('click', function(event) {
    event.preventDefault();
    isRegisterMode = !isRegisterMode;
    updateAuthModalUI();
});


document.getElementById('purchase-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const bookId = parseInt(document.getElementById('purchase-book-id').value, 10);
    const quantity = document.getElementById('purchase-quantity').value;
    
    
    const purchaseModalInstance = bootstrap.Modal.getInstance(document.getElementById('purchase-modal'));
    if (purchaseModalInstance) {
        purchaseModalInstance.hide();
    }

    purchaseBook(bookId, quantity);
});



document.addEventListener('DOMContentLoaded', renderApp);