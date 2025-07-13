document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const rootLoginBtn = document.getElementById('root-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const newsFeed = document.getElementById('news-feed');
    const onlineList = document.getElementById('online-list');
    const addNewsBtn = document.getElementById('add-news-btn');
    const newsModal = document.getElementById('news-modal');
    const closeModal = document.querySelector('.close');
    const publishNewsBtn = document.getElementById('publish-news-btn');
    const newsText = document.getElementById('news-text');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const adminPanelBtn = document.querySelector('.admin-only');
    const usersList = document.getElementById('users-list');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const resetNewsBtn = document.getElementById('reset-news-btn');
    
    // Текущий пользователь
    let currentUser = null;
    
    // Инициализация данных
    initData();
    
    // События авторизации
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);
    rootLoginBtn.addEventListener('click', rootLogin);
    logoutBtn.addEventListener('click', logout);
    
    // События чата
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // События новостей
    addNewsBtn.addEventListener('click', () => {
        newsModal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', () => {
        newsModal.style.display = 'none';
    });
    
    publishNewsBtn.addEventListener('click', publishNews);
    
    // Переключение вкладок
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Скрыть все вкладки
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Убрать активный класс у всех кнопок
            tabBtns.forEach(b => {
                b.classList.remove('active');
            });
            
            // Показать выбранную вкладку
            document.getElementById(`${tab}-tab`).classList.add('active');
            btn.classList.add('active');
            
            // Обновить данные при переходе
            if (tab === 'online') updateOnlineList();
            if (tab === 'admin') updateAdminPanel();
        });
    });
    
    // Админ-панель
    clearChatBtn.addEventListener('click', clearChat);
    resetNewsBtn.addEventListener('click', resetNews);
    
    // Инициализация данных
    function initData() {
        // Пользователи
        if (!localStorage.getItem('users')) {
            const users = [
                { id: 1, username: 'root', password: 'root', isRoot: true, lastSeen: Date.now() },
                { id: 2, username: 'Андрей', password: '123', isRoot: false, lastSeen: Date.now() },
                { id: 3, username: 'Мария', password: '123', isRoot: false, lastSeen: Date.now() },
                { id: 4, username: 'Иван', password: '123', isRoot: false, lastSeen: Date.now() }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Сообщения
        if (!localStorage.getItem('messages')) {
            const messages = [
                { id: 1, sender: 'Андрей', text: 'Привет всем! Как дела?', timestamp: Date.now() - 3600000, isRoot: false },
                { id: 2, sender: 'Мария', text: 'Привет! Всё отлично, работаю над новым проектом.', timestamp: Date.now() - 3500000, isRoot: false },
                { id: 3, sender: 'Иван', text: 'У меня тоже всё хорошо. Кто будет на митапе?', timestamp: Date.now() - 3400000, isRoot: false },
                { id: 4, sender: 'root', text: 'Добро пожаловать в PingMe! Наслаждайтесь общением!', timestamp: Date.now() - 3300000, isRoot: true }
            ];
            localStorage.setItem('messages', JSON.stringify(messages));
        }
        
        // Новости
        if (!localStorage.getItem('news')) {
            const news = [
                { id: 1, author: 'root', text: 'Мы запустили новый мессенджер PingMe! Присоединяйтесь!', timestamp: Date.now() - 86400000, isRoot: true },
                { id: 2, author: 'Андрей', text: 'Создал группу для обсуждения новых технологий. Присоединяйтесь!', timestamp: Date.now() - 43200000, isRoot: false },
                { id: 3, author: 'Мария', text: 'Завтра проведу вебинар по веб-разработке. Будет интересно!', timestamp: Date.now() - 21600000, isRoot: false }
            ];
            localStorage.setItem('news', JSON.stringify(news));
        }
    }
    
    // Авторизация
    function login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            updateLastSeen();
            showMainScreen();
        } else {
            alert('Неверные данные');
        }
    }
    
    // Регистрация
    function register() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users.find(u => u.username === username)) {
            alert('Имя пользователя занято');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username,
            password,
            isRoot: false,
            lastSeen: Date.now()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        showMainScreen();
    }
    
    // Root вход
    function rootLogin() {
        const username = prompt('Введите root логин:');
        const password = prompt('Введите root пароль:');
        
        if (username === 'root' && password === 'root') {
            const users = JSON.parse(localStorage.getItem('users'));
            const rootUser = users.find(u => u.username === 'root');
            currentUser = rootUser;
            updateLastSeen();
            showMainScreen();
        } else {
            alert('Неверные root данные');
        }
    }
    
    // Выход
    function logout() {
        currentUser = null;
        authScreen.classList.add('active');
        mainScreen.classList.remove('active');
    }
    
    // Показать главный экран
    function showMainScreen() {
        authScreen.classList.remove('active');
        mainScreen.classList.add('active');
        
        currentUserSpan.textContent = currentUser.username;
        
        // Показать админ-панель для root
        if (currentUser.isRoot) {
            adminPanelBtn.style.display = 'flex';
        } else {
            adminPanelBtn.style.display = 'none';
        }
        
        // Загрузить данные
        loadChat();
        loadNews();
        updateOnlineList();
    }
    
    // Отправить сообщение
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        
        const newMessage = {
            id: Date.now(),
            sender: currentUser.username,
            text,
            timestamp: Date.now(),
            isRoot: currentUser.isRoot
        };
        
        messages.push(newMessage);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        messageInput.value = '';
        loadChat();
    }
    
    // Загрузить чат
    function loadChat() {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        chatMessages.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.classList.add(msg.sender === currentUser.username ? 'sent' : 'received');
            
            // Выделение root-пользователя
            if (msg.isRoot) {
                messageDiv.classList.add('root-user');
            }
            
            const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="sender">
                    ${msg.sender}
                    ${msg.isRoot ? '<span class="root-badge"><i class="fas fa-crown"></i> ROOT</span>' : ''}
                </div>
                <div class="text">${msg.text}</div>
                <div class="timestamp">${timestamp}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Загрузить новости
    function loadNews() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        newsFeed.innerHTML = '';
        
        news.sort((a, b) => b.timestamp - a.timestamp).forEach(item => {
            const date = new Date(item.timestamp).toLocaleString();
            
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            
            // Выделение root-пользователя
            if (item.isRoot) {
                newsItem.classList.add('root-user');
            }
            
            newsItem.innerHTML = `
                <div class="news-header-info">
                    <div class="user-avatar">${item.author.charAt(0)}</div>
                    <div>
                        <strong>${item.author}</strong>
                        ${item.isRoot ? '<span class="root-badge"><i class="fas fa-crown"></i> ROOT</span>' : ''}
                    </div>
                </div>
                <div class="news-content">${item.text}</div>
                <div class="news-footer">
                    <span>${date}</span>
                    <span><i class="fas fa-heart"></i> Нравится</span>
                </div>
            `;
            
            newsFeed.appendChild(newsItem);
        });
    }
    
    // Обновить список онлайн
    function updateOnlineList() {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Обновить время последней активности текущего пользователя
        if (currentUser) {
            users = users.map(user => {
                if (user.id === currentUser.id) {
                    return { ...user, lastSeen: Date.now() };
                }
                return user;
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        onlineList.innerHTML = '';
        
        users.forEach(user => {
            // Пользователь онлайн, если был активен в последние 5 минут
            const isOnline = (Date.now() - user.lastSeen) < 300000;
            
            if (isOnline) {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                
                // Выделение root-пользователя
                if (user.isRoot) {
                    userItem.classList.add('root-user');
                }
                
                userItem.innerHTML = `
                    <div class="user-avatar">${user.username.charAt(0)}</div>
                    <div>
                        <strong>${user.username}</strong>
                        ${user.isRoot ? '<span class="root-badge"><i class="fas fa-crown"></i> ROOT</span>' : ''}
                    </div>
                    <div class="status-indicator online"></div>
                `;
                
                onlineList.appendChild(userItem);
            }
        });
    }
    
    // Опубликовать новость
    function publishNews() {
        const text = newsText.value.trim();
        if (!text) return;
        
        const news = JSON.parse(localStorage.getItem('news')) || [];
        
        const newItem = {
            id: Date.now(),
            author: currentUser.username,
            text,
            timestamp: Date.now(),
            isRoot: currentUser.isRoot
        };
        
        news.push(newItem);
        localStorage.setItem('news', JSON.stringify(news));
        
        newsText.value = '';
        newsModal.style.display = 'none';
        loadNews();
    }
    
    // Обновить время последней активности
    function updateLastSeen() {
        if (!currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const updatedUsers = users.map(user => {
            if (user.id === currentUser.id) {
                return { ...user, lastSeen: Date.now() };
            }
            return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        currentUser.lastSeen = Date.now();
    }
    
    // Обновить админ-панель
    function updateAdminPanel() {
        if (!currentUser || !currentUser.isRoot) return;
        
        const users = JSON.parse(localStorage.getItem('users'));
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.classList.add('admin-user');
            
            if (user.isRoot) {
                userEl.classList.add('root-user');
            }
            
            userEl.innerHTML = `
                <div>
                    <strong>${user.username}</strong>
                    ${user.isRoot ? '<span>(ROOT)</span>' : ''}
                </div>
                <div>${new Date(user.lastSeen).toLocaleString()}</div>
            `;
            
            usersList.appendChild(userEl);
        });
    }
    
    // Очистить чат
    function clearChat() {
        if (confirm('Вы уверены, что хотите очистить общий чат?')) {
            localStorage.setItem('messages', JSON.stringify([]));
            loadChat();
        }
    }
    
    // Сбросить новости
    function resetNews() {
        if (confirm('Вы уверены, что хотите сбросить все новости?')) {
            localStorage.setItem('news', JSON.stringify([]));
            loadNews();
        }
    }
    
    // Периодическое обновление
    setInterval(() => {
        if (currentUser) {
            updateLastSeen();
            
            // Обновлять онлайн-список, если открыта вкладка
            const onlineTab = document.getElementById('online-tab');
            if (onlineTab.classList.contains('active')) {
                updateOnlineList();
            }
        }
    }, 60000); // Каждую минуту
});