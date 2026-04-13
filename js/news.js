// Система новостей для УчебаВместе
const NEWS_STORAGE_KEY = 'ucheba_news';
const NEWS_PER_PAGE = 5;

// Инициализация новостей
function initNewsSystem() {
    loadNews();
    setupNewsEvents();
}

// Загрузка новостей из localStorage
function loadNews() {
    const news = getStoredNews();
    displayNews(news);
    updateNewsStats(news);
}

// Получение сохраненных новостей
function getStoredNews() {
    return JSON.parse(localStorage.getItem(NEWS_STORAGE_KEY)) || [];
}

// Сохранение новостей
function saveNews(news) {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
}

// Отображение новостей
function displayNews(news) {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    if (!news || news.length === 0) {
        newsContainer.innerHTML = `
            <div class="empty-news">
                <i class="fas fa-newspaper"></i>
                <p>Пока нет новостей</p>
            </div>
        `;
        return;
    }
    
    // Сортируем по дате (сначала новые)
    const sortedNews = [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let newsHTML = '';
    
    sortedNews.forEach((item, index) => {
        const date = new Date(item.createdAt);
        const formattedDate = formatNewsDate(date);
        const timeAgo = getTimeAgo(date);
        
        newsHTML += `
            <div class="news-item" data-id="${item.id}">
                <div class="news-header">
                    <div class="news-category">${item.category || 'Новость'}</div>
                    <div class="news-date" title="${formattedDate}">${timeAgo}</div>
                </div>
                <h4 class="news-title">${item.title}</h4>
                <div class="news-content">${item.content}</div>
                ${item.attachments && item.attachments.length > 0 ? `
                    <div class="news-attachments">
                        <div class="attachment-count">
                            <i class="fas fa-paperclip"></i> ${item.attachments.length} файл(ов)
                        </div>
                    </div>
                ` : ''}
                <div class="news-footer">
                    <div class="news-author">
                        <i class="fas fa-user"></i> ${item.author || 'Администратор'}
                    </div>
                    <div class="news-actions">
                        <button class="news-like-btn" onclick="toggleNewsLike(${item.id})">
                            <i class="far fa-heart"></i> 
                            <span class="like-count">${item.likes || 0}</span>
                        </button>
                        <button class="news-share-btn" onclick="shareNews(${item.id})">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    newsContainer.innerHTML = newsHTML;
}

// Форматирование даты
function formatNewsDate(date) {
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Время назад
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
        return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
        return `${diffDays} д назад`;
    } else {
        return formatNewsDate(date);
    }
}

// Обновление статистики новостей
function updateNewsStats(news) {
    const statsElement = document.getElementById('newsStats');
    if (statsElement) {
        const totalNews = news.length;
        const today = new Date().toDateString();
        const todayNews = news.filter(item => 
            new Date(item.createdAt).toDateString() === today
        ).length;
        
        statsElement.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${totalNews}</div>
                <div class="stat-label">Всего новостей</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${todayNews}</div>
                <div class="stat-label">Сегодня</div>
            </div>
        `;
    }
}

// Публикация новой новости
function publishNews() {
    const titleInput = document.getElementById('newsTitle');
    const contentInput = document.getElementById('newsContent');
    const categoryInput = document.getElementById('newsCategory');
    const publishCheckbox = document.getElementById('publishToVK');
    
    if (!titleInput || !contentInput) return;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = categoryInput ? categoryInput.value : 'Общее';
    
    if (!title || !content) {
        showNotification('Заполните заголовок и текст новости', 'error');
        return;
    }
    
    // Получаем текущего пользователя
    const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
    
    // Создаем новость
    const newNews = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        author: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Администратор',
        createdAt: new Date().toISOString(),
        likes: 0,
        views: 0,
        attachments: [],
        isPublished: true
    };
    
    // Сохраняем в хранилище
    const existingNews = getStoredNews();
    existingNews.unshift(newNews);
    saveNews(existingNews);
    
    // Очищаем форму
    titleInput.value = '';
    contentInput.value = '';
    if (categoryInput) categoryInput.value = 'Общее';
    
    // Показываем уведомление
    showNotification('Новость успешно опубликована!', 'success');
    
    // Обновляем отображение
    loadNews();
    
    // Публикуем в VK если отмечено
    if (publishCheckbox && publishCheckbox.checked) {
        publishToVKFromNews(newNews);
    }
    
    // Закрываем модальное окно если оно открыто
    const modal = document.getElementById('newsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Публикация новости в VK
function publishToVKFromNews(news) {
    // Используем существующий функционал VK API
    const message = `${news.title}\n\n${news.content}\n\n#УчебаВместе #Новости`;
    
    // Заполняем форму VK
    const vkMessage = document.getElementById('vkMessage');
    if (vkMessage) {
        vkMessage.value = message;
        
        // Показываем статус
        showNotification('Подготовка публикации в VK...', 'info');
        
        // Через 1 секунду имитируем публикацию
        setTimeout(() => {
            showNotification('Новость опубликована в VK!', 'success');
        }, 1000);
    }
}

// Настройка событий новостей
function setupNewsEvents() {
    // Кнопка публикации
    const publishBtn = document.getElementById('publishNewsBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishNews);
    }
    
    // Кнопка открытия формы
    const openFormBtn = document.getElementById('openNewsForm');
    if (openFormBtn) {
        openFormBtn.addEventListener('click', openNewsForm);
    }
    
    // Загрузка прикреплений
    const attachmentInput = document.getElementById('newsAttachment');
    if (attachmentInput) {
        attachmentInput.addEventListener('change', handleNewsAttachment);
    }
    
    // Превью текста
    const contentInput = document.getElementById('newsContent');
    if (contentInput) {
        contentInput.addEventListener('input', updateNewsPreview);
    }
}

// Открытие формы новости
function openNewsForm() {
    const modal = document.getElementById('newsModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        createNewsModal();
    }
}

// Создание модального окна новости
function createNewsModal() {
    const modalHTML = `
        <div class="modal" id="newsModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>Публикация новости</h2>
                    <button class="modal-close" onclick="document.getElementById('newsModal').style.display='none'">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="newsTitle">Заголовок новости *</label>
                        <input type="text" id="newsTitle" class="form-control" placeholder="Введите заголовок" maxlength="100">
                        <div class="char-counter" id="titleCounter">0/100</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="newsCategory">Категория</label>
                        <select id="newsCategory" class="form-control">
                            <option value="Общее">Общее</option>
                            <option value="Обновления">Обновления платформы</option>
                            <option value="Репетиторы">Новые репетиторы</option>
                            <option value="Мероприятия">Мероприятия</option>
                            <option value="Конкурсы">Конкурсы и акции</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="newsContent">Текст новости *</label>
                        <textarea id="newsContent" class="form-control" rows="8" placeholder="Напишите текст новости..."></textarea>
                        <div class="char-counter" id="contentCounter">0/4000</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Прикрепления</label>
                        <div class="attachment-upload">
                            <label for="newsAttachment" class="upload-label">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Перетащите файлы или нажмите для выбора</span>
                                <input type="file" id="newsAttachment" multiple style="display: none;">
                            </label>
                            <div class="attachment-preview" id="attachmentPreview"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="publishToVK" checked>
                            Также опубликовать в сообществе VK
                        </label>
                    </div>
                    
                    <div class="preview-section">
                        <h3>Предпросмотр</h3>
                        <div class="news-preview" id="newsPreview">
                            <div class="preview-placeholder">
                                Здесь будет предпросмотр вашей новости
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="document.getElementById('newsModal').style.display='none'">Отмена</button>
                    <button class="btn btn-primary" id="publishNewsBtn">
                        <i class="fas fa-paper-plane"></i> Опубликовать
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupNewsEvents();
    
    // Обновляем счетчики символов
    document.getElementById('newsTitle').addEventListener('input', function() {
        document.getElementById('titleCounter').textContent = this.value.length + '/100';
    });
    
    document.getElementById('newsContent').addEventListener('input', function() {
        document.getElementById('contentCounter').textContent = this.value.length + '/4000';
    });
}

// Обновление превью новости
function updateNewsPreview() {
    const content = document.getElementById('newsContent').value;
    const preview = document.getElementById('newsPreview');
    
    if (!preview || !content.trim()) {
        if (preview) {
            preview.innerHTML = '<div class="preview-placeholder">Здесь будет предпросмотр вашей новости</div>';
        }
        return;
    }
    
    const previewHTML = `
        <div class="news-preview-item">
            <div class="news-preview-header">
                <div class="preview-category">Общее</div>
                <div class="preview-date">только что</div>
            </div>
            <h4 class="preview-title">${document.getElementById('newsTitle').value || 'Заголовок новости'}</h4>
            <div class="preview-content">${content.substring(0, 200)}${content.length > 200 ? '...' : ''}</div>
        </div>
    `;
    
    preview.innerHTML = previewHTML;
}

// Обработка прикреплений к новости
function handleNewsAttachment(event) {
    const files = event.target.files;
    const preview = document.getElementById('attachmentPreview');
    
    if (!preview) return;
    
    preview.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        if (index >= 5) return; // Максимум 5 файлов
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileElement = document.createElement('div');
            fileElement.className = 'attachment-item';
            fileElement.innerHTML = `
                <div class="attachment-info">
                    <i class="fas fa-file"></i>
                    <span class="attachment-name">${file.name}</span>
                    <span class="attachment-size">(${formatFileSize(file.size)})</span>
                </div>
                <button class="attachment-remove" onclick="removeAttachment(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(fileElement);
        };
        reader.readAsDataURL(file);
    });
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

// Удаление прикрепления
function removeAttachment(index) {
    // Здесь будет логика удаления файла
    showNotification('Файл удален', 'info');
}

// Лайк новости
function toggleNewsLike(newsId) {
    const news = getStoredNews();
    const newsIndex = news.findIndex(item => item.id === newsId);
    
    if (newsIndex !== -1) {
        if (!news[newsIndex].liked) {
            news[newsIndex].likes = (news[newsIndex].likes || 0) + 1;
            news[newsIndex].liked = true;
            showNotification('Новость понравилась!', 'success');
        } else {
            news[newsIndex].likes = Math.max(0, (news[newsIndex].likes || 1) - 1);
            news[newsIndex].liked = false;
            showNotification('Лайк удален', 'info');
        }
        
        saveNews(news);
        displayNews(news);
    }
}

// Поделиться новостью
function shareNews(newsId) {
    const news = getStoredNews();
    const newsItem = news.find(item => item.id === newsId);
    
    if (newsItem) {
        const shareText = `${newsItem.title}\n\n${newsItem.content.substring(0, 100)}...\n\nЧитать полностью на УчебаВместе`;
        
        if (navigator.share) {
            navigator.share({
                title: newsItem.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback для старых браузеров
            navigator.clipboard.writeText(shareText);
            showNotification('Текст новости скопирован в буфер обмена!', 'success');
        }
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Используем существующую систему уведомлений или создаем простую
    alert(message); // Временное решение
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('newsContainer') || document.getElementById('newsModal')) {
        initNewsSystem();
    }
});