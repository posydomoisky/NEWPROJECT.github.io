// Login page functionality - FIXED VERSION

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Handle login form submission - FIXED
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = this.querySelector('.btn');
        const btnText = this.querySelector('.btn-text');
        const btnLoading = this.querySelector('.btn-loading');
        const messageDiv = document.getElementById('loginMessage');
        
        console.log('Login attempt:', login, password); // Debug
        
        // Reset message
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'error-message';
        }
        
        // Validate inputs
        if (!login || !password) {
            showMessage('Заполните все поля', 'error');
            return;
        }
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        loginBtn.disabled = true;
        
        // Try to login
        const result = window.login(login, password);
        
        if (result.success) {
            showMessage('Успешный вход! Перенаправление...', 'success');
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('remember_me', 'true');
            }
            
        } else {
            showMessage(result.message, 'error');
            
            // Reset button
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            loginBtn.disabled = false;
        }
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = type === 'error' ? 'error-message show' : 'success-message show';
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    console.log('Login page loaded, current user:', currentUser); // Debug
    
    if (currentUser) {
        // User is already logged in, redirect based on role
        window.redirectBasedOnRole(currentUser.role);
    }
    
    // Check remember me
    const rememberMe = localStorage.getItem('remember_me');
    if (rememberMe === 'true') {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Auto-focus login field
    const loginField = document.getElementById('login');
    if (loginField) {
        loginField.focus();
    }
    
    // Add test button for debugging
    const demoAccounts = document.querySelector('.demo-accounts');
    if (demoAccounts) {
        const testButton = document.createElement('button');
        testButton.textContent = 'Тест авторизации (admin)';
        testButton.className = 'btn btn-outline btn-sm';
        testButton.style.marginTop = '10px';
        testButton.onclick = function() {
            document.getElementById('login').value = 'admin';
            document.getElementById('password').value = 'admin123';
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        };
        demoAccounts.appendChild(testButton);
    }
});