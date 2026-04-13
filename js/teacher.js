
// Добавляем в начало teacher.js после константы teachers:

// Функция для обновления статистики учителя
function updateTeacherStats(teacherId) {
    const lessons = getLessons();
    const teacherLessons = lessons.filter(lesson => lesson.tutorId === teacherId);
    
    const totalLessons = teacherLessons.length;
    const upcomingLessons = teacherLessons.filter(lesson => 
        lesson.status === 'scheduled' && 
        new Date(lesson.date) >= new Date()
    ).length;
    const completedLessons = teacherLessons.filter(lesson => lesson.status === 'completed').length;
    const uniqueStudents = [...new Set(teacherLessons.map(lesson => lesson.studentId))].length;
    
    // Обновляем в localStorage если учитель авторизован
    const allUsers = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const teacherIndex = allUsers.findIndex(user => user.id === teacherId);
    
    if (teacherIndex !== -1) {
        allUsers[teacherIndex].stats = {
            totalLessons,
            upcomingLessons,
            completedLessons,
            totalStudents: uniqueStudents
        };
        localStorage.setItem('ucheba_users', JSON.stringify(allUsers));
    }
}

// Обновляем функцию submitBookingForm:
function submitBookingForm(teacherId) {
    const teacher = teachers[teacherId];
    const currentUser = getCurrentUser();
    
    if (!teacher || !currentUser) {
        alert('Ошибка: данные не найдены');
        return;
    }
    
    // Дополнительная проверка роли
    if (currentUser.role !== 'student') {
        alert('Запись на урок доступна только для учеников');
        return;
    }
    
    // Получаем данные формы
    const bookingDate = document.getElementById('bookingDate')?.value;
    const bookingTime = document.getElementById('bookingTime')?.value;
    const bookingSubject = document.getElementById('bookingSubject')?.value;
    const bookingNotes = document.getElementById('bookingNotes')?.value;
    
    // Валидация
    if (!bookingDate || !bookingTime || !bookingSubject) {
        alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
        return;
    }
    
    // Проверяем, что дата не в прошлом
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Нельзя выбрать прошедшую дату');
        return;
    }
    
    // Создаем уникальный ID для урока
    const lessonId = Date.now();
    
    // Создаем объект урока
    const newLesson = {
        id: lessonId,
        studentId: currentUser.id,
        studentName: `${currentUser.firstName} ${currentUser.lastName}`,
        studentEmail: currentUser.email,
        tutorId: teacher.id,
        tutorName: teacher.name,
        tutorAvatar: teacher.avatar,
        subject: bookingSubject,
        date: bookingDate,
        time: bookingTime,
        duration: '60 минут',
        status: 'scheduled',
        notes: bookingNotes || '',
        createdAt: new Date().toISOString(),
        price: 1500,
        currency: 'руб.',
        role: currentUser.role
    };
    
    // Сохраняем урок
    const lessons = getLessons();
    lessons.push(newLesson);
    const saved = saveLessons(lessons);
    
    if (saved) {
        // Обновляем статистику учителя
        updateTeacherStats(teacher.id);
        
        // Закрываем модальное окно
        closeBookingModal();
        
        // Показываем успешное сообщение
        showSuccessMessage(teacher.name, bookingDate, bookingTime, lessonId);
        
        // Обновляем список уроков если мы на странице профиля
        if (window.location.pathname.includes('profile.html') && typeof loadLessons === 'function') {
            loadLessons();
        }
    } else {
        alert('Произошла ошибка при сохранении урока. Попробуйте еще раз.');
    }
}

// Обновляем функцию showSuccessMessage для отображения ID урока:
function showSuccessMessage(teacherName, date, time, lessonId) {
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const modalHTML = `
        <div class="modal-content success-modal-content">
            <div class="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2>Урок успешно забронирован!</h2>
            <div class="success-details">
                <p><strong>ID урока:</strong> #${lessonId}</p>
                <p><strong>Репетитор:</strong> ${teacherName}</p>
                <p><strong>Дата:</strong> ${formattedDate}</p>
                <p><strong>Время:</strong> ${time}</p>
                <p><strong>Статус:</strong> <span class="status-badge status-scheduled">Запланирован</span></p>
                <p>Урок появится в вашем личном кабинете. За час до начала урока мы пришлем вам напоминание.</p>
            </div>
            <div class="success-actions">
                <button class="btn btn-primary" id="successOkBtn">ОК</button>
                <button class="btn btn-outline" id="successProfileBtn">Перейти в профиль</button>
                <button class="btn btn-outline" id="successViewLessonBtn">Посмотреть урок</button>
            </div>
        </div>
    `;
    
    // Создаем модальное окно успеха
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Обработчики кнопок
    const okBtn = document.getElementById('successOkBtn');
    const profileBtn = document.getElementById('successProfileBtn');
    const viewLessonBtn = document.getElementById('successViewLessonBtn');
    
    if (okBtn) {
        okBtn.addEventListener('click', function() {
            closeSuccessModal();
        });
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            closeSuccessModal();
            window.location.href = 'profile.html';
        });
    }
    
    if (viewLessonBtn) {
        viewLessonBtn.addEventListener('click', function() {
            closeSuccessModal();
            if (window.location.pathname.includes('profile.html')) {
                // Если на странице профиля, показываем детали урока
                if (typeof viewLessonDetails === 'function') {
                    viewLessonDetails(lessonId);
                }
            } else {
                // Иначе переходим в профиль
                window.location.href = 'profile.html';
            }
        });
    }
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Добавляем функцию для проверки и создания демо-пользователей (учителей):
function initDemoUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const existingLessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
    
    // Создаем демо-ученика если нет
    if (!existingUsers.some(user => user.role === 'student')) {
        const demoStudent = {
            id: 1000,
            firstName: 'Иван',
            lastName: 'Иванов',
            email: 'student@example.com',
            password: 'password123',
            role: 'student',
            phone: '+7 (999) 123-45-67',
            grade: '11 класс',
            interests: ['Математика', 'Физика'],
            createdAt: new Date().toISOString()
        };
        existingUsers.push(demoStudent);
    }
    
    // Создаем демо-учителей из списка teachers
    Object.values(teachers).forEach(teacher => {
        if (!existingUsers.some(user => user.id === teacher.id)) {
            const [firstName, lastName] = teacher.name.split(' ');
            const teacherUser = {
                id: teacher.id,
                firstName: firstName,
                lastName: lastName || '',
                email: `teacher${teacher.id}@example.com`,
                password: 'teacher123',
                role: 'tutor',
                subjects: teacher.subjects,
                experience: teacher.experience,
                rating: teacher.rating,
                avatar: teacher.avatar,
                description: teacher.description,
                phone: '+7 (999) 000-00-00',
                stats: {
                    totalLessons: 0,
                    upcomingLessons: 0,
                    completedLessons: 0,
                    totalStudents: 0
                },
                createdAt: new Date().toISOString()
            };
            existingUsers.push(teacherUser);
        }
    });
    
    // Создаем демо-уроки если нет
    if (existingLessons.length === 0) {
        const demoLessons = [
            {
                id: 1,
                studentId: 1000,
                studentName: 'Иван Иванов',
                studentEmail: 'student@example.com',
                tutorId: 1,
                tutorName: 'Анна Петрова',
                tutorAvatar: 'img/АннаПетрова.jpg',
                subject: 'Математика',
                date: getFutureDate(1),
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
                studentEmail: 'student@example.com',
                tutorId: 3,
                tutorName: 'Иван Сидоров',
                tutorAvatar: 'img/ИванСидоров.jpg',
                subject: 'Английский язык',
                date: getFutureDate(2),
                time: '16:00-17:00',
                duration: '60 минут',
                status: 'scheduled',
                notes: 'Разговорная практика',
                createdAt: new Date().toISOString(),
                price: 1200,
                currency: 'руб.',
                role: 'student'
            }
        ];
        existingLessons.push(...demoLessons);
    }
    
    localStorage.setItem('ucheba_users', JSON.stringify(existingUsers));
    localStorage.setItem('ucheba_lessons', JSON.stringify(existingLessons));
}

// Вспомогательная функция для получения будущей даты
function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Обновляем DOMContentLoaded в teacher.js:
document.addEventListener('DOMContentLoaded', function() {
    console.log('Teacher page loaded');
    
    // Добавляем стили при загрузке
    addTeacherStyles();
    
    // Инициализируем демо-пользователей и уроки
    initDemoUsers();
    
    // Обновляем кнопки в зависимости от роли пользователя
    updateBookingButtons();
});

// Данные репетиторов
const teachers = {
    1: {
        id: 1,
        name: 'Анна Петрова',
        subjects: ['Математика', 'Физика'],
        experience: '8 лет',
        students: '350+',
        description: 'Кандидат физико-математических наук. Специализация подготовка к ЕГЭ и олимпиадам.',
        rating: 4.9,
        avatar: 'img/АннаПетрова.jpg'
    },
    2: {
        id: 2,
        name: 'Алексей Козлов',
        subjects: ['Физика', 'Математика'],
        experience: '7 лет',
        students: '290+',
        description: 'Преподаватель вуза. Специализация подготовка к ЕГЭ и олимпиадам по физике.',
        rating: 4.8,
        avatar: 'img/АлексейКозлов.png'
    },
    3: {
        id: 3,
        name: 'Иван Сидоров',
        subjects: ['Английский язык'],
        experience: '6 лет',
        students: '420+',
        description: 'Сертифицированный специалист с международным опытом. Подготовка к IELTS, TOEFL.',
        rating: 4.9,
        avatar: 'img/ИванСидоров.jpg'
    },
    4: {
        id: 4,
        name: 'Елена Смирнова',
        subjects: ['Химия', 'Биология'],
        experience: '9 лет',
        students: '320+',
        description: 'Кандидат химических наук. Авторская методика подготовки к ЕГЭ и олимпиадам.',
        rating: 4.7,
        avatar: 'img/Елена Смирнова.jpg'
    },
    5: {
        id: 5,
        name: 'Мария Иванова',
        subjects: ['Русский язык', 'Литература'],
        experience: '10 лет',
        students: '380+',
        description: 'Эксперт ЕГЭ по русскому языку. Автор учебных пособий для подготовки к экзаменам.',
        rating: 4.9,
        avatar: 'img/МарияИванова.png'
    },
    6: {
        id: 6,
        name: 'Дмитрий Попов',
        subjects: ['Программирование', 'Математика'],
        experience: '5 лет',
        students: '450+',
        description: 'Senior разработчик. Преподаю Python, JavaScript, алгоритмы и структуры данных.',
        rating: 4.8,
        avatar: 'img/Дмитрий Попов.jpg'
    }
};

// Добавляем стили при загрузке страницы
function addTeacherStyles() {
    if (!document.getElementById('teacher-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'teacher-styles';
        styleSheet.textContent = `
            /* Стили для модального окна профиля учителя */
            .teacher-profile-detail {
                padding: 1.5rem;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .teacher-profile-header {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid var(--border);
            }
            
            .teacher-profile-avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;
                border: 4px solid var(--primary-light);
            }
            
            .teacher-profile-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .teacher-profile-info h2 {
                font-size: 1.75rem;
                margin-bottom: 0.5rem;
                color: var(--fg);
            }
            
            .teacher-profile-subjects {
                font-size: 1.1rem;
                color: var(--primary);
                font-weight: 500;
                margin-bottom: 0.5rem;
            }
            
            .teacher-profile-rating {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #fbbf24;
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .teacher-profile-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin: 2rem 0;
            }
            
            .teacher-profile-stat {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 0.75rem;
                padding: 1.5rem;
                text-align: center;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .teacher-profile-stat:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .teacher-profile-stat .stat-value {
                font-size: 2rem;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 0.5rem;
            }
            
            .teacher-profile-stat .stat-label {
                font-size: 0.9rem;
                color: var(--muted-fg);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .teacher-profile-description {
                margin: 2.5rem 0;
            }
            
            .teacher-profile-description h3 {
                margin: 1.5rem 0 0.75rem;
                color: var(--fg);
                font-size: 1.3rem;
                border-bottom: 2px solid var(--primary);
                padding-bottom: 0.5rem;
                display: inline-block;
            }
            
            .teacher-profile-description p {
                color: var(--muted-fg);
                line-height: 1.6;
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            
            .teacher-profile-actions {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border);
                text-align: center;
            }
            
            .teacher-profile-actions .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
                font-weight: 500;
            }
            
            .teacher-profile-actions .btn svg {
                width: 18px;
                height: 18px;
            }
            
            /* Стили для модального окна бронирования */
            .booking-modal-content {
                max-width: 500px;
                width: 90%;
            }
            
            .booking-modal-body {
                padding: 1.5rem;
            }
            
            .booking-teacher-info {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid var(--border);
            }
            
            .booking-teacher-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;
                border: 2px solid var(--primary);
            }
            
            .booking-teacher-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .booking-teacher-details h3 {
                margin: 0 0 0.25rem 0;
                font-size: 1.2rem;
                color: var(--fg);
            }
            
            .booking-teacher-subjects {
                color: var(--primary);
                font-size: 0.9rem;
                margin: 0 0 0.25rem 0;
            }
            
            .booking-teacher-rating {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: #fbbf24;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .booking-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .booking-form .form-group {
                margin-bottom: 0.5rem;
            }
            
            .booking-form label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--fg);
                font-size: 0.95rem;
            }
            
            .booking-form label.required::after {
                content: ' *';
                color: #e53935;
            }
            
            .booking-form input,
            .booking-form select,
            .booking-form textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: 0.5rem;
                background: var(--bg);
                color: var(--fg);
                font-size: 0.95rem;
                transition: border-color 0.2s;
            }
            
            .booking-form input:focus,
            .booking-form select:focus,
            .booking-form textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
            }
            
            .booking-form textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border);
            }
            
            .form-actions .btn {
                flex: 1;
                padding: 0.75rem 1rem;
                font-weight: 500;
            }
            
            .btn-primary {
                background: var(--primary);
                color: white;
                border: none;
            }
            
            .btn-primary:hover {
                background: var(--primary-dark);
            }
            
            .btn-outline {
                background: transparent;
                border: 1px solid var(--border);
                color: var(--fg);
            }
            
            .btn-outline:hover {
                background: var(--bg-hover);
            }
            
            /* Стили для модального окна успеха */
            .success-modal-content {
                max-width: 450px;
                width: 90%;
                text-align: center;
                padding: 2rem;
            }
            
            .success-icon {
                color: #4caf50;
                margin-bottom: 1.5rem;
            }
            
            .success-icon svg {
                width: 64px;
                height: 64px;
            }
            
            .success-details {
                text-align: left;
                margin: 1.5rem 0;
                padding: 1.25rem;
                background: var(--bg);
                border-radius: 0.75rem;
                border: 1px solid var(--border);
            }
            
            .success-details p {
                margin: 0.75rem 0;
                line-height: 1.5;
            }
            
            .success-details strong {
                color: var(--fg);
                font-weight: 600;
            }
            
            .success-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }
            
            .success-actions .btn {
                flex: 1;
                padding: 0.75rem 1rem;
            }
            
            /* Общие стили для модальных окон */
            .modal-content {
                background: var(--bg);
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .modal-header {
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid var(--border);
                background: var(--bg);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                color: var(--fg);
                font-weight: 600;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.75rem;
                color: var(--muted-fg);
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .modal-close:hover {
                color: var(--fg);
            }
            
            @media (max-width: 640px) {
                .teacher-profile-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }
                
                .teacher-profile-stats {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .teacher-profile-avatar {
                    width: 100px;
                    height: 100px;
                }
                
                .form-actions,
                .success-actions {
                    flex-direction: column;
                }
                
                .modal-content {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

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

// Открытие модального окна для записи
function openBookingModal(teacherId) {
    const teacher = teachers[teacherId];
    if (!teacher) {
        alert('Репетитор не найден');
        return;
    }
    
    // Проверяем авторизацию
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему для записи на урок');
        window.location.href = 'centered_login_local.html';
        return;
    }
    
    // Проверяем роль пользователя
    if (currentUser.role !== 'student') {
        if (currentUser.role === 'tutor') {
            alert('Репетиторы не могут записываться на уроки. Эта функция доступна только для учеников.');
        } else if (currentUser.role === 'admin') {
            alert('Администраторы не могут записываться на уроки. Для просмотра всех записей используйте панель администратора.');
            window.location.href = 'admin_panel.html';
        } else {
            alert('Запись на урок доступна только для учеников');
        }
        return;
    }
    
    // Создаем модальное окно для записи
    const modalHTML = `
        <div class="modal-content booking-modal-content">
            <div class="modal-header">
                <h2>Запись на урок</h2>
                <button class="modal-close" id="bookingCloseBtn">×</button>
            </div>
            <div class="booking-modal-body">
                <div class="booking-teacher-info">
                    <div class="booking-teacher-avatar">
                        <img src="${teacher.avatar}" alt="${teacher.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=01497c&color=fff&size=200'">
                    </div>
                    <div class="booking-teacher-details">
                        <h3>${teacher.name}</h3>
                        <p class="booking-teacher-subjects">${teacher.subjects.join(', ')}</p>
                        <div class="booking-teacher-rating">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${teacher.rating}
                        </div>
                    </div>
                </div>
                
                <form id="bookingForm" class="booking-form">
                    <input type="hidden" id="selectedTeacherId" value="${teacherId}">
                    
                    <div class="form-group">
                        <label for="bookingDate" class="required">Дата урока</label>
                        <input type="date" id="bookingDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="bookingTime" class="required">Время урока</label>
                        <select id="bookingTime" required>
                            <option value="">Выберите время</option>
                            <option value="09:00-10:00">09:00 - 10:00</option>
                            <option value="10:30-11:30">10:30 - 11:30</option>
                            <option value="12:00-13:00">12:00 - 13:00</option>
                            <option value="14:00-15:00">14:00 - 15:00</option>
                            <option value="16:00-17:00">16:00 - 17:00</option>
                            <option value="18:00-19:00">18:00 - 19:00</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="bookingSubject" class="required">Предмет</label>
                        <select id="bookingSubject" required>
                            ${teacher.subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="bookingNotes">Дополнительные пожелания</label>
                        <textarea id="bookingNotes" rows="3" placeholder="Укажите темы, которые хотите изучить, уровень подготовки, особые пожелания..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="bookingCancelBtn">Отмена</button>
                        <button type="submit" class="btn btn-primary">Забронировать урок</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Удаляем старое модальное окно если есть
    const oldModal = document.getElementById('bookingModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    // Создаем новое модальное окно
    const modal = document.createElement('div');
    modal.id = 'bookingModal';
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Инициализация формы
    initBookingForm(teacherId);
    
    // Добавляем обработчики событий
    const closeBtn = document.getElementById('bookingCloseBtn');
    const cancelBtn = document.getElementById('bookingCancelBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBookingModal);
    }
    
    // Обработчик для закрытия по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeBookingModal();
        }
    });
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

// Инициализация формы бронирования
function initBookingForm(teacherId) {
    const teacher = teachers[teacherId];
    if (!teacher) return;
    
    // Устанавливаем минимальную дату (сегодня)
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.min = today;
        
        // Устанавливаем дату по умолчанию (через 2 дня)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 2);
        dateInput.value = defaultDate.toISOString().split('T')[0];
    }
    
    // Устанавливаем предмет по умолчанию
    const subjectSelect = document.getElementById('bookingSubject');
    if (subjectSelect && teacher.subjects.length > 0) {
        subjectSelect.value = teacher.subjects[0];
    }
    
    // Обработчик отправки формы
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitBookingForm(teacherId);
        });
    }
}

// Отправка формы бронирования
function submitBookingForm(teacherId) {
    const teacher = teachers[teacherId];
    const currentUser = getCurrentUser();
    
    if (!teacher || !currentUser) {
        alert('Ошибка: данные не найдены');
        return;
    }
    
    // Дополнительная проверка роли (на всякий случай)
    if (currentUser.role !== 'student') {
        alert('Запись на урок доступна только для учеников');
        return;
    }
    
    // Получаем данные формы
    const bookingDate = document.getElementById('bookingDate')?.value;
    const bookingTime = document.getElementById('bookingTime')?.value;
    const bookingSubject = document.getElementById('bookingSubject')?.value;
    const bookingNotes = document.getElementById('bookingNotes')?.value;
    
    // Валидация
    if (!bookingDate || !bookingTime || !bookingSubject) {
        alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
        return;
    }
    
    // Проверяем, что дата не в прошлом
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Нельзя выбрать прошедшую дату');
        return;
    }
    
    // Создаем объект урока
    const newLesson = {
        id: Date.now(),
        studentId: currentUser.id,
        studentName: `${currentUser.firstName} ${currentUser.lastName}`,
        studentEmail: currentUser.email,
        tutorId: teacher.id,
        tutorName: teacher.name,
        tutorAvatar: teacher.avatar,
        subject: bookingSubject,
        date: bookingDate,
        time: bookingTime,
        duration: '60 минут',
        status: 'scheduled',
        notes: bookingNotes || '',
        createdAt: new Date().toISOString(),
        price: 1500,
        currency: 'руб.',
        role: currentUser.role // Добавляем роль пользователя
    };
    
    // Сохраняем урок
    const lessons = getLessons();
    lessons.push(newLesson);
    const saved = saveLessons(lessons);
    
    if (saved) {
        // Закрываем модальное окно
        closeBookingModal();
        
        // Показываем успешное сообщение
        showSuccessMessage(teacher.name, bookingDate, bookingTime);
        
        // Обновляем список уроков если мы на странице профиля
        if (window.location.pathname.includes('profile.html') && typeof loadLessons === 'function') {
            loadLessons();
        }
    } else {
        alert('Произошла ошибка при сохранении урока. Попробуйте еще раз.');
    }
}

// Показать сообщение об успешной записи
function showSuccessMessage(teacherName, date, time) {
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const modalHTML = `
        <div class="modal-content success-modal-content">
            <div class="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2>Урок успешно забронирован!</h2>
            <div class="success-details">
                <p><strong>Репетитор:</strong> ${teacherName}</p>
                <p><strong>Дата:</strong> ${formattedDate}</p>
                <p><strong>Время:</strong> ${time}</p>
                <p>Урок появится в вашем личном кабинете. За час до начала урока мы пришлем вам напоминание.</p>
            </div>
            <div class="success-actions">
                <button class="btn btn-primary" id="successOkBtn">ОК</button>
                <button class="btn btn-outline" id="successProfileBtn">Перейти в профиль</button>
            </div>
        </div>
    `;
    
    // Создаем модальное окно успеха
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Обработчики кнопок
    const okBtn = document.getElementById('successOkBtn');
    const profileBtn = document.getElementById('successProfileBtn');
    
    if (okBtn) {
        okBtn.addEventListener('click', function() {
            closeSuccessModal();
        });
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            closeSuccessModal();
            window.location.href = 'profile.html';
        });
    }
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Закрыть модальное окно успеха
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Закрыть модальное окно бронирования
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Просмотр профиля репетитора
function viewTeacherProfile(teacherId) {
    const teacher = teachers[teacherId];
    if (!teacher) return;
    
    // Проверяем авторизацию для определения доступности бронирования
    const currentUser = getCurrentUser();
    
    // Удаляем старое модальное окно если есть
    const oldModal = document.getElementById('teacherProfileModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'teacherProfileModal';
    modal.className = 'modal';
    
    // Определяем, показывать ли кнопку бронирования
    let bookingButton = '';
    if (currentUser && currentUser.role === 'student') {
        bookingButton = `
            <button class="btn btn-primary" id="teacherProfileBookBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Записаться на урок
            </button>
        `;
    } else if (currentUser && currentUser.role === 'tutor') {
        bookingButton = `
            <div class="alert alert-warning">
                <p><strong>Репетиторы не могут записываться на уроки.</strong></p>
                <p>Эта функция доступна только для учеников.</p>
            </div>
        `;
    } else if (currentUser && currentUser.role === 'admin') {
        bookingButton = `
            <a href="admin_panel.html" class="btn btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"></path>
                </svg>
                Управление бронированиями
            </a>
        `;
    } else {
        bookingButton = `
            <a href="centered_login_local.html" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Войти для записи
            </a>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Профиль репетитора</h2>
                <button class="modal-close" id="teacherProfileCloseBtn">×</button>
            </div>
            <div class="teacher-profile-detail">
                <div class="teacher-profile-header">
                    <div class="teacher-profile-avatar">
                        <img src="${teacher.avatar}" alt="${teacher.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=01497c&color=fff&size=400'">
                    </div>
                    <div class="teacher-profile-info">
                        <h2>${teacher.name}</h2>
                        <p class="teacher-profile-subjects">${teacher.subjects.join(', ')}</p>
                        <div class="teacher-profile-rating">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${teacher.rating} (${teacher.students.replace('+', '')} отзывов)
                        </div>
                    </div>
                </div>
                
                <div class="teacher-profile-stats">
                    <div class="teacher-profile-stat">
                        <div class="stat-value">${teacher.experience}</div>
                        <div class="stat-label">Опыт преподавания</div>
                    </div>
                    <div class="teacher-profile-stat">
                        <div class="stat-value">${teacher.students}</div>
                        <div class="stat-label">Учеников обучено</div>
                    </div>
                </div>
                
                <div class="teacher-profile-description">
                    <h3>О репетиторе</h3>
                    <p>${teacher.description}</p>
                    <h3>Образование</h3>
                    <p>Высшее образование по профилю преподавания. Регулярно проходит повышение квалификации.</p>
                    <h3>Методика</h3>
                    <p>Индивидуальный подход к каждому ученику. Современные методики обучения с использованием интерактивных материалов.</p>
                </div>
                
                <div class="teacher-profile-actions">
                    ${bookingButton}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeBtn = document.getElementById('teacherProfileCloseBtn');
    const bookBtn = document.getElementById('teacherProfileBookBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeTeacherProfileModal();
        });
    }
    
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            closeTeacherProfileModal();
            setTimeout(() => openBookingModal(teacherId), 300);
        });
    }
    
    // Обработчик для закрытия по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTeacherProfileModal();
        }
    });
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно профиля
function closeTeacherProfileModal() {
    const modal = document.getElementById('teacherProfileModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Обновляем кнопки на странице репетиторов в зависимости от роли
function updateBookingButtons() {
    const currentUser = getCurrentUser();
    const bookButtons = document.querySelectorAll('.teacher-actions .btn-primary');
    
    bookButtons.forEach(button => {
        if (currentUser) {
            if (currentUser.role === 'tutor') {
                button.textContent = 'Доступно ученикам';
                button.disabled = true;
                button.style.opacity = '0.7';
                button.style.cursor = 'not-allowed';
                button.onclick = function(e) {
                    e.preventDefault();
                    alert('Репетиторы не могут записываться на уроки. Эта функция доступна только для учеников.');
                };
            } else if (currentUser.role === 'admin') {
                button.textContent = 'Управление бронированиями';
                button.onclick = function(e) {
                    e.preventDefault();
                    window.location.href = 'admin_panel.html';
                };
            }
        }
    });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Teacher page loaded');
    
    // Добавляем стили при загрузке
    addTeacherStyles();
    
    // Проверяем наличие данных в localStorage
    if (!localStorage.getItem('ucheba_lessons')) {
        const demoLessons = [
            {
                id: 1,
                studentId: 1,
                studentName: 'Иван Иванов',
                studentEmail: 'ivan@example.com',
                tutorId: 1,
                tutorName: 'Анна Петрова',
                tutorAvatar: 'img/АннаПетрова.jpg',
                subject: 'Математика',
                date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                time: '14:00-15:00',
                duration: '60 минут',
                status: 'scheduled',
                notes: 'Подготовка к ЕГЭ, тема: производные',
                createdAt: new Date().toISOString(),
                price: 1500,
                currency: 'руб.',
                role: 'student'
            }
        ];
        saveLessons(demoLessons);
    }
    
    // Обновляем кнопки в зависимости от роли пользователя
    updateBookingButtons();
});

// Экспортируем функции в глобальную область
window.openBookingModal = openBookingModal;
window.viewTeacherProfile = viewTeacherProfile;