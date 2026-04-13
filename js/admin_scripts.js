// admin_scripts.js
// Основная логика админ-панели

// Данные для имитации (в реальном проекте будут загружаться с сервера)
let usersData = [
    {id: 1, name: "Иванов Алексей", email: "alex@example.com", role: "student", regDate: "2024-01-15", status: "active"},
    {id: 2, name: "Петрова Мария", email: "maria@example.com", role: "tutor", regDate: "2024-02-10", status: "active"},
    {id: 3, name: "Сидоров Владимир", email: "vladimir@example.com", role: "admin", regDate: "2024-01-20", status: "active"},
    {id: 4, name: "Кузнецова Анна", email: "anna@example.com", role: "student", regDate: "2024-03-05", status: "inactive"},
    {id: 5, name: "Федоров Дмитрий", email: "dmitry@example.com", role: "tutor", regDate: "2024-02-28", status: "active"}
];

let tutorsData = [
    {id: 1, name: "Петрова Мария", subjects: ["Математика", "Физика"], rating: 4.8, status: "active", workload: "Средняя"},
    {id: 2, name: "Федоров Дмитрий", subjects: ["Программирование", "Алгоритмы"], rating: 4.9, status: "active", workload: "Высокая"},
    {id: 3, name: "Смирнов Игорь", subjects: ["Химия", "Биология"], rating: 4.6, status: "on_leave", workload: "Низкая"}
];

let lessonsData = [
    {id: 1, title: "Введение в алгебру", tutor: "Петрова Мария", student: "Иванов Алексей", datetime: "2024-05-20T14:00", duration: 60, status: "scheduled"},
    {id: 2, title: "Основы Python", tutor: "Федоров Дмитрий", student: "Кузнецова Анна", datetime: "2024-05-18T10:00", duration: 90, status: "completed"},
    {id: 3, title: "Органическая химия", tutor: "Смирнов Игорь", student: "Иванов Алексей", datetime: "2024-05-22T16:00", duration: 60, status: "scheduled"}
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация таблиц
    initUsersTable();
    initTutorsTable();
    initLessonsTable();
    
    // Заполнение выпадающих списков
    populateTutorSelect();
    populateStudentSelect();
    
    // Назначение обработчиков форм
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    document.getElementById('tutorForm').addEventListener('submit', handleTutorSubmit);
    document.getElementById('lessonForm').addEventListener('submit', handleLessonSubmit);
});

// Управление вкладками
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
    
    // Обновление таблицы при переключении вкладок
    if (tabName === 'users' && $.fn.DataTable.isDataTable('#usersTable')) {
        $('#usersTable').DataTable().draw();
    } else if (tabName === 'tutors' && $.fn.DataTable.isDataTable('#tutorsTable')) {
        $('#tutorsTable').DataTable().draw();
    } else if (tabName === 'lessons' && $.fn.DataTable.isDataTable('#lessonsTable')) {
        $('#lessonsTable').DataTable().draw();
    }
}

// Инициализация таблицы пользователей
function initUsersTable() {
    $('#usersTable').DataTable({
        data: usersData,
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'email' },
            { 
                data: 'role',
                render: function(data) {
                    const roles = {
                        'student': 'Ученик',
                        'tutor': 'Репетитор', 
                        'admin': 'Администратор'
                    };
                    return roles[data] || data;
                }
            },
            { data: 'regDate' },
            { 
                data: 'status',
                render: function(data) {
                    const statuses = {
                        'active': '<span class="status-active">Активный</span>',
                        'inactive': '<span class="status-inactive">Неактивный</span>',
                        'blocked': '<span class="status-blocked">Заблокирован</span>'
                    };
                    return statuses[data] || data;
                }
            },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="action-btn edit-btn" onclick="editUser(${row.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteUser(${row.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json'
        },
        pageLength: 10
    });
}

// Инициализация таблицы репетиторов
function initTutorsTable() {
    $('#tutorsTable').DataTable({
        data: tutorsData,
        columns: [
            { data: 'id' },
            { data: 'name' },
            { 
                data: 'subjects',
                render: function(data) {
                    return Array.isArray(data) ? data.join(', ') : data;
                }
            },
            { 
                data: 'rating',
                render: function(data) {
                    return `<span class="rating">${data}</span>`;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statuses = {
                        'active': '<span class="status-active">Активный</span>',
                        'on_leave': '<span class="status-warning">В отпуске</span>',
                        'inactive': '<span class="status-inactive">Неактивный</span>'
                    };
                    return statuses[data] || data;
                }
            },
            { data: 'workload' },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="action-btn edit-btn" onclick="editTutor(${row.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteTutor(${row.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json'
        },
        pageLength: 10
    });
}

// Инициализация таблицы уроков
function initLessonsTable() {
    $('#lessonsTable').DataTable({
        data: lessonsData,
        columns: [
            { data: 'id' },
            { data: 'title' },
            { data: 'tutor' },
            { data: 'student' },
            { 
                data: 'datetime',
                render: function(data) {
                    return new Date(data).toLocaleString('ru-RU');
                }
            },
            { 
                data: 'duration',
                render: function(data) {
                    return `${data} мин.`;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statuses = {
                        'scheduled': '<span class="status-scheduled">Запланирован</span>',
                        'completed': '<span class="status-completed">Завершен</span>',
                        'cancelled': '<span class="status-cancelled">Отменен</span>'
                    };
                    return statuses[data] || data;
                }
            },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="action-btn edit-btn" onclick="editLesson(${row.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteLesson(${row.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json'
        },
        pageLength: 10
    });
}

// Заполнение выпадающих списков для уроков
function populateTutorSelect() {
    const select = document.getElementById('lessonTutor');
    select.innerHTML = '<option value="">Выберите репетитора</option>';
    
    tutorsData.forEach(tutor => {
        if (tutor.status === 'active') {
            const option = document.createElement('option');
            option.value = tutor.id;
            option.textContent = tutor.name;
            select.appendChild(option);
        }
    });
}

function populateStudentSelect() {
    const select = document.getElementById('lessonStudent');
    select.innerHTML = '<option value="">Выберите ученика</option>';
    
    usersData.forEach(user => {
        if (user.role === 'student' && user.status === 'active') {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        }
    });
}

// Управление модальными окнами
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalUserTitle');
    const form = document.getElementById('userForm');
    
    if (userId) {
        // Режим редактирования
        const user = usersData.find(u => u.id === userId);
        if (user) {
            title.textContent = 'Редактировать пользователя';
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
        }
    } else {
        // Режим добавления
        title.textContent = 'Добавить пользователя';
        form.reset();
        document.getElementById('userId').value = '';
    }
    
    modal.style.display = 'block';
}

function openTutorModal(tutorId = null) {
    const modal = document.getElementById('tutorModal');
    const title = document.getElementById('modalTutorTitle');
    const form = document.getElementById('tutorForm');
    
    if (tutorId) {
        const tutor = tutorsData.find(t => t.id === tutorId);
        if (tutor) {
            title.textContent = 'Редактировать репетитора';
            document.getElementById('tutorId').value = tutor.id;
            document.getElementById('tutorName').value = tutor.name;
            document.getElementById('tutorSubjects').value = Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects;
            document.getElementById('tutorBio').value = tutor.bio || '';
            document.getElementById('tutorStatus').value = tutor.status;
        }
    } else {
        title.textContent = 'Добавить репетитора';
        form.reset();
        document.getElementById('tutorId').value = '';
    }
    
    modal.style.display = 'block';
}

function openLessonModal(lessonId = null) {
    const modal = document.getElementById('lessonModal');
    const title = document.getElementById('modalLessonTitle');
    const form = document.getElementById('lessonForm');
    
    if (lessonId) {
        const lesson = lessonsData.find(l => l.id === lessonId);
        if (lesson) {
            title.textContent = 'Редактировать урок';
            document.getElementById('lessonId').value = lesson.id;
            document.getElementById('lessonTitle').value = lesson.title;
            document.getElementById('lessonTutor').value = tutorsData.findIndex(t => t.name === lesson.tutor) + 1;
            document.getElementById('lessonStudent').value = usersData.findIndex(u => u.name === lesson.student && u.role === 'student') + 1;
            document.getElementById('lessonDateTime').value = lesson.datetime.substring(0, 16);
            document.getElementById('lessonDuration').value = lesson.duration;
            document.getElementById('lessonStatus').value = lesson.status;
        }
    } else {
        title.textContent = 'Создать урок';
        form.reset();
        document.getElementById('lessonId').value = '';
        document.getElementById('lessonStatus').value = 'scheduled';
        document.getElementById('lessonDateTime').value = new Date().toISOString().slice(0, 16);
    }
    
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Обработка отправки форм
function handleUserSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        regDate: id ? usersData.find(u => u.id == id).regDate : new Date().toISOString().split('T')[0]
    };
    
    if (id) {
        // Обновление существующего пользователя
        const index = usersData.findIndex(u => u.id == id);
        if (index !== -1) {
            userData.id = parseInt(id);
            usersData[index] = userData;
        }
    } else {
        // Добавление нового пользователя
        userData.id = usersData.length > 0 ? Math.max(...usersData.map(u => u.id)) + 1 : 1;
        usersData.push(userData);
    }
    
    // Обновление таблицы
    const table = $('#usersTable').DataTable();
    table.clear();
    table.rows.add(usersData);
    table.draw();
    
    // Обновление списка учеников для уроков
    populateStudentSelect();
    
    closeModal('userModal');
    alert(id ? 'Пользователь обновлен!' : 'Пользователь добавлен!');
}

function handleTutorSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('tutorId').value;
    const tutorData = {
        name: document.getElementById('tutorName').value,
        subjects: document.getElementById('tutorSubjects').value.split(',').map(s => s.trim()),
        bio: document.getElementById('tutorBio').value,
        status: document.getElementById('tutorStatus').value,
        rating: id ? tutorsData.find(t => t.id == id).rating : 4.5,
        workload: id ? tutorsData.find(t => t.id == id).workload : 'Средняя'
    };
    
    if (id) {
        const index = tutorsData.findIndex(t => t.id == id);
        if (index !== -1) {
            tutorData.id = parseInt(id);
            tutorsData[index] = tutorData;
        }
    } else {
        tutorData.id = tutorsData.length > 0 ? Math.max(...tutorsData.map(t => t.id)) + 1 : 1;
        tutorsData.push(tutorData);
    }
    
    const table = $('#tutorsTable').DataTable();
    table.clear();
    table.rows.add(tutorsData);
    table.draw();
    
    // Обновление списка репетиторов для уроков
    populateTutorSelect();
    
    closeModal('tutorModal');
    alert(id ? 'Репетитор обновлен!' : 'Репетитор добавлен!');
}

function handleLessonSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('lessonId').value;
    const tutorId = document.getElementById('lessonTutor').value;
    const studentId = document.getElementById('lessonStudent').value;
    
    const tutor = tutorsData.find(t => t.id == tutorId);
    const student = usersData.find(u => u.id == studentId);
    
    const lessonData = {
        title: document.getElementById('lessonTitle').value,
        tutor: tutor ? tutor.name : '',
        student: student ? student.name : '',
        datetime: document.getElementById('lessonDateTime').value,
        duration: parseInt(document.getElementById('lessonDuration').value),
        status: document.getElementById('lessonStatus').value
    };
    
    if (id) {
        const index = lessonsData.findIndex(l => l.id == id);
        if (index !== -1) {
            lessonData.id = parseInt(id);
            lessonsData[index] = lessonData;
        }
    } else {
        lessonData.id = lessonsData.length > 0 ? Math.max(...lessonsData.map(l => l.id)) + 1 : 1;
        lessonsData.push(lessonData);
    }
    
    const table = $('#lessonsTable').DataTable();
    table.clear();
    table.rows.add(lessonsData);
    table.draw();
    
    closeModal('lessonModal');
    alert(id ? 'Урок обновлен!' : 'Урок создан!');
}

// Функции редактирования
function editUser(id) {
    openUserModal(id);
}

function editTutor(id) {
    openTutorModal(id);
}

function editLesson(id) {
    openLessonModal(id);
}

// Функции удаления
function deleteUser(id) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        usersData = usersData.filter(user => user.id !== id);
        const table = $('#usersTable').DataTable();
        table.clear();
        table.rows.add(usersData);
        table.draw();
        populateStudentSelect();
        alert('Пользователь удален!');
    }
}

function deleteTutor(id) {
    if (confirm('Вы уверены, что хотите удалить этого репетитора?')) {
        tutorsData = tutorsData.filter(tutor => tutor.id !== id);
        const table = $('#tutorsTable').DataTable();
        table.clear();
        table.rows.add(tutorsData);
        table.draw();
        populateTutorSelect();
        alert('Репетитор удален!');
    }
}

function deleteLesson(id) {
    if (confirm('Вы уверены, что хотите удалить этот урок?')) {
        lessonsData = lessonsData.filter(lesson => lesson.id !== id);
        const table = $('#lessonsTable').DataTable();
        table.clear();
        table.rows.add(lessonsData);
        table.draw();
        alert('Урок удален!');
    }
}