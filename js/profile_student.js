// Student Profile Functionality

let currentUser = null;
let userLessons = [];
let userTutors = [];
let currentWeek = 0;

// Initialize student profile
function initStudentProfile() {
    // Get current user
    currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
    
    if (!currentUser) {
        window.location.href = 'login_simple.html';
        return;
    }
    
    // Check if user is student
    if (currentUser.role !== 'student') {
        alert('Эта страница доступна только ученикам');
        window.location.href = currentUser.role === 'admin' ? 'admin_panel.html' : 'teacher_dashboard.html';
        return;
    }
    
    // Update user info
    updateUserInfo();
    
    // Initialize lessons data
    initLessonsData();
    
    // Load lessons
    loadLessons();
    
    // Load stats
    updateStats();
    
    // Setup rating stars
    setupRatingStars();
    
    // Generate schedule
    generateSchedule();
}

function updateUserInfo() {
    document.getElementById('profileAvatar').textContent = 
        (currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '');
    document.getElementById('profileName').textContent = 
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`;
    document.getElementById('profileRole').textContent = 'Ученик';
    document.getElementById('profileEmail').textContent = currentUser.email || 'Не указан';
}

function initLessonsData() {
    // Get all lessons
    let lessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
    
    // Filter lessons for current student
    userLessons = lessons.filter(lesson => lesson.studentId === currentUser.id);
    
    // Create demo lessons if none exist
    if (userLessons.length === 0) {
        createDemoLessons();
        lessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
        userLessons = lessons.filter(lesson => lesson.studentId === currentUser.id);
    }
    
    // Extract unique tutors
    const tutorIds = [...new Set(userLessons.map(lesson => lesson.tutorId))];
    const allTutors = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    userTutors = allTutors.filter(user => tutorIds.includes(user.id) && user.role === 'tutor');
}

function createDemoLessons() {
    const demoLessons = [
        {
            id: Date.now(),
            studentId: currentUser.id,
            studentName: `${currentUser.firstName} ${currentUser.lastName}`,
            tutorId: 2, // Anna Petrova
            tutorName: 'Анна Петрова',
            subject: 'Математика',
            date: getFutureDate(2), // 2 days from now
            time: '14:00-15:00',
            status: 'scheduled',
            notes: 'Подготовка к ЕГЭ, тема: производные',
            price: 1500
        },
        {
            id: Date.now() + 1,
            studentId: currentUser.id,
            studentName: `${currentUser.firstName} ${currentUser.lastName}`,
            tutorId: 7, // Dmitry Popov
            tutorName: 'Дмитрий Попов',
            subject: 'Программирование',
            date: getFutureDate(3),
            time: '16:00-17:00',
            status: 'scheduled',
            notes: 'Основы Python, работа с функциями',
            price: 2000
        },
        {
            id: Date.now() + 2,
            studentId: currentUser.id,
            studentName: `${currentUser.firstName} ${currentUser.lastName}`,
            tutorId: 4, // Ivan Sidorov
            tutorName: 'Иван Сидоров',
            subject: 'Английский язык',
            date: getPastDate(5),
            time: '10:00-11:00',
            status: 'completed',
            notes: 'Разговорная практика',
            price: 1200,
            rating: 5,
            review: 'Отличный урок, преподаватель очень понятно объясняет'
        },
        {
            id: Date.now() + 3,
            studentId: currentUser.id,
            studentName: `${currentUser.firstName} ${currentUser.lastName}`,
            tutorId: 5, // Elena Smirnova
            tutorName: 'Елена Смирнова',
            subject: 'Химия',
            date: getPastDate(10),
            time: '12:00-13:00',
            status: 'cancelled',
            notes: 'Органическая химия',
            price: 1500,
            cancelReason: 'Болезнь ученика'
        }
    ];
    
    // Save to localStorage
    const existingLessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
    localStorage.setItem('ucheba_lessons', JSON.stringify([...existingLessons, ...demoLessons]));
    
    // Reload lessons
    initLessonsData();
}

function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function getPastDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Activate selected tab button
    document.getElementById(`${tabName}TabBtn`).classList.add('active');
    
    // Load tab data
    switch(tabName) {
        case 'lessons':
            loadLessons();
            break;
        case 'tutors':
            loadTutors();
            break;
        case 'schedule':
            generateSchedule();
            break;
        case 'reviews':
            loadReviews();
            break;
    }
}

function loadLessons() {
    const filter = document.getElementById('lessonFilter').value;
    let filteredLessons = [...userLessons];
    
    // Apply filter
    if (filter !== 'all') {
        filteredLessons = userLessons.filter(lesson => lesson.status === filter);
    }
    
    const lessonsList = document.getElementById('lessonsList');
    
    if (filteredLessons.length === 0) {
        lessonsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>Нет уроков</h3>
                <p>${filter === 'all' ? 'У вас пока нет запланированных уроков.' : 'Нет уроков с выбранным статусом.'}</p>
                <button class="btn btn-primary" onclick="bookNewLesson()">Записаться на урок</button>
            </div>
        `;
        return;
    }
    
    // Sort lessons by date (newest first)
    filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    lessonsList.innerHTML = '';
    
    filteredLessons.forEach(lesson => {
        const lessonDate = new Date(lesson.date);
        const now = new Date();
        const isPast = lessonDate < now;
        
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        lessonCard.innerHTML = `
            <div class="lesson-header">
                <div>
                    <h3>${lesson.subject}</h3>
                    <p>${lesson.tutorName}</p>
                </div>
                <span class="status-badge status-${lesson.status}">
                    ${lesson.status === 'scheduled' ? 'Запланирован' : 
                      lesson.status === 'completed' ? 'Завершен' : 'Отменен'}
                </span>
            </div>
            
            <div class="lesson-details">
                <p><strong>Дата:</strong> ${formatDate(lesson.date)}</p>
                <p><strong>Время:</strong> ${lesson.time}</p>
                <p><strong>Стоимость:</strong> ${lesson.price} ₽</p>
                ${lesson.notes ? `<p><strong>Заметки:</strong> ${lesson.notes}</p>` : ''}
                ${lesson.cancelReason ? `<p><strong>Причина отмены:</strong> ${lesson.cancelReason}</p>` : ''}
                ${lesson.review ? `<p><strong>Ваш отзыв:</strong> ${lesson.review}</p>` : ''}
                ${lesson.rating ? `<p><strong>Оценка:</strong> <span class="rating-stars">${'★'.repeat(lesson.rating)}${'☆'.repeat(5-lesson.rating)}</span></p>` : ''}
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="viewLessonDetails(${lesson.id})">Подробнее</button>
                ${lesson.status === 'scheduled' && !isPast ? 
                    `<button class="btn btn-danger btn-sm" onclick="cancelLesson(${lesson.id})">Отменить</button>` : ''}
                ${lesson.status === 'completed' && !lesson.rating ? 
                    `<button class="btn btn-warning btn-sm" onclick="writeReview(${lesson.id})">Оставить отзыв</button>` : ''}
            </div>
        `;
        
        lessonsList.appendChild(lessonCard);
    });
}

function filterLessons() {
    loadLessons();
}

function refreshLessons() {
    initLessonsData();
    loadLessons();
    updateStats();
    alert('Список уроков обновлен!');
}

function loadTutors() {
    const tutorsList = document.getElementById('tutorsList');
    
    if (userTutors.length === 0) {
        tutorsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                </svg>
                <h3>Нет репетиторов</h3>
                <p>У вас пока нет закрепленных репетиторов.</p>
                <button class="btn btn-primary" onclick="findNewTutor()">Найти репетитора</button>
            </div>
        `;
        return;
    }
    
    tutorsList.innerHTML = '';
    
    userTutors.forEach(tutor => {
        const tutorLessons = userLessons.filter(lesson => lesson.tutorId === tutor.id);
        const completedLessons = tutorLessons.filter(lesson => lesson.status === 'completed').length;
        
        const tutorCard = document.createElement('div');
        tutorCard.className = 'tutor-card';
        tutorCard.innerHTML = `
            <div class="tutor-header">
                <div class="tutor-avatar">${(tutor.firstName?.[0] || '') + (tutor.lastName?.[0] || '')}</div>
                <div>
                    <h3>${tutor.firstName} ${tutor.lastName}</h3>
                    <p>${tutor.subjects?.join(', ') || 'Репетитор'}</p>
                    ${tutor.rating ? `<p class="rating-stars">${'★'.repeat(tutor.rating)}${'☆'.repeat(5-tutor.rating)} ${tutor.rating}.0</p>` : ''}
                </div>
            </div>
            
            <div class="tutor-details">
                <p><strong>Email:</strong> ${tutor.email}</p>
                <p><strong>Телефон:</strong> ${tutor.phone}</p>
                <p><strong>Опыт:</strong> ${tutor.experience || 'Не указан'}</p>
                <p><strong>Проведено уроков:</strong> ${completedLessons}</p>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="bookWithTutor(${tutor.id})">Записаться</button>
                <button class="btn btn-outline btn-sm" onclick="contactTutor(${tutor.id})">Написать</button>
                ${tutorLessons.some(l => l.status === 'completed' && !l.rating) ? 
                    `<button class="btn btn-warning btn-sm" onclick="writeReviewForTutor(${tutor.id})">Оставить отзыв</button>` : ''}
            </div>
        `;
        
        tutorsList.appendChild(tutorCard);
    });
}

function generateSchedule() {
    const calendar = document.getElementById('scheduleCalendar');
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay() + 1 + (currentWeek * 7)); // Monday of current week
    
    // Update week display
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    document.getElementById('currentWeek').textContent = 
        `Неделя ${formatDate(startDate.toISOString().split('T')[0])} - ${formatDate(endDate.toISOString().split('T')[0])}`;
    
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const timeSlots = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00'];
    
    let scheduleHTML = '<div class="calendar-grid">';
    
    // Add time slots header
    scheduleHTML += '<div class="time-header"></div>';
    daysOfWeek.forEach(day => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + daysOfWeek.indexOf(day));
        scheduleHTML += `<div class="day-header">${day}<br>${dayDate.getDate()}</div>`;
    });
    
    // Add time slots
    timeSlots.forEach(time => {
        scheduleHTML += `<div class="time-slot-header">${time}</div>`;
        
        daysOfWeek.forEach(day => {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + daysOfWeek.indexOf(day));
            const dateStr = dayDate.toISOString().split('T')[0];
            
            // Find lesson for this time slot
            const lesson = userLessons.find(l => 
                l.date === dateStr && 
                l.time.startsWith(time) &&
                l.status === 'scheduled'
            );
            
            let cellClass = 'calendar-cell';
            let cellContent = '';
            let onclick = '';
            
            if (lesson) {
                cellClass += ' lesson-scheduled';
                cellContent = `${lesson.subject}<br>${lesson.tutorName.split(' ')[0]}`;
                onclick = `viewLessonDetails(${lesson.id})`;
            } else if (dayDate < new Date().setHours(0,0,0,0)) {
                cellClass += ' past-day';
            } else {
                cellClass += ' available-slot';
                onclick = `bookLessonSlot('${dateStr}', '${time}')`;
                cellContent = 'Свободно';
            }
            
            scheduleHTML += `<div class="${cellClass}" ${onclick ? `onclick="${onclick}"` : ''}>${cellContent}</div>`;
        });
    });
    
    scheduleHTML += '</div>';
    calendar.innerHTML = scheduleHTML;
}

function prevWeek() {
    currentWeek--;
    generateSchedule();
}

function nextWeek() {
    currentWeek++;
    generateSchedule();
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const reviews = userLessons.filter(lesson => lesson.rating && lesson.review);
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h3>Нет отзывов</h3>
                <p>Вы еще не оставляли отзывов о пройденных уроках.</p>
                <button class="btn btn-primary" onclick="writeNewReview()">Написать первый отзыв</button>
            </div>
        `;
        return;
    }
    
    reviewsList.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div>
                    <h3>${review.subject}</h3>
                    <p>${review.tutorName}</p>
                </div>
                <div class="rating-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            </div>
            
            <div class="review-content">
                <p>${review.review}</p>
                <p class="review-date">${formatDate(review.date)}</p>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-outline btn-sm" onclick="editReview(${review.id})">Редактировать</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.id})">Удалить</button>
            </div>
        `;
        
        reviewsList.appendChild(reviewCard);
    });
}

function updateStats() {
    const totalLessons = userLessons.length;
    const upcomingLessons = userLessons.filter(lesson => 
        lesson.status === 'scheduled' && 
        new Date(lesson.date) >= new Date()
    ).length;
    const completedLessons = userLessons.filter(lesson => lesson.status === 'completed').length;
    
    document.getElementById('totalLessonsCount').textContent = totalLessons;
    document.getElementById('upcomingLessonsCount').textContent = upcomingLessons;
    document.getElementById('completedLessonsCount').textContent = completedLessons;
    document.getElementById('totalTutorsCount').textContent = userTutors.length;
}

// Action functions
function bookNewLesson() {
    window.location.href = 'teacher.html';
}

function findNewTutor() {
    window.location.href = 'teacher.html';
}

function viewLessonDetails(lessonId) {
    const lesson = userLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    document.getElementById('lessonModalTitle').textContent = `Урок: ${lesson.subject}`;
    
    const content = document.getElementById('lessonDetailsContent');
    content.innerHTML = `
        <div class="lesson-details">
            <p><strong>Репетитор:</strong> ${lesson.tutorName}</p>
            <p><strong>Дата:</strong> ${formatDate(lesson.date)}</p>
            <p><strong>Время:</strong> ${lesson.time}</p>
            <p><strong>Статус:</strong> <span class="status-badge status-${lesson.status}">
                ${lesson.status === 'scheduled' ? 'Запланирован' : 
                  lesson.status === 'completed' ? 'Завершен' : 'Отменен'}
            </span></p>
            <p><strong>Стоимость:</strong> ${lesson.price} ₽</p>
            ${lesson.notes ? `<p><strong>Заметки:</strong> ${lesson.notes}</p>` : ''}
            ${lesson.cancelReason ? `<p><strong>Причина отмены:</strong> ${lesson.cancelReason}</p>` : ''}
            ${lesson.rating ? `<p><strong>Оценка:</strong> <span class="rating-stars">${'★'.repeat(lesson.rating)}${'☆'.repeat(5-lesson.rating)}</span></p>` : ''}
            ${lesson.review ? `<p><strong>Отзыв:</strong> ${lesson.review}</p>` : ''}
        </div>
        
        <div class="action-buttons">
            ${lesson.status === 'scheduled' ? 
                `<button class="btn btn-danger" onclick="cancelLesson(${lesson.id})">Отменить урок</button>` : ''}
            ${lesson.status === 'completed' && !lesson.rating ? 
                `<button class="btn btn-warning" onclick="writeReview(${lesson.id})">Оставить отзыв</button>` : ''}
            <button class="btn btn-outline" onclick="closeModal('lessonDetailsModal')">Закрыть</button>
        </div>
    `;
    
    openModal('lessonDetailsModal');
}

function cancelLesson(lessonId) {
    document.getElementById('cancelLessonId').value = lessonId;
    openModal('cancelLessonModal');
}

function submitCancelLesson(event) {
    event.preventDefault();
    
    const lessonId = parseInt(document.getElementById('cancelLessonId').value);
    const reason = document.getElementById('cancelReason').value;
    const notifyTutor = document.getElementById('notifyTutor').checked;
    
    if (!reason.trim()) {
        alert('Пожалуйста, укажите причину отмены');
        return;
    }
    
    // Update lesson in localStorage
    let allLessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex !== -1) {
        allLessons[lessonIndex].status = 'cancelled';
        allLessons[lessonIndex].cancelReason = reason;
        
        localStorage.setItem('ucheba_lessons', JSON.stringify(allLessons));
        
        // Update local data
        initLessonsData();
        loadLessons();
        updateStats();
        
        closeModal('cancelLessonModal');
        
        // Reset form
        document.getElementById('cancelReason').value = '';
        
        alert('Урок успешно отменен!');
        
        if (notifyTutor) {
            // Здесь можно добавить уведомление репетитору
            console.log('Уведомление отправлено репетитору');
        }
    }
}

function writeReview(lessonId) {
    const lesson = userLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    document.getElementById('reviewModalTitle').textContent = `Отзыв для ${lesson.tutorName}`;
    document.getElementById('reviewLessonId').value = lessonId;
    document.getElementById('reviewRatingValue').value = 5;
    document.getElementById('reviewText').value = '';
    
    // Reset stars
    document.querySelectorAll('#ratingStars .star').forEach((star, index) => {
        if (index < 5) {
            star.style.color = '#fbbf24';
        }
    });
    
    openModal('reviewModal');
}

function setupRatingStars() {
    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.value);
            document.getElementById('reviewRatingValue').value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#d1d5db';
                }
            });
        });
    });
}

function submitReview(event) {
    event.preventDefault();
    
    const lessonId = parseInt(document.getElementById('reviewLessonId').value);
    const rating = parseInt(document.getElementById('reviewRatingValue').value);
    const reviewText = document.getElementById('reviewText').value;
    
    if (!reviewText.trim()) {
        alert('Пожалуйста, напишите текст отзыва');
        return;
    }
    
    // Update lesson in localStorage
    let allLessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex !== -1) {
        allLessons[lessonIndex].rating = rating;
        allLessons[lessonIndex].review = reviewText;
        
        localStorage.setItem('ucheba_lessons', JSON.stringify(allLessons));
        
        // Update tutor rating
        updateTutorRating(allLessons[lessonIndex].tutorId);
        
        // Update local data
        initLessonsData();
        loadLessons();
        loadReviews();
        
        closeModal('reviewModal');
        alert('Отзыв успешно отправлен!');
    }
}

function updateTutorRating(tutorId) {
    let allUsers = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const userIndex = allUsers.findIndex(u => u.id === tutorId);
    
    if (userIndex !== -1) {
        // Calculate average rating from all completed lessons
        const allLessons = JSON.parse(localStorage.getItem('ucheba_lessons')) || [];
        const tutorLessons = allLessons.filter(l => l.tutorId === tutorId && l.rating);
        
        if (tutorLessons.length > 0) {
            const avgRating = tutorLessons.reduce((sum, l) => sum + l.rating, 0) / tutorLessons.length;
            allUsers[userIndex].rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
            localStorage.setItem('ucheba_users', JSON.stringify(allUsers));
        }
    }
}

function writeNewReview() {
    // Find a completed lesson without review
    const lesson = userLessons.find(l => l.status === 'completed' && !l.rating);
    
    if (lesson) {
        writeReview(lesson.id);
    } else {
        alert('У вас нет завершенных уроков для отзыва');
    }
}

function editProfile() {
    // Fill form with current user data
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editGrade').value = currentUser.grade || '';
    document.getElementById('editInterests').value = currentUser.interests?.join(', ') || '';
    
    openModal('editProfileModal');
}

function saveProfileChanges(event) {
    event.preventDefault();
    
    // Update user data
    currentUser.firstName = document.getElementById('editFirstName').value;
    currentUser.lastName = document.getElementById('editLastName').value;
    currentUser.email = document.getElementById('editEmail').value;
    currentUser.phone = document.getElementById('editPhone').value;
    currentUser.grade = document.getElementById('editGrade').value;
    currentUser.interests = document.getElementById('editInterests').value.split(',').map(i => i.trim()).filter(i => i);
    
    // Update in localStorage
    let allUsers = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...currentUser };
        localStorage.setItem('ucheba_users', JSON.stringify(allUsers));
    }
    
    // Update current user session
    localStorage.setItem('ucheba_current_user', JSON.stringify(currentUser));
    
    // Update UI
    updateUserInfo();
    closeModal('editProfileModal');
    alert('Профиль успешно обновлен!');
}

function bookWithTutor(tutorId) {
    // Find tutor
    const allTutors = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const tutor = allTutors.find(t => t.id === tutorId);
    
    if (tutor) {
        if (confirm(`Записаться на урок к ${tutor.firstName} ${tutor.lastName}?`)) {
            // Redirect to tutor's booking page
            window.location.href = `teacher.html#book-${tutor.id}`;
        }
    }
}

function contactTutor(tutorId) {
    const allTutors = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    const tutor = allTutors.find(t => t.id === tutorId);
    
    if (tutor) {
        alert(`Контакты репетитора:\nИмя: ${tutor.firstName} ${tutor.lastName}\nEmail: ${tutor.email}\nТелефон: ${tutor.phone}`);
    }
}

function writeReviewForTutor(tutorId) {
    // Find a completed lesson with this tutor
    const lesson = userLessons.find(l => 
        l.tutorId === tutorId && 
        l.status === 'completed' && 
        !l.rating
    );
    
    if (lesson) {
        writeReview(lesson.id);
    } else {
        alert('У вас нет завершенных уроков с этим репетитором для отзыва');
    }
}

function bookLessonSlot(date, time) {
    if (confirm(`Записаться на ${time} ${formatDate(date)}?`)) {
        window.location.href = 'teacher.html';
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = '';
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
    
    if (!currentUser) {
        window.location.href = 'login_simple.html';
        return;
    }
    
    // Initialize student profile
    if (document.querySelector('.profile-section')) {
        initStudentProfile();
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});