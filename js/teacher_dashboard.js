// teacher_dashboard.js - функционал панели учителя

let currentWeek = 0;
let currentTeacher = null;

// Инициализация панели учителя
function initTeacherDashboard() {
    // Проверяем авторизацию
    currentTeacher = checkAuth('tutor');
    if (!currentTeacher) return;
    
    // Загружаем данные учителя
    loadTeacherData();
    
    // Загружаем предстоящие уроки
    loadUpcomingLessons();
    
    // Генерируем расписание
    generateSchedule();
    
    // Загружаем список учеников
    loadStudents();
    
    // Инициализируем график доходов
    initEarningsChart();
    
    // Настраиваем обработчики событий
    setupEventListeners();
}

// Загрузка данных учителя
function loadTeacherData() {
    if (!currentTeacher) return;
    
    // Обновляем информацию в сайдбаре
    document.getElementById('teacherName').textContent = 
        `${currentTeacher.firstName} ${currentTeacher.lastName}`;
    
    document.getElementById('teacherRole').textContent = 
        `${currentTeacher.subjects?.join(', ') || 'Репетитор'}`;
    
    // Обновляем статистику
    updateTeacherStats();
}

// Обновление статистики учителя
function updateTeacherStats() {
    const lessons = getLessons();
    const teacherLessons = lessons.filter(lesson => lesson.tutorId === currentTeacher.id);
    const users = getUsers();
    
    // Считаем уникальных учеников
    const studentIds = [...new Set(teacherLessons.map(lesson => lesson.studentId))];
    const totalStudents = studentIds.length;
    
    // Считаем уроки
    const totalLessons = teacherLessons.length;
    const upcomingLessons = teacherLessons.filter(lesson => 
        lesson.status === 'scheduled' && 
        new Date(lesson.date) >= new Date()
    ).length;
    
    // Считаем доходы за месяц
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthLessons = teacherLessons.filter(lesson => {
        if (lesson.status !== 'completed') return false;
        
        const lessonDate = new Date(lesson.date);
        return lessonDate.getMonth() === currentMonth && 
               lessonDate.getFullYear() === currentYear;
    });
    
    const monthEarnings = monthLessons.reduce((sum, lesson) => sum + (lesson.price || 1500), 0);
    
    // Обновляем статистику в интерфейсе
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalLessons').textContent = totalLessons;
    document.getElementById('monthEarnings').textContent = `${monthEarnings.toLocaleString('ru-RU')} ₽`;
    
    // Сохраняем обновленную статистику
    const updatedUsers = users.map(user => {
        if (user.id === currentTeacher.id) {
            return {
                ...user,
                stats: {
                    totalStudents,
                    totalLessons,
                    monthEarnings
                }
            };
        }
        return user;
    });
    
    saveUsers(updatedUsers);
}

// Загрузка предстоящих уроков
function loadUpcomingLessons() {
    const container = document.getElementById('upcomingLessons');
    if (!container) return;
    
    const lessons = getLessons();
    const now = new Date();
    
    // Фильтруем предстоящие уроки
    const upcomingLessons = lessons.filter(lesson => 
        lesson.tutorId === currentTeacher.id && 
        lesson.status === 'scheduled' && 
        new Date(lesson.date) >= new Date(now.setHours(0, 0, 0, 0))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingLessons.length === 0) {
        container.innerHTML = `
            <div class="empty-lessons">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>Нет предстоящих уроков</h3>
                <p>Когда ученики запишутся на уроки, они появятся здесь</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    upcomingLessons.forEach(lesson => {
        const lessonDate = new Date(lesson.date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateLabel = formatDate(lesson.date);
        if (lessonDate.toDateString() === today.toDateString()) {
            dateLabel = 'Сегодня';
        } else if (lessonDate.toDateString() === tomorrow.toDateString()) {
            dateLabel = 'Завтра';
        }
        
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card clickable';
        lessonCard.innerHTML = `
            <div class="lesson-card-header">
                <div>
                    <h4>${lesson.subject}</h4>
                    <p class="lesson-student">${lesson.studentName}</p>
                </div>
                <span class="lesson-status scheduled">Запланирован</span>
            </div>
            <div class="lesson-card-body">
                <div class="lesson-info">
                    <div class="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateLabel}
                    </div>
                    <div class="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${lesson.time}
                    </div>
                </div>
                ${lesson.notes ? `<p class="lesson-notes">${lesson.notes}</p>` : ''}
            </div>
            <div class="lesson-card-actions">
                <button class="btn btn-sm btn-primary" onclick="startLesson(${lesson.id})">
                    Начать урок
                </button>
                <button class="btn btn-sm btn-outline" onclick="showLessonDetails(${lesson.id})">
                    Подробнее
                </button>
            </div>
        `;
        
        lessonCard.onclick = (e) => {
            if (!e.target.closest('button')) {
                showLessonDetails(lesson.id);
            }
        };
        
        container.appendChild(lessonCard);
    });
}

// Генерация расписания на неделю
function generateSchedule() {
    const container = document.getElementById('weeklySchedule');
    if (!container) return;
    
    // Определяем начало текущей недели (понедельник)
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + (currentWeek * 7));
    
    // Обновляем заголовок недели
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const weekTitle = `${monday.getDate()} ${getMonthName(monday.getMonth())} - ${sunday.getDate()} ${getMonthName(sunday.getMonth())} ${sunday.getFullYear()}`;
    document.getElementById('currentWeek').textContent = weekTitle;
    
    // Получаем уроки учителя
    const lessons = getLessons();
    const teacherLessons = lessons.filter(lesson => 
        lesson.tutorId === currentTeacher.id && 
        lesson.status === 'scheduled'
    );
    
    // Временные слоты
    const timeSlots = [
        '09:00-10:00', '10:30-11:30', '12:00-13:00',
        '14:00-15:00', '16:00-17:00', '18:00-19:00'
    ];
    
    container.innerHTML = '';
    
    // Генерируем слоты для каждого дня недели
    for (let day = 0; day < 7; day++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        timeSlots.forEach(timeSlot => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            
            // Проверяем, есть ли урок в этот слот
            const lesson = teacherLessons.find(l => 
                l.date === dateString && 
                l.time === timeSlot
            );
            
            if (lesson) {
                slot.classList.add('booked');
                slot.innerHTML = `
                    <div class="time-label">${timeSlot.split('-')[0]}</div>
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-student">${lesson.studentName.split(' ')[0]}</div>
                `;
                slot.title = `Урок: ${lesson.subject}\nУченик: ${lesson.studentName}\nВремя: ${timeSlot}`;
                slot.onclick = () => showLessonDetails(lesson.id);
            } else if (currentDate >= new Date(now.setHours(0, 0, 0, 0))) {
                // Только будущие даты доступны для бронирования
                slot.classList.add('available');
                slot.textContent = timeSlot.split('-')[0];
                slot.title = 'Свободно для бронирования';
                slot.onclick = () => createLessonInSlot(dateString, timeSlot);
            } else {
                slot.classList.add('unavailable');
                slot.textContent = timeSlot.split('-')[0];
                slot.title = 'Недоступно';
            }
            
            container.appendChild(slot);
        });
    }
}

// Создание урока в выбранном слоте
function createLessonInSlot(date, time) {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Создание нового урока</h2>
                <button class="modal-close" onclick="closeModal('createLessonModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="slot-info">
                    <p><strong>Дата:</strong> ${formatDate(date)}</p>
                    <p><strong>Время:</strong> ${time}</p>
                </div>
                <form id="createLessonForm">
                    <div class="form-group">
                        <label for="studentSelect">Ученик</label>
                        <select id="studentSelect" required>
                            <option value="">Выберите ученика</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="lessonSubject">Предмет</label>
                        <select id="lessonSubject" required>
                            <option value="">Выберите предмет</option>
                            ${currentTeacher.subjects?.map(subject => 
                                `<option value="${subject}">${subject}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="lessonPrice">Стоимость (руб.)</label>
                        <input type="number" id="lessonPrice" value="1500" min="500" step="100" required>
                    </div>
                    <div class="form-group">
                        <label for="lessonNotes">Заметки (необязательно)</label>
                        <textarea id="lessonNotes" rows="3" placeholder="Тема урока, особенности..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('createLessonModal')">Отмена</button>
                        <button type="submit" class="btn btn-primary">Создать урок</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    createModal('createLessonModal', modalContent);
    openModal('createLessonModal');
    
    // Заполняем список учеников
    loadStudentOptions();
    
    // Обработчик формы
    document.getElementById('createLessonForm').onsubmit = function(e) {
        e.preventDefault();
        submitNewLesson(date, time);
    };
}

// Загрузка списка учеников для выбора
function loadStudentOptions() {
    const select = document.getElementById('studentSelect');
    if (!select) return;
    
    const lessons = getLessons();
    const users = getUsers();
    
    // Находим учеников, которые уже были у этого учителя
    const studentIds = [...new Set(lessons
        .filter(lesson => lesson.tutorId === currentTeacher.id)
        .map(lesson => lesson.studentId)
    )];
    
    const existingStudents = users.filter(user => 
        user.role === 'student' && studentIds.includes(user.id)
    );
    
    // Добавляем существующих учеников
    existingStudents.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.firstName} ${student.lastName}`;
        select.appendChild(option);
    });
    
    // Добавляем опцию для нового ученика
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Новый ученик';
    select.appendChild(newOption);
}

// Создание нового урока
function submitNewLesson(date, time) {
    const studentId = document.getElementById('studentSelect').value;
    const subject = document.getElementById('lessonSubject').value;
    const price = parseInt(document.getElementById('lessonPrice').value);
    const notes = document.getElementById('lessonNotes').value;
    
    if (!studentId || !subject) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    let student = null;
    const users = getUsers();
    
    if (studentId === 'new') {
        // Создание нового ученика
        const newStudentId = Math.max(...users.map(u => u.id), 0) + 1;
        student = {
            id: newStudentId,
            firstName: 'Новый',
            lastName: 'Ученик',
            email: `student${newStudentId}@test.com`,
            role: 'student',
            createdAt: new Date().toISOString()
        };
        users.push(student);
        saveUsers(users);
    } else {
        student = users.find(u => u.id === parseInt(studentId));
    }
    
    if (!student) {
        showNotification('Ошибка при выборе ученика', 'error');
        return;
    }
    
    // Создаем урок
    const newLesson = {
        id: Date.now(),
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        tutorId: currentTeacher.id,
        tutorName: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
        subject: subject,
        date: date,
        time: time,
        duration: '60 минут',
        status: 'scheduled',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        price: price,
        currency: 'руб.',
        createdBy: 'teacher'
    };
    
    const lessons = getLessons();
    lessons.push(newLesson);
    saveLessons(lessons);
    
    // Обновляем интерфейс
    closeModal('createLessonModal');
    loadUpcomingLessons();
    generateSchedule();
    updateTeacherStats();
    
    showNotification('Урок успешно создан!', 'success');
}

// Загрузка списка учеников
function loadStudents() {
    const container = document.getElementById('studentsList');
    if (!container) return;
    
    const lessons = getLessons();
    const users = getUsers();
    
    // Находим учеников учителя
    const studentIds = [...new Set(lessons
        .filter(lesson => lesson.tutorId === currentTeacher.id)
        .map(lesson => lesson.studentId)
    )];
    
    const students = users.filter(user => 
        user.role === 'student' && studentIds.includes(user.id)
    );
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-students">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3>Нет учеников</h3>
                <p>У вас пока нет учеников. Создайте первый урок!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    students.forEach(student => {
        const studentLessons = lessons.filter(lesson => 
            lesson.tutorId === currentTeacher.id && 
            lesson.studentId === student.id
        );
        
        const completedLessons = studentLessons.filter(l => l.status === 'completed').length;
        const upcomingLessons = studentLessons.filter(l => l.status === 'scheduled').length;
        const lastLesson = studentLessons.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card clickable';
        studentCard.innerHTML = `
            <div class="student-card-header">
                <div class="student-avatar">
                    ${(student.firstName?.[0] || 'У')}${(student.lastName?.[0] || 'Ч')}
                </div>
                <div class="student-info">
                    <h4>${student.firstName} ${student.lastName}</h4>
                    <p>${student.email}</p>
                </div>
            </div>
            <div class="student-stats">
                <div class="stat">
                    <div class="stat-value">${studentLessons.length}</div>
                    <div class="stat-label">Всего уроков</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${upcomingLessons}</div>
                    <div class="stat-label">Предстоящих</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${completedLessons}</div>
                    <div class="stat-label">Завершено</div>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn btn-sm btn-primary" onclick="contactStudent(${student.id})">
                    Написать
                </button>
                <button class="btn btn-sm btn-outline" onclick="createLessonForStudent(${student.id})">
                    Новый урок
                </button>
            </div>
        `;
        
        studentCard.onclick = () => showStudentDetails(student.id);
        container.appendChild(studentCard);
    });
}

// Показать детали урока
function showLessonDetails(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Детали урока</h2>
                <button class="modal-close" onclick="closeModal('lessonDetailsModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="lesson-details">
                    <h3>${lesson.subject}</h3>
                    
                    <div class="detail-section">
                        <h4>Информация об уроке</h4>
                        <p><strong>Дата:</strong> ${formatDate(lesson.date)}</p>
                        <p><strong>Время:</strong> ${lesson.time}</p>
                        <p><strong>Длительность:</strong> ${lesson.duration}</p>
                        <p><strong>Статус:</strong> <span class="status-${lesson.status}">${
                            lesson.status === 'scheduled' ? 'Запланирован' :
                            lesson.status === 'completed' ? 'Завершен' : 'Отменен'
                        }</span></p>
                        <p><strong>Стоимость:</strong> ${lesson.price} ${lesson.currency}</p>
                        ${lesson.notes ? `<p><strong>Заметки:</strong> ${lesson.notes}</p>` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h4>Информация об ученике</h4>
                        <p><strong>Имя:</strong> ${lesson.studentName}</p>
                        <p><strong>Email:</strong> ${lesson.studentEmail}</p>
                    </div>
                    
                    ${lesson.cancelReason ? `
                        <div class="detail-section">
                            <h4>Информация об отмене</h4>
                            <p><strong>Причина:</strong> ${lesson.cancelReason}</p>
                            <p><strong>Отменен:</strong> ${lesson.cancelledBy === 'teacher' ? 'Учителем' : 'Учеником'}</p>
                        </div>
                    ` : ''}
                    
                    ${lesson.rating ? `
                        <div class="detail-section">
                            <h4>Отзыв ученика</h4>
                            <div class="rating">
                                <div class="stars">${'★'.repeat(lesson.rating)}${'☆'.repeat(5 - lesson.rating)}</div>
                                <p>${lesson.review || 'Без комментариев'}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="modal-actions">
                    ${lesson.status === 'scheduled' ? `
                        <button class="btn btn-success" onclick="startLesson(${lesson.id})">
                            Начать урок
                        </button>
                        <button class="btn btn-warning" onclick="rescheduleLesson(${lesson.id})">
                            Перенести
                        </button>
                        <button class="btn btn-danger" onclick="cancelLesson(${lesson.id})">
                            Отменить
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="closeModal('lessonDetailsModal')">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    createModal('lessonDetailsModal', modalContent);
    openModal('lessonDetailsModal');
}

// Начать урок
function startLesson(lessonId) {
    const lessons = getLessons();
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex === -1) return;
    
    // Обновляем статус урока
    lessons[lessonIndex].status = 'in_progress';
    lessons[lessonIndex].startedAt = new Date().toISOString();
    saveLessons(lessons);
    
    // Генерируем ссылку на видеоконференцию
    const lesson = lessons[lessonIndex];
    const meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const meetingUrl = `https://meet.google.com/ueba-${meetingCode}`;
    
    // Показываем модальное окно с ссылкой
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Начать урок</h2>
                <button class="modal-close" onclick="closeModal('startLessonModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="meeting-info">
                    <h3>Ссылка на видеоконференцию:</h3>
                    <div class="meeting-link">
                        <input type="text" readonly value="${meetingUrl}" id="meetingLink">
                        <button class="btn btn-sm" onclick="copyMeetingLink()">Копировать</button>
                    </div>
                    <p class="meeting-note">
                        Скопируйте ссылку и отправьте ученику, или перейдите по ней чтобы начать урок.
                    </p>
                </div>
                <div class="modal-actions">
                    <a href="${meetingUrl}" target="_blank" class="btn btn-success">
                        Перейти к конференции
                    </a>
                    <button class="btn btn-outline" onclick="closeModal('startLessonModal')">
                        Позже
                    </button>
                </div>
            </div>
        </div>
    `;
    
    createModal('startLessonModal', modalContent);
    openModal('startLessonModal');
    
    // Закрываем предыдущее модальное окно
    closeModal('lessonDetailsModal');
    
    // Обновляем список уроков
    loadUpcomingLessons();
}

// Копировать ссылку на встречу
function copyMeetingLink() {
    const linkInput = document.getElementById('meetingLink');
    if (linkInput) {
        linkInput.select();
        document.execCommand('copy');
        showNotification('Ссылка скопирована в буфер обмена!', 'success');
    }
}

// Перенести урок
function rescheduleLesson(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Перенос урока</h2>
                <button class="modal-close" onclick="closeModal('rescheduleModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="current-lesson-info">
                    <p><strong>Текущее время:</strong> ${formatDate(lesson.date)} ${lesson.time}</p>
                    <p><strong>Ученик:</strong> ${lesson.studentName}</p>
                    <p><strong>Предмет:</strong> ${lesson.subject}</p>
                </div>
                <form id="rescheduleForm">
                    <input type="hidden" id="rescheduleLessonId" value="${lessonId}">
                    <div class="form-group">
                        <label for="newDate">Новая дата</label>
                        <input type="date" id="newDate" min="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="newTime">Новое время</label>
                        <select id="newTime" required>
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
                        <label for="rescheduleReason">Причина переноса (необязательно)</label>
                        <textarea id="rescheduleReason" rows="3" placeholder="Укажите причину переноса..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('rescheduleModal')">Отмена</button>
                        <button type="submit" class="btn btn-primary">Перенести урок</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    createModal('rescheduleModal', modalContent);
    openModal('rescheduleModal');
    
    // Устанавливаем дату по умолчанию (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('newDate').value = tomorrow.toISOString().split('T')[0];
    
    // Обработчик формы
    document.getElementById('rescheduleForm').onsubmit = function(e) {
        e.preventDefault();
        
        const newDate = document.getElementById('newDate').value;
        const newTime = document.getElementById('newTime').value;
        const reason = document.getElementById('rescheduleReason').value;
        
        if (!newDate || !newTime) {
            showNotification('Выберите дату и время', 'error');
            return;
        }
        
        // Обновляем урок
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
            lessons[lessonIndex].date = newDate;
            lessons[lessonIndex].time = newTime;
            lessons[lessonIndex].notes = (lessons[lessonIndex].notes || '') + 
                `\n\n[Перенесено] Старое время: ${formatDate(lesson.date)} ${lesson.time}. Причина: ${reason || 'не указана'}`;
            
            saveLessons(lessons);
            
            // Обновляем интерфейс
            closeModal('rescheduleModal');
            closeModal('lessonDetailsModal');
            loadUpcomingLessons();
            generateSchedule();
            
            showNotification('Урок успешно перенесен!', 'success');
        }
    };
}

// Отменить урок
function cancelLesson(lessonId) {
    document.getElementById('cancelLessonId').value = lessonId;
    openModal('cancelLessonModal');
}

// Отправка формы отмены урока
document.getElementById('cancelLessonForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const lessonId = parseInt(document.getElementById('cancelLessonId').value);
    const reason = document.getElementById('cancelReason').value;
    const notifyStudent = document.getElementById('notifyStudent')?.checked || false;
    
    if (!reason.trim()) {
        showNotification('Укажите причину отмены', 'error');
        return;
    }
    
    const lessons = getLessons();
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex !== -1) {
        // Отменяем урок
        lessons[lessonIndex].status = 'cancelled';
        lessons[lessonIndex].cancelReason = reason;
        lessons[lessonIndex].cancelledAt = new Date().toISOString();
        lessons[lessonIndex].cancelledBy = 'teacher';
        
        saveLessons(lessons);
        
        // Обновляем интерфейс
        closeModal('cancelLessonModal');
        closeModal('lessonDetailsModal');
        loadUpcomingLessons();
        updateTeacherStats();
        
        showNotification('Урок успешно отменен!', 'success');
        
        if (notifyStudent) {
            // Здесь можно добавить отправку email ученику
            console.log(`Уведомление отправлено ученику ${lessons[lessonIndex].studentEmail}`);
        }
    }
});

// Показать детали ученика
function showStudentDetails(studentId) {
    const users = getUsers();
    const lessons = getLessons();
    
    const student = users.find(u => u.id === studentId && u.role === 'student');
    if (!student) return;
    
    const studentLessons = lessons.filter(lesson => 
        lesson.tutorId === currentTeacher.id && 
        lesson.studentId === student.id
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const modalContent = `
        <div class="modal-content wide-modal">
            <div class="modal-header">
                <h2>Профиль ученика</h2>
                <button class="modal-close" onclick="closeModal('studentDetailsModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="student-profile">
                    <div class="profile-header">
                        <div class="avatar-large">
                            ${(student.firstName?.[0] || 'У')}${(student.lastName?.[0] || 'Ч')}
                        </div>
                        <div class="profile-info">
                            <h3>${student.firstName} ${student.lastName}</h3>
                            <p>${student.email}</p>
                            ${student.phone ? `<p>${student.phone}</p>` : ''}
                            ${student.grade ? `<p><strong>Класс:</strong> ${student.grade}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="student-stats-detailed">
                        <div class="stat-card">
                            <div class="stat-value">${studentLessons.length}</div>
                            <div class="stat-label">Всего уроков</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${studentLessons.filter(l => l.status === 'scheduled').length}</div>
                            <div class="stat-label">Предстоящих</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${studentLessons.filter(l => l.status === 'completed').length}</div>
                            <div class="stat-label">Завершено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${studentLessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.price, 0)} ₽</div>
                            <div class="stat-label">Всего оплачено</div>
                        </div>
                    </div>
                    
                    <div class="lessons-history">
                        <h4>История уроков</h4>
                        ${studentLessons.length > 0 ? `
                            <div class="lessons-list">
                                ${studentLessons.map(lesson => `
                                    <div class="lesson-item ${lesson.status}" onclick="showLessonDetails(${lesson.id})">
                                        <div class="lesson-date">${formatDate(lesson.date)}</div>
                                        <div class="lesson-info">
                                            <strong>${lesson.subject}</strong>
                                            <span class="lesson-time">${lesson.time}</span>
                                            <span class="lesson-status-badge ${lesson.status}">${
                                                lesson.status === 'scheduled' ? 'Запланирован' :
                                                lesson.status === 'completed' ? 'Завершен' : 'Отменен'
                                            }</span>
                                        </div>
                                        <div class="lesson-price">${lesson.price} ₽</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-lessons">У этого ученика пока нет уроков</p>'}
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="createLessonForStudent(${student.id})">
                            Создать урок
                        </button>
                        <button class="btn btn-outline" onclick="contactStudent(${student.id})">
                            Написать сообщение
                        </button>
                        <button class="btn btn-outline" onclick="closeModal('studentDetailsModal')">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    createModal('studentDetailsModal', modalContent);
    openModal('studentDetailsModal');
}

// Создать урок для ученика
function createLessonForStudent(studentId) {
    const users = getUsers();
    const student = users.find(u => u.id === studentId);
    
    if (!student) return;
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Новый урок для ${student.firstName} ${student.lastName}</h2>
                <button class="modal-close" onclick="closeModal('newLessonForStudentModal')">×</button>
            </div>
            <div class="modal-body">
                <form id="newLessonForStudentForm">
                    <input type="hidden" id="newLessonStudentId" value="${studentId}">
                    <div class="form-group">
                        <label for="lessonDateForStudent">Дата урока</label>
                        <input type="date" id="lessonDateForStudent" min="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="lessonTimeForStudent">Время урока</label>
                        <select id="lessonTimeForStudent" required>
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
                        <label for="lessonSubjectForStudent">Предмет</label>
                        <select id="lessonSubjectForStudent" required>
                            <option value="">Выберите предмет</option>
                            ${currentTeacher.subjects?.map(subject => 
                                `<option value="${subject}">${subject}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="lessonPriceForStudent">Стоимость (руб.)</label>
                        <input type="number" id="lessonPriceForStudent" value="1500" min="500" step="100" required>
                    </div>
                    <div class="form-group">
                        <label for="lessonNotesForStudent">Заметки (необязательно)</label>
                        <textarea id="lessonNotesForStudent" rows="3" placeholder="Тема урока, особенности..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('newLessonForStudentModal')">Отмена</button>
                        <button type="submit" class="btn btn-primary">Создать урок</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    createModal('newLessonForStudentModal', modalContent);
    openModal('newLessonForStudentModal');
    
    // Устанавливаем дату по умолчанию (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('lessonDateForStudent').value = tomorrow.toISOString().split('T')[0];
    
    // Обработчик формы
    document.getElementById('newLessonForStudentForm').onsubmit = function(e) {
        e.preventDefault();
        
        const date = document.getElementById('lessonDateForStudent').value;
        const time = document.getElementById('lessonTimeForStudent').value;
        const subject = document.getElementById('lessonSubjectForStudent').value;
        const price = parseInt(document.getElementById('lessonPriceForStudent').value);
        const notes = document.getElementById('lessonNotesForStudent').value;
        
        if (!date || !time || !subject) {
            showNotification('Заполните все обязательные поля', 'error');
            return;
        }
        
        // Создаем урок
        const newLesson = {
            id: Date.now(),
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail: student.email,
            tutorId: currentTeacher.id,
            tutorName: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
            subject: subject,
            date: date,
            time: time,
            duration: '60 минут',
            status: 'scheduled',
            notes: notes || '',
            createdAt: new Date().toISOString(),
            price: price,
            currency: 'руб.',
            createdBy: 'teacher'
        };
        
        const lessons = getLessons();
        lessons.push(newLesson);
        saveLessons(lessons);
        
        // Обновляем интерфейс
        closeModal('newLessonForStudentModal');
        closeModal('studentDetailsModal');
        loadUpcomingLessons();
        generateSchedule();
        updateTeacherStats();
        
        showNotification('Урок успешно создан!', 'success');
    };
}

// Связаться с учеником
function contactStudent(studentId) {
    const users = getUsers();
    const student = users.find(u => u.id === studentId);
    
    if (!student) return;
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Связаться с учеником</h2>
                <button class="modal-close" onclick="closeModal('contactStudentModal')">×</button>
            </div>
            <div class="modal-body">
                <div class="contact-info">
                    <p><strong>Ученик:</strong> ${student.firstName} ${student.lastName}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                    ${student.phone ? `<p><strong>Телефон:</strong> ${student.phone}</p>` : ''}
                </div>
                
                <form id="contactForm">
                    <div class="form-group">
                        <label for="contactSubject">Тема сообщения</label>
                        <input type="text" id="contactSubject" required>
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">Сообщение</label>
                        <textarea id="contactMessage" rows="5" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('contactStudentModal')">Отмена</button>
                        <button type="submit" class="btn btn-primary">Отправить</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    createModal('contactStudentModal', modalContent);
    openModal('contactStudentModal');
    
    // Обработчик формы
    document.getElementById('contactForm').onsubmit = function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
        // Здесь можно добавить отправку сообщения
        console.log(`Отправка сообщения ученику ${student.email}: ${subject} - ${message}`);
        
        closeModal('contactStudentModal');
        showNotification('Сообщение отправлено ученику!', 'success');
    };
}

// Инициализация графика доходов
function initEarningsChart() {
    const container = document.getElementById('earningsChart');
    if (!container) return;
    
    const lessons = getLessons();
    const teacherLessons = lessons.filter(lesson => 
        lesson.tutorId === currentTeacher.id && 
        lesson.status === 'completed'
    );
    
    // Группируем по месяцам
    const monthlyEarnings = {};
    teacherLessons.forEach(lesson => {
        const date = new Date(lesson.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyEarnings[monthYear]) {
            monthlyEarnings[monthYear] = 0;
        }
        monthlyEarnings[monthYear] += lesson.price || 1500;
    });
    
    // Сортируем по дате
    const sortedMonths = Object.keys(monthlyEarnings).sort();
    const last5Months = sortedMonths.slice(-5);
    
    container.innerHTML = `
        <div class="chart-bars">
            ${last5Months.map(month => {
                const earnings = monthlyEarnings[month];
                const maxEarnings = Math.max(...Object.values(monthlyEarnings));
                const height = maxEarnings > 0 ? (earnings / maxEarnings * 100) : 0;
                
                return `
                    <div class="chart-bar">
                        <div class="bar-value">${earnings.toLocaleString('ru-RU')} ₽</div>
                        <div class="bar-fill" style="height: ${height}%"></div>
                        <div class="bar-label">${formatMonth(month)}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Вспомогательные функции
function getMonthName(monthIndex) {
    const months = [
        'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
        'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
    ];
    return months[monthIndex];
}

function formatMonth(monthYear) {
    const [year, month] = monthYear.split('-');
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

// Навигация по неделям
function prevWeek() {
    currentWeek--;
    generateSchedule();
}

function nextWeek() {
    currentWeek++;
    generateSchedule();
}

// Экспорт списка учеников
function exportStudents() {
    const lessons = getLessons();
    const users = getUsers();
    
    const studentIds = [...new Set(lessons
        .filter(lesson => lesson.tutorId === currentTeacher.id)
        .map(lesson => lesson.studentId)
    )];
    
    const students = users.filter(user => 
        user.role === 'student' && studentIds.includes(user.id)
    );
    
    if (students.length === 0) {
        showNotification('Нет учеников для экспорта', 'error');
        return;
    }
    
    // Формируем CSV
    let csv = 'Имя,Фамилия,Email,Телефон,Количество уроков\n';
    
    students.forEach(student => {
        const studentLessons = lessons.filter(lesson => 
            lesson.tutorId === currentTeacher.id && 
            lesson.studentId === student.id
        ).length;
        
        csv += `${student.firstName || ''},${student.lastName || ''},${student.email || ''},${student.phone || ''},${studentLessons}\n`;
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ученики_${currentTeacher.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Список учеников экспортирован в CSV', 'success');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Фильтр периода доходов
    document.getElementById('earningsPeriod')?.addEventListener('change', function() {
        initEarningsChart();
    });
    
    // Быстрые действия в сайдбаре
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target && target.startsWith('#')) {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Закрытие модальных окон по кнопке
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.teacher-dashboard')) {
        initTeacherDashboard();
    }
});