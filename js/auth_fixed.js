// ФИКСИРОВАННАЯ система авторизации - 100% работает

// Создаем демо-пользователей при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт auth_fixed.js загружен');
    
    // Проверяем, есть ли пользователи в localStorage
    let users = localStorage.getItem('ucheba_users');
    console.log('Пользователи в localStorage:', users);
    
    if (!users) {
        // Создаем демо-пользователей
        const demoUsers = [
            {
                id: 1,
                firstName: 'Админ',
                lastName: 'Админов',
                email: 'admin@ucheba-vmeste.ru',
                login: 'admin',
                password: 'admin123',
                role: 'admin',
                phone: '+7 (999) 000-00-01'
            },
            {
                id: 2,
                firstName: 'Анна',
                lastName: 'Петрова',
                email: 'anna@ucheba-vmeste.ru',
                login: 'anna',
                password: 'anna123',
                role: 'tutor',
                phone: '+7 (999) 123-45-67',
                subjects: ['Математика', 'Физика']
            },
            {
                id: 3,
                firstName: 'Иван',
                lastName: 'Иванов',
                email: 'student@example.com',
                login: 'student',
                password: 'student123',
                role: 'student',
                phone: '+7 (999) 123-45-73'
            }
        ];
        
        localStorage.setItem('ucheba_users', JSON.stringify(demoUsers));
        console.log('Демо-пользователи созданы');
    }
    
    // Обновляем интерфейс
    updateUserInterface();
});

// Функция быстрого входа
function quickLogin(login, password) {
    console.log('Попытка входа:', login, password);
    
    // Получаем пользователей из localStorage
    const users = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    console.log('Все пользователи:', users);
    
    // Ищем пользователя
    const user = users.find(u => u.login === login && u.password === password);
    
    if (user) {
        console.log('Найден пользователь:', user);
        
        // Сохраняем сессию (без пароля)
        const { password, ...userSession } = user;
        localStorage.setItem('ucheba_current_user', JSON.stringify(userSession));
        console.log('Сессия сохранена');
        
        // Обновляем интерфейс
        updateUserInterface();
        
        // Показываем сообщение
        alert(`Успешный вход как ${user.firstName} ${user.lastName} (${user.role})! Перенаправление...`);
        
        // Перенаправляем через секунду
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin_panel.html';
            } else if (user.role === 'tutor') {
                window.location.href = 'teacher_dashboard.html';
            } else {
                window.location.href = 'profile.html';
            }
        }, 1000);
        
        return true;
    } else {
        console.log('Пользователь не найден');
        alert('Ошибка: неверный логин или пароль. Попробуйте снова.');
        return false;
    }
}

// Функция обновления интерфейса
function updateUserInterface() {
    const userAuthSection = document.getElementById('userAuthSection');
    if (!userAuthSection) return;
    
    const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
    console.log('Текущий пользователь для интерфейса:', currentUser);
    
    if (currentUser) {
        const initials = (currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '');
        const profileLink = currentUser.role === 'admin' ? 'admin_panel.html' : 
                           currentUser.role === 'tutor' ? 'teacher_dashboard.html' : 'profile.html';
        
        userAuthSection.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <span class="user-greeting">Здравствуйте,</span>
                    <a href="${profileLink}" class="user-name">${currentUser.firstName}</a>
                </div>
                <button onclick="logout()" class="btn btn-outline btn-sm">Выйти</button>
            </div>
        `;
    } else {
        userAuthSection.innerHTML = `
            <a href="login_simple.html" class="btn btn-primary">Войти</a>
        `;
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('ucheba_current_user');
    updateUserInterface();
    window.location.href = 'index.html';
}

// Проверка авторизации для защищенных страниц
function checkAuth(requiredRole = null) {
    const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
    
    if (!currentUser) {
        window.location.href = 'login_simple.html';
        return false;
    }
    
    if (requiredRole && currentUser.role !== requiredRole) {
        alert('У вас нет доступа к этой странице');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Глобально экспортируем функции
window.quickLogin = quickLogin;
window.logout = logout;
window.checkAuth = checkAuth;
window.updateUserInterface = updateUserInterface;