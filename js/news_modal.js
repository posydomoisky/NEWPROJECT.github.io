// Модальное окно для публикации новостей (для администраторов)

// Проверка прав администратора
function isAdmin() {
  const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
  return currentUser && currentUser.role === 'admin';
}

// Инициализация системы публикации
function initPublishingSystem() {
  // Показываем кнопку публикации только админам
  const publishBtn = document.getElementById('adminPublishBtn');
  if (publishBtn && isAdmin()) {
    publishBtn.style.display = 'flex';
    publishBtn.addEventListener('click', openPublishModal);
  }
  
  // Загружаем новости
  loadNews();
}

// Открытие модального окна публикации
function openPublishModal() {
  if (!isAdmin()) {
    alert('Эта функция доступна только администраторам');
    return;
  }
  
  const modal = document.getElementById('publishModal');
  if (!modal) {
    createPublishModal();
  } else {
    modal.classList.add('active');
  }
  
  // Очищаем форму
  document.getElementById('publishTitle').value = '';
  document.getElementById('publishContent').value = '';
  document.getElementById('publishCategory').value = 'general';
  document.getElementById('publishToVK').checked = true;
  
  // Обновляем счетчики
  updateCharCount('titleCounter', 0);
  updateCharCount('contentCounter', 0);
  
  // Скрываем кнопку публикации в VK если нет доступа
  const vkSection = document.querySelector('.vk-publish-section');
  if (!localStorage.getItem('vk_access_token') && vkSection) {
    vkSection.style.display = 'none';
  }
}

// Создание модального окна
function createPublishModal() {
  const modalHTML = `
    <div class="modal publish-modal" id="publishModal">
      <div class="modal-content publish-modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-newspaper"></i> Публикация новости</h2>
          <button class="modal-close" onclick="closePublishModal()">×</button>
        </div>
        
        <div class="modal-body publish-form">
          <div class="publish-tabs">
            <button class="tab-btn active" onclick="switchPublishTab('site')">
              <i class="fas fa-globe"></i> На сайт
            </button>
            <button class="tab-btn" onclick="switchPublishTab('vk')">
              <i class="fab fa-vk"></i> ВКонтакте
            </button>
            <button class="tab-btn" onclick="switchPublishTab('both')">
              <i class="fas fa-share-alt"></i> Обе платформы
            </button>
          </div>
          
          <div class="tab-content active" id="siteTab">
            <div class="form-group">
              <label for="publishTitle">Заголовок *</label>
              <input type="text" id="publishTitle" class="form-control" 
                     placeholder="Введите заголовок новости" 
                     maxlength="100"
                     oninput="updateCharCount('titleCounter', this.value.length)">
              <div class="char-counter">
                <span id="titleCounter">0</span>/100 символов
              </div>
            </div>
            
            <div class="form-group">
              <label for="publishCategory">Категория</label>
              <select id="publishCategory" class="form-control">
                <option value="general">Общее</option>
                <option value="updates">Обновления</option>
                <option value="events">Мероприятия</option>
                <option value="tutors">Новые репетиторы</option>
                <option value="success">Истории успеха</option>
                <option value="tips">Советы по учебе</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="publishContent">Текст новости *</label>
              <textarea id="publishContent" class="form-control" 
                        rows="6" 
                        placeholder="Напишите текст новости..."
                        maxlength="2000"
                        oninput="updateCharCount('contentCounter', this.value.length)"></textarea>
              <div class="char-counter">
                <span id="contentCounter">0</span>/2000 символов
              </div>
            </div>
            
            <div class="form-group">
              <label for="publishImage">Изображение (необязательно)</label>
              <div class="image-upload">
                <input type="file" id="publishImage" accept="image/*" 
                       style="display: none;" onchange="previewImage(event)">
                <button type="button" class="btn btn-outline" onclick="document.getElementById('publishImage').click()">
                  <i class="fas fa-image"></i> Выбрать изображение
                </button>
                <div class="image-preview" id="imagePreview"></div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="vkTab" style="display: none;">
            <div class="vk-publish-section">
              <div class="form-group">
                <label>Выберите сообщество</label>
                <select id="vkGroupSelect" class="form-control">
                  <option value="">Загрузка сообществ...</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Текст поста в VK *</label>
                <textarea id="vkPostText" class="form-control" rows="4" 
                          placeholder="Текст для публикации в VK..."></textarea>
              </div>
              
              <div class="vk-options">
                <label>
                  <input type="checkbox" id="vkFromGroup" checked>
                  От имени сообщества
                </label>
                <label>
                  <input type="checkbox" id="vkSigned">
                  С подписью автора
                </label>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="bothTab" style="display: none;">
            <div class="both-platforms-info">
              <div class="info-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <p>Новость будет опубликована одновременно на сайте и в сообществе ВКонтакте.</p>
            </div>
            
            <div class="form-group">
              <label for="bothTitle">Заголовок *</label>
              <input type="text" id="bothTitle" class="form-control" 
                     placeholder="Введите заголовок" maxlength="100">
            </div>
            
            <div class="form-group">
              <label for="bothContent">Текст для сайта *</label>
              <textarea id="bothContent" class="form-control" rows="4" 
                        placeholder="Текст для публикации на сайте..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="bothVkText">Текст для VK *</label>
              <textarea id="bothVkText" class="form-control" rows="3" 
                        placeholder="Текст для публикации в VK..."></textarea>
            </div>
          </div>
          
          <div class="publish-options">
            <label class="checkbox-option">
              <input type="checkbox" id="publishToVK" checked>
              <span>Также опубликовать в сообществе ВКонтакте</span>
            </label>
            
            <label class="checkbox-option">
              <input type="checkbox" id="notifyUsers">
              <span>Отправить уведомление пользователям</span>
            </label>
            
            <label class="checkbox-option">
              <input type="checkbox" id="pinPost">
              <span>Закрепить новость</span>
            </label>
          </div>
          
          <div class="preview-section">
            <h3><i class="fas fa-eye"></i> Предпросмотр</h3>
            <div class="preview-card" id="newsPreview">
              <div class="preview-header">
                <div class="preview-category">Общее</div>
                <div class="preview-date">Сейчас</div>
              </div>
              <h4 class="preview-title">Заголовок новости</h4>
              <div class="preview-content">
                Здесь будет отображаться предпросмотр вашей новости...
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="publish-actions">
            <button class="btn btn-outline" onclick="closePublishModal()">
              <i class="fas fa-times"></i> Отмена
            </button>
            <button class="btn btn-primary" onclick="previewNews()">
              <i class="fas fa-eye"></i> Превью
            </button>
            <button class="btn btn-success" onclick="publishNews()" id="publishBtn">
              <i class="fas fa-paper-plane"></i> Опубликовать
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Добавляем обработчики
  document.getElementById('publishTitle').addEventListener('input', updateNewsPreview);
  document.getElementById('publishContent').addEventListener('input', updateNewsPreview);
  document.getElementById('publishCategory').addEventListener('change', updateNewsPreview);
}

// Закрытие модального окна
function closePublishModal() {
  const modal = document.getElementById('publishModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Переключение вкладок
function switchPublishTab(tabName) {
  // Скрываем все вкладки
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Деактивируем все кнопки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Показываем выбранную вкладку
  document.getElementById(`${tabName}Tab`).style.display = 'block';
  
  // Активируем выбранную кнопку
  document.querySelector(`.tab-btn[onclick*="${tabName}"]`).classList.add('active');
}

// Обновление счетчика символов
function updateCharCount(counterId, length) {
  const counter = document.getElementById(counterId);
  if (counter) {
    counter.textContent = length;
    
    // Меняем цвет при приближении к лимиту
    const max = counterId.includes('title') ? 100 : 2000;
    const percent = (length / max) * 100;
    
    if (percent > 90) {
      counter.style.color = '#ef4444';
    } else if (percent > 70) {
      counter.style.color = '#f59e0b';
    } else {
      counter.style.color = '';
    }
  }
}

// Превью изображения
function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('imagePreview');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `
        <div class="preview-image">
          <img src="${e.target.result}" alt="Preview">
          <button class="remove-image" onclick="removeImage()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }
}

// Удаление изображения
function removeImage() {
  document.getElementById('publishImage').value = '';
  document.getElementById('imagePreview').innerHTML = '';
}

// Обновление превью новости
function updateNewsPreview() {
  const title = document.getElementById('publishTitle').value || 'Заголовок новости';
  const content = document.getElementById('publishContent').value || 'Текст новости...';
  const category = document.getElementById('publishCategory').value;
  
  // Получаем название категории
  const categoryNames = {
    general: 'Общее',
    updates: 'Обновления',
    events: 'Мероприятия',
    tutors: 'Новые репетиторы',
    success: 'Истории успеха',
    tips: 'Советы по учебе'
  };
  
  const categoryName = categoryNames[category] || 'Общее';
  
  const previewHTML = `
    <div class="preview-header">
      <div class="preview-category">${categoryName}</div>
      <div class="preview-date">Сейчас</div>
    </div>
    <h4 class="preview-title">${title}</h4>
    <div class="preview-content">${content.substring(0, 200)}${content.length > 200 ? '...' : ''}</div>
  `;
  
  document.getElementById('newsPreview').innerHTML = previewHTML;
}

// Публикация новости
function publishNews() {
  const title = document.getElementById('publishTitle').value.trim();
  const content = document.getElementById('publishContent').value.trim();
  const category = document.getElementById('publishCategory').value;
  const publishToVK = document.getElementById('publishToVK').checked;
  const notifyUsers = document.getElementById('notifyUsers').checked;
  const pinPost = document.getElementById('pinPost').checked;
  
  // Валидация
  if (!title) {
    showNotification('Введите заголовок новости', 'error');
    return;
  }
  
  if (!content) {
    showNotification('Введите текст новости', 'error');
    return;
  }
  
  // Получаем текущего пользователя
  const currentUser = JSON.parse(localStorage.getItem('ucheba_current_user'));
  
  // Создаем новость
  const newsItem = {
    id: Date.now(),
    title: title,
    content: content,
    category: category,
    author: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Администратор',
    authorId: currentUser ? currentUser.id : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
    views: 0,
    isPinned: pinPost,
    isPublished: true,
    image: null // Можно добавить обработку изображения
  };
  
  // Сохраняем новость
  saveNewsItem(newsItem);
  
  // Публикуем в VK если нужно
  if (publishToVK) {
    publishToVKFromNews(newsItem);
  }
  
  // Уведомляем пользователей если нужно
  if (notifyUsers) {
    notifyUsersAboutNews(newsItem);
  }
  
  // Закрываем модальное окно
  closePublishModal();
  
  // Показываем уведомление
  showNotification('Новость успешно опубликована!', 'success');
  
  // Обновляем список новостей
  loadNews();
}

// Сохранение новости в хранилище
function saveNewsItem(newsItem) {
  const news = getStoredNews();
  news.unshift(newsItem); // Добавляем в начало
  
  // Ограничиваем количество новостей (последние 100)
  if (news.length > 100) {
    news.pop();
  }
  
  localStorage.setItem('ucheba_news', JSON.stringify(news));
}

// Получение сохраненных новостей
function getStoredNews() {
  return JSON.parse(localStorage.getItem('ucheba_news')) || [];
}

// Публикация в VK
function publishToVKFromNews(newsItem) {
  // Используем существующий функционал VK API
  const vkMessage = `${newsItem.title}\n\n${newsItem.content}\n\n#УчебаВместе #Новости`;
  
  // Здесь можно добавить интеграцию с вашим VK API
  console.log('Публикация в VK:', vkMessage);
  
  // Показываем уведомление
  showNotification('Новость опубликована в ВКонтакте!', 'success');
}

// Уведомление пользователей
function notifyUsersAboutNews(newsItem) {
  // Здесь можно добавить систему уведомлений
  console.log('Уведомление пользователей о новости:', newsItem.title);
}

// Загрузка новостей
function loadNews() {
  const news = getStoredNews();
  const newsContainer = document.getElementById('newsContainer');
  
  if (!newsContainer) return;
  
  if (news.length === 0) {
    // Показываем демо-новости или сообщение
    newsContainer.innerHTML = `
      <div class="empty-news">
        <i class="fas fa-newspaper"></i>
        <h3>Новостей пока нет</h3>
        <p>Будьте первым, кто опубликует новость!</p>
        ${isAdmin() ? `
          <button class="btn btn-primary" onclick="openPublishModal()">
            <i class="fas fa-plus"></i> Добавить первую новость
          </button>
        ` : ''}
      </div>
    `;
    return;
  }
  
  let newsHTML = '';
  
  news.forEach(item => {
    const date = new Date(item.createdAt);
    const timeAgo = getTimeAgo(date);
    const categoryNames = {
      general: 'Общее',
      updates: 'Обновления',
      events: 'Мероприятия',
      tutors: 'Новые репетиторы',
      success: 'Истории успеха',
      tips: 'Советы по учебе'
    };
    
    newsHTML += `
      <div class="news-item ${item.isPinned ? 'pinned' : ''}" data-id="${item.id}">
        ${item.isPinned ? '<div class="pin-badge"><i class="fas fa-thumbtack"></i> Закреплено</div>' : ''}
        
        <div class="news-header">
          <div class="news-category">${categoryNames[item.category] || 'Общее'}</div>
          <div class="news-date" title="${date.toLocaleString('ru-RU')}">
            <i class="far fa-clock"></i> ${timeAgo}
          </div>
        </div>
        
        <h3 class="news-title">${item.title}</h3>
        
        <div class="news-content">
          <p>${item.content}</p>
        </div>
        
        <div class="news-footer">
          <div class="news-author">
            <i class="fas fa-user"></i> ${item.author}
          </div>
          
          <div class="news-stats">
            <span class="news-stat">
              <i class="far fa-eye"></i> ${item.views}
            </span>
            <span class="news-stat">
              <i class="far fa-heart"></i> ${item.likes}
            </span>
            <span class="news-stat">
              <i class="far fa-comment"></i> ${item.comments}
            </span>
          </div>
          
          ${isAdmin() ? `
            <div class="news-actions">
              <button class="action-btn" onclick="editNews(${item.id})" title="Редактировать">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn" onclick="deleteNews(${item.id})" title="Удалить">
                <i class="fas fa-trash"></i>
              </button>
              <button class="action-btn" onclick="togglePinNews(${item.id})" title="${item.isPinned ? 'Открепить' : 'Закрепить'}">
                <i class="fas fa-thumbtack"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  newsContainer.innerHTML = newsHTML;
}

// Время назад
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // разница в секундах
  
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} д назад`;
  
  return date.toLocaleDateString('ru-RU');
}

// Показ уведомления
function showNotification(message, type = 'info') {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    </div>
    <div class="notification-content">${message}</div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Автоматическое удаление через 5 секунд
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Функции администрирования новостей
function editNews(newsId) {
  const news = getStoredNews();
  const newsItem = news.find(item => item.id === newsId);
  
  if (newsItem) {
    // Заполняем форму данными
    document.getElementById('publishTitle').value = newsItem.title;
    document.getElementById('publishContent').value = newsItem.content;
    document.getElementById('publishCategory').value = newsItem.category;
    
    // Открываем модальное окно
    openPublishModal();
    
    // Меняем кнопку публикации
    const publishBtn = document.getElementById('publishBtn');
    publishBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
    publishBtn.onclick = function() { updateNews(newsId); };
  }
}

function updateNews(newsId) {
  // Обновление существующей новости
  const title = document.getElementById('publishTitle').value.trim();
  const content = document.getElementById('publishContent').value.trim();
  const category = document.getElementById('publishCategory').value;
  
  let news = getStoredNews();
  const index = news.findIndex(item => item.id === newsId);
  
  if (index !== -1) {
    news[index] = {
      ...news[index],
      title: title,
      content: content,
      category: category,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('ucheba_news', JSON.stringify(news));
    showNotification('Новость обновлена!', 'success');
    closePublishModal();
    loadNews();
  }
}

function deleteNews(newsId) {
  if (confirm('Вы уверены, что хотите удалить эту новость?')) {
    let news = getStoredNews();
    news = news.filter(item => item.id !== newsId);
    localStorage.setItem('ucheba_news', JSON.stringify(news));
    showNotification('Новость удалена', 'success');
    loadNews();
  }
}

function togglePinNews(newsId) {
  let news = getStoredNews();
  const index = news.findIndex(item => item.id === newsId);
  
  if (index !== -1) {
    // Снимаем закрепление со всех новостей
    news = news.map(item => ({...item, isPinned: false}));
    // Закрепляем выбранную (если она еще не была закреплена)
    news[index].isPinned = !news[index].isPinned;
    
    localStorage.setItem('ucheba_news', JSON.stringify(news));
    showNotification(news[index].isPinned ? 'Новость закреплена' : 'Новость откреплена', 'success');
    loadNews();
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  initPublishingSystem();
  
  // Закрытие модального окна при клике на фон
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('publishModal');
    if (modal && e.target === modal) {
      closePublishModal();
    }
  });
});