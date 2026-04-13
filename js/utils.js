// utils.js - общие функции для всего приложения

// Функция получения текущего пользователя
function getCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem('ucheba_current_user'));
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Функция получения уроков
function getLessons() {
    try {
        const lessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
        return lessons;
    } catch (error) {
        console.error('Error getting lessons:', error);
        return [];
    }
}

// Функция сохранения уроков
function saveLessons(lessons) {
    try {
        localStorage.setItem('ucheba_lessons', JSON.stringify(lessons));
        return true;
    } catch (error) {
        console.error('Error saving lessons:', error);
        return false;
    }
}

// Функция получения всех пользователей
function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem('ucheba_users')) || [];
        return users;
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

// Функция сохранения пользователей
function saveUsers(users) {
    try {
        localStorage.setItem('ucheba_users', JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Функция форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Функция форматирования времени
function formatTime(timeString) {
    return timeString.replace('-', ' - ');
}

// Функция создания модального окна
function createModal(id, content) {
    // Удаляем старое модальное окно если есть
    const oldModal = document.getElementById(id);
    if (oldModal) {
        oldModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    return modal;
}

// Функция открытия модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

// Функция закрытия модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Функция показа уведомления
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? '✓' : '✗'} ${message}
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Функция проверки авторизации
function checkAuth(requiredRole = null) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'centered_login_local.html';
        return null;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        alert(`Эта страница доступна только для ${requiredRole === 'tutor' ? 'репетиторов' : 'учеников'}`);
        window.location.href = user.role === 'admin' ? 'admin_panel.html' : 'profile.html';
        return null;
    }
    
    return user;
}

// Функция для инициализации тестовых данных
function initTestData() {
    const users = getUsers();
    const lessons = getLessons();
    
    // Создаем тестового ученика если нет
    if (!users.some(u => u.role === 'student')) {
        const testStudent = {
            id: 1000,
            firstName: 'Иван',
            lastName: 'Иванов',
            email: 'student@test.com',
            password: '123456',
            role: 'student',
            phone: '+7 (999) 123-45-67',
            grade: '11 класс',
            interests: ['Математика', 'Физика'],
            createdAt: new Date().toISOString()
        };
        users.push(testStudent);
    }
    
    // Создаем тестовых учителей если нет
    const testTeachers = [
        {
            id: 1,
            firstName: 'Анна',
            lastName: 'Петрова',
            email: 'anna@test.com',
            password: '123456',
            role: 'tutor',
            subjects: ['Математика', 'Физика'],
            experience: '8 лет',
            description: 'Кандидат физико-математических наук',
            rating: 4.9,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
            phone: '+7 (999) 111-11-11',
            stats: {
                totalStudents: 12,
                totalLessons: 45,
                monthEarnings: 85000
            },
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            firstName: 'Алексей',
            lastName: 'Козлов',
            email: 'alexey@test.com',
            password: '123456',
            role: 'tutor',
            subjects: ['Физика', 'Математика'],
            experience: '7 лет',
            description: 'Преподаватель вуза',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            phone: '+7 (999) 222-22-22',
            stats: {
                totalStudents: 8,
                totalLessons: 32,
                monthEarnings: 65000
            },
            createdAt: new Date().toISOString()
        }
    ];
    
    testTeachers.forEach(teacher => {
        if (!users.some(u => u.id === teacher.id)) {
            users.push(teacher);
        }
    });
    
    // Создаем тестовые уроки если нет
    if (lessons.length === 0) {
        const testLessons = [
            {
                id: 1,
                studentId: 1000,
                studentName: 'Иван Иванов',
                studentEmail: 'student@test.com',
                tutorId: 1,
                tutorName: 'Анна Петрова',
                subject: 'Математика',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Завтра
                time: '14:00-15:00',
                duration: '60 минут',
                status: 'scheduled',
                notes: 'Подготовка к ЕГЭ, тема: производные',
                createdAt: new Date().toISOString(),
                price: 1500,
                currency: 'руб.',
                role: 'student'
            },
            {
                id: 2,
                studentId: 1000,
                studentName: 'Иван Иванов',
                studentEmail: 'student@test.com',
                tutorId: 1,
                tutorName: 'Анна Петрова',
                subject: 'Физика',
                date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Послезавтра
                time: '16:00-17:00',
                duration: '60 минут',
                status: 'scheduled',
                notes: 'Кинематика, законы Ньютона',
                createdAt: new Date().toISOString(),
                price: 1500,
                currency: 'руб.',
                role: 'student'
            },
            {
                id: 3,
                studentId: 1000,
                studentName: 'Иван Иванов',
                studentEmail: 'student@test.com',
                tutorId: 1,
                tutorName: 'Анна Петрова',
                subject: 'Математика',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Вчера
                time: '10:00-11:00',
                duration: '60 минут',
                status: 'completed',
                notes: 'Тригонометрия',
                createdAt: new Date().toISOString(),
                price: 1500,
                currency: 'руб.',
                role: 'student',
                rating: 5,
                review: 'Отличный урок!'
            }
        ];
        
        testLessons.forEach(lesson => lessons.push(lesson));
    }
    
    saveUsers(users);
    saveLessons(lessons);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initTestData();
    
    // Закрытие модальных окон по клику вне их
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Закрытие модальных окон по клавише ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal.id);
                }
            });
        }
    });
});