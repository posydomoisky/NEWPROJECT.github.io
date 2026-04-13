// Функции для страницы профиля

function switchTab(tabName) {
    // Скрыть все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс со всех кнопок табов
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранный таб
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Активировать соответствующую кнопку
    document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
    
    // Загрузить данные для таба
    if (tabName === 'lessons') {
        loadLessons();
    } else if (tabName === 'tutors') {
        loadTutors();
    } else if (tabName === 'schedule') {
        generateCalendar();
    }
}

function loadLessons() {
    const currentUser = getCurrentUser();
    const lessons = getLessons();
    const lessonsList = document.getElementById('lessonsList');
    
    if (!lessonsList) return;
    
    // Фильтруем уроки в зависимости от роли пользователя
    let userLessons;
    if (currentUser.role === 'admin') {
        // Администратор видит все уроки
        userLessons = lessons;
    } else if (currentUser.role === 'tutor') {
        // Репетитор видит только свои уроки
        userLessons = lessons.filter(lesson => lesson.tutorId === currentUser.id);
    } else {
        // Ученик видит только свои уроки
        userLessons = lessons.filter(lesson => lesson.studentId === currentUser.id);
    }
    
    if (userLessons.length === 0) {
        lessonsList.innerHTML = '<p>У вас пока нет уроков.</p>';
        return;
    }
    
    lessonsList.innerHTML = '';
    
    userLessons.forEach(lesson => {
        const statusText = lesson.status === 'scheduled' ? 'Запланирован' :
                          lesson.status === 'completed' ? 'Завершен' : 'Отменен';
        const statusClass = lesson.status === 'scheduled' ? 'status-scheduled' :
                           lesson.status === 'completed' ? 'status-completed' : 'status-cancelled';
        
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        lessonCard.innerHTML = `
            <div class="lesson-header">
                <h3>${lesson.subject}</h3>
                <span class="lesson-status ${statusClass}">${statusText}</span>
            </div>
            <div class="lesson-details">
                <p>📅 ${lesson.date}</p>
                <p>⏰ ${lesson.time}</p>
                <p>👨‍🏫 Репетитор: ${lesson.tutorName}</p>
                <p>👨‍🎓 Ученик: ${lesson.studentName}</p>
                ${lesson.notes ? `<p>📝 ${lesson.notes}</p>` : ''}
                ${lesson.cancelReason ? `<p>❌ Причина отмены: ${lesson.cancelReason}</p>` : ''}
            </div>
            <div class="lesson-actions">
                ${(currentUser.role === 'admin' || currentUser.role === 'tutor') && lesson.status === 'scheduled' ? 
                    `<button class="btn btn-danger btn-sm" onclick="openCancelLessonModal(${lesson.id})">Отменить урок</button>` : ''}
                ${currentUser.role === 'admin' ? 
                    `<button class="btn btn-warning btn-sm" onclick="editLesson(${lesson.id})">Редактировать</button>` : ''}
            </div>
        `;
        
        lessonsList.appendChild(lessonCard);
    });
}

function loadTutors() {
    const currentUser = getCurrentUser();
    const tutorsList = document.getElementById('tutorsList');
    
    if (!tutorsList) return;
    
    const tutors = [
        {
            id: 1,
            name: 'Анна Петрова',
            subject: 'Математика',
            rating: 4.9,
            experience: '8 лет',
            description: 'Специалист по подготовке к ЕГЭ и ОГЭ'
        },
        {
            id: 2,
            name: 'Петр Сидоров',
            subject: 'Физика',
            rating: 4.7,
            experience: '6 лет',
            description: 'Эксперт в решении олимпиадных задач'
        }
    ];
    
    tutorsList.innerHTML = '';
    
    tutors.forEach(tutor => {
        const tutorCard = document.createElement('div');
        tutorCard.className = 'tutor-card';
        tutorCard.innerHTML = `
            <div class="tutor-header">
                <h3>${tutor.name}</h3>
                <span class="tutor-rating">⭐ ${tutor.rating}</span>
            </div>
            <div class="tutor-details">
                <p>📚 ${tutor.subject}</p>
                <p>🎓 Опыт: ${tutor.experience}</p>
                <p>${tutor.description}</p>
            </div>
            <div class="tutor-actions">
                <button class="btn btn-primary btn-sm" onclick="bookTutorFromProfile(${tutor.id})">Забронировать урок</button>
                <button class="btn btn-outline btn-sm" onclick="viewTutorProfile(${tutor.id})">Профиль</button>
            </div>
        `;
        
        tutorsList.appendChild(tutorCard);
    });
}

// Бронирование репетитора из профиля
function bookTutorFromProfile(tutorId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        window.location.href = 'login_simple.html';
        return;
    }
    
    if (currentUser.role !== 'student') {
        alert('Только ученики могут бронировать уроки');
        return;
    }
    
    // Получаем информацию о репетиторе
    const tutors = {
        1: {
            id: 1,
            name: 'Анна Петрова',
            subjects: ['Математика', 'Физика']
        },
        2: {
            id: 2,
            name: 'Петр Сидоров',
            subjects: ['Физика', 'Математика']
        }
    };
    
    const tutor = tutors[tutorId];
    if (!tutor) {
        alert('Репетитор не найден');
        return;
    }
    
    // Сохраняем данные для предзаполнения формы
    const bookingData = {
        tutorId: tutorId,
        tutorName: tutor.name,
        tutorSubjects: tutor.subjects,
        prefilled: true,
        source: 'profile'
    };
    
    localStorage.setItem('prefilled_booking', JSON.stringify(bookingData));
    
    // Переходим на страницу teacher.html
    window.location.href = 'teacher.html';
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const currentDate = new Date();
    const currentMonth = document.getElementById('currentMonth');
    
    // Устанавливаем текущий месяц
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    currentMonth.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Очищаем календарь
    calendarGrid.innerHTML = '';
    
    // Добавляем заголовки дней недели
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Добавляем дни месяца (просто демо)
    for (let i = 1; i <= 31; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // Пример: отмечаем некоторые дни как занятые
        if (i % 5 === 0) {
            dayElement.classList.add('booked');
            dayElement.title = 'Есть уроки';
        } else if (i % 7 === 0) {
            dayElement.classList.add('unavailable');
            dayElement.title = 'Нет доступного времени';
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function openCancelLessonModal(lessonId) {
    const modal = document.getElementById('cancelLessonModal');
    const lessonIdInput = document.getElementById('cancelLessonId');
    
    if (modal && lessonIdInput) {
        lessonIdInput.value = lessonId;
        openModal('cancelLessonModal');
    }
}

// Обработка отмены урока
document.getElementById('cancelLessonForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const lessonId = parseInt(document.getElementById('cancelLessonId').value);
    const cancelReason = document.getElementById('cancelReason').value;
    
    if (!cancelReason.trim()) {
        alert('Пожалуйста, укажите причину отмены');
        return;
    }
    
    // Обновляем урок в хранилище
    const lessons = getLessons();
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    
    if (lessonIndex !== -1) {
        lessons[lessonIndex].status = 'cancelled';
        lessons[lessonIndex].cancelReason = cancelReason;
        saveLessons(lessons);
        
        // Закрываем модальное окно
        closeModal('cancelLessonModal');
        
        // Обновляем список уроков
        loadLessons();
        
        // Очищаем форму
        document.getElementById('cancelReason').value = '';
        
        alert('Урок успешно отменен');
    }
});

function prevMonth() {
    alert('Навигация по месяцам будет реализована позже');
}

function nextMonth() {
    alert('Навигация по месяцам будет реализована позже');
}

// Инициализация страницы профиля
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('lessonsTab')) {
        loadLessons();
    }
});