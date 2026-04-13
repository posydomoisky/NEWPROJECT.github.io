// vk_publisher_simple.js – публикация новостей в группу ВКонтакте

// Конфигурация (замените на свои данные, если нужно)
const VK_CONFIG = {
    groupId: 233570764,                     // ID вашего сообщества
    accessToken: 'vk1.a.IK8gSaWVCL-PEv_PLybMVyV5ujgQSoVZUlJPsWnc_dJ758RdB1i9BbAWw0PQy8Rrvax_JATUVm7cQrXHPRRxFSSzf_TIJWQxp2fh1PuqwfSARSw6G9AlOy28Xd_GQ3c9k6TiJwwbhqv3qJ7fdxfjLmE_ycRQvummkUAgsITLuVut0gxXDbjSz_zfomb5sBFUkeKmdg2uX4SbGD5I4I8zbQ',
    apiVersion: '5.199'
};

// Глобальные переменные для работы с изображениями (упрощённо)
let selectedImages = [];

// Инициализация при загрузке страницы
function initVKPublisher() {
    const dropZone = document.getElementById('vkDropZone');
    const fileInput = document.getElementById('vkImageUpload');
    
    if (!dropZone || !fileInput) return;
    
    // Обработка выбора файлов через input
    fileInput.addEventListener('change', (e) => handleImageSelect(e.target.files));
    
    // Drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        handleImageSelect(files);
    });
    
    // Счётчик символов
    const textarea = document.getElementById('vkPostText');
    const charCounter = document.getElementById('charCounter');
    if (textarea && charCounter) {
        textarea.addEventListener('input', () => {
            charCounter.textContent = `${textarea.value.length}/4096`;
        });
    }
}

// Обработка выбранных изображений (до 10 шт.)
function handleImageSelect(files) {
    const maxFiles = 10;
    let newImages = [...selectedImages];
    
    for (let i = 0; i < Math.min(files.length, maxFiles - newImages.length); i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
            newImages.push({
                file: file,
                preview: e.target.result
            });
            updateImagePreview(newImages);
            selectedImages = newImages;
        };
        reader.readAsDataURL(file);
    }
    
    if (newImages.length >= maxFiles) {
        alert('Можно загрузить не более 10 изображений');
    }
}

// Обновление превью изображений
function updateImagePreview(images) {
    const previewContainer = document.getElementById('vkImagePreview');
    if (!previewContainer) return;
    
    if (images.length === 0) {
        previewContainer.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Нажмите для загрузки изображений или перетащите их сюда</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="preview-grid">';
    images.forEach((img, idx) => {
        html += `
            <div class="preview-item">
                <img src="${img.preview}" alt="preview">
                <button class="remove-image" onclick="removeImage(${idx})">&times;</button>
            </div>
        `;
    });
    html += '</div>';
    previewContainer.innerHTML = html;
}

// Удаление изображения из списка
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview(selectedImages);
}

// Очистка формы
function clearVKForm() {
    document.getElementById('vkPostText').value = '';
    selectedImages = [];
    updateImagePreview([]);
    document.getElementById('charCounter').textContent = '0/4096';
}

// Основная функция публикации в VK
async function publishToVK() {
    const text = document.getElementById('vkPostText').value.trim();
    if (!text) {
        alert('Введите текст новости');
        return;
    }
    
    const publishBtn = document.querySelector('#vkPublishModal .btn-primary');
    const originalText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Публикация...';
    publishBtn.disabled = true;
    
    try {
        let attachmentString = '';
        
        // Если есть изображения – загружаем их на сервер VK
        if (selectedImages.length > 0) {
            // Шаг 1: получаем адрес для загрузки фото на стену
            const uploadUrl = await getWallUploadServer();
            if (!uploadUrl) throw new Error('Не удалось получить сервер загрузки');
            
            // Шаг 2: загружаем файлы
            const uploadedPhotos = await uploadPhotosToWall(uploadUrl, selectedImages);
            
            // Шаг 3: сохраняем фото в альбоме сообщества
            const savedPhotos = await saveWallPhoto(uploadedPhotos);
            
            // Формируем attachment: photo{owner_id}_{photo_id}
            attachmentString = savedPhotos.map(p => `photo${p.owner_id}_${p.id}`).join(',');
        }
        
        // Шаг 4: публикуем пост
        const postResult = await postToWall(text, attachmentString);
        
        if (postResult && postResult.post_id) {
            // Сохраняем новость в localStorage для отображения на сайте
            saveNewsToLocal(text);
            
            alert('✅ Новость успешно опубликована в группе VK!');
            closeVKPublishModal();
            clearVKForm();
            // Обновляем ленту новостей на главной
            if (typeof loadVKNews === 'function') loadVKNews();
        } else {
            throw new Error('Не удалось опубликовать пост');
        }
    } catch (error) {
        console.error('Ошибка публикации:', error);
        alert(`❌ Ошибка: ${error.message || 'Не удалось опубликовать новость'}`);
    } finally {
        publishBtn.innerHTML = originalText;
        publishBtn.disabled = false;
    }
}

// Получение сервера для загрузки фото на стену
async function getWallUploadServer() {
    const url = `https://api.vk.com/method/photos.getWallUploadServer?group_id=${VK_CONFIG.groupId}&access_token=${VK_CONFIG.accessToken}&v=${VK_CONFIG.apiVersion}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error.error_msg);
    return data.response.upload_url;
}

// Загрузка фото на полученный сервер
async function uploadPhotosToWall(uploadUrl, images) {
    const formData = new FormData();
    // VK API принимает несколько файлов с ключом 'file' + индекс (file0, file1...)
    images.forEach((img, idx) => {
        formData.append(`file${idx}`, img.file);
    });
    
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result; // содержит поле "photo" с JSON-строкой
}

// Сохранение загруженного фото на стене сообщества
async function saveWallPhoto(uploadResult) {
    const photoData = JSON.parse(uploadResult.photo);
    const url = `https://api.vk.com/method/photos.saveWallPhoto?group_id=${VK_CONFIG.groupId}&photo=${encodeURIComponent(photoData.photo)}&server=${photoData.server}&hash=${photoData.hash}&access_token=${VK_CONFIG.accessToken}&v=${VK_CONFIG.apiVersion}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error.error_msg);
    return data.response; // массив сохранённых фото
}

// Публикация поста на стене сообщества
async function postToWall(message, attachments = '') {
    let url = `https://api.vk.com/method/wall.post?owner_id=-${VK_CONFIG.groupId}&from_group=1&message=${encodeURIComponent(message)}&access_token=${VK_CONFIG.accessToken}&v=${VK_CONFIG.apiVersion}`;
    if (attachments) {
        url += `&attachments=${encodeURIComponent(attachments)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error.error_msg);
    return data.response;
}

// Сохранение новости в localStorage для отображения на сайте
function saveNewsToLocal(text) {
    const news = JSON.parse(localStorage.getItem('ucheba_vk_news')) || [];
    const newItem = {
        id: Date.now(),
        text: text,
        date: 'только что',
        fromVK: true,
        vkLink: `https://vk.com/public${VK_CONFIG.groupId}?w=wall-${VK_CONFIG.groupId}_${Date.now()}`
    };
    news.unshift(newItem); // новая новость в начало
    // оставляем не более 50 записей
    if (news.length > 50) news.pop();
    localStorage.setItem('ucheba_vk_news', JSON.stringify(news));
}

// Экспорт функций для глобального доступа (для вызова из HTML)
window.initVKPublisher = initVKPublisher;
window.publishToVK = publishToVK;
window.clearVKForm = clearVKForm;
window.removeImage = removeImage;
window.closeVKPublishModal = function() {
    document.getElementById('vkPublishModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};
window.openVKPublishModal = function() {
    document.getElementById('vkPublishModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
