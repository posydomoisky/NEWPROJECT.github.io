// Auth system for УчебаВместе

// Default users data
const DEFAULT_USERS = [
    // Администратор
    {
        id: 1,
        firstName: 'Админ',
        lastName: 'Админов',
        email: 'admin@ucheba-vmeste.ru',
        login: 'admin',
        password: 'admin123',
        role: 'admin',
        phone: '+7 (999) 000-00-01',
        createdAt: '2024-01-01'
    },
    
    // Репетиторы
    {
        id: 2,
        firstName: 'Анна',
        lastName: 'Петрова',
        email: 'anna.petrova@ucheba-vmeste.ru',
        login: 'anna',
        password: 'anna123',
        role: 'tutor',
        phone: '+7 (999) 123-45-67',
        subjects: ['Математика', 'Физика'],
        experience: '8 лет',
        studentsCount: 350,
        rating: 4.9,
        education: 'Кандидат физико-математических наук',
        description: 'Специализация подготовка к ЕГЭ и олимпиадам',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-01-15'
    },
    {
        id: 3,
        firstName: 'Алексей',
        lastName: 'Козлов',
        email: 'alexey.kozlov@ucheba-vmeste.ru',
        login: 'alexey',
        password: 'alexey123',
        role: 'tutor',
        phone: '+7 (999) 123-45-68',
        subjects: ['Физика', 'Математика'],
        experience: '7 лет',
        studentsCount: 290,
        rating: 4.8,
        education: 'Преподаватель вуза',
        description: 'Специализация подготовка к ЕГЭ и олимпиадам по физике',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-01-20'
    },
    {
        id: 4,
        firstName: 'Иван',
        lastName: 'Сидоров',
        email: 'ivan.sidorov@ucheba-vmeste.ru',
        login: 'ivan',
        password: 'ivan123',
        role: 'tutor',
        phone: '+7 (999) 123-45-69',
        subjects: ['Английский язык'],
        experience: '6 лет',
        studentsCount: 420,
        rating: 4.9,
        education: 'Сертифицированный специалист TEFL',
        description: 'Международный опыт, подготовка к IELTS, TOEFL',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-02-01'
    },
    {
        id: 5,
        firstName: 'Елена',
        lastName: 'Смирнова',
        email: 'elena.smirnova@ucheba-vmeste.ru',
        login: 'elena',
        password: 'elena123',
        role: 'tutor',
        phone: '+7 (999) 123-45-70',
        subjects: ['Химия', 'Биология'],
        experience: '9 лет',
        studentsCount: 320,
        rating: 4.7,
        education: 'Кандидат химических наук',
        description: 'Авторская методика подготовки к ЕГЭ и олимпиадам',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-02-10'
    },
    {
        id: 6,
        firstName: 'Мария',
        lastName: 'Иванова',
        email: 'maria.ivanova@ucheba-vmeste.ru',
        login: 'maria',
        password: 'maria123',
        role: 'tutor',
        phone: '+7 (999) 123-45-71',
        subjects: ['Русский язык', 'Литература'],
        experience: '10 лет',
        studentsCount: 380,
        rating: 4.9,
        education: 'Кандидат филологических наук',
        description: 'Эксперт ЕГЭ по русскому языку, автор учебных пособий',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-02-15'
    },
    {
        id: 7,
        firstName: 'Дмитрий',
        lastName: 'Попов',
        email: 'dmitry.popov@ucheba-vmeste.ru',
        login: 'dmitry',
        password: 'dmitry123',
        role: 'tutor',
        phone: '+7 (999) 123-45-72',
        subjects: ['Программирование', 'Математика'],
        experience: '5 лет',
        studentsCount: 450,
        rating: 4.8,
        education: 'Senior разработчик',
        description: 'Преподаю Python, JavaScript, алгоритмы и структуры данных',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        createdAt: '2024-03-01'
    },
    
    // Ученик
    {
        id: 8,
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'student@example.com',
        login: 'student',
        password: 'student123',
        role: 'student',
        phone: '+7 (999) 123-45-73',
        grade: '11 класс',
        interests: ['Математика', 'Физика', 'Программирование'],
        createdAt: '2024-03-15'
    }
];

// Initialize auth system
function initAuth() {
    // Load users from localStorage or create default
    let users = JSON.parse(localStorage.getItem('ucheba_users'));
    
    if (!users || users.length === 0) {
        users = DEFAULT_USERS;
        localStorage.setItem('ucheba_users', JSON.stringify(users));
        
        // Also create some demo lessons for testing
        createDemoLessons();
    }
}

// Login function - FIXED
window.login = function(login, password) {
    console.log('Attempting login:', login); // Debug
    const users = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    console.log('Available users:', users.map(u => u.login)); // Debug
    
    const user = users.find(u => u.login === login && u.password === password);
    
    if (user) {
        console.log('Login successful for user:', user.login); // Debug
        // Don't store password in current user session
        const { password, ...userSession } = user;
        localStorage.setItem('ucheba_current_user', JSON.stringify(userSession));
        
        // Update UI
        updateUserInterface();
        
        // Redirect based on role
        redirectBasedOnRole(user.role);
        
        return { success: true, user: userSession };
    }
    
    console.log('Login failed - user not found or wrong password'); // Debug
    return { success: false, message: 'Неверный логин или пароль' };
};

// Register function - FIXED
window.register = function(userData) {
    const users = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    
    // Check if login or email already exists
    const existingUser = users.find(u => u.login === userData.login || u.email === userData.email);
    if (existingUser) {
        return { success: false, message: 'Пользователь с таким логином или email уже существует' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        role: userData.role || 'student'
    };
    
    users.push(newUser);
    localStorage.setItem('ucheba_users', JSON.stringify(users));
    
    // Don't store password in session
    const { password, ...userSession } = newUser;
    localStorage.setItem('ucheba_current_user', JSON.stringify(userSession));
    
    return { success: true, user: userSession };
};

// Logout function - FIXED
window.logout = function() {
    localStorage.removeItem('ucheba_current_user');
    updateUserInterface();
    window.location.href = 'index.html';
};

// Get current user - FIXED
window.getCurrentUser = function() {
    const user = JSON.parse(localStorage.getItem('ucheba_current_user'));
    console.log('Current user from localStorage:', user); // Debug
    return user;
};

// Redirect based on user role - FIXED
window.redirectBasedOnRole = function(role) {
    console.log('Redirecting based on role:', role); // Debug
    setTimeout(() => {
        switch(role) {
            case 'admin':
                window.location.href = 'admin_panel.html';
                break;
            case 'tutor':
                window.location.href = 'teacher_dashboard.html';
                break;
            case 'student':
                window.location.href = 'profile.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }, 500);
};

// Update user interface - FIXED
function updateUserInterface() {
    const userAuthSection = document.getElementById('userAuthSection');
    const currentUser = getCurrentUser();
    
    console.log('Updating UI, current user:', currentUser); // Debug
    
    if (!userAuthSection) return;
    
    if (currentUser) {
        const userInitials = getInitials(currentUser.firstName, currentUser.lastName);
        
        // Determine profile link based on role
        let profileLink = 'profile.html';
        if (currentUser.role === 'tutor') {
            profileLink = 'teacher_dashboard.html';
        } else if (currentUser.role === 'admin') {
            profileLink = 'admin_panel.html';
        }
        
        userAuthSection.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">
                    ${userInitials}
                </div>
                <div class="user-info">
                    <span class="user-greeting">Здравствуйте,</span>
                    <a href="${profileLink}" class="user-name">
                        ${currentUser.firstName}
                    </a>
                </div>
                <button onclick="logout()" class="btn btn-outline btn-sm">
                    Выйти
                </button>
            </div>
        `;
        
        // Update profile page if exists
        updateProfilePage(currentUser);
        
    } else {
        userAuthSection.innerHTML = `
            <a href="login.html" class="btn btn-primary">Войти</a>
        `;
    }
}

function getInitials(firstName, lastName) {
    if (!firstName || !lastName) return 'У';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function updateProfilePage(currentUser) {
    // Update avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.textContent = getInitials(currentUser.firstName, currentUser.lastName);
    }
    
    // Update name
    const profileName = document.getElementById('profileName');
    if (profileName && currentUser.firstName && currentUser.lastName) {
        profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    // Update role
    const profileRole = document.getElementById('profileRole');
    if (profileRole && currentUser.role) {
        profileRole.textContent = currentUser.role === 'admin' ? 'Администратор' : 
                                 currentUser.role === 'tutor' ? 'Репетитор' : 'Ученик';
    }
    
    // Update email
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail && currentUser.email) {
        profileEmail.textContent = currentUser.email;
    }
    
    // Show admin controls if user is admin
    const adminControls = document.getElementById('adminControls');
    if (adminControls && currentUser.role === 'admin') {
        adminControls.style.display = 'flex';
    }
}

// Create demo lessons for testing
function createDemoLessons() {
    const demoLessons = [
        {
            id: 1,
            studentId: 8,
            studentName: 'Иван Иванов',
            tutorId: 2,
            tutorName: 'Анна Петрова',
            subject: 'Математика',
            date: '2024-12-15',
            time: '14:00-15:00',
            status: 'scheduled',
            notes: 'Подготовка к ЕГЭ, тема: производные',
            price: 1500,
            createdAt: '2024-12-01T10:00:00'
        },
        {
            id: 2,
            studentId: 8,
            studentName: 'Иван Иванов',
            tutorId: 3,
            tutorName: 'Алексей Козлов',
            subject: 'Физика',
            date: '2024-12-16',
            time: '16:00-17:00',
            status: 'completed',
            notes: 'Кинематика, задачи на движение',
            price: 1500,
            rating: 5,
            review: 'Отличный урок, всё понятно объяснил',
            createdAt: '2024-11-20T14:30:00'
        },
        {
            id: 3,
            studentId: 8,
            studentName: 'Иван Иванов',
            tutorId: 7,
            tutorName: 'Дмитрий Попов',
            subject: 'Программирование',
            date: '2024-12-18',
            time: '18:00-19:00',
            status: 'scheduled',
            notes: 'Основы Python, работа с функциями',
            price: 2000,
            createdAt: '2024-12-05T11:15:00'
        },
        {
            id: 4,
            studentId: 8,
            studentName: 'Иван Иванов',
            tutorId: 2,
            tutorName: 'Анна Петрова',
            subject: 'Математика',
            date: '2024-12-20',
            time: '10:30-11:30',
            status: 'scheduled',
            notes: 'Решение задач по тригонометрии',
            price: 1500,
            createdAt: '2024-12-10T09:45:00'
        }
    ];
    
    localStorage.setItem('ucheba_lessons', JSON.stringify(demoLessons));
    console.log('Demo lessons created');
}

// Check if user is authenticated
function requireAuth(requiredRole = null) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (requiredRole && currentUser.role !== requiredRole) {
        alert('У вас нет доступа к этой странице');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Get all users (for admin)
function getAllUsers() {
    return JSON.parse(localStorage.getItem('ucheba_users')) || [];
}

// Update user
function updateUser(userId, updates) {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('ucheba_users', JSON.stringify(users));
        
        // If updating current user, update session
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const { password, ...userSession } = users[userIndex];
            localStorage.setItem('ucheba_current_user', JSON.stringify(userSession));
            updateUserInterface();
        }
        
        return true;
    }
    
    return false;
}

// Delete user (admin only)
function deleteUser(userId) {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length < users.length) {
        localStorage.setItem('ucheba_users', JSON.stringify(filteredUsers));
        
        // If deleting current user, logout
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            logout();
        }
        
        return true;
    }
    
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing auth system...');
    initAuth();
    
    // Always update UI on page load
    updateUserInterface();
});