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
    
    // Текущий пользователь
    let currentUser = null;
    let currentChatId = 'general';
    
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
        support: []
    };
    
    // Автоматические ответы персонажей
    const characterResponses = [
        {
            trigger: ["привет", "здравствуй", "hi", "hello"],
            responses: [
                "Приветствую, охотник! Готов к новым заданиям?",
                "Привет! Чем могу помочь?",
                "Добро пожаловать в мир Нен!"
            ]
        },
        {
            trigger: ["задание", "квест", "миссия"],
            responses: [
                "Проверь вкладку 'Новости' для новых объявлений!",
                "У Гильдии всегда есть работа для опытных охотников.",
                "Сейчас нет особо важных миссий, но ты можешь проверить позже."
            ]
        },
        {
            trigger: ["нен", "аура", "сила"],
            responses: [
                "Помни: настоящая сила Нен идет от сердца!",
                "Твоя аура сегодня особенно сильна, продолжай тренировки!",
                "Нен - это отражение твоей души, используй его мудро."
            ]
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
                case 'news':
                    loadNews();
                    break;
                case 'support':
                    loadSupportTickets();
                    break;
            }
        });
    });
    
    // События поддержки
    createTicketBtn.addEventListener('click', createTicket);
    
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
                    author: "Гильдия Охотников"
                },
                {
                    id: 2,
                    title: "Новые правила Гильдии",
                    content: "Опубликованы обновленные правила для членов Гильдии Охотников.",
                    date: new Date(Date.now() - 86400000).toLocaleDateString('ru-RU'),
                    author: "Председатель Гильдии"
                }
            ];
            localStorage.setItem('news', JSON.stringify(news));
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
                    sender: "Система",
                    text: "Добро пожаловать в NenChat! Ваши сообщения защищены аурой Нен.",
                    time: new Date().toISOString(),
                    nenType: "enhancement"
                }
            ];
            chats.hunters = [
                {
                    sender: "Система",
                    text: "Этот чат только для охотников!",
                    time: new Date().toISOString(),
                    nenType: "emission"
                },
                {
                    sender: "Гон",
                    text: "Готов к новому квесту!",
                    time: new Date().toISOString(),
                    nenType: "enhancement"
                }
            ];
            chats.support = [
                {
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
            alert(`Добро пожаловать, ${user.username}!`);
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
        const username = prompt('Секретный идентификатор Мастера:');
        const password = prompt('Код доступа к силе Нен:');
        
        if (username === 'root' && password === 'root') {
            currentUser = {
                username: "Мастер Нен",
                role: ROLES.ADMIN,
                isRoot: true
            };
            
            currentUserSpan.textContent = "Мастер Нен";
            updateUserRoleBadge(ROLES.ADMIN);
            authScreen.classList.remove('active');
            mainScreen.classList.add('active');
            document.body.classList.add('root-user');
            
            // Показываем все вкладки для root
            updateTabsVisibility(ROLES.ADMIN);
            
            addSystemLog('auth', `Мастер Нен вошел в систему`);
            alert('Добро пожаловать, Мастер! Полный доступ к системе активирован.');
        } else {
            alert('Ошибка доступа! Неверные учетные данные Мастера.');
            addSystemLog('auth', `Неудачная попытка входа Мастера`);
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
            [ROLES.ADMIN]: 'Администратор'
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
        const chat = chats[chatId];
        chatMessages.innerHTML = '';
        
        chat.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', msg.sender === currentUser?.username ? 'sent' : 'received');
            
            const nenBadge = msg.nenType ? 
                `<span class="nen-badge ${msg.nenType}">${getNenTypeName(msg.nenType)}</span>` : '';
            
            messageDiv.innerHTML = `
                <div class="message-sender">${msg.sender} ${nenBadge}</div>
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Генерация ответа
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        for (const group of characterResponses) {
            for (const trigger of group.trigger) {
                if (lowerMsg.includes(trigger)) {
                    return {
                        text: group.responses[Math.floor(Math.random() * group.responses.length)],
                        nenType: "enhancement"
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
    
    // Отправить сообщение
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        // Добавляем сообщение пользователя
        const userMessage = {
            sender: currentUser.username,
            text,
            time: new Date().toISOString()
        };
        
        // Сохраняем в текущий чат
        chats[currentChatId].push(userMessage);
        localStorage.setItem('chats', JSON.stringify(chats));
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        messageDiv.innerHTML = `
            <div class="message-sender">${currentUser.username}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        messageInput.value = '';
        
        // Генерация ответа (только для общего чата)
        if (currentChatId === 'general') {
            setTimeout(() => {
                const response = generateResponse(text);
                const botMessage = {
                    sender: "Система",
                    text: response.text,
                    time: new Date().toISOString(),
                    nenType: response.nenType
                };
                
                chats[currentChatId].push(botMessage);
                localStorage.setItem('chats', JSON.stringify(chats));
                
                const responseDiv = document.createElement('div');
                responseDiv.classList.add('message', 'received');
                responseDiv.innerHTML = `
                    <div class="message-sender">Система <span class="nen-badge ${response.nenType}">${getNenTypeName(response.nenType)}</span></div>
                    <div class="message-text">${response.text}</div>
                    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                `;
                
                chatMessages.appendChild(responseDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
        
        addSystemLog('messages', `${currentUser.username} отправил сообщение в чат ${currentChatId}`);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Загрузка списка охотников
    function loadHuntersList() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        huntersList.innerHTML = '';
        
        users.forEach(user => {
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
                    <button class="hunter-action-btn" title="Написать сообщение"><i class="fas fa-envelope"></i></button>
                </div>
            `;
            huntersList.appendChild(hunterEl);
        });
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
                    <button class="hunter-action-btn" title="Написать сообщение"><i class="fas fa-envelope"></i></button>
                </div>
            `;
            huntersList.appendChild(hunterEl);
        });
    }
    
    // Загрузка новостей
    function loadNews() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        newsList.innerHTML = '';
        
        news.forEach(item => {
            const newsEl = document.createElement('div');
            newsEl.classList.add('news-item');
            newsEl.innerHTML = `
                <div class="news-header">
                    <h4 class="news-title">${item.title}</h4>
                    <div class="news-date">${item.date}</div>
                </div>
                <div class="news-content">${item.content}</div>
                <div class="news-footer">
                    <div class="news-author">Автор: ${item.author}</div>
                </div>
            `;
            newsList.appendChild(newsEl);
        });
    }
    
    // Загрузка тикетов поддержки
    function loadSupportTickets() {
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        supportTickets.innerHTML = '';
        
        tickets.forEach(ticket => {
            const ticketEl = document.createElement('div');
            ticketEl.classList.add('ticket-item', ticket.status);
            ticketEl.innerHTML = `
                <div class="ticket-header">
                    <h4 class="ticket-title">${ticket.title}</h4>
                    <div class="ticket-status ${ticket.status}">${ticket.status === 'open' ? 'Открыт' : 'Закрыт'}</div>
                </div>
                <div class="ticket-content">${ticket.content}</div>
                <div class="ticket-footer">
                    <div class="ticket-author">Автор: ${ticket.author}</div>
                    <div class="ticket-date">${new Date(ticket.date).toLocaleString()}</div>
                </div>
            `;
            supportTickets.appendChild(ticketEl);
        });
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
                    <button class="user-action-btn" title="Блокировать"><i class="fas fa-ban"></i></button>
                </div>
            `;
            usersList.appendChild(userEl);
            
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
        addSystemLog('admin', `Администратор добавил нового охотника: ${username}`);
    }
    
    // Блокировка пользователя
    function banUser() {
        const userId = prompt('Введите ID охотника для блокировки:');
        if (!userId) return;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id.toString() === userId);
        
        if (user) {
            if (confirm(`Вы уверены, что хотите заблокировать ${user.username}?`)) {
                // В реальной системе здесь была бы блокировка
                addSystemLog('admin', `Администратор заблокировал охотника: ${user.username}`);
                alert(`${user.username} заблокирован!`);
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
            addSystemLog('admin', `Администратор назначил роль ${getRoleName(role)} для ${user.username}`);
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

    // Обработчики для переключения чатов
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            // Убираем активный класс у всех
            document.querySelectorAll('.chat-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Добавляем активный класс текущему
            this.classList.add('active');
            
            // Загружаем чат
            const chatId = this.dataset.chat;
            document.getElementById('current-chat').textContent = 
                this.querySelector('.chat-name').textContent;
            
            loadChat(chatId);
        });
    });
});