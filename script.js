document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    const loginBtn = document.getElementById('login-btn');
    const rootLoginBtn = document.getElementById('root-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const currentUserSpan = document.getElementById('current-user');
    const updateText = document.getElementById('update-text');
    const updateTextMain = document.getElementById('update-text-main');
    const updateTitleInput = document.getElementById('update-title');
    const updateContentInput = document.getElementById('update-content');
    const saveUpdateBtn = document.getElementById('save-update-btn');
    const publishUpdateBtn = document.getElementById('publish-update-btn');
    const addUpdateBtn = document.getElementById('add-update-btn');
    const updatesList = document.getElementById('updates-list');
    const usersList = document.getElementById('users-list');
    const actionsList = document.getElementById('actions-list');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const refreshUsersBtn = document.getElementById('refresh-users-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    
    // Текущий пользователь
    let currentUser = null;
    
    // Инициализация данных
    initData();
    
    // События авторизации
    loginBtn.addEventListener('click', login);
    rootLoginBtn.addEventListener('click', rootLogin);
    logoutBtn.addEventListener('click', logout);
    
    // События обновлений
    saveUpdateBtn.addEventListener('click', saveUpdate);
    publishUpdateBtn.addEventListener('click', publishUpdate);
    addUpdateBtn.addEventListener('click', addNewUpdate);
    
    // События чата
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // События вкладок
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Скрыть все вкладки
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Убрать активный класс у всех кнопок
            tabBtns.forEach(b => {
                b.classList.remove('active');
            });
            
            // Показать выбранную вкладку
            document.getElementById(`${tab}-tab`).classList.add('active');
            btn.classList.add('active');
            
            // Обновить данные для вкладки
            if (tab === 'admin') {
                loadUsersList();
                loadActionsHistory();
                initStatsChart();
            }
        });
    });
    
    // События root-панели
    refreshUsersBtn.addEventListener('click', loadUsersList);
    addUserBtn.addEventListener('click', addNewUser);
    
    // Инициализация данных
    function initData() {
        // Обновление системы
        if (!localStorage.getItem('systemUpdate')) {
            localStorage.setItem('systemUpdate', 'Новая система Нен-шифрования активирована! Повышена безопасность чатов.');
        }
        
        updateText.textContent = localStorage.getItem('systemUpdate');
        updateTextMain.textContent = localStorage.getItem('systemUpdate');
        updateContentInput.value = localStorage.getItem('systemUpdate');
        
        // История обновлений
        if (!localStorage.getItem('updatesHistory')) {
            const history = [
                {
                    id: 1,
                    title: "Запуск NenChat",
                    content: "Мы рады представить вам мессенджер для настоящих охотников!",
                    version: "1.0.0",
                    priority: "high",
                    date: new Date().toLocaleDateString('ru-RU')
                }
            ];
            localStorage.setItem('updatesHistory', JSON.stringify(history));
        }
        
        // Пользователи
        if (!localStorage.getItem('users')) {
            const users = [
                { id: 1, username: 'Гон', avatar: 'G', isOnline: true },
                { id: 2, username: 'Киллуа', avatar: 'K', isOnline: true },
                { id: 3, username: 'Курапика', avatar: 'K', isOnline: false },
                { id: 4, username: 'Леорио', avatar: 'L', isOnline: true }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // История действий
        if (!localStorage.getItem('actionsHistory')) {
            const actions = [
                { id: 1, action: "Система запущена", timestamp: new Date().toISOString() }
            ];
            localStorage.setItem('actionsHistory', JSON.stringify(actions));
        }
        
        // Загрузить историю обновлений
        loadUpdatesHistory();
    }
    
    // Авторизация
    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username) {
            alert('Введите идентификатор охотника!');
            return;
        }
        
        // Для демо - любой пользователь
        currentUser = {
            username: username,
            isRoot: false
        };
        
        currentUserSpan.textContent = username;
        authScreen.classList.remove('active');
        mainScreen.classList.add('active');
        addAction(`Пользователь ${username} вошел в систему`);
    }
    
    // Root-авторизация
    function rootLogin() {
        const username = prompt('Секретный идентификатор Мастера:');
        const password = prompt('Код доступа к силе Нен:');
        
        if (username === 'root' && password === 'root') {
            currentUser = {
                username: "Мастер Нен",
                isRoot: true
            };
            
            currentUserSpan.textContent = "Мастер Нен";
            authScreen.classList.remove('active');
            mainScreen.classList.add('active');
            document.body.classList.add('root-user');
            addAction(`Мастер Нен вошел в систему`);
            alert('Добро пожаловать, Мастер! Полный доступ к системе активирован.');
        } else {
            alert('Ошибка доступа! Неверные учетные данные Мастера.');
        }
    }
    
    // Выход
    function logout() {
        addAction(`Пользователь ${currentUser.username} вышел из системы`);
        currentUser = null;
        document.body.classList.remove('root-user');
        authScreen.classList.add('active');
        mainScreen.classList.remove('active');
        usernameInput.value = '';
        passwordInput.value = '';
    }
    
    // Отправить сообщение
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        messageDiv.innerHTML = `
            <div class="message-sender">${currentUser.username}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        messageInput.value = '';
        
        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
        addAction(`${currentUser.username} отправил сообщение`);
    }
    
    // Сохранение обновления
    function saveUpdate() {
        const title = updateTitleInput.value.trim();
        const content = updateContentInput.value.trim();
        
        if (!title || !content) {
            alert('Заполните заголовок и описание обновления!');
            return;
        }
        
        localStorage.setItem('updateDraft', JSON.stringify({
            title,
            content
        }));
        
        addAction(`Мастер сохранил черновик обновления: ${title}`);
        alert('Свиток сохранен!');
    }
    
    // Публикация обновления
    function publishUpdate() {
        const title = updateTitleInput.value.trim();
        const content = updateContentInput.value.trim();
        const version = document.getElementById('update-version').value;
        const priority = document.getElementById('update-priority').value;
        
        if (!title || !content) {
            alert('Заполните заголовок и описание обновления!');
            return;
        }
        
        // Сохраняем как текущее обновление
        localStorage.setItem('systemUpdate', content);
        updateText.textContent = content;
        updateTextMain.textContent = content;
        
        // Добавляем в историю
        const history = JSON.parse(localStorage.getItem('updatesHistory')) || [];
        const newUpdate = {
            id: Date.now(),
            title,
            content,
            version,
            priority,
            date: new Date().toLocaleDateString('ru-RU')
        };
        history.unshift(newUpdate);
        localStorage.setItem('updatesHistory', JSON.stringify(history));
        
        // Обновляем список
        loadUpdatesHistory();
        addAction(`Мастер опубликовал обновление: ${title}`);
        alert('Свиток опубликован! Все охотники увидят его.');
    }
    
    // Добавление нового обновления
    function addNewUpdate() {
        updateTitleInput.value = 'Новое обновление системы';
        updateContentInput.value = 'Опишите здесь детали нового обновления...';
        document.getElementById('update-version').value = `1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`;
        alert('Готово к созданию нового свитка! Заполните детали и опубликуйте.');
        addAction('Мастер начал создание нового обновления');
    }
    
    // Загрузка истории обновлений
    function loadUpdatesHistory() {
        const history = JSON.parse(localStorage.getItem('updatesHistory')) || [];
        updatesList.innerHTML = '';
        
        history.forEach(update => {
            const priorityClass = update.priority === 'high' ? 'enhancement' : 
                                update.priority === 'medium' ? 'emission' : 'manipulation';
            
            const updateEl = document.createElement('div');
            updateEl.classList.add('update-item');
            updateEl.innerHTML = `
                <div class="update-header">
                    <div class="update-title">${update.title}</div>
                    <div class="update-date">${update.date}</div>
                </div>
                <div class="update-content-item">${update.content}</div>
                <div class="update-footer">
                    <span class="update-version">${update.version}</span>
                    <span class="nen-badge ${priorityClass}">${update.priority}</span>
                </div>
            `;
            updatesList.appendChild(updateEl);
        });
    }
    
    // Загрузка списка пользователей
    function loadUsersList() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.classList.add('user-item');
            userEl.innerHTML = `
                <div class="user-avatar">${user.avatar}</div>
                <div class="user-name">${user.username}</div>
                <div class="user-status">${user.isOnline ? '🟢 Онлайн' : '⚫ Офлайн'}</div>
                <div class="user-actions">
                    <button class="user-action-btn" title="Блокировать"><i class="fas fa-ban"></i></button>
                    <button class="user-action-btn" title="Отправить сообщение"><i class="fas fa-envelope"></i></button>
                </div>
            `;
            usersList.appendChild(userEl);
        });
    }
    
    // Добавление нового пользователя
    function addNewUser() {
        const username = prompt('Имя нового охотника:');
        if (!username) return;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const newUser = {
            id: Date.now(),
            username: username,
            avatar: username.charAt(0),
            isOnline: true
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsersList();
        addAction(`Мастер добавил нового охотника: ${username}`);
    }
    
    // Загрузка истории действий
    function loadActionsHistory() {
        const actions = JSON.parse(localStorage.getItem('actionsHistory')) || [];
        actionsList.innerHTML = '';
        
        actions.slice().reverse().forEach(action => {
            const actionEl = document.createElement('div');
            actionEl.classList.add('action-item');
            
            const actionType = action.action.includes('Мастер') ? 'crown' : 
                              action.action.includes('вошел') ? 'sign-in-alt' : 
                              action.action.includes('вышел') ? 'sign-out-alt' : 
                              action.action.includes('сообщение') ? 'comment' : 
                              action.action.includes('обновление') ? 'scroll' : 'info-circle';
            
            actionEl.innerHTML = `
                <div class="action-icon"><i class="fas fa-${actionType}"></i></div>
                <div class="action-info">
                    <div class="action-text">${action.action}</div>
                    <div class="action-time">${new Date(action.timestamp).toLocaleString()}</div>
                </div>
            `;
            actionsList.appendChild(actionEl);
        });
    }
    
    // Добавление действия в историю
    function addAction(actionText) {
        const actions = JSON.parse(localStorage.getItem('actionsHistory')) || [];
        actions.push({
            id: Date.now(),
            action: actionText,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('actionsHistory', JSON.stringify(actions));
    }
    
    // Инициализация графика статистики
    function initStatsChart() {
        const ctx = document.getElementById('system-stats-chart').getContext('2d');
        
        // Данные для демонстрации
        const data = {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Активные охотники',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: '#3a86ff',
                backgroundColor: 'rgba(58, 134, 255, 0.2)',
                tension: 0.4
            }, {
                label: 'Сообщения',
                data: [28, 48, 40, 19, 86, 27, 90],
                borderColor: '#fdb731',
                backgroundColor: 'rgba(253, 183, 49, 0.2)',
                tension: 0.4
            }]
        };
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e1dd'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e1dd'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#e0e1dd'
                        }
                    }
                }
            }
        });
    }
});