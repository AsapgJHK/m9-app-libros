let BOOKS = [
    { id: 1, nombre: "Cien Años de Soledad", cantidad_disponible: 15 },
    { id: 2, nombre: "1984", cantidad_disponible: 8 },
    { id: 3, nombre: "El Principito", cantidad_disponible: 25 },
    { id: 4, nombre: "Don Quijote de la Mancha", cantidad_disponible: 5 },
    { id: 5, nombre: "Un Mundo Feliz", cantidad_disponible: 12 },
];


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


function purchaseBook(bookId, quantity) {
    if (!loggedInUser) {
        showAlert('Debe iniciar sesión para realizar una compra.', 'danger');
        return false;
    }

    const book = BOOKS.find(b => b.id === bookId);
    const qty = parseInt(quantity, 10);

    if (!book) {
        showAlert('Error: Libro no encontrado.', 'danger');
        return false;
    }

    if (qty <= 0) {
        showAlert('Error: La cantidad a comprar debe ser positiva.', 'danger');
        return false;
    }

    
    if (book.cantidad_disponible < qty) {
        showAlert(`Error: No hay suficiente stock. Disponibles: ${book.cantidad_disponible}.`, 'danger');
        return false;
    }

    
    book.cantidad_disponible -= qty;
    
    
    renderBookList();
    showAlert(`¡Compra exitosa! Has comprado ${qty} unidad(es) de "${book.nombre}".`, 'success');
    
    return true;
}


function renderBookList() {
    const container = document.getElementById('books-container');
    container.innerHTML = ''; 

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


function renderApp() {
    
    const token = localStorage.getItem(TOKEN_KEY);
    loggedInUser = validateJWT(token);
    
    
    renderAuthControls();
    
    
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