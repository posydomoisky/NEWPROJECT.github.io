// Общие функции управления балансом
class BalanceManager {
    constructor() {
        this.operations = JSON.parse(localStorage.getItem('ucheba_balance_operations')) || [];
        this.users = JSON.parse(localStorage.getItem('ucheba_users')) || [];
    }
    
    // Получить баланс пользователя
    getUserBalance(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? (user.balance || 0) : 0;
    }
    
    // Обновить баланс пользователя
    updateUserBalance(userId, amount, type, comment = '') {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        
        const user = this.users[userIndex];
        const oldBalance = user.balance || 0;
        let newBalance = oldBalance;
        
        switch(type) {
            case 'add':
            case 'bonus':
            case 'refund':
                newBalance = oldBalance + amount;
                break;
            case 'subtract':
            case 'commission':
            case 'fine':
                newBalance = oldBalance - amount;
                break;
            case 'salary':
                // Для зарплаты - списание полной суммы
                newBalance = oldBalance - amount;
                break;
            case 'correction':
                // Корректировка - устанавливаем точное значение
                newBalance = amount;
                amount = amount - oldBalance;
                break;
        }
        
        // Обновляем пользователя
        user.balance = newBalance;
        this.users[userIndex] = user;
        
        // Сохраняем операцию
        const operation = {
            id: Date.now(),
            userId: userId,
            userType: user.role,
            type: type,
            amount: amount,
            oldBalance: oldBalance,
            newBalance: newBalance,
            comment: comment,
            date: new Date().toISOString(),
            adminId: this.getCurrentAdminId()
        };
        
        this.operations.push(operation);
        
        // Сохраняем в localStorage
        this.saveToStorage();
        
        return {
            success: true,
            operation: operation,
            newBalance: newBalance
        };
    }
    
    // Получить историю операций пользователя
    getUserOperations(userId, limit = 50) {
        return this.operations
            .filter(op => op.userId === userId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    // Получить историю операций по типу пользователя
    getOperationsByUserType(userType, limit = 50) {
        return this.operations
            .filter(op => op.userType === userType)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    // Получить статистику по балансам
    getBalanceStats() {
        const students = this.users.filter(u => u.role === 'student');
        const tutors = this.users.filter(u => u.role === 'tutor');
        
        const studentBalance = students.reduce((sum, user) => sum + (user.balance || 0), 0);
        const tutorBalance = tutors.reduce((sum, user) => sum + (user.balance || 0), 0);
        
        return {
            total: studentBalance + tutorBalance,
            studentBalance: studentBalance,
            tutorBalance: tutorBalance,
            studentCount: students.length,
            tutorCount: tutors.length,
            avgStudentBalance: students.length > 0 ? studentBalance / students.length : 0,
            avgTutorBalance: tutors.length > 0 ? tutorBalance / tutors.length : 0
        };
    }
    
    // Экспорт операций в CSV
    exportOperationsToCSV(operations) {
        const headers = ['ID', 'Дата', 'Пользователь', 'Тип', 'Сумма', 'Старый баланс', 'Новый баланс', 'Комментарий'];
        const rows = operations.map(op => [
            op.id,
            new Date(op.date).toLocaleString('ru-RU'),
            op.userId,
            this.getOperationTypeText(op.type),
            op.amount,
            op.oldBalance,
            op.newBalance,
            op.comment
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    // Получить текстовое описание типа операции
    getOperationTypeText(type) {
        const types = {
            'add': 'Пополнение',
            'subtract': 'Списание',
            'bonus': 'Бонус',
            'salary': 'Зарплата',
            'refund': 'Возврат',
            'commission': 'Комиссия',
            'correction': 'Корректировка',
            'fine': 'Штраф'
        };
        
        return types[type] || type;
    }
    
    // Получить ID текущего администратора
    getCurrentAdminId() {
        const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
        return currentUser && currentUser.role === 'admin' ? currentUser.id : null;
    }
    
    // Сохранить данные в localStorage
    saveToStorage() {
        localStorage.setItem('ucheba_balance_operations', JSON.stringify(this.operations));
        localStorage.setItem('ucheba_users', JSON.stringify(this.users));
    }
    
    // Инициализировать демо-данные
    initDemoData() {
        if (this.operations.length === 0) {
            const demoOperations = [
                {
                    id: 1,
                    userId: 3,
                    userType: 'student',
                    type: 'add',
                    amount: 5000,
                    oldBalance: 0,
                    newBalance: 5000,
                    comment: 'Пополнение через Сбербанк Онлайн',
                    date: '2024-12-15T10:30:00Z',
                    adminId: 1
                },
                {
                    id: 2,
                    userId: 2,
                    userType: 'tutor',
                    type: 'salary',
                    amount: 50000,
                    oldBalance: 95000,
                    newBalance: 45000,
                    comment: 'Выплата за ноябрь',
                    date: '2024-12-10T14:15:00Z',
                    adminId: 1
                }
            ];
            
            this.operations = demoOperations;
            this.saveToStorage();
        }
    }
}

// Глобальный экземпляр менеджера баланса
window.balanceManager = new BalanceManager();

// Инициализация демо-данных при первой загрузке
document.addEventListener('DOMContentLoaded', function() {
    window.balanceManager.initDemoData();
});

// Вспомогательные функции
function formatBalance(amount) {
    return amount.toLocaleString('ru-RU') + ' ₽';
}

function getBalanceClass(balance) {
    if (balance > 0) return 'balance-positive';
    if (balance < 0) return 'balance-negative';
    return 'balance-zero';
}

function getRoleClass(role) {
    switch(role) {
        case 'admin': return 'role-admin';
        case 'tutor': return 'role-tutor';
        case 'student': return 'role-student';
        default: return '';
    }
}

function getRoleText(role) {
    switch(role) {
        case 'admin': return 'Администратор';
        case 'tutor': return 'Репетитор';
        case 'student': return 'Ученик';
        default: return role;
    }
}

// Экспорт функций для использования в других файлах
window.balanceUtils = {
    formatBalance,
    getBalanceClass,
    getRoleClass,
    getRoleText
};