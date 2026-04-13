// Основной файл функционала админ панели
class AdminPanel {
    constructor() {
        this.init();
    }
    
    init() {
        // Инициализация данных
        this.initData();
        
        // Загрузка интерфейса
        this.loadDashboard();
        
        // Настройка обработчиков
        this.setupEventListeners();
        
        // Обновление данных каждые 30 секунд
        setInterval(() => this.loadDashboard(), 30000);
    }
    
    initData() {
        // Инициализация данных в localStorage если их нет
        const dataKeys = ['admin_users', 'admin_tutors', 'admin_lessons', 'admin_money_ops'];
        
        dataKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        // Добавим тестовые данные если пусто
        if (JSON.parse(localStorage.getItem('admin_users')).length === 0) {
            this.createSampleData();
        }
    }
    
    createSampleData() {
        const users = [
            {
                id: 1,
                name: "Иванов Алексей",
                email: "alex@example.com",
                role: "student",
                balance: 5000,
                status: "active",
                created: new Date().toISOString(),
                phone: "+7 900 123-45-67"
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
                rating: 4.8,
                created: new Date().toISOString(),
                phone: "+7 900 987-65-43"
            },
            {
                id: 3,
                name: "Администратор",
                email: "admin@example.com",
                role: "admin",
                balance: 100000,
                status: "active",
                created: new Date().toISOString()
            },
            {
                id: 4,
                name: "Сидоров Иван",
                email: "ivan@example.com",
                role: "student",
                balance: 3000,
                status: "active",
                created: new Date().toISOString(),
                phone: "+7 900 555-44-33"
            }
        ];
        
        const tutors = [
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
                lessonsCompleted: 35,
                salaryDate: new Date().toISOString()
            },
            {
                id: 5,
                name: "Федоров Дмитрий",
                email: "dmitry@example.com",
                subjects: "Программирование, Алгоритмы",
                rating: 4.9,
                balance: 22000,
                rate: 1500,
                status: "active",
                totalEarned: 78000,
                lessonsCompleted: 52,
                salaryDate: new Date().toISOString()
            }
        ];
        
        const lessons = [
            {
                id: 1,
                studentId: 1,
                studentName: "Иванов Алексей",
                tutorId: 2,
                tutorName: "Петрова Мария",
                subject: "Математика",
                dateTime: new Date(Date.now() + 86400000).toISOString(),
                duration: 60,
                price: 1200,
                paymentStatus: "paid",
                lessonStatus: "scheduled",
                created: new Date().toISOString()
            },
            {
                id: 2,
                studentId: 4,
                studentName: "Сидоров Иван",
                tutorId: 5,
                tutorName: "Федоров Дмитрий",
                subject: "Программирование",
                dateTime: new Date(Date.now() + 172800000).toISOString(),
                duration: 90,
                price: 2250,
                paymentStatus: "pending",
                lessonStatus: "scheduled",
                created: new Date().toISOString()
            }
        ];
        
        const operations = [
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
        
        localStorage.setItem('admin_users', JSON.stringify(users));
        localStorage.setItem('admin_tutors', JSON.stringify(tutors));
        localStorage.setItem('admin_lessons', JSON.stringify(lessons));
        localStorage.setItem('admin_money_ops', JSON.stringify(operations));
    }
    
    loadDashboard() {
        this.updateUserStats();
        this.updateLessonStats();
        this.updateTutorStats();
        this.updateFinancialStats();
        this.loadRecentItems();
    }
    
    updateUserStats() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const students = users.filter(u => u.role === 'student');
        const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
        
        document.getElementById('usersCount').textContent = users.length;
        document.getElementById('studentsCount').textContent = students.length;
        document.getElementById('usersBalance').textContent = this.formatMoney(totalBalance);
        
        // Обновляем список последних пользователей
        this.updateRecentUsersList();
    }
    
    updateLessonStats() {
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        const activeLessons = lessons.filter(l => l.lessonStatus === 'scheduled');
        const revenue = lessons
            .filter(l => l.paymentStatus === 'paid')
            .reduce((sum, lesson) => sum + (lesson.price || 0), 0);
        
        document.getElementById('lessonsCount').textContent = lessons.length;
        document.getElementById('activeLessonsCount').textContent = activeLessons.length;
        document.getElementById('lessonsRevenue').textContent = this.formatMoney(revenue);
        
        // Обновляем список последних уроков
        this.updateRecentLessonsList();
    }
    
    updateTutorStats() {
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const activeTutors = tutors.filter(t => t.status === 'active');
        const totalBalance = tutors.reduce((sum, tutor) => sum + (tutor.balance || 0), 0);
        
        document.getElementById('tutorsCount').textContent = tutors.length;
        document.getElementById('activeTutorsCount').textContent = activeTutors.length;
        document.getElementById('tutorsBalance').textContent = this.formatMoney(totalBalance);
        
        // Обновляем список топ репетиторов
        this.updateRecentTutorsList();
    }
    
    updateFinancialStats() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        
        // Общий баланс системы
        const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0) +
                           tutors.reduce((sum, tutor) => sum + (tutor.balance || 0), 0);
        
        // Выручка за последние 30 дней
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthlyRevenue = lessons
            .filter(l => l.paymentStatus === 'paid' && new Date(l.created) > monthAgo)
            .reduce((sum, lesson) => sum + (lesson.price || 0), 0);
        
        // Средний чек урока
        const paidLessons = lessons.filter(l => l.paymentStatus === 'paid');
        const avgLessonPrice = paidLessons.length > 0 
            ? paidLessons.reduce((sum, lesson) => sum + lesson.price, 0) / paidLessons.length
            : 0;
        
        // Ожидающие оплаты
        const pendingPayments = lessons.filter(l => l.paymentStatus === 'pending').length;
        
        document.getElementById('totalSystemBalance').textContent = this.formatMoney(totalBalance);
        document.getElementById('monthlyRevenue').textContent = this.formatMoney(monthlyRevenue);
        document.getElementById('avgLessonPrice').textContent = this.formatMoney(avgLessonPrice);
        document.getElementById('pendingPayments').textContent = pendingPayments;
    }
    
    updateRecentUsersList() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const recentUsers = users.slice(-5).reverse(); // Последние 5 пользователей
        
        const container = document.getElementById('recentUsersList');
        if (!container) return;
        
        container.innerHTML = recentUsers.map(user => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <div class="recent-item-name">${user.name}</div>
                    <div class="recent-item-details">
                        ${this.getRoleName(user.role)} • ${user.email}
                    </div>
                </div>
                <div class="recent-item-amount">${this.formatMoney(user.balance || 0)}</div>
                <div class="recent-item-actions">
                    <button class="recent-item-btn" onclick="adminPanel.editUser(${user.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="recent-item-btn" onclick="adminPanel.manageMoney(${user.id}, 'user')" title="Управление деньгами">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateRecentLessonsList() {
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        const recentLessons = lessons
            .filter(l => l.lessonStatus === 'scheduled')
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .slice(0, 5);
        
        const container = document.getElementById('recentLessonsList');
        if (!container) return;
        
        container.innerHTML = recentLessons.map(lesson => {
            const date = new Date(lesson.dateTime);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="recent-item">
                    <div class="recent-item-info">
                        <div class="recent-item-name">${lesson.subject}</div>
                        <div class="recent-item-details">
                            ${lesson.studentName} → ${lesson.tutorName} • ${formattedDate}
                        </div>
                    </div>
                    <div class="recent-item-amount">${this.formatMoney(lesson.price)}</div>
                    <div class="recent-item-actions">
                        <button class="recent-item-btn" onclick="adminPanel.processPayment(${lesson.id})" title="Оплатить">
                            <i class="fas fa-credit-card"></i>
                        </button>
                        <button class="recent-item-btn" onclick="adminPanel.editLesson(${lesson.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateRecentTutorsList() {
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const topTutors = tutors
            .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
            .slice(0, 5);
        
        const container = document.getElementById('recentTutorsList');
        if (!container) return;
        
        container.innerHTML = topTutors.map(tutor => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <div class="recent-item-name">${tutor.name}</div>
                    <div class="recent-item-details">
                        ${tutor.subjects} • ★${tutor.rating}
                    </div>
                </div>
                <div class="recent-item-amount">${this.formatMoney(tutor.totalEarned || 0)}</div>
                <div class="recent-item-actions">
                    <button class="recent-item-btn" onclick="adminPanel.editTutor(${tutor.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="recent-item-btn" onclick="adminPanel.manageMoney(${tutor.id}, 'tutor')" title="Выплатить">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    loadRecentItems() {
        this.updateRecentUsersList();
        this.updateRecentLessonsList();
        this.updateRecentTutorsList();
    }
    
    // Управление пользователями
    manageUsers() {
        this.loadUsersTable();
        this.showModal('usersModal');
    }
    
    loadUsersTable() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${this.getRoleName(user.role)}</td>
                <td><strong>${this.formatMoney(user.balance || 0)}</strong></td>
                <td>
                    <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn btn-money" onclick="adminPanel.manageMoney(${user.id}, 'user')">
                            <i class="fas fa-money-bill-wave"></i> Деньги
                        </button>
                        <button class="table-btn btn-edit" onclick="adminPanel.editUser(${user.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="table-btn btn-delete" onclick="adminPanel.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    addNewUser() {
        this.manageUsers();
        this.showAddUserForm();
    }
    
    showAddUserForm() {
        document.getElementById('addUserForm').style.display = 'block';
        document.getElementById('usersTableBody').parentElement.parentElement.style.display = 'none';
    }
    
    hideAddUserForm() {
        document.getElementById('addUserForm').style.display = 'none';
        document.getElementById('usersTableBody').parentElement.parentElement.style.display = 'block';
    }
    
    addNewUserSubmit(event) {
        event.preventDefault();
        
        const name = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        const role = document.getElementById('newUserRole').value;
        const balance = parseFloat(document.getElementById('newUserBalance').value) || 0;
        const status = document.getElementById('newUserStatus').value;
        
        if (!name || !email || !password) {
            alert('Заполните все обязательные поля');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            name,
            email,
            password,
            role,
            balance,
            status,
            created: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('admin_users', JSON.stringify(users));
        
        // Если это репетитор, создаем запись в таблице репетиторов
        if (role === 'tutor') {
            const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
            const newTutor = {
                id: newId,
                name,
                email,
                subjects: "Математика",
                rating: 5.0,
                balance,
                rate: 1000,
                status: "active",
                totalEarned: 0,
                lessonsCompleted: 0,
                salaryDate: new Date().toISOString()
            };
            tutors.push(newTutor);
            localStorage.setItem('admin_tutors', JSON.stringify(newTutor));
        }
        
        // Если добавлен начальный баланс, создаем операцию
        if (balance > 0) {
            this.addMoneyOperation({
                type: 'add',
                from: 'system',
                to: name,
                amount: balance,
                comment: 'Начальный депозит',
                userId: newId,
                userType: 'user'
            });
        }
        
        this.loadUsersTable();
        this.hideAddUserForm();
        this.loadDashboard();
        this.showNotification('Пользователь успешно добавлен!', 'success');
        
        // Сбрасываем форму
        document.getElementById('newUserName').value = '';
        document.getElementById('newUserEmail').value = '';
        document.getElementById('newUserPassword').value = '';
        document.getElementById('newUserBalance').value = '0';
    }
    
    editUser(userId) {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (!user) return;
        
        // Заполняем форму редактирования
        // (можно создать отдельную форму или использовать ту же самую)
        this.showAddUserForm();
        
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserEmail').value = user.email;
        document.getElementById('newUserRole').value = user.role;
        document.getElementById('newUserBalance').value = user.balance;
        document.getElementById('newUserStatus').value = user.status;
        
        // Сохраняем ID для обновления
        document.getElementById('addUserForm').dataset.editId = userId;
    }
    
    deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
        
        let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('admin_users', JSON.stringify(users));
        
        // Если это репетитор, удаляем из таблицы репетиторов
        let tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        tutors = tutors.filter(t => t.id !== userId);
        localStorage.setItem('admin_tutors', JSON.stringify(tutors));
        
        this.loadUsersTable();
        this.loadDashboard();
        this.showNotification('Пользователь удален', 'info');
    }
    
    // Управление уроками
    manageLessons() {
        this.loadLessonsTable();
        this.showModal('lessonsModal');
    }
    
    loadLessonsTable() {
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        const tbody = document.getElementById('lessonsTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = lessons.map(lesson => {
            const date = new Date(lesson.dateTime);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <tr>
                    <td>${lesson.id}</td>
                    <td>${lesson.studentName}</td>
                    <td>${lesson.tutorName}</td>
                    <td>${lesson.subject}</td>
                    <td>${formattedDate}</td>
                    <td>${this.formatMoney(lesson.price)}</td>
                    <td>
                        <span class="status-badge ${lesson.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                            ${lesson.paymentStatus === 'paid' ? 'Оплачен' : 'Ожидает'}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${lesson.lessonStatus === 'completed' ? 'status-active' : 'status-pending'}">
                            ${this.getLessonStatus(lesson.lessonStatus)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn btn-money" onclick="adminPanel.processPayment(${lesson.id})">
                                <i class="fas fa-credit-card"></i> Оплата
                            </button>
                            <button class="table-btn btn-edit" onclick="adminPanel.editLesson(${lesson.id})">
                                <i class="fas fa-edit"></i> Изменить
                            </button>
                            <button class="table-btn btn-delete" onclick="adminPanel.deleteLesson(${lesson.id})">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    createLesson() {
        this.manageLessons();
        this.showCreateLessonForm();
    }
    
    processPayment(lessonId) {
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        
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
            alert(`Недостаточно средств. Необходимо: ${this.formatMoney(lesson.price)}, на балансе: ${this.formatMoney(student.balance)}`);
            
            if (confirm('Пополнить баланс ученика?')) {
                this.manageMoney(student.id, 'user');
            }
            return;
        }
        
        // Списание у ученика
        users[studentIndex].balance -= lesson.price;
        
        // Находим репетитора
        const tutorIndex = tutors.findIndex(t => t.id === lesson.tutorId);
        if (tutorIndex !== -1) {
            // 80% репетитору, 20% системе
            const tutorAmount = lesson.price * 0.8;
            tutors[tutorIndex].balance += tutorAmount;
            tutors[tutorIndex].totalEarned = (tutors[tutorIndex].totalEarned || 0) + tutorAmount;
            tutors[tutorIndex].lessonsCompleted = (tutors[tutorIndex].lessonsCompleted || 0) + 1;
        }
        
        // Обновляем статус урока
        lessons[lessonIndex].paymentStatus = 'paid';
        
        // Сохраняем изменения
        localStorage.setItem('admin_users', JSON.stringify(users));
        localStorage.setItem('admin_tutors', JSON.stringify(tutors));
        localStorage.setItem('admin_lessons', JSON.stringify(lessons));
        
        // Записываем операцию
        this.addMoneyOperation({
            type: 'lesson_payment',
            from: student.name,
            to: lesson.tutorName,
            amount: lesson.price,
            comment: `Оплата урока: ${lesson.subject}`,
            userId: student.id,
            userType: 'user'
        });
        
        this.loadLessonsTable();
        this.loadDashboard();
        this.showNotification(`Урок оплачен! Списано: ${this.formatMoney(lesson.price)}`, 'success');
    }
    
    // Управление репетиторами
    manageTutors() {
        this.loadTutorsTable();
        this.showModal('tutorsModal');
    }
    
    loadTutorsTable() {
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const tbody = document.getElementById('tutorsTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = tutors.map(tutor => `
            <tr>
                <td>${tutor.id}</td>
                <td>${tutor.name}</td>
                <td>${tutor.subjects}</td>
                <td>${'★'.repeat(Math.floor(tutor.rating))}${tutor.rating % 1 ? '☆' : ''} ${tutor.rating}</td>
                <td><strong>${this.formatMoney(tutor.balance || 0)}</strong></td>
                <td>
                    <span class="status-badge ${tutor.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${tutor.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                </td>
                <td>${this.formatMoney(tutor.rate || 0)}/час</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn btn-money" onclick="adminPanel.manageMoney(${tutor.id}, 'tutor')">
                            <i class="fas fa-money-bill-wave"></i> Деньги
                        </button>
                        <button class="table-btn btn-edit" onclick="adminPanel.editTutor(${tutor.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="table-btn btn-delete" onclick="adminPanel.deleteTutor(${tutor.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    addNewTutor() {
        this.manageTutors();
        this.showAddTutorForm();
    }
    
    // Управление деньгами
    manageMoney(userId, userType) {
        let users, currentUser;
        
        if (userType === 'user') {
            users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        } else {
            users = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        }
        
        currentUser = users.find(u => u.id === userId);
        
        if (!currentUser) return;
        
        // Показываем модальное окно управления деньгами
        // Заполняем форму
        document.getElementById('moneyRecipientName').textContent = currentUser.name;
        document.getElementById('currentBalance').textContent = this.formatMoney(currentUser.balance || 0);
        document.getElementById('moneyAmount').value = '';
        document.getElementById('moneyComment').value = '';
        
        // Сохраняем данные
        document.getElementById('moneyModal').dataset.userId = userId;
        document.getElementById('moneyModal').dataset.userType = userType;
        
        this.showModal('moneyModal');
    }
    
    processMoneyOperation() {
        const amount = parseFloat(document.getElementById('moneyAmount').value);
        const comment = document.getElementById('moneyComment').value;
        const operationType = document.getElementById('moneyOperationType').value;
        const userId = parseInt(document.getElementById('moneyModal').dataset.userId);
        const userType = document.getElementById('moneyModal').dataset.userType;
        
        if (!amount || amount <= 0) {
            alert('Введите корректную сумму');
            return;
        }
        
        let storageKey, users;
        
        if (userType === 'user') {
            storageKey = 'admin_users';
        } else {
            storageKey = 'admin_tutors';
        }
        
        users = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return;
        
        // Обновляем баланс
        if (operationType === 'add' || operationType === 'salary' || operationType === 'bonus') {
            users[userIndex].balance = (users[userIndex].balance || 0) + amount;
        } else if (operationType === 'withdraw') {
            if (users[userIndex].balance < amount) {
                alert('Недостаточно средств');
                return;
            }
            users[userIndex].balance -= amount;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(users));
        
        // Записываем операцию
        this.addMoneyOperation({
            type: operationType,
            from: 'Администратор',
            to: users[userIndex].name,
            amount: amount,
            comment: comment || this.getOperationDescription(operationType),
            userId: userId,
            userType: userType
        });
        
        // Обновляем интерфейс
        if (userType === 'user') {
            this.loadUsersTable();
        } else {
            this.loadTutorsTable();
        }
        
        this.loadDashboard();
        this.closeModal('moneyModal');
        this.showNotification(`Операция выполнена! Новый баланс: ${this.formatMoney(users[userIndex].balance)}`, 'success');
    }
    
    addMoneyOperation(operation) {
        const operations = JSON.parse(localStorage.getItem('admin_money_ops') || '[]');
        const newId = operations.length > 0 ? Math.max(...operations.map(op => op.id)) + 1 : 1;
        
        const newOperation = {
            id: newId,
            date: new Date().toISOString(),
            ...operation
        };
        
        operations.push(newOperation);
        localStorage.setItem('admin_money_ops', JSON.stringify(operations));
    }
    
    // Быстрые операции
    quickAddMoney(userType) {
        // Показываем форму с предустановленным типом операции "add"
        document.getElementById('moneyOperationType').value = 'add';
        this.manageMoney(prompt('Введите ID пользователя:'), userType);
    }
    
    quickWithdrawMoney() {
        const userId = prompt('Введите ID пользователя для списания:');
        const amount = prompt('Введите сумму для списания:');
        
        if (!userId || !amount) return;
        
        let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const userIndex = users.findIndex(u => u.id == userId);
        
        if (userIndex === -1) {
            alert('Пользователь не найден');
            return;
        }
        
        if (users[userIndex].balance < amount) {
            alert('Недостаточно средств');
            return;
        }
        
        users[userIndex].balance -= parseFloat(amount);
        localStorage.setItem('admin_users', JSON.stringify(users));
        
        this.addMoneyOperation({
            type: 'withdraw',
            from: 'Администратор',
            to: users[userIndex].name,
            amount: parseFloat(amount),
            comment: 'Списание средств',
            userId: parseInt(userId),
            userType: 'user'
        });
        
        this.loadDashboard();
        this.showNotification(`Списано ${this.formatMoney(amount)} у ${users[userIndex].name}`, 'info');
    }
    
    // Вспомогательные методы
    formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    getRoleName(role) {
        const roles = {
            'student': 'Ученик',
            'tutor': 'Репетитор',
            'admin': 'Администратор'
        };
        return roles[role] || role;
    }
    
    getLessonStatus(status) {
        const statuses = {
            'scheduled': 'Запланирован',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statuses[status] || status;
    }
    
    getOperationDescription(type) {
        const descriptions = {
            'add': 'Пополнение баланса',
            'withdraw': 'Списание средств',
            'salary': 'Выплата зарплаты',
            'bonus': 'Выдача бонуса',
            'lesson_payment': 'Оплата урока'
        };
        return descriptions[type] || type;
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    setupEventListeners() {
        // Закрытие модалок при клике на фон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Поиск пользователей
        const searchInput = document.getElementById('searchUsersInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchUsers());
        }
    }
    
    searchUsers() {
        const searchTerm = document.getElementById('searchUsersInput').value.toLowerCase();
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
    
    // Экспорт данных
    exportAllData() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const lessons = JSON.parse(localStorage.getItem('admin_lessons') || '[]');
        const operations = JSON.parse(localStorage.getItem('admin_money_ops') || '[]');
        
        const data = {
            exportDate: new Date().toISOString(),
            users: users,
            tutors: tutors,
            lessons: lessons,
            operations: operations
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `admin_export_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Данные успешно экспортированы!', 'success');
    }
    
    // Финансовая статистика
    showMoneyStats() {
        // Загружаем статистику и показываем модалку
        this.updateFinancialStats();
        this.showModal('moneyStatsModal');
    }
    
    showAllOperations() {
        // Показываем все денежные операции
        const operations = JSON.parse(localStorage.getItem('admin_money_ops') || '[]');
        
        let html = '<div class="table-container">';
        html += '<table class="data-table"><thead><tr><th>Дата</th><th>Тип</th><th>От</th><th>Кому</th><th>Сумма</th><th>Комментарий</th></tr></thead><tbody>';
        
        operations.slice().reverse().forEach(op => {
            const date = new Date(op.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${this.getOperationDescription(op.type)}</td>
                    <td>${op.from}</td>
                    <td>${op.to}</td>
                    <td><strong>${this.formatMoney(op.amount)}</strong></td>
                    <td>${op.comment}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        
        // Показываем в модалке
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content wide-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-exchange-alt"></i> Все денежные операции</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
                <div class="modal-body">${html}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
}

// Инициализация при загрузке страницы
let adminPanel;

document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
});

// Глобальные функции для вызова из HTML
function manageUsers() { adminPanel.manageUsers(); }
function addNewUser() { adminPanel.addNewUser(); }
function manageLessons() { adminPanel.manageLessons(); }
function createLesson() { adminPanel.createLesson(); }
function manageTutors() { adminPanel.manageTutors(); }
function addNewTutor() { adminPanel.addNewTutor(); }
function showMoneyStats() { adminPanel.showMoneyStats(); }
function showAllOperations() { adminPanel.showAllOperations(); }
function exportAllData() { adminPanel.exportAllData(); }
function quickAddMoney(type) { adminPanel.quickAddMoney(type); }
function quickWithdrawMoney() { adminPanel.quickWithdrawMoney(); }
function closeModal(modalId) { adminPanel.closeModal(modalId); }
// Добавим в класс AdminPanel новый метод для быстрого управления балансом
class AdminPanel {
    // ... существующий код ...
    
    // Улучшенное управление балансом пользователя
    manageUserBalance(userId, userType = 'user') {
        let users, user, storageKey;
        
        if (userType === 'user') {
            storageKey = 'admin_users';
            users = JSON.parse(localStorage.getItem(storageKey) || '[]');
            user = users.find(u => u.id === userId);
        } else if (userType === 'tutor') {
            storageKey = 'admin_tutors';
            users = JSON.parse(localStorage.getItem(storageKey) || '[]');
            user = users.find(u => u.id === userId);
        } else {
            alert('Неверный тип пользователя');
            return;
        }
        
        if (!user) {
            alert('Пользователь не найден');
            return;
        }
        
        // Показываем модальное окно управления балансом
        document.getElementById('balanceUserId').value = userId;
        document.getElementById('balanceUserType').value = userType;
        document.getElementById('balanceUserName').textContent = user.name;
        document.getElementById('currentUserBalance').textContent = this.formatMoney(user.balance || 0);
        document.getElementById('balanceAmount').value = '';
        document.getElementById('balanceComment').value = '';
        document.getElementById('balanceOperationType').value = 'add';
        
        this.showModal('balanceModal');
    }
    
    // Обработка операции с балансом
    processBalanceOperation() {
        const userId = parseInt(document.getElementById('balanceUserId').value);
        const userType = document.getElementById('balanceUserType').value;
        const operationType = document.getElementById('balanceOperationType').value;
        const amount = parseFloat(document.getElementById('balanceAmount').value);
        const comment = document.getElementById('balanceComment').value;
        
        if (!amount || amount <= 0) {
            alert('Введите корректную сумму');
            return;
        }
        
        let storageKey, users, userIndex, user;
        
        if (userType === 'user') {
            storageKey = 'admin_users';
        } else if (userType === 'tutor') {
            storageKey = 'admin_tutors';
        } else {
            alert('Неверный тип пользователя');
            return;
        }
        
        users = JSON.parse(localStorage.getItem(storageKey) || '[]');
        userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            alert('Пользователь не найден');
            return;
        }
        
        user = users[userIndex];
        
        // Проверяем наличие достаточного баланса для списания
        if (operationType === 'withdraw' && (user.balance || 0) < amount) {
            alert(`Недостаточно средств. На балансе: ${this.formatMoney(user.balance)}, требуется: ${this.formatMoney(amount)}`);
            return;
        }
        
        // Обновляем баланс
        if (operationType === 'add') {
            user.balance = (user.balance || 0) + amount;
        } else if (operationType === 'withdraw') {
            user.balance = (user.balance || 0) - amount;
        } else if (operationType === 'salary') {
            user.balance = (user.balance || 0) + amount;
        } else if (operationType === 'bonus') {
            user.balance = (user.balance || 0) + amount;
        }
        
        // Сохраняем изменения
        users[userIndex] = user;
        localStorage.setItem(storageKey, JSON.stringify(users));
        
        // Записываем операцию
        this.addMoneyOperation({
            type: operationType,
            from: 'system',
            to: user.name,
            amount: amount,
            comment: comment || this.getOperationDescription(operationType),
            userId: userId,
            userType: userType
        });
        
        // Обновляем интерфейс
        if (userType === 'user') {
            this.loadUsersTable();
        } else {
            this.loadTutorsTable();
        }
        
        this.updateUserStats();
        this.closeModal('balanceModal');
        this.showNotification(`Баланс обновлен! Новый баланс: ${this.formatMoney(user.balance)}`, 'success');
    }
    
    // Быстрое пополнение баланса
    quickAddBalance(userType) {
        const userId = prompt('Введите ID пользователя:');
        if (!userId) return;
        
        const amount = parseFloat(prompt('Введите сумму для пополнения:'));
        if (!amount || amount <= 0) {
            alert('Неверная сумма');
            return;
        }
        
        let storageKey, users, userIndex;
        
        if (userType === 'user') {
            storageKey = 'admin_users';
        } else if (userType === 'tutor') {
            storageKey = 'admin_tutors';
        } else {
            alert('Неверный тип пользователя');
            return;
        }
        
        users = JSON.parse(localStorage.getItem(storageKey) || '[]');
        userIndex = users.findIndex(u => u.id == userId);
        
        if (userIndex === -1) {
            alert('Пользователь не найден');
            return;
        }
        
        users[userIndex].balance = (users[userIndex].balance || 0) + amount;
        localStorage.setItem(storageKey, JSON.stringify(users));
        
        // Записываем операцию
        this.addMoneyOperation({
            type: 'add',
            from: 'Администратор',
            to: users[userIndex].name,
            amount: amount,
            comment: 'Быстрое пополнение',
            userId: parseInt(userId),
            userType: userType
        });
        
        this.loadDashboard();
        this.showNotification(`Баланс пополнен на ${this.formatMoney(amount)}`, 'success');
    }
    
    // Показать историю операций пользователя
    showUserOperations(userId, userType) {
        const operations = JSON.parse(localStorage.getItem('admin_money_ops') || '[]');
        const userOperations = operations.filter(op => op.userId === userId && op.userType === userType);
        
        let html = '<div class="table-container">';
        html += '<table class="data-table"><thead><tr><th>Дата</th><th>Тип</th><th>Сумма</th><th>Комментарий</th></tr></thead><tbody>';
        
        userOperations.slice().reverse().forEach(op => {
            const date = new Date(op.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const amountClass = op.type === 'add' || op.type === 'salary' || op.type === 'bonus' 
                ? 'text-success' 
                : 'text-danger';
            
            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${this.getOperationDescription(op.type)}</td>
                    <td class="${amountClass}"><strong>${op.type === 'add' || op.type === 'salary' || op.type === 'bonus' ? '+' : '-'}${this.formatMoney(op.amount)}</strong></td>
                    <td>${op.comment}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        
        // Показываем в модалке
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content wide-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-history"></i> История операций</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    // Общая финансовая статистика
    showSystemFinanceStats() {
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        const tutors = JSON.parse(localStorage.getItem('admin_tutors') || '[]');
        const operations = JSON.parse(localStorage.getItem('admin_money_ops') || '[]');
        
        // Общий баланс системы
        const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0) +
                           tutors.reduce((sum, tutor) => sum + (tutor.balance || 0), 0);
        
        // Пополнения за месяц
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthAdditions = operations
            .filter(op => (op.type === 'add' || op.type === 'salary' || op.type === 'bonus') && new Date(op.date) > monthAgo)
            .reduce((sum, op) => sum + op.amount, 0);
        
        // Списания за месяц
        const monthWithdrawals = operations
            .filter(op => op.type === 'withdraw' && new Date(op.date) > monthAgo)
            .reduce((sum, op) => sum + op.amount, 0);
        
        // Самые активные пользователи
        const userAdditions = {};
        operations.forEach(op => {
            if (op.type === 'add' || op.type === 'salary' || op.type === 'bonus') {
                userAdditions[op.userId] = (userAdditions[op.userId] || 0) + op.amount;
            }
        });
        
        const topUsers = Object.entries(userAdditions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        let html = `
            <div class="finance-stats-grid">
                <div class="finance-stat-card">
                    <h3>Общий баланс системы</h3>
                    <div class="finance-stat-value">${this.formatMoney(totalBalance)}</div>
                </div>
                <div class="finance-stat-card">
                    <h3>Пополнения за месяц</h3>
                    <div class="finance-stat-value text-success">${this.formatMoney(monthAdditions)}</div>
                </div>
                <div class="finance-stat-card">
                    <h3>Списания за месяц</h3>
                    <div class="finance-stat-value text-danger">${this.formatMoney(monthWithdrawals)}</div>
                </div>
                <div class="finance-stat-card">
                    <h3>Оборот за месяц</h3>
                    <div class="finance-stat-value">${this.formatMoney(monthAdditions - monthWithdrawals)}</div>
                </div>
            </div>
            
            <div class="finance-top-users">
                <h3>Топ-5 по пополнениям</h3>
                <div class="top-users-list">
        `;
        
        topUsers.forEach(([userId, amount]) => {
            const user = users.find(u => u.id == userId) || tutors.find(t => t.id == userId);
            if (user) {
                html += `
                    <div class="top-user-item">
                        <div class="top-user-name">${user.name}</div>
                        <div class="top-user-amount">${this.formatMoney(amount)}</div>
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
        
        // Показываем в модалке
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content wide-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-pie"></i> Финансовая статистика</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
}
// Добавить в конец admin_functional.js
function manageUserBalance(userId, userType) {
    if (adminPanel && adminPanel.manageUserBalance) {
        adminPanel.manageUserBalance(userId, userType);
    } else {
        alert('Админ панель не инициализирована');
    }
}

function selectOperationType(type) {
    document.getElementById('balanceOperationType').value = type;
    
    // Обновляем активные кнопки
    document.querySelectorAll('.operation-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`.operation-type-btn[data-type="${type}"]`).classList.add('active');
}

function processBalanceOperation() {
    if (adminPanel && adminPanel.processBalanceOperation) {
        adminPanel.processBalanceOperation();
    } else {
        alert('Админ панель не инициализирована');
    }
}

function showSystemFinanceStats() {
    if (adminPanel && adminPanel.showSystemFinanceStats) {
        adminPanel.showSystemFinanceStats();
    }
}

function quickAddBalance(type) {
    if (adminPanel && adminPanel.quickAddBalance) {
        adminPanel.quickAddBalance(type);
    }
}

function showUserOperations(userId, userType) {
    if (adminPanel && adminPanel.showUserOperations) {
        adminPanel.showUserOperations(userId, userType);
    }
}