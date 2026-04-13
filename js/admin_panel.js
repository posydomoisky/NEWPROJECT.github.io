// Данные в localStorage
const STORAGE_KEYS = {
    USERS: 'admin_users',
    TUTORS: 'admin_tutors',
    LESSONS: 'ucheba_lessons', // Изменено для совместимости с teacher.js
    MONEY_OPERATIONS: 'admin_money_ops'
};

// Глобальные переменные для фильтрации
let currentLessonsFilter = 'all';
let currentUsersFilter = 'all';
let currentTutorsFilter = 'all';

// Инициализация данных
function initAdminData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            {
                id: 1,
                name: "Иванов Алексей",
                email: "alex@example.com",
                role: "student",
                balance: 5000,
                status: "active",
                created: new Date().toISOString()
            },
            {
                id: 2,
                name: "Петрова Мария",
                email: "maria@example.com",
                role: "tutor",
                balance: 15000,
                status: "active",
                rate: 1200,
                subjects: "Математика, Физика",
                created: new Date().toISOString()
            },
            {
                id: 3,
                name: "Администратор",
                email: "admin@example.com",
                role: "admin",
                balance: 100000,
                status: "active",
                created: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TUTORS)) {
        const defaultTutors = [
            {
                id: 2,
                name: "Петрова Мария",
                email: "maria@example.com",
                subjects: "Математика, Физика",
                rating: 4.8,
                balance: 15000,
                rate: 1200,
                status: "active",
                totalEarned: 45000,
                salaryDate: new Date().toISOString()
            },
            {
                id: 4,
                name: "Сидоров Иван",
                email: "ivan@example.com",
                subjects: "Программирование, Алгоритмы",
                rating: 4.9,
                balance: 22000,
                rate: 1500,
                status: "active",
                totalEarned: 78000,
                salaryDate: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(defaultTutors));
    }

    // Используем данные из ucheba_lessons для совместимости
    if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
        const existingLessons = localStorage.getItem('ucheba_lessons');
        if (!existingLessons) {
            const defaultLessons = [
                {
                    id: 1,
                    studentId: 1,
                    studentName: "Иванов Алексей",
                    studentEmail: "alex@example.com",
                    tutorId: 2,
                    tutorName: "Петрова Мария",
                    tutorAvatar: "img/АннаПетрова.jpg",
                    subject: "Математика",
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    time: "14:00-15:00",
                    duration: "60 минут",
                    price: 1200,
                    paymentStatus: "paid",
                    status: "scheduled",
                    notes: "Подготовка к ЕГЭ",
                    createdAt: new Date().toISOString(),
                    currency: "руб.",
                    role: "student"
                }
            ];
            localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(defaultLessons));
            // Также сохраняем в ucheba_lessons для совместимости
            localStorage.setItem('ucheba_lessons', JSON.stringify(defaultLessons));
        } else {
            // Копируем существующие уроки
            localStorage.setItem(STORAGE_KEYS.LESSONS, existingLessons);
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS)) {
        const defaultOps = [
            {
                id: 1,
                date: new Date().toISOString(),
                type: "add",
                from: "system",
                to: "Иванов Алексей",
                amount: 5000,
                comment: "Начальный депозит",
                userId: 1
            },
            {
                id: 2,
                date: new Date(Date.now() - 86400000).toISOString(),
                type: "salary",
                from: "system",
                to: "Петрова Мария",
                amount: 15000,
                comment: "Выплата зарплаты",
                userId: 2
            }
        ];
        localStorage.setItem(STORAGE_KEYS.MONEY_OPERATIONS, JSON.stringify(defaultOps));
    }
}

// Открытие модальных окон
function manageUsers() {
    initAdminData();
    loadUsersTable();
    createFilterControls('users');
    document.getElementById('usersModal').style.display = 'block';
}

function manageLessons() {
    initAdminData();
    loadLessonsTable();
    createFilterControls('lessons');
    populateLessonSelects();
    document.getElementById('lessonsModal').style.display = 'block';
}

function manageTutors() {
    initAdminData();
    loadTutorsTable();
    createFilterControls('tutors');
    document.getElementById('tutorsModal').style.display = 'block';
}

function addNewUser() {
    manageUsers();
    showAddUserForm();
}

function createLesson() {
    manageLessons();
    showCreateLessonForm();
}

function addNewTutor() {
    manageTutors();
    showAddTutorForm();
}

// Закрытие модалок
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Создание элементов фильтрации
function createFilterControls(type) {
    let container, filterFunction;
    
    switch(type) {
        case 'lessons':
            container = document.getElementById('lessonsFilters');
            filterFunction = applyLessonsFilter;
            break;
        case 'users':
            container = document.getElementById('usersFilters');
            filterFunction = applyUsersFilter;
            break;
        case 'tutors':
            container = document.getElementById('tutorsFilters');
            filterFunction = applyTutorsFilter;
            break;
        default:
            return;
    }
    
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем кнопки фильтрации
    if (type === 'lessons') {
        const filters = [
            { id: 'all', label: 'Все уроки', count: 0 },
            { id: 'scheduled', label: 'Запланированные', count: 0 },
            { id: 'completed', label: 'Завершенные', count: 0 },
            { id: 'cancelled', label: 'Отмененные', count: 0 },
            { id: 'profile', label: 'Из профиля', count: 0 },
            { id: 'direct', label: 'Прямые', count: 0 },
            { id: 'pending', label: 'Ожидают оплаты', count: 0 },
            { id: 'paid', label: 'Оплаченные', count: 0 }
        ];
        
        // Подсчитываем уроки по категориям
        const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
        filters.forEach(filter => {
            switch(filter.id) {
                case 'scheduled':
                    filter.count = lessons.filter(l => l.status === 'scheduled').length;
                    break;
                case 'completed':
                    filter.count = lessons.filter(l => l.status === 'completed').length;
                    break;
                case 'cancelled':
                    filter.count = lessons.filter(l => l.status === 'cancelled').length;
                    break;
                case 'profile':
                    filter.count = lessons.filter(l => l.source === 'profile_redirect').length;
                    break;
                case 'direct':
                    filter.count = lessons.filter(l => !l.source || l.source === 'direct').length;
                    break;
                case 'pending':
                    filter.count = lessons.filter(l => l.paymentStatus === 'pending').length;
                    break;
                case 'paid':
                    filter.count = lessons.filter(l => l.paymentStatus === 'paid').length;
                    break;
                default:
                    filter.count = lessons.length;
            }
        });
        
        // Создаем кнопки фильтров
        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${currentLessonsFilter === filter.id ? 'active' : ''}`;
            button.setAttribute('data-filter', filter.id);
            button.innerHTML = `
                ${filter.label}
                <span class="filter-count">${filter.count}</span>
            `;
            button.onclick = () => {
                currentLessonsFilter = filter.id;
                applyLessonsFilter();
            };
            container.appendChild(button);
        });
        
    } else if (type === 'users') {
        const filters = [
            { id: 'all', label: 'Все пользователи', count: 0 },
            { id: 'students', label: 'Ученики', count: 0 },
            { id: 'tutors', label: 'Репетиторы', count: 0 },
            { id: 'admins', label: 'Администраторы', count: 0 },
            { id: 'active', label: 'Активные', count: 0 },
            { id: 'inactive', label: 'Неактивные', count: 0 }
        ];
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        filters.forEach(filter => {
            switch(filter.id) {
                case 'students':
                    filter.count = users.filter(u => u.role === 'student').length;
                    break;
                case 'tutors':
                    filter.count = users.filter(u => u.role === 'tutor').length;
                    break;
                case 'admins':
                    filter.count = users.filter(u => u.role === 'admin').length;
                    break;
                case 'active':
                    filter.count = users.filter(u => u.status === 'active').length;
                    break;
                case 'inactive':
                    filter.count = users.filter(u => u.status === 'inactive').length;
                    break;
                default:
                    filter.count = users.length;
            }
        });
        
        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${currentUsersFilter === filter.id ? 'active' : ''}`;
            button.setAttribute('data-filter', filter.id);
            button.innerHTML = `
                ${filter.label}
                <span class="filter-count">${filter.count}</span>
            `;
            button.onclick = () => {
                currentUsersFilter = filter.id;
                applyUsersFilter();
            };
            container.appendChild(button);
        });
        
    } else if (type === 'tutors') {
        const filters = [
            { id: 'all', label: 'Все репетиторы', count: 0 },
            { id: 'active', label: 'Активные', count: 0 },
            { id: 'inactive', label: 'Неактивные', count: 0 }
        ];
        
        const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
        filters.forEach(filter => {
            switch(filter.id) {
                case 'active':
                    filter.count = tutors.filter(t => t.status === 'active').length;
                    break;
                case 'inactive':
                    filter.count = tutors.filter(t => t.status === 'inactive').length;
                    break;
                default:
                    filter.count = tutors.length;
            }
        });
        
        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${currentTutorsFilter === filter.id ? 'active' : ''}`;
            button.setAttribute('data-filter', filter.id);
            button.innerHTML = `
                ${filter.label}
                <span class="filter-count">${filter.count}</span>
            `;
            button.onclick = () => {
                currentTutorsFilter = filter.id;
                applyTutorsFilter();
            };
            container.appendChild(button);
        });
    }
}

// Применение фильтров для уроков
function applyLessonsFilter() {
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    let filteredLessons = [...lessons];
    
    // Применяем фильтр
    switch(currentLessonsFilter) {
        case 'scheduled':
            filteredLessons = lessons.filter(l => l.status === 'scheduled');
            break;
        case 'completed':
            filteredLessons = lessons.filter(l => l.status === 'completed');
            break;
        case 'cancelled':
            filteredLessons = lessons.filter(l => l.status === 'cancelled');
            break;
        case 'profile':
            filteredLessons = lessons.filter(l => l.source === 'profile_redirect');
            break;
        case 'direct':
            filteredLessons = lessons.filter(l => !l.source || l.source === 'direct');
            break;
        case 'pending':
            filteredLessons = lessons.filter(l => l.paymentStatus === 'pending');
            break;
        case 'paid':
            filteredLessons = lessons.filter(l => l.paymentStatus === 'paid');
            break;
        case 'all':
        default:
            filteredLessons = lessons;
    }
    
    // Обновляем активный класс на кнопках фильтров
    document.querySelectorAll('#lessonsFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentLessonsFilter) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем таблицу с отфильтрованными данными
    updateLessonsTable(filteredLessons);
}

// Применение фильтров для пользователей
function applyUsersFilter() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let filteredUsers = [...users];
    
    switch(currentUsersFilter) {
        case 'students':
            filteredUsers = users.filter(u => u.role === 'student');
            break;
        case 'tutors':
            filteredUsers = users.filter(u => u.role === 'tutor');
            break;
        case 'admins':
            filteredUsers = users.filter(u => u.role === 'admin');
            break;
        case 'active':
            filteredUsers = users.filter(u => u.status === 'active');
            break;
        case 'inactive':
            filteredUsers = users.filter(u => u.status === 'inactive');
            break;
        case 'all':
        default:
            filteredUsers = users;
    }
    
    // Обновляем активный класс на кнопках фильтров
    document.querySelectorAll('#usersFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentUsersFilter) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем таблицу с отфильтрованными данными
    updateUsersTable(filteredUsers);
}

// Применение фильтров для репетиторов
function applyTutorsFilter() {
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    let filteredTutors = [...tutors];
    
    switch(currentTutorsFilter) {
        case 'active':
            filteredTutors = tutors.filter(t => t.status === 'active');
            break;
        case 'inactive':
            filteredTutors = tutors.filter(t => t.status === 'inactive');
            break;
        case 'all':
        default:
            filteredTutors = tutors;
    }
    
    // Обновляем активный класс на кнопках фильтров
    document.querySelectorAll('#tutorsFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentTutorsFilter) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем таблицу с отфильтрованными данными
    updateTutorsTable(filteredTutors);
}

// Обновление таблицы уроков с фильтрацией
function updateLessonsTable(lessons) {
    const tbody = document.getElementById('lessonsTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Сортируем уроки по дате (сначала ближайшие)
    lessons.sort((a, b) => {
        try {
            return new Date(a.date + ' ' + (a.time ? a.time.split('-')[0] : '00:00')) - 
                   new Date(b.date + ' ' + (b.time ? b.time.split('-')[0] : '00:00'));
        } catch (e) {
            return 0;
        }
    });
    
    lessons.forEach(lesson => {
        const row = tbody.insertRow();
        
        // Форматируем дату для отображения
        let formattedDate = 'Не указано';
        try {
            const lessonDate = new Date(lesson.date);
            formattedDate = lessonDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            formattedDate = lesson.date || 'Не указано';
        }
        
        // Определяем источник
        const sourceText = lesson.source === 'profile_redirect' ? 
            '<span class="badge badge-profile">Из профиля</span>' : 
            '<span class="badge badge-direct">Прямой</span>';
        
        // Определяем статус оплаты
        const paymentStatus = lesson.paymentStatus === 'paid' ? 
            '<span class="status-badge status-paid">Оплачен</span>' : 
            '<span class="status-badge status-pending">Ожидает оплаты</span>';
        
        // Определяем статус урока
        let lessonStatus;
        switch(lesson.status) {
            case 'scheduled':
                lessonStatus = '<span class="status-badge status-scheduled">Запланирован</span>';
                break;
            case 'completed':
                lessonStatus = '<span class="status-badge status-completed">Завершен</span>';
                break;
            case 'cancelled':
                lessonStatus = '<span class="status-badge status-cancelled">Отменен</span>';
                break;
            default:
                lessonStatus = '<span class="status-badge">' + (lesson.status || 'Не указан') + '</span>';
        }
        
        row.innerHTML = `
            <td>${lesson.id || 'Н/Д'}</td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small">${(lesson.studentName || '?').charAt(0)}</div>
                    <div>
                        <div class="user-name">${lesson.studentName || 'Не указан'}</div>
                        <div class="user-email">${lesson.studentEmail || 'Нет email'}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small tutor-avatar">${(lesson.tutorName || '?').charAt(0)}</div>
                    <div>
                        <div class="user-name">${lesson.tutorName || 'Не указан'}</div>
                        <div class="user-subject">${lesson.subject || 'Не указан'}</div>
                    </div>
                </div>
            </td>
            <td>${lesson.subject || 'Не указан'}</td>
            <td>
                <div class="date-cell">
                    <div class="date">${formattedDate}</div>
                    <div class="time">${lesson.time || 'Не указано'}</div>
                </div>
            </td>
            <td>${lesson.duration || '60 минут'}</td>
            <td><strong>${formatMoney(lesson.price || 1500)}</strong></td>
            <td>${paymentStatus}</td>
            <td>${lessonStatus}</td>
            <td>${sourceText}</td>
            <td>
                <div class="action-buttons">
                    ${lesson.status === 'scheduled' ? `
                        <button class="action-btn btn-complete" onclick="completeLesson(${lesson.id})" title="Завершить урок">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button class="action-btn btn-cancel" onclick="cancelLessonAdmin(${lesson.id})" title="Отменить урок">
                            <i class="fas fa-times-circle"></i>
                        </button>
                    ` : ''}
                    ${lesson.status === 'completed' ? `
                        <button class="action-btn btn-view" onclick="viewLessonDetails(${lesson.id})" title="Просмотреть детали">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn btn-edit" onclick="editLesson(${lesson.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteLessonAdmin(${lesson.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
    
    // Обновляем статистику фильтра
    document.querySelectorAll('#lessonsFilters .filter-btn').forEach(btn => {
        if (btn.classList.contains('active')) {
            const countSpan = btn.querySelector('.filter-count');
            if (countSpan) {
                countSpan.textContent = lessons.length;
            }
        }
    });
}

// Загрузка таблицы уроков
function loadLessonsTable() {
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    updateLessonsTable(lessons);
}

// Обновление таблицы пользователей с фильтрацией
function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = tbody.insertRow();
        
        // Определяем иконку роли
        let roleIcon, roleClass;
        switch(user.role) {
            case 'student':
                roleIcon = '<i class="fas fa-user-graduate"></i>';
                roleClass = 'role-student';
                break;
            case 'tutor':
                roleIcon = '<i class="fas fa-chalkboard-teacher"></i>';
                roleClass = 'role-tutor';
                break;
            case 'admin':
                roleIcon = '<i class="fas fa-user-shield"></i>';
                roleClass = 'role-admin';
                break;
            default:
                roleIcon = '<i class="fas fa-user"></i>';
                roleClass = '';
        }
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small ${roleClass}">${(user.name || '?').charAt(0)}</div>
                    <div>
                        <div class="user-name">${user.name || 'Не указано'}</div>
                        <div class="user-email">${user.email || 'Нет email'}</div>
                    </div>
                </div>
            </td>
            <td><span class="user-role ${roleClass}">${roleIcon} ${getRoleName(user.role)}</span></td>
            <td><strong>${formatMoney(user.balance || 0)}</strong></td>
            <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${user.status === 'active' ? 'Активен' : 'Неактивен'}
            </span></td>
            <td>${new Date(user.created || new Date()).toLocaleDateString('ru-RU')}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-money" onclick="openMoneyModal(${user.id}, 'user')" title="Управление деньгами">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                    ${user.role === 'tutor' ? `
                        <button class="action-btn btn-tutor" onclick="viewTutorDetails(${user.id})" title="Профиль репетитора">
                            <i class="fas fa-chalkboard"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn btn-edit" onclick="editUser(${user.id})" title="Изменить">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="action-btn btn-delete" onclick="deleteUser(${user.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
    });
    
    // Обновляем статистику фильтра
    document.querySelectorAll('#usersFilters .filter-btn').forEach(btn => {
        if (btn.classList.contains('active')) {
            const countSpan = btn.querySelector('.filter-count');
            if (countSpan) {
                countSpan.textContent = users.length;
            }
        }
    });
}

// Загрузка таблицы пользователей
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    updateUsersTable(users);
}

// Обновление таблицы репетиторов с фильтрацией
function updateTutorsTable(tutors) {
    const tbody = document.getElementById('tutorsTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    tutors.forEach(tutor => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${tutor.id}</td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small tutor-avatar">${(tutor.name || '?').charAt(0)}</div>
                    <div>
                        <div class="user-name">${tutor.name || 'Не указано'}</div>
                        <div class="user-email">${tutor.email || 'Нет email'}</div>
                    </div>
                </div>
            </td>
            <td>${tutor.subjects || 'Не указаны'}</td>
            <td>${'★'.repeat(Math.floor(tutor.rating || 0))}${(tutor.rating || 0) % 1 ? '☆' : ''} ${tutor.rating || 0}</td>
            <td><strong>${formatMoney(tutor.balance || 0)}</strong></td>
            <td><span class="status-badge ${tutor.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${tutor.status === 'active' ? 'Активен' : 'Неактивен'}
            </span></td>
            <td>${formatMoney(tutor.rate || 0)}/час</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-money" onclick="openMoneyModal(${tutor.id}, 'tutor')" title="Управление деньгами">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editTutor(${tutor.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteTutor(${tutor.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
    
    // Обновляем статистику фильтра
    document.querySelectorAll('#tutorsFilters .filter-btn').forEach(btn => {
        if (btn.classList.contains('active')) {
            const countSpan = btn.querySelector('.filter-count');
            if (countSpan) {
                countSpan.textContent = tutors.length;
            }
        }
    });
}

// Загрузка таблицы репетиторов
function loadTutorsTable() {
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    updateTutorsTable(tutors);
}

// Открытие модалки для денежных операций
function openMoneyModal(userId, userType) {
    let users, currentUser;
    
    if (userType === 'user') {
        users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } else {
        users = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    }
    
    currentUser = users.find(u => u.id === userId);
    
    if (!currentUser) return;
    
    document.getElementById('moneyRecipientName').textContent = currentUser.name;
    document.getElementById('moneyRecipientType').textContent = userType === 'user' ? 'Пользователь' : 'Репетитор';
    document.getElementById('currentBalance').textContent = formatMoney(currentUser.balance || 0);
    document.getElementById('moneyAmount').value = '';
    document.getElementById('moneyComment').value = '';
    
    // Сохраняем данные для использования при подтверждении
    document.getElementById('moneyModal').dataset.userId = userId;
    document.getElementById('moneyModal').dataset.userType = userType;
    
    document.getElementById('moneyModal').style.display = 'block';
}

// Обработка денежной операции
function processMoneyOperation() {
    const amountInput = document.getElementById('moneyAmount');
    const commentInput = document.getElementById('moneyComment');
    const operationTypeSelect = document.getElementById('moneyOperationType');
    
    if (!amountInput || !commentInput || !operationTypeSelect) return;
    
    const amount = parseFloat(amountInput.value);
    const comment = commentInput.value;
    const operationType = operationTypeSelect.value;
    const userId = parseInt(document.getElementById('moneyModal').dataset.userId);
    const userType = document.getElementById('moneyModal').dataset.userType;
    
    if (!amount || amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }
    
    let storageKey, users;
    
    if (userType === 'user') {
        storageKey = STORAGE_KEYS.USERS;
    } else {
        storageKey = STORAGE_KEYS.TUTORS;
    }
    
    users = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    // Обновляем баланс
    if (operationType === 'add' || operationType === 'bonus' || operationType === 'salary') {
        users[userIndex].balance = (users[userIndex].balance || 0) + amount;
    } else if (operationType === 'withdraw') {
        if (users[userIndex].balance < amount) {
            alert('Недостаточно средств на балансе');
            return;
        }
        users[userIndex].balance -= amount;
    }
    
    // Сохраняем обновленные данные
    localStorage.setItem(storageKey, JSON.stringify(users));
    
    // Записываем операцию в историю
    const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
    const newOperation = {
        id: operations.length > 0 ? Math.max(...operations.map(op => op.id)) + 1 : 1,
        date: new Date().toISOString(),
        type: operationType,
        from: 'Администратор',
        to: users[userIndex].name,
        amount: amount,
        comment: comment || getOperationDescription(operationType),
        userId: userId,
        userType: userType
    };
    
    operations.push(newOperation);
    localStorage.setItem(STORAGE_KEYS.MONEY_OPERATIONS, JSON.stringify(operations));
    
    // Обновляем таблицы
    if (userType === 'user') {
        loadUsersTable();
    } else {
        loadTutorsTable();
    }
    
    // Обновляем статистику на главной
    updateAdminStats();
    
    // Закрываем модалку и показываем уведомление
    closeModal('moneyModal');
    alert(`Операция выполнена успешно! Новый баланс: ${formatMoney(users[userIndex].balance)}`);
}

// Добавление нового пользователя
function showAddUserForm() {
    document.getElementById('addUserForm').style.display = 'block';
    document.getElementById('usersTableBody').parentElement.parentElement.style.display = 'none';
}

function hideAddUserForm() {
    document.getElementById('addUserForm').style.display = 'none';
    document.getElementById('usersTableBody').parentElement.parentElement.style.display = 'block';
}

function addNewUserSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('newUserName')?.value;
    const email = document.getElementById('newUserEmail')?.value;
    const password = document.getElementById('newUserPassword')?.value;
    const role = document.getElementById('newUserRole')?.value;
    const balance = parseFloat(document.getElementById('newUserBalance')?.value) || 0;
    const status = document.getElementById('newUserStatus')?.value || 'active';
    
    if (!name || !email || !password || !role) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
        id: newUserId,
        name: name,
        email: email,
        password: password,
        role: role,
        balance: balance,
        status: status,
        created: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Если это репетитор, добавляем его в таблицу репетиторов
    if (role === 'tutor') {
        const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
        const newTutor = {
            id: newUserId,
            name: name,
            email: email,
            subjects: "Математика",
            rating: 5.0,
            balance: balance,
            rate: 1000,
            status: status,
            totalEarned: 0,
            salaryDate: new Date().toISOString()
        };
        tutors.push(newTutor);
        localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
    }
    
    // Записываем денежную операцию (начальный депозит)
    if (balance > 0) {
        const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
        const newOperation = {
            id: operations.length > 0 ? Math.max(...operations.map(op => op.id)) + 1 : 1,
            date: new Date().toISOString(),
            type: 'add',
            from: 'system',
            to: name,
            amount: balance,
            comment: 'Начальный депозит при регистрации',
            userId: newUserId,
            userType: 'user'
        };
        operations.push(newOperation);
        localStorage.setItem(STORAGE_KEYS.MONEY_OPERATIONS, JSON.stringify(operations));
    }
    
    // Обновляем интерфейс
    loadUsersTable();
    hideAddUserForm();
    updateAdminStats();
    
    alert('Пользователь успешно добавлен!');
}

// Создание урока
function showCreateLessonForm() {
    document.getElementById('createLessonForm').style.display = 'block';
    document.getElementById('lessonsTableBody').parentElement.parentElement.style.display = 'none';
}

function hideCreateLessonForm() {
    document.getElementById('createLessonForm').style.display = 'none';
    document.getElementById('lessonsTableBody').parentElement.parentElement.style.display = 'block';
}

function populateLessonSelects() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    
    const studentSelect = document.getElementById('lessonStudent');
    const tutorSelect = document.getElementById('lessonTutor');
    
    if (!studentSelect || !tutorSelect) return;
    
    studentSelect.innerHTML = '<option value="">Выберите ученика</option>';
    tutorSelect.innerHTML = '<option value="">Выберите репетитора</option>';
    
    // Ученики
    users.filter(u => u.role === 'student' && u.status === 'active').forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (Баланс: ${formatMoney(user.balance)})`;
        studentSelect.appendChild(option);
    });
    
    // Репетиторы
    tutors.filter(t => t.status === 'active').forEach(tutor => {
        const option = document.createElement('option');
        option.value = tutor.id;
        option.textContent = `${tutor.name} - ${tutor.subjects} (${formatMoney(tutor.rate)}/час)`;
        tutorSelect.appendChild(option);
    });
}

function createLessonSubmit(event) {
    event.preventDefault();
    
    const studentId = parseInt(document.getElementById('lessonStudent')?.value);
    const tutorId = parseInt(document.getElementById('lessonTutor')?.value);
    const subject = document.getElementById('lessonSubject')?.value;
    const dateTime = document.getElementById('lessonDateTime')?.value;
    const duration = parseInt(document.getElementById('lessonDuration')?.value);
    const price = parseFloat(document.getElementById('lessonPrice')?.value);
    const notes = document.getElementById('lessonNotes')?.value || '';
    
    if (!studentId || !tutorId || !subject || !dateTime || !duration || !price) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    
    const student = users.find(u => u.id === studentId);
    const tutor = tutors.find(t => t.id === tutorId);
    
    if (!student || !tutor) {
        alert('Ошибка: пользователь не найден');
        return;
    }
    
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const newLessonId = lessons.length > 0 ? Math.max(...lessons.map(l => l.id)) + 1 : 1;
    
    // Разбираем дату и время
    const date = dateTime.split('T')[0];
    const time = dateTime.split('T')[1] ? dateTime.split('T')[1].substring(0, 5) + '-00:00' : '10:00-11:00';
    
    const newLesson = {
        id: newLessonId,
        studentId: studentId,
        studentName: student.name,
        studentEmail: student.email,
        tutorId: tutorId,
        tutorName: tutor.name,
        tutorAvatar: '',
        subject: subject,
        date: date,
        time: time,
        duration: duration + ' минут',
        price: price,
        paymentStatus: 'pending',
        status: 'scheduled',
        notes: notes,
        createdAt: new Date().toISOString(),
        currency: 'руб.',
        role: 'student',
        source: 'admin'
    };
    
    lessons.push(newLesson);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    // Также сохраняем в ucheba_lessons для совместимости
    localStorage.setItem('ucheba_lessons', JSON.stringify(lessons));
    
    loadLessonsTable();
    hideCreateLessonForm();
    updateAdminStats();
    
    alert('Урок успешно создан!');
}

// Добавление репетитора
function showAddTutorForm() {
    document.getElementById('addTutorForm').style.display = 'block';
    document.getElementById('tutorsTableBody').parentElement.parentElement.style.display = 'none';
}

function hideAddTutorForm() {
    document.getElementById('addTutorForm').style.display = 'none';
    document.getElementById('tutorsTableBody').parentElement.parentElement.style.display = 'block';
}

function addNewTutorSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('newTutorName')?.value;
    const email = document.getElementById('newTutorEmail')?.value;
    const subjects = document.getElementById('newTutorSubjects')?.value;
    const rate = parseFloat(document.getElementById('newTutorRate')?.value) || 1000;
    const balance = parseFloat(document.getElementById('newTutorBalance')?.value) || 0;
    
    if (!name || !email || !subjects) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const newTutorId = tutors.length > 0 ? Math.max(...tutors.map(t => t.id)) + 1 : 1;
    
    // Добавляем в таблицу репетиторов
    const newTutor = {
        id: newTutorId,
        name: name,
        email: email,
        subjects: subjects,
        rating: 5.0,
        balance: balance,
        rate: rate,
        status: 'active',
        totalEarned: 0,
        salaryDate: new Date().toISOString()
    };
    
    tutors.push(newTutor);
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
    
    // Добавляем как пользователя с ролью tutor
    const newUser = {
        id: newTutorId,
        name: name,
        email: email,
        password: 'tutor123',
        role: 'tutor',
        balance: balance,
        status: 'active',
        created: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Записываем денежную операцию
    if (balance > 0) {
        const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
        const newOperation = {
            id: operations.length > 0 ? Math.max(...operations.map(op => op.id)) + 1 : 1,
            date: new Date().toISOString(),
            type: 'add',
            from: 'system',
            to: name,
            amount: balance,
            comment: 'Начальный депозит для репетитора',
            userId: newTutorId,
            userType: 'tutor'
        };
        operations.push(newOperation);
        localStorage.setItem(STORAGE_KEYS.MONEY_OPERATIONS, JSON.stringify(operations));
    }
    
    loadTutorsTable();
    hideAddTutorForm();
    updateAdminStats();
    
    alert('Репетитор успешно добавлен!');
}

// Удаление записей
function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Если это репетитор, удаляем и из таблицы репетиторов
    let tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    tutors = tutors.filter(t => t.id !== userId);
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
    
    loadUsersTable();
    updateAdminStats();
}

function deleteLessonAdmin(lessonId) {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) return;
    
    let lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    lessons = lessons.filter(l => l.id !== lessonId);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    // Также обновляем ucheba_lessons для совместимости
    localStorage.setItem('ucheba_lessons', JSON.stringify(lessons));
    
    loadLessonsTable();
    updateAdminStats();
}

function deleteTutor(tutorId) {
    if (!confirm('Вы уверены, что хотите удалить этого репетитора?')) return;
    
    let tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    tutors = tutors.filter(t => t.id !== tutorId);
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
    
    // Удаляем из пользователей
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    users = users.filter(u => u.id !== tutorId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    loadTutorsTable();
    updateAdminStats();
}

// Завершение урока
function completeLesson(lessonId) {
    if (!confirm('Отметить урок как завершенный?')) return;
    
    let lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex !== -1) {
        lessons[lessonIndex].status = 'completed';
        lessons[lessonIndex].completedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
        // Также обновляем ucheba_lessons для совместимости
        localStorage.setItem('ucheba_lessons', JSON.stringify(lessons));
        loadLessonsTable();
        updateAdminStats();
        alert('Урок отмечен как завершенный');
    }
}

// Отмена урока администратором
function cancelLessonAdmin(lessonId) {
    const reason = prompt('Введите причину отмены урока:');
    if (!reason) return;
    
    let lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex !== -1) {
        lessons[lessonIndex].status = 'cancelled';
        lessons[lessonIndex].cancelReason = reason;
        lessons[lessonIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
        // Также обновляем ucheba_lessons для совместимости
        localStorage.setItem('ucheba_lessons', JSON.stringify(lessons));
        loadLessonsTable();
        updateAdminStats();
        alert('Урок отменен');
    }
}

// Просмотр деталей урока
function viewLessonDetails(lessonId) {
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Детали урока #${lesson.id}</h2>
                <button class="modal-close" onclick="closeModal('lessonDetailsModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="lesson-details-view">
                    <div class="detail-section">
                        <h3>Общая информация</h3>
                        <div class="detail-row">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value">${getLessonStatus(lesson.status)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Предмет:</span>
                            <span class="detail-value">${lesson.subject}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата:</span>
                            <span class="detail-value">${lesson.date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Время:</span>
                            <span class="detail-value">${lesson.time}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Длительность:</span>
                            <span class="detail-value">${lesson.duration}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Стоимость:</span>
                            <span class="detail-value">${formatMoney(lesson.price)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Источник:</span>
                            <span class="detail-value">${lesson.source === 'profile_redirect' ? 'Из профиля ученика' : lesson.source === 'admin' ? 'Создан администратором' : 'Прямая запись'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Участники</h3>
                        <div class="detail-row">
                            <span class="detail-label">Ученик:</span>
                            <span class="detail-value">${lesson.studentName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email ученика:</span>
                            <span class="detail-value">${lesson.studentEmail || 'Не указан'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Репетитор:</span>
                            <span class="detail-value">${lesson.tutorName}</span>
                        </div>
                    </div>
                    
                    ${lesson.notes ? `
                    <div class="detail-section">
                        <h3>Примечания</h3>
                        <p>${lesson.notes}</p>
                    </div>
                    ` : ''}
                    
                    ${lesson.cancelReason ? `
                    <div class="detail-section">
                        <h3>Причина отмены</h3>
                        <p>${lesson.cancelReason}</p>
                    </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h3>Дополнительная информация</h3>
                        <div class="detail-row">
                            <span class="detail-label">Создан:</span>
                            <span class="detail-value">${new Date(lesson.createdAt || lesson.created).toLocaleString('ru-RU')}</span>
                        </div>
                        ${lesson.completedAt ? `
                        <div class="detail-row">
                            <span class="detail-label">Завершен:</span>
                            <span class="detail-value">${new Date(lesson.completedAt).toLocaleString('ru-RU')}</span>
                        </div>
                        ` : ''}
                        ${lesson.cancelledAt ? `
                        <div class="detail-row">
                            <span class="detail-label">Отменен:</span>
                            <span class="detail-value">${new Date(lesson.cancelledAt).toLocaleString('ru-RU')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal('lessonDetailsModal')">Закрыть</button>
            </div>
        </div>
    `;
    
    // Удаляем старое модальное окно если есть
    const oldModal = document.getElementById('lessonDetailsModal');
    if (oldModal) oldModal.remove();
    
    // Создаем новое модальное окно
    const modal = document.createElement('div');
    modal.id = 'lessonDetailsModal';
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Показываем модальное окно
    modal.style.display = 'block';
}

// Редактирование урока
function editLesson(lessonId) {
    alert('Редактирование урока будет реализовано в следующем обновлении');
}

// Редактирование пользователя
function editUser(userId) {
    alert('Редактирование пользователя будет реализовано в следующем обновлении');
}

// Редактирование репетитора
function editTutor(tutorId) {
    alert('Редактирование репетитора будет реализовано в следующем обновлении');
}

// Просмотр деталей репетитора
function viewTutorDetails(tutorId) {
    alert('Просмотр профиля репетитора будет реализован в следующем обновлении');
}

// Обновление статистики на главной
function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    
    // Общее количество пользователей (исключая администраторов)
    const totalUsers = users.filter(u => u.role !== 'admin').length;
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
        totalUsersElement.textContent = totalUsers.toLocaleString();
    }
    
    // Активные уроки
    const activeLessons = lessons.filter(l => l.status === 'scheduled').length;
    const activeLessonsElement = document.getElementById('activeLessons');
    if (activeLessonsElement) {
        activeLessonsElement.textContent = activeLessons;
    }
    
    // Количество репетиторов
    const totalTutorsElement = document.getElementById('totalTutors');
    if (totalTutorsElement) {
        totalTutorsElement.textContent = tutors.length;
    }
    
    // Общая сумма денег в системе
    const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0) +
                       tutors.reduce((sum, tutor) => sum + (tutor.balance || 0), 0);
    
    // Обновляем статистику финансов
    const totalSystemBalanceElement = document.getElementById('totalSystemBalance');
    if (totalSystemBalanceElement) {
        totalSystemBalanceElement.textContent = formatMoney(totalBalance);
    }
    
    const totalUsersBalanceElement = document.getElementById('totalUsersBalance');
    if (totalUsersBalanceElement) {
        const usersBalance = users.filter(u => u.role === 'student')
                                 .reduce((sum, user) => sum + (user.balance || 0), 0);
        totalUsersBalanceElement.textContent = formatMoney(usersBalance);
    }
    
    const totalTutorsBalanceElement = document.getElementById('totalTutorsBalance');
    if (totalTutorsBalanceElement) {
        const tutorsBalance = tutors.reduce((sum, tutor) => sum + (tutor.balance || 0), 0);
        totalTutorsBalanceElement.textContent = formatMoney(tutorsBalance);
    }
    
    // Оборот за месяц (сумма всех оплаченных уроков за последние 30 дней)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthlyTurnover = lessons
        .filter(l => l.paymentStatus === 'paid' && new Date(l.createdAt || l.created) > monthAgo)
        .reduce((sum, lesson) => sum + (lesson.price || 0), 0);
    
    const monthlyTurnoverElement = document.getElementById('monthlyTurnover');
    if (monthlyTurnoverElement) {
        monthlyTurnoverElement.textContent = formatMoney(monthlyTurnover);
    }
    
    // Статистика по источникам бронирования
    const profileBookings = lessons.filter(l => l.source === 'profile_redirect').length;
    const directBookings = lessons.filter(l => !l.source || l.source === 'direct').length;
    const adminBookings = lessons.filter(l => l.source === 'admin').length;
    
    console.log(`Бронирований из профиля: ${profileBookings}, прямых бронирований: ${directBookings}, создано администратором: ${adminBookings}`);
}

// Поиск
function searchUsers() {
    const searchTerm = document.getElementById('searchUsersInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function searchLessons() {
    const searchTerm = document.getElementById('searchLessonsInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#lessonsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function searchTutors() {
    const searchTerm = document.getElementById('searchTutorsInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#tutorsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Функции для кнопок в основном интерфейсе
function showMoneyStats() {
    updateAdminStats();
    loadMoneyOperations();
    document.getElementById('moneyStatsModal').style.display = 'block';
}

function loadMoneyOperations() {
    const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
    const tbody = document.getElementById('moneyOperationsTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Берем последние 20 операций
    operations.slice(-20).reverse().forEach(op => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDateTime(op.date)}</td>
            <td>${getOperationDescription(op.type)}</td>
            <td>${op.from}</td>
            <td>${op.to}</td>
            <td><strong>${formatMoney(op.amount)}</strong></td>
            <td>${op.comment}</td>
        `;
    });
}

// Экспорт финансового отчета
function exportFinancialReport() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
    
    const report = {
        generated: new Date().toISOString(),
        summary: {
            totalUsers: users.length,
            totalTutors: tutors.length,
            totalLessons: lessons.length,
            totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0) + 
                         tutors.reduce((sum, t) => sum + (t.balance || 0), 0),
            activeLessons: lessons.filter(l => l.status === 'scheduled').length,
            paidLessons: lessons.filter(l => l.paymentStatus === 'paid').length,
            totalEarned: tutors.reduce((sum, t) => sum + (t.totalEarned || 0), 0)
        },
        users: users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            balance: u.balance || 0,
            status: u.status
        })),
        tutors: tutors.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            subjects: t.subjects,
            rate: t.rate,
            balance: t.balance || 0,
            totalEarned: t.totalEarned || 0
        })),
        recentOperations: operations.slice(-50).reverse()
    };
    
    // Создаем JSON файл для скачивания
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial_report_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Отчет успешно экспортирован!');
}

// Вспомогательные функции
function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function getRoleName(role) {
    const roles = {
        'student': 'Ученик',
        'tutor': 'Репетитор',
        'admin': 'Администратор'
    };
    return roles[role] || role;
}

function getLessonStatus(status) {
    const statuses = {
        'scheduled': 'Запланирован',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

function getOperationDescription(type) {
    const descriptions = {
        'add': 'Пополнение баланса',
        'withdraw': 'Списание средств',
        'salary': 'Выплата зарплаты',
        'bonus': 'Выдача бонуса',
        'lesson_payment': 'Оплата урока'
    };
    return descriptions[type] || type;
}

// Обработка оплаты урока
function processLessonPayment(lessonId) {
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const tutors = JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTORS) || '[]');
    
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;
    
    const lesson = lessons[lessonIndex];
    
    if (lesson.paymentStatus === 'paid') {
        alert('Урок уже оплачен');
        return;
    }
    
    // Находим ученика
    const studentIndex = users.findIndex(u => u.id === lesson.studentId);
    if (studentIndex === -1) return;
    
    const student = users[studentIndex];
    
    // Проверяем баланс ученика
    if (student.balance < lesson.price) {
        alert(`Недостаточно средств у ученика. Необходимо: ${formatMoney(lesson.price)}, на балансе: ${formatMoney(student.balance)}`);
        
        // Предлагаем пополнить баланс
        if (confirm('Хотите пополнить баланс ученика?')) {
            openMoneyModal(student.id, 'user');
        }
        return;
    }
    
    // Списание средств у ученика
    users[studentIndex].balance -= lesson.price;
    
    // Находим репетитора
    const tutorIndex = tutors.findIndex(t => t.id === lesson.tutorId);
    if (tutorIndex !== -1) {
        // Зачисление средств репетитору (например, 80% от стоимости)
        const tutorAmount = lesson.price * 0.8;
        tutors[tutorIndex].balance += tutorAmount;
        tutors[tutorIndex].totalEarned = (tutors[tutorIndex].totalEarned || 0) + tutorAmount;
    }
    
    // Обновляем статус урока
    lessons[lessonIndex].paymentStatus = 'paid';
    
    // Сохраняем изменения
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    
    // Записываем операцию
    const operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONEY_OPERATIONS) || '[]');
    const newOperation = {
        id: operations.length > 0 ? Math.max(...operations.map(op => op.id)) + 1 : 1,
        date: new Date().toISOString(),
        type: 'lesson_payment',
        from: student.name,
        to: lesson.tutorName,
        amount: lesson.price,
        comment: `Оплата урока: ${lesson.subject}`,
        userId: student.id,
        userType: 'user'
    };
    operations.push(newOperation);
    localStorage.setItem(STORAGE_KEYS.MONEY_OPERATIONS, JSON.stringify(operations));
    
    // Обновляем интерфейс
    loadLessonsTable();
    loadUsersTable();
    loadTutorsTable();
    updateAdminStats();
    
    alert(`Урок успешно оплачен! Списано: ${formatMoney(lesson.price)}`);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initAdminData();
    updateAdminStats();
    
    // Добавляем кнопку для просмотра финансовой статистики
    const statsGrid = document.querySelector('.admin-stats-grid');
    if (statsGrid) {
        const moneyStatCard = document.createElement('div');
        moneyStatCard.className = 'admin-stat-card';
        moneyStatCard.style.cursor = 'pointer';
        moneyStatCard.onclick = showMoneyStats;
        moneyStatCard.innerHTML = `
            <div class="admin-stat-value">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="admin-stat-label">Финансы</div>
        `;
        statsGrid.appendChild(moneyStatCard);
    }
    
    // Обновляем данные каждые 30 секунд
    setInterval(updateAdminStats, 30000);
});

// Обработчик для модальных окон
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});