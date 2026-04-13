// Создание демо-новостей при первом запуске
function initDemoNews() {
  if (!localStorage.getItem('ucheba_news')) {
    const demoNews = [
      {
        id: 1,
        title: 'Добро пожаловать на УчебаВместе!',
        content: 'Мы рады представить вам нашу обновленную платформу для онлайн-обучения. Здесь вы найдете лучших репетиторов и сможете достичь своих учебных целей.',
        category: 'general',
        author: 'Администратор',
        authorId: 1,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 дня назад
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        likes: 15,
        comments: 3,
        views: 120,
        isPinned: true,
        isPublished: true
      },
      {
        id: 2,
        title: 'Новые репетиторы по математике',
        content: 'К нам присоединились опытные преподаватели по высшей математике. Теперь доступна подготовка к экзаменам любого уровня сложности.',
        category: 'tutors',
        author: 'Администратор',
        authorId: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 8,
        comments: 1,
        views: 85,
        isPinned: false,
        isPublished: true
      },
      {
        id: 3,
        title: 'Советы по подготовке к ЕГЭ',
        content: 'Эксперты делятся полезными рекомендациями по эффективной подготовке к экзаменам. Читайте в нашем блоге советы по тайм-менеджменту и техникам запоминания.',
        category: 'tips',
        author: 'Администратор',
        authorId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 5,
        comments: 0,
        views: 42,
        isPinned: false,
        isPublished: true
      }
    ];
    
    localStorage.setItem('ucheba_news', JSON.stringify(demoNews));
  }
}

// Вызов функции инициализации новостей
initDemoNews();