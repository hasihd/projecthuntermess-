document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const rootLoginBtn = document.getElementById('root-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const registerUsername = document.getElementById('register-username');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirm = document.getElementById('register-confirm');
    const currentUserSpan = document.getElementById('current-user');
    const userRoleBadge = document.getElementById('user-role-badge');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const huntersList = document.getElementById('hunters-list');
    const newsList = document.getElementById('news-list');
    const announcementsList = document.getElementById('announcements-list');
    const supportTickets = document.getElementById('support-tickets');
    const createTicketBtn = document.getElementById('create-ticket-btn');
    const ticketTitle = document.getElementById('ticket-title');
    const ticketContent = document.getElementById('ticket-content');
    const refreshUsersBtn = document.getElementById('refresh-users-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const banUserBtn = document.getElementById('ban-user-btn');
    const assignRoleBtn = document.getElementById('assign-role-btn');
    const roleUserSelect = document.getElementById('role-user-select');
    const roleSelect = document.getElementById('role-select');
    const refreshLogsBtn = document.getElementById('refresh-logs-btn');
    const logType = document.getElementById('log-type');
    const logsList = document.getElementById('logs-list');
    const hunterSearch = document.getElementById('hunter-search');
    const searchBtn = document.getElementById('search-btn');
    const huntersSearchInput = document.getElementById('hunters-search-input');
    const huntersSearchBtn = document.getElementById('hunters-search-btn');
    const updateText = document.getElementById('update-text');
    const addNewsBtn = document.querySelector('.add-news-btn');
    const addAnnouncementBtn = document.querySelector('.add-announcement-btn');
    const clearChatBtn = document.querySelector('.clear-chat-btn');
    const newsModal = document.getElementById('news-modal');
    const newsTitleInput = document.getElementById('news-title');
    const newsContentInput = document.getElementById('news-content');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const ticketReplyModal = document.getElementById('ticket-reply-modal');
    const ticketReplyContent = document.getElementById('ticket-reply-content');
    const sendTicketReplyBtn = document.getElementById('send-ticket-reply');
    const ticketView = document.getElementById('ticket-view');
    const privateChatModal = document.getElementById('private-chat-modal');
    const privateChatUserSelect = document.getElementById('private-chat-user');
    const createPrivateChatBtn = document.getElementById('create-private-chat-btn');
    const privateChatsList = document.getElementById('private-chats-list');
    const usersList = document.getElementById('users-list');
    
    // Текущий пользователь
    let currentUser = null;
    let currentChatId = 'general';
    let currentTicketId = null;
    
    // Роли пользователей
    const ROLES = {
        HUNTER: 'hunter',
        SUPPORT: 'support',
        ADMIN: 'admin'
    };
    
    // Цвета для ролей
    const ROLE_COLORS = {
        [ROLES.HUNTER]: '#3a86ff',
        [ROLES.SUPPORT]: '#4caf50',
        [ROLES.ADMIN]: '#ffc107'
    };
    
    // Хранилище чатов
    let chats = {
        general: [],
        hunters: [],
        support: [],
        private: {}
    };
    
    // Автоматические ответы персонажей
    const characterResponses = [
        {
            trigger: ["привет", "здравствуй", "hi", "hello"],
            responses: [
                "Приветствую, охотник! Готов к новым заданиям?",
                "Привет! Чем могу помочь?",
                "Добро пожаловать в мир Нен!"
            ],
            nenType: "enhancement"
        },
        {
            trigger: ["задание", "квест", "миссия"],
            responses: [
                "Проверь вкладку 'Новости' для новых объявлений!",
                "У Гильдии всегда есть работа для опытных охотников.",
                "Сейчас нет особо важных миссий, но ты можешь проверить позже."
            ],
            nenType: "emission"
        },
        {
            trigger: ["нен", "аура", "сила"],
            responses: [
                "Помни: настоящая сила Нен идет от сердца!",
                "Твоя аура сегодня особенно сильна, продолжай тренировки!",
                "Нен - это отражение твоей души, используй его мудро."
            ],
            nenType: "manipulation"
        }
    ];
    
    // Инициализация данных
    initData();
    
    // События авторизации
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);
    rootLoginBtn.addEventListener('click', rootLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Переключение между вкладками авторизации
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            authTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            loginForm.classList.toggle('active', tab === 'login');
            registerForm.classList.toggle('active', tab === 'register');
        });
    });
    
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
            switch(tab) {
                case 'admin':
                    loadUsersList();
                    loadSystemLogs();
                    initStatsChart();
                    break;
                case 'hunters':
                    loadHuntersList();
                    break;
                case 'forum':
                    loadNews();
                    loadAnnouncements();
                    break;
                case 'support':
                    loadSupportTickets();
                    break;
                case 'messenger':
                    loadPrivateChatsList();
                    break;
            }
        });
    });
    
    // События поддержки
    createTicketBtn.addEventListener('click', createTicket);
    sendTicketReplyBtn.addEventListener('click', sendTicketReply);
    
    // События root-панели
    refreshUsersBtn.addEventListener('click', loadUsersList);
    addUserBtn.addEventListener('click', addNewUser);
    banUserBtn.addEventListener('click', banUser);
    assignRoleBtn.addEventListener('click', assignRole);
    refreshLogsBtn.addEventListener('click', loadSystemLogs);
    
    // Поиск охотников
    searchBtn.addEventListener('click', searchHunters);
    hunterSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchHunters();
    });
    
    huntersSearchBtn.addEventListener('click', searchHuntersList);
    huntersSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchHuntersList();
    });
    
    // Управление новостями и анонсами
    addNewsBtn?.addEventListener('click', () => openNewsModal('news'));
    addAnnouncementBtn?.addEventListener('click', () => openNewsModal('announcement'));
    saveNewsBtn.addEventListener('click', saveNews);
    
    // Управление чатом
    clearChatBtn?.addEventListener('click', clearChat);
    
    // Модальные окна
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Обработчики для переключения чатов
    document.querySelector('.chat-list').addEventListener('click', function(e) {
        const chatItem = e.target.closest('.chat-item');
        if (chatItem) {
            // Убираем активный класс у всех
            document.querySelectorAll('.chat-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Добавляем активный класс текущему
            chatItem.classList.add('active');
            
            // Загружаем чат
            const chatId = chatItem.dataset.chat;
            document.getElementById('current-chat').textContent = 
                chatItem.querySelector('.chat-name').textContent;
            
            loadChat(chatId);
        }
    });
    
    // Личные чаты
    createPrivateChatBtn.addEventListener('click', createPrivateChat);
    
    // Инициализация данных
    function initData() {
        // Пользователи
        if (!localStorage.getItem('users')) {
            const users = [
                { id: 1, username: 'Гон', email: 'gon@hxh.com', password: 'hunter123', role: ROLES.HUNTER, isOnline: true },
                { id: 2, username: 'Киллуа', email: 'killua@hxh.com', password: 'hunter123', role: ROLES.HUNTER, isOnline: true },
                { id: 3, username: 'Курапика', email: 'kurapika@hxh.com', password: 'hunter123', role: ROLES.SUPPORT, isOnline: false },
                { id: 4, username: 'Леорио', email: 'leorio@hxh.com', password: 'hunter123', role: ROLES.ADMIN, isOnline: true }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Новости
        if (!localStorage.getItem('news')) {
            const news = [
                {
                    id: 1,
                    title: "Обновление системы Нен-шифрования",
                    content: "Мы рады сообщить о внедрении новой системы шифрования на основе ауры Нен!",
                    date: new Date().toLocaleDateString('ru-RU'),
                    author: "Созвездие",
                    type: "news"
                },
                {
                    id: 2,
                    title: "Новые правила Гильдии",
                    content: "Опубликованы обновленные правила для членов Гильдии Охотников.",
                    date: new Date(Date.now() - 86400000).toLocaleDateString('ru-RU'),
                    author: "Председатель Гильдии",
                    type: "news"
                }
            ];
            localStorage.setItem('news', JSON.stringify(news));
        }
        
        // Анонсы
        if (!localStorage.getItem('announcements')) {
            const announcements = [
                {
                    id: 1,
                    title: "Соревнование по Нен",
                    content: "В следующем месяце пройдет ежегодное соревнование по владению Нен!",
                    date: new Date().toLocaleDateString('ru-RU'),
                    author: "Созвездие",
                    type: "announcement"
                }
            ];
            localStorage.setItem('announcements', JSON.stringify(announcements));
        }
        
        // Тикеты поддержки
        if (!localStorage.getItem('tickets')) {
            const tickets = [
                {
                    id: 1,
                    title: "Проблема с входом",
                    content: "Не могу войти в систему, выдает ошибку аутентификации.",
                    status: "open",
                    author: "Гон",
                    date: new Date().toISOString(),
                    replies: []
                }
            ];
            localStorage.setItem('tickets', JSON.stringify(tickets));
        }
        
        // Логи системы
        if (!localStorage.getItem('systemLogs')) {
            const logs = [
                {
                    id: 1,
                    type: "system",
                    message: "Система запущена",
                    timestamp: new Date().toISOString()
                }
            ];
            localStorage.setItem('systemLogs', JSON.stringify(logs));
        }
        
        // Инициализация чатов
        if (!localStorage.getItem('chats')) {
            // Начальные сообщения для чатов
            chats.general = [
                {
                    id: Date.now().toString(),
                    sender: "Система",
                    text: "Добро пожаловать в NenChat! Ваши сообщения защищены аурой Нен.",
                    time: new Date().toISOString(),
                    nenType: "enhancement"
                }
            ];
            chats.hunters = [
                {
                    id: Date.now().toString(),
                    sender: "Система",
                    text: "Этот чат только для охотников!",
                    time: new Date().toISOString(),
                    nenType: "emission"
                },
                {
                    id: Date.now().toString(),
                    sender: "Гон",
                    text: "Готов к новому квесту!",
                    time: new Date().toISOString(),
                    nenType: "enhancement"
                }
            ];
            chats.support = [
                {
                    id: Date.now().toString(),
                    sender: "Система",
                    text: "Этот чат для обращения в техническую поддержку.",
                    time: new Date().toISOString(),
                    nenType: "manipulation"
                }
            ];
            localStorage.setItem('chats', JSON.stringify(chats));
        } else {
            chats = JSON.parse(localStorage.getItem('chats'));
        }
        
        // Загрузка активного чата
        loadChat(currentChatId);
    }
    
    // Авторизация
    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            alert('Введите идентификатор охотника и код Нен!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = {
                id: user.id,
                username: user.username,
                role: user.role,
                isRoot: false
            };
            
            currentUserSpan.textContent = user.username;
            updateUserRoleBadge(user.role);
            authScreen.classList.remove('active');
            mainScreen.classList.add('active');
            
            // Показываем/скрываем вкладки в зависимости от роли
            updateTabsVisibility(user.role);
            
            addSystemLog('auth', `Пользователь ${user.username} вошел в систему`);
            
            // Приветствие в зависимости от роли
            const greeting = user.role === ROLES.ADMIN ? 
                `Добро пожаловать, Созвездие ${user.username}!` :
                `Добро пожаловать, Охотник ${user.username}!`;
            alert(greeting);
        } else {
            alert('Ошибка входа! Неверные учетные данные.');
            addSystemLog('auth', `Неудачная попытка входа для пользователя ${username}`);
        }
    }
    
    // Регистрация
    function register() {
        const username = registerUsername.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();
        const confirm = registerConfirm.value.trim();
        
        if (!username || !email || !password || !confirm) {
            alert('Заполните все поля!');
            return;
        }
        
        if (password !== confirm) {
            alert('Коды Нен не совпадают!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.username === username)) {
            alert('Этот идентификатор охотника уже занят!');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            alert('Эта почта уже используется!');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            role: ROLES.HUNTER,
            isOnline: true
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Регистрация успешна! Теперь вы можете войти в систему.');
        addSystemLog('auth', `Зарегистрирован новый пользователь: ${username}`);
        
        // Переключаем на вкладку входа
        document.querySelector('.auth-tab-btn[data-tab="login"]').click();
        usernameInput.value = username;
        passwordInput.value = '';
    }
    
    // Root-авторизация
    function rootLogin() {
        const username = prompt('Секретный идентификатор Созвездия:');
        const password = prompt('Код доступа к силе Нен:');
        
        if (username === 'admin' && password === 'admin') {
            currentUser = {
                id: 999,
                username: "Созвездие",
                role: ROLES.ADMIN,
                isRoot: true
            };
            
            currentUserSpan.textContent = "Созвездие";
            updateUserRoleBadge(ROLES.ADMIN);
            authScreen.classList.remove('active');
            mainScreen.classList.add('active');
            document.body.classList.add('root-user');
            
            // Показываем все вкладки для root
            updateTabsVisibility(ROLES.ADMIN);
            
            addSystemLog('auth', `Созвездие вошло в систему`);
            alert('Добро пожаловать, Созвездие! Полный доступ к системе активирован.');
        } else {
            alert('Ошибка доступа! Неверные учетные данные Созвездия.');
            addSystemLog('auth', `Неудачная попытка входа Созвездия`);
        }
    }
    
    // Выход
    function logout() {
        addSystemLog('auth', `Пользователь ${currentUser.username} вышел из системы`);
        currentUser = null;
        document.body.classList.remove('root-user');
        authScreen.classList.add('active');
        mainScreen.classList.remove('active');
        usernameInput.value = '';
        passwordInput.value = '';
    }
    
    // Обновление бейджа роли
    function updateUserRoleBadge(role) {
        userRoleBadge.textContent = getRoleName(role);
        userRoleBadge.className = 'role-badge';
        userRoleBadge.classList.add(role);
        userRoleBadge.style.backgroundColor = ROLE_COLORS[role];
    }
    
    // Получение названия роли
    function getRoleName(role) {
        const names = {
            [ROLES.HUNTER]: 'Охотник',
            [ROLES.SUPPORT]: 'Поддержка',
            [ROLES.ADMIN]: 'Созвездие'
        };
        return names[role] || role;
    }
    
    // Обновление видимости вкладок в зависимости от роли
    function updateTabsVisibility(role) {
        // Скрыть все специальные вкладки
        document.querySelectorAll('.support-only, .admin-only').forEach(el => {
            el.style.display = 'none';
        });
        
        // Показать нужные вкладки
        if (role === ROLES.SUPPORT || role === ROLES.ADMIN) {
            document.querySelectorAll('.support-only').forEach(el => {
                el.style.display = 'flex';
            });
        }
        
        if (role === ROLES.ADMIN) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'flex';
            });
        }
    }
    
    // Загрузка чата
    function loadChat(chatId) {
        currentChatId = chatId;
        const chat = chatId.startsWith('private_') ? 
            (chats.private[chatId] || []) : 
            (chats[chatId] || []);
            
        chatMessages.innerHTML = '';
        
        chat.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', msg.sender === currentUser?.username ? 'sent' : 'received');
            
            const nenBadge = msg.nenType ? 
                `<span class="nen-badge ${msg.nenType}">${getNenTypeName(msg.nenType)}</span>` : '';
            
            const deleteBtn = (currentUser?.role === ROLES.ADMIN || currentUser?.isRoot) ? 
                `<button class="delete-message-btn" data-id="${msg.id}"><i class="fas fa-trash"></i></button>` : '';
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <div class="message-sender">${msg.sender} ${nenBadge}</div>
                    ${deleteBtn}
                </div>
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.delete-message-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMessage(btn.dataset.id);
            });
        });
        
        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Удаление сообщения
    function deleteMessage(messageId) {
        if (currentChatId.startsWith('private_')) {
            chats.private[currentChatId] = chats.private[currentChatId].filter(msg => msg.id !== messageId);
        } else {
            chats[currentChatId] = chats[currentChatId].filter(msg => msg.id !== messageId);
        }
        
        localStorage.setItem('chats', JSON.stringify(chats));
        loadChat(currentChatId);
        addSystemLog('admin', `${currentUser.username} удалил сообщение в чате ${currentChatId}`);
    }
    
    // Очистка чата
    function clearChat() {
        if (confirm('Вы уверены, что хотите очистить этот чат?')) {
            if (currentChatId.startsWith('private_')) {
                chats.private[currentChatId] = [];
            } else {
                chats[currentChatId] = [];
            }
            
            localStorage.setItem('chats', JSON.stringify(chats));
            loadChat(currentChatId);
            addSystemLog('admin', `${currentUser.username} очистил чат ${currentChatId}`);
        }
    }
    
    // Отправить сообщение
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        // Создаем уникальный ID для сообщения
        const messageId = Date.now().toString();
        
        // Добавляем сообщение пользователя
        const userMessage = {
            id: messageId,
            sender: currentUser.username,
            text,
            time: new Date().toISOString()
        };
        
        // Сохраняем в текущий чат
        if (currentChatId.startsWith('private_')) {
            if (!chats.private[currentChatId]) {
                chats.private[currentChatId] = [];
            }
            chats.private[currentChatId].push(userMessage);
        } else {
            chats[currentChatId].push(userMessage);
        }
        
        localStorage.setItem('chats', JSON.stringify(chats));
        
        loadChat(currentChatId);
        messageInput.value = '';
        
        // Генерация ответа (только для общего чата)
        if (currentChatId === 'general') {
            setTimeout(() => {
                const response = generateResponse(text);
                const botMessage = {
                    id: Date.now().toString(),
                    sender: "Система",
                    text: response.text,
                    time: new Date().toISOString(),
                    nenType: response.nenType
                };
                
                chats[currentChatId].push(botMessage);
                localStorage.setItem('chats', JSON.stringify(chats));
                loadChat(currentChatId);
            }, 1000);
        }
        
        addSystemLog('messages', `${currentUser.username} отправил сообщение в чат ${currentChatId}`);
    }
    
    // Генерация ответа
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        for (const group of characterResponses) {
            for (const trigger of group.trigger) {
                if (lowerMsg.includes(trigger)) {
                    return {
                        text: group.responses[Math.floor(Math.random() * group.responses.length)],
                        nenType: group.nenType
                    };
                }
            }
        }
        return {
            text: "Ваше сообщение было защищено аурой Нен и доставлено!",
            nenType: "emission"
        };
    }
    
    // Получение названия типа Нен
    function getNenTypeName(type) {
        const names = {
            enhancement: "Усиление",
            emission: "Излучение",
            manipulation: "Манипуляция"
        };
        return names[type] || type;
    }
    
    // Загрузка списка охотников
    function loadHuntersList() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        huntersList.innerHTML = '';
        privateChatUserSelect.innerHTML = '<option value="">Выберите охотника</option>';
        
        users.forEach(user => {
            if (user.id === currentUser?.id) return; // Пропускаем текущего пользователя
            
            const hunterEl = document.createElement('div');
            hunterEl.classList.add('hunter-item');
            hunterEl.innerHTML = `
                <div class="hunter-avatar">${user.username.charAt(0)}</div>
                <div class="hunter-info">
                    <div class="hunter-name">${user.username}</div>
                    <div class="hunter-role ${user.role}">${getRoleName(user.role)}</div>
                </div>
                <div class="hunter-status">${user.isOnline ? '🟢 Онлайн' : '⚫ Офлайн'}</div>
                <div class="hunter-actions">
                    <button class="hunter-action-btn start-chat-btn" data-user-id="${user.id}" title="Начать чат"><i class="fas fa-comment"></i></button>
                </div>
            `;
            huntersList.appendChild(hunterEl);
            
            // Добавляем в выпадающий список для личных чатов
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            privateChatUserSelect.appendChild(option);
        });
        
        // Добавляем обработчики для кнопок начала чата
        document.querySelectorAll('.start-chat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.id.toString() === userId);
                if (user) {
                    createPrivateChatWithUser(user);
                }
            });
        });
    }
    
    // Загрузка личных чатов
    function loadPrivateChatsList() {
        privateChatsList.innerHTML = '';
        
        if (!chats.private) chats.private = {};
        
        Object.keys(chats.private).forEach(chatId => {
            if (chatId.includes(currentUser.id)) {
                const userId = chatId.split('_').find(id => id !== currentUser.id.toString());
                const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.id.toString() === userId);
                
                if (user) {
                    const lastMessage = chats.private[chatId][chats.private[chatId].length - 1];
                    const chatEl = document.createElement('div');
                    chatEl.classList.add('chat-item');
                    chatEl.dataset.chat = chatId;
                    chatEl.innerHTML = `
                        <div class="chat-icon"><i class="fas fa-user"></i></div>
                        <div class="chat-info">
                            <div class="chat-name">${user.username}</div>
                            <div class="chat-preview">${lastMessage?.text || 'Нет сообщений'}</div>
                        </div>
                    `;
                    privateChatsList.appendChild(chatEl);
                }
            }
        });
    }
    
    // Создание личного чата
    function createPrivateChat() {
        const userId = privateChatUserSelect.value;
        if (!userId) {
            alert('Выберите охотника!');
            return;
        }
        
        const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.id.toString() === userId);
        if (user) {
            createPrivateChatWithUser(user);
            privateChatModal.style.display = 'none';
        }
    }
    
    // Создание личного чата с пользователем
    function createPrivateChatWithUser(user) {
        if (!currentUser || !currentUser.id) {
            alert('Ошибка: текущий пользователь не определен');
            return;
        }
        
        const chatId = `private_${Math.min(currentUser.id, user.id)}_${Math.max(currentUser.id, user.id)}`;
        
        if (!chats.private[chatId]) {
            chats.private[chatId] = [{
                id: Date.now().toString(),
                sender: "Система",
                text: `Личный чат между ${currentUser.username} и ${user.username}`,
                time: new Date().toISOString(),
                nenType: "manipulation"
            }];
            localStorage.setItem('chats', JSON.stringify(chats));
        }
        
        // Найти или создать элемент чата
        let chatItem = document.querySelector(`.chat-item[data-chat="${chatId}"]`);
        if (!chatItem) {
            chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.dataset.chat = chatId;
            chatItem.innerHTML = `
                <div class="chat-icon"><i class="fas fa-user"></i></div>
                <div class="chat-info">
                    <div class="chat-name">${user.username}</div>
                    <div class="chat-preview">Новый чат</div>
                </div>
            `;
            privateChatsList.appendChild(chatItem);
        }
        
        // Переключиться на чат
        document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
        chatItem.classList.add('active');
        document.getElementById('current-chat').textContent = user.username;
        currentChatId = chatId;
        loadChat(chatId);
    }
    
    // Поиск охотников
    function searchHunters() {
        const query = hunterSearch.value.trim().toLowerCase();
        if (!query) return;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const results = users.filter(u => 
            u.username.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        );
        
        if (results.length > 0) {
            let message = "Найденные охотники:\n";
            results.forEach(u => {
                message += `- ${u.username} (${u.isOnline ? 'Онлайн' : 'Офлайн'})\n`;
            });
            alert(message);
        } else {
            alert("Охотники не найдены!");
        }
    }
    
    // Поиск в списке охотников
    function searchHuntersList() {
        const query = huntersSearchInput.value.trim().toLowerCase();
        if (!query) {
            loadHuntersList();
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        huntersList.innerHTML = '';
        
        users.filter(u => 
            u.username.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        ).forEach(user => {
            if (user.id === currentUser?.id) return;
            
            const hunterEl = document.createElement('div');
            hunterEl.classList.add('hunter-item');
            hunterEl.innerHTML = `
                <div class="hunter-avatar">${user.username.charAt(0)}</div>
                <div class="hunter-info">
                    <div class="hunter-name">${user.username}</div>
                    <div class="hunter-role ${user.role}">${getRoleName(user.role)}</div>
                </div>
                <div class="hunter-status">${user.isOnline ? '🟢 Онлайн' : '⚫ Офлайн'}</div>
                <div class="hunter-actions">
                    <button class="hunter-action-btn start-chat-btn" data-user-id="${user.id}" title="Начать чат"><i class="fas fa-comment"></i></button>
                </div>
            `;
            huntersList.appendChild(hunterEl);
        });
        
        // Добавляем обработчики для кнопок начала чата
        document.querySelectorAll('.start-chat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.id.toString() === userId);
                if (user) {
                    createPrivateChatWithUser(user);
                }
            });
        });
    }
    
    // Загрузка новостей
    function loadNews() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        newsList.innerHTML = '';
        
        news.filter(item => item.type === 'news').forEach(item => {
            const newsEl = document.createElement('div');
            newsEl.classList.add('news-item');
            
            const deleteBtn = (currentUser?.role === ROLES.ADMIN || currentUser?.isRoot) ? 
                `<button class="delete-news-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>` : '';
            
            newsEl.innerHTML = `
                <div class="news-header">
                    <h4 class="news-title">${item.title}</h4>
                    <div class="news-actions">
                        <div class="news-date">${item.date}</div>
                        ${deleteBtn}
                    </div>
                </div>
                <div class="news-content">${item.content}</div>
                <div class="news-footer">
                    <div class="news-author">Автор: ${item.author}</div>
                </div>
            `;
            newsList.appendChild(newsEl);
        });
        
        // Добавляем обработчики для кнопок удаления новостей
        document.querySelectorAll('.delete-news-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteNews(btn.dataset.id);
            });
        });
    }
    
    // Загрузка анонсов
    function loadAnnouncements() {
        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        announcementsList.innerHTML = '';
        
        announcements.filter(item => item.type === 'announcement').forEach(item => {
            const announcementEl = document.createElement('div');
            announcementEl.classList.add('announcement-item');
            
            const deleteBtn = (currentUser?.role === ROLES.ADMIN || currentUser?.isRoot) ? 
                `<button class="delete-announcement-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>` : '';
            
            announcementEl.innerHTML = `
                <div class="announcement-header">
                    <h4 class="announcement-title">${item.title}</h4>
                    <div class="announcement-actions">
                        <div class="announcement-date">${item.date}</div>
                        ${deleteBtn}
                    </div>
                </div>
                <div class="announcement-content">${item.content}</div>
                <div class="announcement-footer">
                    <div class="announcement-author">Автор: ${item.author}</div>
                </div>
            `;
            announcementsList.appendChild(announcementEl);
        });
        
        // Добавляем обработчики для кнопок удаления анонсов
        document.querySelectorAll('.delete-announcement-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteAnnouncement(btn.dataset.id);
            });
        });
    }
    
    // Открытие модального окна для новостей/анонсов
    function openNewsModal(type) {
        newsModal.style.display = 'block';
        newsTitleInput.value = '';
        newsContentInput.value = '';
        
        if (type === 'news') {
            document.getElementById('modal-title').textContent = 'Добавить новость';
            saveNewsBtn.dataset.type = 'news';
        } else {
            document.getElementById('modal-title').textContent = 'Добавить анонс';
            saveNewsBtn.dataset.type = 'announcement';
        }
    }
    
    // Сохранение новости/анонса
    function saveNews() {
        const title = newsTitleInput.value.trim();
        const content = newsContentInput.value.trim();
        const type = saveNewsBtn.dataset.type;
        
        if (!title || !content) {
            alert('Заполните заголовок и содержание!');
            return;
        }
        
        if (type === 'news') {
            const news = JSON.parse(localStorage.getItem('news')) || [];
            const newItem = {
                id: Date.now(),
                title,
                content,
                date: new Date().toLocaleDateString('ru-RU'),
                author: currentUser.username,
                type: 'news'
            };
            news.push(newItem);
            localStorage.setItem('news', JSON.stringify(news));
            addSystemLog('admin', `${currentUser.username} добавил новость: ${title}`);
        } else {
            const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
            const newItem = {
                id: Date.now(),
                title,
                content,
                date: new Date().toLocaleDateString('ru-RU'),
                author: currentUser.username,
                type: 'announcement'
            };
            announcements.push(newItem);
            localStorage.setItem('announcements', JSON.stringify(announcements));
            addSystemLog('admin', `${currentUser.username} добавил анонс: ${title}`);
        }
        
        newsModal.style.display = 'none';
        loadNews();
        loadAnnouncements();
    }
    
    // Удаление новости
    function deleteNews(newsId) {
        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
            const news = JSON.parse(localStorage.getItem('news')) || [];
            const updatedNews = news.filter(item => item.id.toString() !== newsId);
            localStorage.setItem('news', JSON.stringify(updatedNews));
            loadNews();
            addSystemLog('admin', `${currentUser.username} удалил новость ID: ${newsId}`);
        }
    }
    
    // Удаление анонса
    function deleteAnnouncement(announcementId) {
        if (confirm('Вы уверены, что хотите удалить этот анонс?')) {
            const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
            const updatedAnnouncements = announcements.filter(item => item.id.toString() !== announcementId);
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
            loadAnnouncements();
            addSystemLog('admin', `${currentUser.username} удалил анонс ID: ${announcementId}`);
        }
    }
    
    // Загрузка тикетов поддержки
    function loadSupportTickets() {
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        supportTickets.innerHTML = '';
        
        tickets.forEach(ticket => {
            const ticketEl = document.createElement('div');
            ticketEl.classList.add('ticket-item', ticket.status);
            
            const replyBtn = (currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.SUPPORT) ? 
                `<button class="reply-ticket-btn" data-id="${ticket.id}"><i class="fas fa-reply"></i> Ответить</button>` : '';
            
            const closeBtn = (currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.SUPPORT) && ticket.status === 'open' ? 
                `<button class="close-ticket-btn" data-id="${ticket.id}"><i class="fas fa-lock"></i> Закрыть</button>` : '';
            
            ticketEl.innerHTML = `
                <div class="ticket-header">
                    <h4 class="ticket-title">${ticket.title}</h4>
                    <div class="ticket-status ${ticket.status}">${ticket.status === 'open' ? 'Открыт' : 'Закрыт'}</div>
                </div>
                <div class="ticket-content">${ticket.content}</div>
                <div class="ticket-footer">
                    <div class="ticket-meta">
                        <div class="ticket-author">Автор: ${ticket.author}</div>
                        <div class="ticket-date">${new Date(ticket.date).toLocaleString()}</div>
                    </div>
                    <div class="ticket-actions">
                        ${replyBtn}
                        ${closeBtn}
                    </div>
                </div>
                ${ticket.replies?.length > 0 ? `
                <div class="ticket-replies">
                    <h5>Ответы (${ticket.replies.length}):</h5>
                    ${ticket.replies.map(reply => `
                        <div class="ticket-reply">
                            <div class="reply-author">${reply.author}</div>
                            <div class="reply-content">${reply.content}</div>
                            <div class="reply-date">${new Date(reply.date).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            `;
            supportTickets.appendChild(ticketEl);
        });
        
        // Добавляем обработчики для кнопок ответа
        document.querySelectorAll('.reply-ticket-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ticketId = btn.dataset.id;
                openTicketReplyModal(ticketId);
            });
        });
        
        // Добавляем обработчики для кнопок закрытия
        document.querySelectorAll('.close-ticket-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ticketId = btn.dataset.id;
                closeTicket(ticketId);
            });
        });
    }
    
    // Открытие модального окна для ответа на тикет
    function openTicketReplyModal(ticketId) {
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const ticket = tickets.find(t => t.id.toString() === ticketId);
        
        if (ticket) {
            currentTicketId = ticketId;
            ticketView.innerHTML = `
                <h4>${ticket.title}</h4>
                <p>${ticket.content}</p>
                <div class="ticket-meta">
                    <span>Автор: ${ticket.author}</span>
                    <span>Дата: ${new Date(ticket.date).toLocaleString()}</span>
                </div>
                ${ticket.replies?.length > 0 ? `
                <div class="ticket-replies">
                    <h5>Ответы:</h5>
                    ${ticket.replies.map(reply => `
                        <div class="ticket-reply">
                            <div class="reply-author">${reply.author}</div>
                            <div class="reply-content">${reply.content}</div>
                            <div class="reply-date">${new Date(reply.date).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            `;
            ticketReplyContent.value = '';
            ticketReplyModal.style.display = 'block';
        }
    }
    
    // Создание тикета поддержки
    function createTicket() {
        const title = ticketTitle.value.trim();
        const content = ticketContent.value.trim();
        
        if (!title || !content) {
            alert('Заполните тему и описание проблемы!');
            return;
        }
        
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const newTicket = {
            id: Date.now(),
            title,
            content,
            status: "open",
            author: currentUser.username,
            date: new Date().toISOString(),
            replies: []
        };
        
        tickets.push(newTicket);
        localStorage.setItem('tickets', JSON.stringify(tickets));
        
        ticketTitle.value = '';
        ticketContent.value = '';
        
        loadSupportTickets();
        addSystemLog('support', `${currentUser.username} создал тикет: ${title}`);
        alert('Тикет успешно создан!');
    }
    
    // Ответ на тикет
    function sendTicketReply() {
        const content = ticketReplyContent.value.trim();
        
        if (!content) {
            alert('Введите текст ответа!');
            return;
        }
        
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const ticketIndex = tickets.findIndex(t => t.id.toString() === currentTicketId);
        
        if (ticketIndex !== -1) {
            if (!tickets[ticketIndex].replies) {
                tickets[ticketIndex].replies = [];
            }
            
            tickets[ticketIndex].replies.push({
                author: currentUser.username,
                content,
                date: new Date().toISOString()
            });
            
            localStorage.setItem('tickets', JSON.stringify(tickets));
            loadSupportTickets();
            ticketReplyModal.style.display = 'none';
            addSystemLog('support', `${currentUser.username} ответил на тикет ID: ${currentTicketId}`);
        }
    }
    
    // Закрытие тикета
    function closeTicket(ticketId) {
        if (confirm('Вы уверены, что хотите закрыть этот тикет?')) {
            const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
            const ticketIndex = tickets.findIndex(t => t.id.toString() === ticketId);
            
            if (ticketIndex !== -1) {
                tickets[ticketIndex].status = 'closed';
                localStorage.setItem('tickets', JSON.stringify(tickets));
                loadSupportTickets();
                addSystemLog('support', `${currentUser.username} закрыл тикет ID: ${ticketId}`);
            }
        }
    }
    
    // Загрузка списка пользователей для админки
    function loadUsersList() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        usersList.innerHTML = '';
        roleUserSelect.innerHTML = '<option value="">Выберите охотника</option>';
        
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.classList.add('user-item');
            userEl.innerHTML = `
                <div class="user-avatar">${user.username.charAt(0)}</div>
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-role ${user.role}">${getRoleName(user.role)}</div>
                </div>
                <div class="user-status">${user.isOnline ? '🟢 Онлайн' : '⚫ Офлайн'}</div>
                <div class="user-actions">
                    <button class="user-action-btn ban-btn" data-user-id="${user.id}" title="Заблокировать"><i class="fas fa-ban"></i></button>
                </div>
            `;
            usersList.appendChild(userEl);
            
            // Добавляем обработчик для кнопки блокировки
            userEl.querySelector('.ban-btn').addEventListener('click', () => {
                banUser(user.id);
            });
            
            // Добавляем в выпадающий список для назначения ролей
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            roleUserSelect.appendChild(option);
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
            email: `${username.toLowerCase()}@hxh.com`,
            password: 'hunter123',
            role: ROLES.HUNTER,
            isOnline: true
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsersList();
        addSystemLog('admin', `Созвездие добавило нового охотника: ${username}`);
        alert(`Охотник ${username} успешно добавлен!`);
    }
    
    // Блокировка пользователя
    function banUser(userId) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id.toString() === userId.toString());
        
        if (userIndex !== -1) {
            if (confirm(`Вы уверены, что хотите заблокировать ${users[userIndex].username}?`)) {
                users.splice(userIndex, 1);
                localStorage.setItem('users', JSON.stringify(users));
                loadUsersList();
                addSystemLog('admin', `Созвездие заблокировало охотника ID: ${userId}`);
                alert('Охотник заблокирован!');
            }
        } else {
            alert('Охотник не найден!');
        }
    }
    
    // Назначение роли
    function assignRole() {
        const userId = roleUserSelect.value;
        const role = roleSelect.value;
        
        if (!userId) {
            alert('Выберите охотника!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id.toString() === userId);
        
        if (user) {
            user.role = role;
            localStorage.setItem('users', JSON.stringify(users));
            loadUsersList();
            addSystemLog('admin', `Созвездие назначило роль ${getRoleName(role)} для ${user.username}`);
            alert(`Роль успешно назначена!`);
        }
    }
    
    // Загрузка системных логов
    function loadSystemLogs() {
        const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
        const type = logType.value;
        logsList.innerHTML = '';
        
        const filteredLogs = type === 'all' ? logs : logs.filter(log => log.type === type);
        
        filteredLogs.slice().reverse().forEach(log => {
            const logEl = document.createElement('div');
            logEl.classList.add('log-item', log.type);
            logEl.innerHTML = `
                <div class="log-type ${log.type}">${getLogTypeName(log.type)}</div>
                <div class="log-message">${log.message}</div>
                <div class="log-time">${new Date(log.timestamp).toLocaleString()}</div>
            `;
            logsList.appendChild(logEl);
        });
    }
    
    // Получение названия типа лога
    function getLogTypeName(type) {
        const names = {
            'auth': 'Авторизация',
            'messages': 'Сообщения',
            'system': 'Система',
            'admin': 'Администрирование',
            'support': 'Поддержка'
        };
        return names[type] || type;
    }
    
    // Добавление системного лога
    function addSystemLog(type, message) {
        const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
        logs.push({
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('systemLogs', JSON.stringify(logs));
    }
    
    // Инициализация графика статистики
    function initStatsChart() {
        const ctx = document.getElementById('system-stats-chart').getContext('2d');
        
        // Удаляем предыдущий график, если он существует
        if (window.statsChart) {
            window.statsChart.destroy();
        }
        
        // Данные для демонстрации
        const data = {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Активные охотники',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: '#3a86ff',
                backgroundColor: 'rgba(58, 134, 255, 0.2)',
                tension: 0.4,
                fill: true
            }]
        };
        
        window.statsChart = new Chart(ctx, {
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