// Registration page functionality - FIXED VERSION

function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleBtn = passwordInput.parentNode.querySelector('.toggle-password');
    
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

// Show/hide additional fields based on user type
const userTypeSelect = document.getElementById('userType');
if (userTypeSelect) {
    userTypeSelect.addEventListener('change', function() {
        const userType = this.value;
        const tutorFields = document.getElementById('tutorFields');
        const studentFields = document.getElementById('studentFields');
        
        if (tutorFields) tutorFields.style.display = userType === 'tutor' ? 'block' : 'none';
        if (studentFields) studentFields.style.display = userType === 'student' ? 'block' : 'none';
    });
}

// Password strength checker
const userPasswordInput = document.getElementById('userPassword');
if (userPasswordInput) {
    userPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordStrengthText');
        
        if (!password) {
            strengthBar.className = 'strength-fill';
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Надежность пароля';
            return;
        }
        
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // Update display
        let strength = 'weak';
        let width = '33%';
        let text = 'Слабый пароль';
        
        if (score >= 4) {
            strength = 'medium';
            width = '66%';
            text = 'Средний пароль';
        }
        
        if (score >= 6) {
            strength = 'strong';
            width = '100%';
            text = 'Надёжный пароль';
        }
        
        if (strengthBar) {
            strengthBar.className = `strength-fill ${strength}`;
            strengthBar.style.width = width;
        }
        if (strengthText) {
            strengthText.textContent = text;
        }
    });
}

// Password confirmation check
const confirmPasswordInput = document.getElementById('confirmPassword');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        const password = document.getElementById('userPassword').value;
        const confirmPassword = this.value;
        const matchDiv = document.getElementById('passwordMatch');
        
        if (!matchDiv) return;
        
        if (!confirmPassword) {
            matchDiv.textContent = '';
            matchDiv.className = 'error-message';
            return;
        }
        
        if (password === confirmPassword) {
            matchDiv.textContent = '✓ Пароли совпадают';
            matchDiv.className = 'success-message show';
        } else {
            matchDiv.textContent = '✗ Пароли не совпадают';
            matchDiv.className = 'error-message show';
        }
    });
}

// Handle registration form submission - FIXED
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            login: document.getElementById('userLogin').value.trim(),
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userType').value
        };
        
        // Get additional data based on role
        if (formData.role === 'tutor') {
            const subjectsInput = document.getElementById('subjects');
            if (subjectsInput) {
                formData.subjects = subjectsInput.value.split(',').map(s => s.trim()).filter(s => s);
            }
            const experienceInput = document.getElementById('experience');
            if (experienceInput) {
                formData.experience = experienceInput.value;
            }
            const educationInput = document.getElementById('education');
            if (educationInput) {
                formData.education = educationInput.value.trim();
            }
            formData.studentsCount = 0;
            formData.rating = 0;
        } else if (formData.role === 'student') {
            const gradeInput = document.getElementById('grade');
            if (gradeInput) {
                formData.grade = gradeInput.value.trim();
            }
            const interestsInput = document.getElementById('interests');
            if (interestsInput) {
                formData.interests = interestsInput.value.split(',').map(s => s.trim()).filter(s => s);
            }
        }
        
        // Validate inputs
        const errors = validateRegistration(formData);
        
        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return;
        }
        
        // Check password match
        const password = document.getElementById('userPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showMessage('Пароли не совпадают', 'error');
            return;
        }
        
        // Check terms acceptance
        if (!document.getElementById('terms').checked) {
            showMessage('Необходимо согласиться с условиями использования', 'error');
            return;
        }
        
        // Show loading state
        const registerBtn = this.querySelector('.btn');
        const btnText = this.querySelector('.btn-text');
        const btnLoading = this.querySelector('.btn-loading');
        const messageDiv = document.getElementById('registerMessage');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        registerBtn.disabled = true;
        
        // Try to register
        const result = window.register(formData);
        
        if (result.success) {
            showMessage('Регистрация успешна! Перенаправление...', 'success');
            
        } else {
            showMessage(result.message, 'error');
            
            // Reset button
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            registerBtn.disabled = false;
        }
    });
}

function validateRegistration(data) {
    const errors = [];
    
    // Required fields
    if (!data.firstName) errors.push('Введите имя');
    if (!data.lastName) errors.push('Введите фамилию');
    if (!data.email) errors.push('Введите email');
    if (!data.phone) errors.push('Введите телефон');
    if (!data.login) errors.push('Введите логин');
    if (!data.password) errors.push('Введите пароль');
    if (!data.role) errors.push('Выберите тип аккаунта');
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Введите корректный email');
    }
    
    // Login validation
    if (data.login && data.login.length < 3) {
        errors.push('Логин должен содержать минимум 3 символа');
    }
    
    // Password validation
    if (data.password && data.password.length < 6) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    return errors;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('registerMessage');
    if (messageDiv) {
        messageDiv.innerHTML = message;
        messageDiv.className = type === 'error' ? 'error-message show' : 'success-message show';
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (currentUser) {
        // User is already logged in, redirect based on role
        window.redirectBasedOnRole(currentUser.role);
    }
    
    // Auto-focus first field
    document.getElementById('firstName')?.focus();
});