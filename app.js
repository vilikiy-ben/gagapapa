// SubsViewer - мини-приложение для Telegram
// Инициализация Telegram Mini App

// Глобальная переменная для хранения ID пользователя
let currentUserId = null;

// Функция для принудительного применения стилей на мобильных устройствах
// Глобальная функция для использования во всем приложении
function forceMobileStyles() {
  // Определяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Обрабатываем все иконки вкладок для обеспечения единообразия
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.classList.contains('active');
      const svg = btn.querySelector('svg');
      
      if (svg) {
        // Устанавливаем одинаковые стили для всех SVG
        svg.style.fill = 'none';
        svg.setAttribute('fill', 'none');
        svg.style.stroke = 'currentColor';
        svg.style.color = 'currentColor';
        svg.setAttribute('stroke-width', '1.5');
        
        // Обрабатываем все дочерние элементы SVG
        const elements = svg.querySelectorAll('*');
        elements.forEach(el => {
          el.style.fill = 'none';
          el.setAttribute('fill', 'none');
          el.style.stroke = 'currentColor';
          el.style.color = 'currentColor';
          
          // Принудительно устанавливаем атрибуты
          if (el.hasAttribute('stroke')) {
            el.setAttribute('stroke', 'currentColor');
          }
          if (!el.hasAttribute('stroke-width')) {
            el.setAttribute('stroke-width', '1.5');
          }
        });
      }
    });
  }
}

// Эмуляция Telegram WebApp API для локальной разработки
if (!window.Telegram && window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Запущена локальная эмуляция Telegram WebApp API');
  window.Telegram = {
    WebApp: {
      initData: '',
      initDataUnsafe: {
        user: {
          id: 12345,
          first_name: 'Тестовый',
          last_name: 'Пользователь',
          username: 'test_user',
          language_code: 'ru'
        },
        query_id: '',
        auth_date: new Date().getTime() / 1000,
        hash: ''
      },
      colorScheme: 'dark',
      themeParams: {
        bg_color: '#1c1c1c',
        text_color: '#ffffff',
        hint_color: '#999999',
        link_color: '#4a90e2',
        button_color: '#4a90e2',
        button_text_color: '#ffffff'
      },
      isExpanded: true,
      expand: function() {
        console.log('Telegram.WebApp.expand() вызван');
        this.isExpanded = true;
      },
      close: function() {
        console.log('Telegram.WebApp.close() вызван');
      },
      ready: function() {
        console.log('Telegram.WebApp.ready() вызван');
      },
      showAlert: function(message) {
        alert(message);
      },
      showConfirm: function(message) {
        return confirm(message);
      },
      MainButton: {
        text: '',
        isVisible: false,
        isActive: true,
        setText: function(text) {
          this.text = text;
        },
        show: function() {
          this.isVisible = true;
        },
        hide: function() {
          this.isVisible = false;
        },
        enable: function() {
          this.isActive = true;
        },
        disable: function() {
          this.isActive = false;
        }
      }
    }
  };
  
  // Добавляем индикатор локального режима
  const addLocalModeBadge = () => {
    const badge = document.createElement('div');
    badge.className = 'local-mode-badge';
    badge.textContent = 'Локальный режим';
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.backgroundColor = '#ff9800';
    badge.style.color = 'black';
    badge.style.padding = '5px 10px';
    badge.style.borderRadius = '5px';
    badge.style.fontSize = '12px';
    badge.style.zIndex = '9999';
    document.body.appendChild(badge);
  };
  
  window.addEventListener('DOMContentLoaded', addLocalModeBadge);
}

let tg = window.Telegram?.WebApp;

// Немедленное исправление стилей для иконки главной вкладки
(function() {
  // Исправляем стили для всех иконок вкладок
  const fixTabIcons = () => {
    // Общая функция для исправления SVG иконок
    const fixSvgIcon = (btn) => {
      const svg = btn.querySelector('svg');
      if (svg) {
        // Устанавливаем единые атрибуты для SVG
        svg.style.fill = 'none';
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.5');
        
        // Унифицируем стили для всех элементов внутри SVG
        const allElements = svg.querySelectorAll('*');
        allElements.forEach(el => {
          el.style.fill = 'none';
          el.setAttribute('fill', 'none');
          
          if (el.tagName === 'path' || el.tagName === 'rect' || el.tagName === 'circle' || el.tagName === 'line') {
            const isActive = btn.classList.contains('active');
            el.style.stroke = 'currentColor';
            el.setAttribute('stroke', 'currentColor');
            el.setAttribute('stroke-width', '1.5');
            
            // Добавляем атрибуты для улучшения внешнего вида
            if (!el.hasAttribute('stroke-linecap')) {
              el.setAttribute('stroke-linecap', 'round');
            }
            if (!el.hasAttribute('stroke-linejoin') && el.tagName === 'path') {
              el.setAttribute('stroke-linejoin', 'round');
            }
          }
        });
      }
    };
    
    // Применяем исправления ко всем вкладкам
    document.querySelectorAll('.tab-btn').forEach(fixSvgIcon);
  };
  
  // Исправляем стили сразу
  fixTabIcons();
  
  // Добавляем обработчик события для переключения вкладок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Даем немного времени на смену классов активности
      setTimeout(fixTabIcons, 10);
    });
  });
})();

if (tg) {
  tg.expand();
  document.body.classList.add('telegram-app');
  
  // Используем фиксированные цвета приложения, а не цвета темы Telegram
  document.documentElement.style.setProperty('--primary-color', '#4a90e2'); // Значение из :root
  document.documentElement.style.setProperty('--text-color', '#e0e0e0');    // Значение из :root
  document.documentElement.style.setProperty('--dark-bg', '#0d0d0d');       // Значение из :root
  
  // Вызываем функцию принудительного применения стилей
  forceMobileStyles();
  
  // Добавляем наблюдателя за изменениями DOM
  const observer = new MutationObserver(() => {
    forceMobileStyles();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Основные переменные приложения
let subscriptions = [];
let selectedDate = new Date();
const DEFAULT_SUBSCRIPTION_COLOR = '#383838';

// Инициализация переменных для работы с иконками
let nameInput = null;
let searchDropdown = null;
let iconPreview = null;
let selectedIconUrl = null;
const API_TOKEN = "pk_f-SKNQU7TJWnou-__dux7A"; // Токен API logo.dev
const SEARCH_DELAY = 500; // Задержка поиска после ввода (мс)
let searchTimeout = null;

// Переменные для Trial-функционала
let trialCheckbox = null;
let priceInput = null;

// Добавим переменную для ключа API Brand Search
// Для Brand Search API требуется специальный секретный ключ, который начинается с 'sk_'
const BRAND_SEARCH_API_TOKEN = "sk_ZLMtq5JcR-Kiw28z9gh5VQ"; // Секретный ключ для Brand Search API

// DOM элементы
const subscriptionFormModal = document.getElementById('subscription-form-modal');
const subscriptionForm = document.getElementById('subscription-form');
const addSubscriptionBtn = document.getElementById('add-subscription-btn');
const closeFormBtn = document.getElementById('close-form-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const colorInput = document.getElementById('color');
const subscriptionsList = document.getElementById('subscriptions-list');
const monthlyTotalElement = document.getElementById('monthly-total');
const yearlyTotalElement = document.getElementById('yearly-total');
const allSubscriptionsTitle = document.getElementById('all-subscriptions-title');
const calendarContainer = document.getElementById('calendar-container');
const dailySubscriptions = document.getElementById('daily-subscriptions');
const emptySubscriptionsMessage = document.getElementById('empty-subscriptions-message');
const upcomingPayments = document.getElementById('upcoming-payments');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const formTitle = document.getElementById('form-title');
const formSubmitBtn = document.getElementById('form-submit-btn');
const subscriptionIdInput = document.getElementById('subscription-id');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// Режим формы - добавление или редактирование
let formMode = 'add';

// ID подписки, которую нужно удалить
let subscriptionToDeleteId = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
  if (window.Telegram && window.Telegram.WebApp) {
    // Настраиваем главную кнопку Telegram
    const mainButton = window.Telegram.WebApp.MainButton;
    mainButton.onClick(function() {
      // Обработка нажатия кнопки
    });
  }
  
  // Запускаем инициализацию приложения
  try {
    await initApp();
  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error.message);
  }
});

// Основная функция инициализации приложения
async function initApp() {
  console.log('Запуск initApp');
  
  try {
    // Загружаем данные из localStorage
    await loadSubscriptionsFromLocalStorage();
    
    // Сохраняем ID пользователя из Telegram (если доступен)
    if (window.Telegram && window.Telegram.WebApp.initDataUnsafe.user) {
      currentUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      console.log('Получены данные пользователя Telegram:', currentUserId);
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error.message);
    subscriptions = [];
  }
  
  // Инициализация элементов для работы с иконками
  nameInput = document.getElementById('name');
  searchDropdown = document.getElementById('search-dropdown');
  iconPreview = document.getElementById('icon-preview');
  trialCheckbox = document.getElementById('trial-checkbox');
  priceInput = document.getElementById('price');
  
  // Настраиваем обработчики событий
  setupEventListeners();
  
  // Рендерим календарь
  renderCalendar(new Date());
  
  // Обновляем UI
  updateUI();
  
  // Скрываем экран загрузки
  try {
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    } else {
      console.error('Элемент загрузки не найден');
    }
  } catch (error) {
    console.error('Ошибка при скрытии экрана загрузки:', error.message);
  }
  
  // Исправляем размер логотипа (временное решение для некоторых устройств)
  try {
    const logo = document.querySelector('.app-logo img');
    if (logo) {
      logo.style.width = '100%';
      logo.style.height = '100%';
    }
  } catch (error) {
    console.error('Ошибка при изменении размера логотипа', error.message);
  }
  
  // Принудительно исправляем стили для мобильных устройств
  forceMobileStyles();
  
  console.log('Инициализация приложения завершена');
}

// Функция для загрузки подписок из localStorage
async function loadSubscriptionsFromLocalStorage() {
  console.log('Загрузка подписок из localStorage');
  
  try {
    const storedData = localStorage.getItem('subscriptions');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        subscriptions = parsedData;
        console.log('Данные успешно загружены из localStorage', parsedData.length + ' подписок');
        
        // Преобразуем строковые даты в объекты Date
        subscriptions = parsedData.map(sub => {
          // Проверяем формат даты
          if (typeof sub.billingDate === 'string') {
            return {
              ...sub,
              billingDate: new Date(sub.billingDate)
            };
          }
          return sub;
        });
        
        console.log('Загружено из localStorage:', subscriptions);
      } catch (parseError) {
        console.error('Ошибка при парсинге данных из localStorage:', parseError);
        subscriptions = [];
      }
    } else {
      console.log('В localStorage нет данных о подписках');
      subscriptions = [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке подписок из localStorage:', error);
    subscriptions = [];
  }
}

// Функция для сохранения подписок в localStorage
async function saveSubscriptionsToLocalStorage() {
  console.log('Сохранение подписок в localStorage', subscriptions.length + ' подписок');
  
  try {
    // Подготавливаем данные для сохранения
    const dataToSave = subscriptions.map(sub => {
      // Если это объект с датой, преобразуем ее в строку
      if (sub.billingDate instanceof Date) {
        return {
          ...sub,
          // Оставляем дату как есть, JSON.stringify преобразует ее в строку
        };
      }
      return sub;
    });

    localStorage.setItem('subscriptions', JSON.stringify(dataToSave));
    console.log('Подписки сохранены в localStorage:', dataToSave);
    
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении подписок в localStorage:', error);
    return false;
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Открытие формы добавления подписки
  addSubscriptionBtn.addEventListener('click', () => {
    openSubscriptionForm();
  });
  
  // Закрытие формы
  closeFormBtn.addEventListener('click', () => {
    closeSubscriptionForm();
  });
  
  cancelFormBtn.addEventListener('click', () => {
    closeSubscriptionForm();
  });
  
  // Обработчик поиска иконок при вводе названия сервиса
  if (nameInput) {
    nameInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();
      
      if (query.length < 2) {
        searchDropdown.innerHTML = '';
        searchDropdown.classList.remove('active');
        return;
      }
      
      // Устанавливаем задержку для предотвращения слишком частых запросов
      searchTimeout = setTimeout(() => {
        searchAppIcons(query);
      }, SEARCH_DELAY);
    });
  }
  
  // Отправка формы
  subscriptionForm.addEventListener('submit', handleFormSubmit);
  
  // Обработчики для переключения периодичности (с принудительным применением стилей)
  document.getElementById('weekly').addEventListener('change', function() {
    if (this.checked && tg) {
      // Стили будут установлены через CSS
    }
  });
  
  document.getElementById('monthly').addEventListener('change', function() {
    if (this.checked && tg) {
      // Стили будут установлены через CSS
    }
  });
  
  document.getElementById('yearly').addEventListener('change', function() {
    if (this.checked && tg) {
      // Стили будут установлены через CSS
    }
  });
  
  // Закрытие формы при клике вне её содержимого
  subscriptionFormModal.addEventListener('click', (e) => {
    if (e.target === subscriptionFormModal) {
      closeSubscriptionForm();
    }
  });
  
  // Закрытие диалога подтверждения при клике вне его содержимого
  confirmDeleteModal.addEventListener('click', (e) => {
    if (e.target === confirmDeleteModal) {
      closeConfirmDeleteModal();
    }
  });
  
  // Кнопки диалога подтверждения удаления
  cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);
  confirmDeleteBtn.addEventListener('click', confirmDelete);
  
  // Навигация по табам
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Обработчик для кастомного меню сортировки
  const sortToggle = document.getElementById('sort-toggle');
  const sortDropdown = document.getElementById('sort-dropdown');
  const sortLabel = document.querySelector('.sort-label');
  const sortOptions = document.querySelectorAll('.sort-option');
  
  if (sortToggle) {
    // Показать/скрыть выпадающее меню
    sortToggle.addEventListener('click', (e) => {
      if (!e.target.closest('.sort-dropdown')) {
        sortDropdown.classList.toggle('active');
      }
    });
    
    // Клик вне меню скрывает его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-sort-toggle') && sortDropdown.classList.contains('active')) {
        sortDropdown.classList.remove('active');
      }
    });
    
    // Обработка выбора опции сортировки
    sortOptions.forEach(option => {
      option.addEventListener('click', () => {
        const sortType = option.dataset.sort;
        
        // Обновляем активную опцию
        sortOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Обновляем текст текущей сортировки
        sortLabel.textContent = option.textContent;
        
        // Закрываем меню
        sortDropdown.classList.remove('active');
        
        // Запускаем сортировку с выбранным типом
        renderAllSubscriptions(sortType);
      });
    });
  }
}

// Переключение между табами
function switchTab(tabId) {
  // Убираем активный класс со всех кнопок и табов
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabPanes.forEach(pane => pane.classList.remove('active'));
  
  // Добавляем активный класс к выбранной кнопке и табу
  const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const selectedPane = document.getElementById(tabId);
  
  if (selectedButton && selectedPane) {
    selectedButton.classList.add('active');
    selectedPane.classList.add('active');
  }
}

// Обновление интерфейса
function updateUI() {
  // Сбрасываем меню сортировки
  const sortOptions = document.querySelectorAll('.sort-option');
  const sortLabel = document.querySelector('.sort-label');
  
  if (sortOptions && sortLabel) {
    sortOptions.forEach(opt => opt.classList.remove('active'));
    sortLabel.textContent = 'Сортировка';
  }
  
  renderAllSubscriptions();
  renderUpcomingPayments();
  updateTotals();
  renderDailySubscriptions();
  renderCalendar(selectedDate);
}

// Рендеринг всех подписок
function renderAllSubscriptions(sortType = null) {
  subscriptionsList.innerHTML = '';
  
  if (subscriptions.length === 0) {
    emptySubscriptionsMessage.style.display = 'block';
  } else {
    emptySubscriptionsMessage.style.display = 'none';
    
    // Используем переданный тип сортировки или сортируем по умолчанию по ближайшей дате
    const currentSortType = sortType || 'nearest';
    
    // Сортировка подписок в зависимости от выбранного типа
    const sortedSubscriptions = [...subscriptions].sort((a, b) => {
      switch (currentSortType) {
        case 'nearest':
          // Ближайшие (от ближайшей даты к самой дальней)
          const dateA = getNextBillingDate(a.billingDate, a.isYearly, a.isWeekly);
          const dateB = getNextBillingDate(b.billingDate, b.isYearly, b.isWeekly);
          return dateA - dateB;
        case 'furthest':
          // Дальние (от самой дальней даты к самой ближайшей)
          const dateC = getNextBillingDate(a.billingDate, a.isYearly, a.isWeekly);
          const dateD = getNextBillingDate(b.billingDate, b.isYearly, b.isWeekly);
          return dateD - dateC;
        case 'cheapest':
          // Дешевые (от самой дешевой к самой дорогой)
          // Сначала показываем триальные подписки, затем сортируем по возрастанию цены
          if (a.isTrial && !b.isTrial) return -1;
          if (!a.isTrial && b.isTrial) return 1;
          return a.price - b.price;
        case 'expensive':
          // Дорогие (от самой дорогой к самой дешевой)
          // Последними показываем триальные подписки, сначала сортируем по убыванию цены
          if (a.isTrial && !b.isTrial) return 1;
          if (!a.isTrial && b.isTrial) return -1;
          return b.price - a.price;
        default:
          // По умолчанию сортируем по ближайшей дате
          const dateE = getNextBillingDate(a.billingDate, a.isYearly, a.isWeekly);
          const dateF = getNextBillingDate(b.billingDate, b.isYearly, b.isWeekly);
          return dateE - dateF;
      }
    });
    
    sortedSubscriptions.forEach(subscription => {
      const subscriptionElement = createSubscriptionCard(subscription);
      subscriptionsList.appendChild(subscriptionElement);
    });
  }
  
  // Обновляем заголовок с количеством подписок
  allSubscriptionsTitle.textContent = `Все подписки (${subscriptions.length})`;
}

// Создание карточки подписки
function createSubscriptionCard(subscription) {
  const subscriptionElement = document.createElement('div');
  subscriptionElement.className = 'subscription-card';
  
  const nextBillingDate = getNextBillingDate(subscription.billingDate, subscription.isYearly, subscription.isWeekly);
  const formattedDate = formatDate(nextBillingDate);
  
  // Получаем отформатированную цену или "Триал" для триальных подписок
  const formattedPrice = subscription.isTrial ? 'Триал' : formatCurrency(subscription.price);
  
  const period = formatSubscriptionPeriod(subscription);
  
  // Устанавливаем единый цвет для всех карточек
  subscriptionElement.style.setProperty('--sub-color', DEFAULT_SUBSCRIPTION_COLOR);
  
  // Генерируем HTML с поддержкой иконки
  let iconHtml = '';
  if (subscription.iconUrl) {
    // Проверяем, локальная ли это иконка
    if (subscription.iconUrl.startsWith('data:local,')) {
      try {
        // Парсим данные локальной иконки
        const iconDataStr = subscription.iconUrl.replace('data:local,', '');
        const iconData = JSON.parse(iconDataStr);
        
        // Создаем HTML для локальной иконки
        iconHtml = `
          <div class="subscription-icon local-icon" style="background-color: ${iconData.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            <span>${iconData.letter}</span>
          </div>
        `;
      } catch (e) {
        console.error('Ошибка при парсинге данных локальной иконки:', e);
        // Если не удалось распарсить, создаем стандартную иконку
        iconHtml = `
          <div class="subscription-icon local-icon" style="background-color: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            <span>${subscription.name.charAt(0).toUpperCase()}</span>
          </div>
        `;
      }
    } else {
      // Формируем URL для иконки с учетом того, содержит ли он уже параметры
      let optimizedIconUrl;
      if (subscription.iconUrl.includes('?')) {
        // URL уже содержит параметры, добавляем только размер и формат
        optimizedIconUrl = `${subscription.iconUrl}&format=png&size=64`;
      } else {
        // URL без параметров, добавляем токен, размер и формат
        optimizedIconUrl = `${subscription.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
      }
      
      iconHtml = `
        <div class="subscription-icon">
          <img src="${optimizedIconUrl}" alt="${subscription.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 24 24%22><rect width=%2224%22 height=%2224%22 fill=%22%233498db%22 rx=%224%22 /><text x=%2250%%22 y=%2250%%22 dy=%22.35em%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2214%22 font-weight=%22bold%22>${subscription.name.charAt(0).toUpperCase()}</text></svg>';">
        </div>
      `;
    }
  }
  
  // Формируем HTML для блока с ценой и периодом - разный для триальных и обычных подписок
  let priceHtml = '';
  if (subscription.isTrial) {
    priceHtml = `
      <div class="subscription-price-group">
        <span class="subscription-price trial-price">Триал</span>
      </div>
    `;
  } else {
    priceHtml = `
      <div class="subscription-price-group">
        <span class="subscription-price">${formattedPrice}</span>
        <span class="subscription-period">за ${period}</span>
      </div>
    `;
  }
  
  subscriptionElement.innerHTML = `
    <button class="subscription-delete" data-id="${subscription.id}">&times;</button>
    <div class="subscription-content">
      ${iconHtml}
      <div class="subscription-details">
        <div class="subscription-name">${subscription.name}</div>
        ${priceHtml}
      </div>
    </div>
    <div class="payment-date">
      <svg class="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${subscription.isTrial ? 'Закончится' : 'Оплата'} ${formattedDate}</span>
    </div>
  `;
  
  // Добавляем обработчик для удаления
  const deleteButton = subscriptionElement.querySelector('.subscription-delete');
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    showConfirmDeleteModal(subscription.id);
  });
  
  // Добавляем обработчик для редактирования при клике на карточку
  subscriptionElement.addEventListener('click', () => {
    openEditSubscriptionForm(subscription);
  });
  
  return subscriptionElement;
}

// Рендеринг предстоящих платежей
function renderUpcomingPayments() {
  // Очищаем контейнер
  upcomingPayments.innerHTML = '';
  
  if (subscriptions.length === 0) {
    upcomingPayments.innerHTML = '<div class="empty-list-message">Нет предстоящих платежей</div>';
    upcomingPayments.classList.remove('has-scroll');
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fourteenDaysFromNow = new Date(today);
  fourteenDaysFromNow.setDate(today.getDate() + 14);
  
  const upcomingPaymentsList = [];
  
  subscriptions.forEach(sub => {
    const nextPaymentDate = getNextBillingDate(sub.billingDate, sub.isYearly, sub.isWeekly);
    const normalizedNextPaymentDate = new Date(nextPaymentDate);
    normalizedNextPaymentDate.setHours(0,0,0,0);

    if (normalizedNextPaymentDate >= today && normalizedNextPaymentDate <= fourteenDaysFromNow) {
      upcomingPaymentsList.push({
        ...sub,
        nextDate: normalizedNextPaymentDate
      });
    }
  });
  
  upcomingPaymentsList.sort((a, b) => a.nextDate - b.nextDate);
  
  if (upcomingPaymentsList.length === 0) {
    upcomingPayments.innerHTML = '<div class="empty-list-message">Нет платежей в ближайшие 2 недели</div>'; 
    upcomingPayments.classList.remove('has-scroll');
    return;
  }
  
  // Создаем новую структуру DOM
  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'upcoming-payments-scroll';
  
  // Добавляем карточки в контейнер скролла
  upcomingPaymentsList.forEach(payment => {
    const paymentElement = createPaymentItem(payment);
    scrollContainer.appendChild(paymentElement);
  });
  
  // Добавляем невидимый элемент в конце для предотвращения обрезки последней карточки
  const spacerElement = document.createElement('div');
  spacerElement.style.minWidth = '15px'; // Минимальная ширина, чтобы быть заметным
  spacerElement.style.height = '1px'; // Практически невидимый
  scrollContainer.appendChild(spacerElement);
  
  // Создаем индикатор-точки
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'scroll-dots-container';
  
  // Предположим, что у нас будет максимум 3 точки
  // 1 точка для видимой области и до 2 точек для обозначения скрытого контента
  const visibleItems = Math.floor(scrollContainer.clientWidth / 130); // 130px - примерная ширина элемента с учетом отступа
  const totalDots = Math.min(3, Math.ceil(upcomingPaymentsList.length / visibleItems));
  
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.className = 'scroll-dot';
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  }
  
  // Добавляем элементы в DOM
  upcomingPayments.appendChild(scrollContainer);
  upcomingPayments.appendChild(dotsContainer);
  
  // Проверяем необходимость скролла и добавляем/убираем индикатор
  setTimeout(() => {
    const hasScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    console.log('Upcoming Payments Scroll Check:', 
                'scrollWidth:', scrollContainer.scrollWidth, 
                'clientWidth:', scrollContainer.clientWidth, 
                'hasScroll:', hasScroll);
    
    if (hasScroll) {
      upcomingPayments.classList.add('has-scroll');
    } else {
      upcomingPayments.classList.remove('has-scroll');
      dotsContainer.style.display = 'none'; // Скрываем точки, если скролл не нужен
    }
    
    // Добавляем обработчик события скролла, чтобы обновлять точки
    scrollContainer.addEventListener('scroll', () => {
      // Обновляем точки в зависимости от положения скролла
      if (hasScroll && totalDots > 1) {
        const scrollPercentage = scrollContainer.scrollLeft / (scrollContainer.scrollWidth - scrollContainer.clientWidth);
        const activeDotIndex = Math.min(Math.floor(scrollPercentage * totalDots), totalDots - 1);
        
        // Обновляем активную точку
        const dots = dotsContainer.querySelectorAll('.scroll-dot');
        dots.forEach((dot, index) => {
          if (index === activeDotIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, 100);
}

// Создание элемента предстоящего платежа
function createPaymentItem(payment) {
  const paymentElement = document.createElement('div');
  paymentElement.className = 'upcoming-payment-item';
  
  const date = payment.nextDate;
  // Формат даты: "ДД мес.", например, "15 мая"
  const formattedPaymentDate = `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' }).replace('.', '').slice(0, 3)}`;
  
  // Получаем отформатированную цену или сокращенное название для триальных подписок
  const formattedPrice = payment.isTrial ? 'Триал' : formatCurrency(payment.price);

  const today = new Date();
  today.setHours(0,0,0,0);
  const paymentDateOnly = new Date(date);

  const diffTime = paymentDateOnly - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let termText = '';
  let termClass = '';
  
  // Определяем цвет карточки в зависимости от количества дней
  let cardColor;
  let importance = 0; // Для отслеживания важности (0 - самая высокая, 2 - самая низкая)
  
  if (diffDays <= 3) {
    // 1 категория (0-3 дня) - красный цвет
    if (diffDays === 0) {
      termText = 'Сегодня';
    } else if (diffDays === 1) {
      termText = 'Завтра';
    } else {
      termText = `${diffDays} ${getDaysString(diffDays)}`;
    }
    termClass = 'uupi-term-critical';
    cardColor = 'rgba(231, 76, 60, 0.7)'; // Красный
    importance = 0;
  } else if (diffDays <= 7) {
    // 2 категория (4-7 дней) - светло-синий цвет
    termText = `${diffDays} ${getDaysString(diffDays)}`;
    termClass = 'uupi-term-notice';
    cardColor = 'rgba(90, 200, 250, 0.6)'; // Светло-синий
    importance = 1;
  } else {
    // 3 категория (8-14 дней) - серый цвет
    termText = `${diffDays} ${getDaysString(diffDays)}`;
    termClass = 'uupi-term-warning';
    cardColor = 'rgba(170, 170, 170, 0.3)'; // Серый
    importance = 2;
  }
  
  // Устанавливаем атрибуты
  paymentElement.setAttribute('data-importance', importance.toString());
  paymentElement.style.setProperty('--card-custom-color', cardColor);
  
  // Определяем тип периода
  const periodText = formatSubscriptionPeriodShort(payment);
  
  // Генерируем HTML для иконки
  let iconHtml = '';
  if (payment.iconUrl) {
    // Проверяем, локальная ли это иконка
    if (payment.iconUrl.startsWith('data:local,')) {
      try {
        // Парсим данные локальной иконки
        const iconDataStr = payment.iconUrl.replace('data:local,', '');
        const iconData = JSON.parse(iconDataStr);
        
        // Создаем HTML для локальной иконки
        iconHtml = `
          <div class="payment-app-icon local-icon" style="background-color: ${iconData.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; width: 32px; height: 32px; border-radius: 8px;">
            <span>${iconData.letter}</span>
          </div>
        `;
      } catch (e) {
        console.error('Ошибка при парсинге данных локальной иконки в платеже:', e);
        // Если не удалось распарсить, создаем стандартную иконку
        iconHtml = `
          <div class="payment-app-icon local-icon" style="background-color: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; width: 32px; height: 32px; border-radius: 8px;">
            <span>${payment.name.charAt(0).toUpperCase()}</span>
          </div>
        `;
      }
    } else {
      // Формируем URL для иконки с учетом того, содержит ли он уже параметры
      let optimizedIconUrl;
      if (payment.iconUrl.includes('?')) {
        // URL уже содержит параметры, добавляем только размер и формат
        optimizedIconUrl = `${payment.iconUrl}&format=png&size=64`;
      } else {
        // URL без параметров, добавляем токен, размер и формат
        optimizedIconUrl = `${payment.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
      }
      
      iconHtml = `
        <div class="payment-app-icon">
          <img src="${optimizedIconUrl}" alt="${payment.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22><rect width=%2224%22 height=%2224%22 fill=%22%233498db%22 rx=%224%22 /><text x=%2250%%22 y=%2250%%22 dy=%22.35em%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2212%22 font-weight=%22bold%22>${payment.name.charAt(0).toUpperCase()}</text></svg>';">
        </div>
      `;
    }
  }
  
  // Формируем HTML для цены - разный для триальных и обычных подписок
  let priceHtml = '';
  if (payment.isTrial) {
    priceHtml = `<span class="uupi-price trial-color">${formattedPrice}</span>`;
  } else {
    priceHtml = `<span class="uupi-price success-color">${formattedPrice}</span>`;
  }
  
  paymentElement.innerHTML = `
    ${iconHtml}
    <div class="uupi-name">${payment.name}</div>
    <div class="uupi-meta-info">
      ${priceHtml}
    </div>
    <div class="uupi-term ${termClass}">${termText}</div>
  `;
  
  return paymentElement;
}

// Обновление сумм подписок
function updateTotals() {
  // Ежемесячная сумма
  const monthlyTotal = calculateMonthlyTotal();
  monthlyTotalElement.textContent = formatCurrency(monthlyTotal);
  
  // Годовая сумма
  const yearlyTotal = monthlyTotal * 12;
  yearlyTotalElement.textContent = formatCurrency(yearlyTotal);
}

// Получение ближайшей подписки
function getNextSubscription() {
  if (subscriptions.length === 0) return null;
  
  const today = new Date();
  
  // Находим ближайшую дату платежа
  return subscriptions
    .map(sub => {
      const nextDate = getNextBillingDate(sub.billingDate, sub.isYearly, sub.isWeekly);
      return { ...sub, nextDate };
    })
    .sort((a, b) => a.nextDate - b.nextDate)
    .find(sub => sub.nextDate >= today) || subscriptions[0];
}

// Расчет ежемесячной суммы (без учета триальных подписок)
function calculateMonthlyTotal() {
  if (subscriptions.length === 0) return 0;
  
  return subscriptions.reduce((total, sub) => {
    // Пропускаем триальные подписки
    if (sub.isTrial) return total;
    
    if (sub.isYearly) {
      return total + (sub.price / 12); // разделить годовую сумму на 12 месяцев
    } else if (sub.isWeekly) {
      return total + (sub.price * 4.33); // умножить недельную сумму на среднее количество недель в месяце (4.33)
    }
    return total + sub.price;
  }, 0);
}

// Форматирование валюты
function formatCurrency(amount) {
  // Проверяем, является ли сумма целым числом
  if (amount % 1 === 0) {
    return '$' + amount.toFixed(0); // Отображаем без десятичной части
  } else {
    return '$' + amount.toFixed(2); // Отображаем с двумя десятичными знаками
  }
}

// Форматирование даты
function formatDate(date) {
  const options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('ru-RU', options);
}

// Получение следующей даты списания
function getNextBillingDate(billingDate, isYearly, isWeekly) {
  const today = new Date();
  // Создаем копию даты, чтобы не изменять оригинал
  const nextDate = new Date(billingDate);
  
  // Убеждаемся, что мы работаем с чистой датой (без времени)
  nextDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (isWeekly) {
    // Еженедельный платеж
    while (nextDate < today) {
      nextDate.setDate(nextDate.getDate() + 7);
    }
  } else if (isYearly) {
    // Ежегодный платеж
    while (nextDate < today) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  } else {
    // Ежемесячный платеж
    while (nextDate < today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
  }
  
  return nextDate;
}

// Рендеринг календаря
function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Дни недели
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  // Создаем заголовок календаря
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  let calendarHTML = `
    <div class="calendar-header">
      <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
      <div class="calendar-navigation">
        <button class="calendar-nav-btn prev-month" aria-label="Предыдущий месяц"></button>
        <button class="calendar-nav-btn next-month" aria-label="Следующий месяц"></button>
      </div>
    </div>
    <div class="calendar-grid">
  `;
  
  // Добавляем дни недели
  daysOfWeek.forEach(day => {
    calendarHTML += `<div class="calendar-weekday">${day}</div>`;
  });
  
  // Определяем смещение первого дня месяца
  // В JS воскресенье - 0, мы хотим чтобы понедельник был 0
  let firstDayOffset = firstDayOfMonth.getDay() - 1;
  if (firstDayOffset < 0) firstDayOffset = 6; // Если это воскресенье
  
  // Добавляем дни из предыдущего месяца
  const prevMonth = new Date(year, month, 0);
  const prevMonthTotalDays = prevMonth.getDate();
  
  for (let i = 0; i < firstDayOffset; i++) {
    const day = prevMonthTotalDays - firstDayOffset + i + 1;
    calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
  }
  
  // Добавляем дни текущего месяца
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const subscriptionOnThisDay = checkIfDateHasSubscription(currentDate);
    const hasSubscription = !!subscriptionOnThisDay;
    
    // Определяем, выбран ли день
    const isSelected = currentDate.getTime() === selectedDate.getTime();
    
    // Определяем, является ли день сегодняшним
    const isToday = currentDate.getTime() === today.getTime();
    
    let dayClasses = 'calendar-day';
    if (isSelected) dayClasses += ' selected';
    if (isToday) dayClasses += ' today';
    if (hasSubscription) dayClasses += ' has-subscription';
    
    // Атрибут для подписок больше не нужен, так как отображаем только одну точку
    let subscriptionAttribute = '';

    calendarHTML += `
      <div class="${dayClasses}" data-date="${currentDate.toISOString()}" ${subscriptionAttribute}>
        ${day}
      </div>
    `;
  }
  
  // Добавляем дни следующего месяца
  const totalCells = 42; // 6 строк по 7 дней
  const nextMonthDays = totalCells - lastDayOfMonth.getDate() - firstDayOffset;
  
  for (let day = 1; day <= nextMonthDays; day++) {
    calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
  }
  
  calendarHTML += '</div>';
  
  calendarContainer.innerHTML = calendarHTML;
  
  // Добавляем обработчики событий
  setupCalendarEventListeners();
}

// Настройка обработчиков событий для календаря
function setupCalendarEventListeners() {
  // Кнопки навигации
  const prevMonthBtn = calendarContainer.querySelector('.prev-month');
  const nextMonthBtn = calendarContainer.querySelector('.next-month');
  
  prevMonthBtn.addEventListener('click', () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    selectedDate = newDate;
    renderCalendar(selectedDate);
  });
  
  nextMonthBtn.addEventListener('click', () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    selectedDate = newDate;
    renderCalendar(selectedDate);
  });
  
  // Клик по ячейке календаря
  const dayElements = calendarContainer.querySelectorAll('.calendar-day');
  dayElements.forEach(day => {
    day.addEventListener('click', () => {
      // Игнорируем дни других месяцев
      if (day.classList.contains('other-month')) return;
      
      // Обновляем выбранную дату
      const dateString = day.getAttribute('data-date');
      if (dateString) {
        selectedDate = new Date(dateString);
        
        // Обновляем стили выбранного дня
        dayElements.forEach(d => d.classList.remove('selected'));
        day.classList.add('selected');
        
        // Обновляем список подписок на этот день
        renderDailySubscriptions();
      }
    });
  });
}

// Проверка наличия подписок на дату
function checkIfDateHasSubscription(date) {
  // Вместо поиска одной подписки, собираем все подписки на эту дату
  const subscriptionsOnDate = subscriptions.filter(sub => {
    const initialBillingDate = new Date(sub.billingDate);
    initialBillingDate.setHours(0,0,0,0); // Нормализуем время

    const calendarDate = new Date(date);
    calendarDate.setHours(0,0,0,0); // Нормализуем время

    if (sub.isYearly) {
      // Для годовых подписок проверяем совпадение дня и месяца
      return initialBillingDate.getDate() === calendarDate.getDate() &&
             initialBillingDate.getMonth() === calendarDate.getMonth();
    } else if (sub.isWeekly) {
      // Для еженедельных подписок проверяем совпадение дня недели
      return initialBillingDate.getDay() === calendarDate.getDay();
    } else {
      // Для месячных подписок
      const billingDay = initialBillingDate.getDate();
      const calendarDay = calendarDate.getDate();
      const lastDayOfCalendarMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();

      // Случай 1: Прямое совпадение дня месяца
      if (billingDay === calendarDay) {
        return true;
      }
      // Случай 2: День биллинга больше, чем дней в текущем календарном месяце,
      // и текущий календарный день - последний день месяца
      // (например, биллинг 31-го, а в феврале отображаем 28/29-го)
      if (billingDay > lastDayOfCalendarMonth && calendarDay === lastDayOfCalendarMonth) {
        return true;
      }
      return false;
    }
  });

  if (subscriptionsOnDate.length === 0) {
    return null;
  }

  // Возвращаем объект с информацией о количестве подписок
  return {
    count: subscriptionsOnDate.length,
    subscriptions: subscriptionsOnDate
  };
}

// Рендеринг подписок на выбранный день
function renderDailySubscriptions() {
  // Получаем подписки для выбранной даты с помощью существующей функции
  const subscriptionOnThisDay = checkIfDateHasSubscription(selectedDate);
  const subsForDate = subscriptionOnThisDay ? subscriptionOnThisDay.subscriptions.map(sub => {
    const nextBillingDate = getNextBillingDate(sub.billingDate, sub.isYearly, sub.isWeekly);
    return { ...sub, nextBillingDate };
  }) : [];

  // Форматируем выбранную дату для заголовка (например, "22 мая 2025 г.")
  const formattedHeaderDate = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Обновляем отображение
  if (subsForDate.length === 0) {
    dailySubscriptions.innerHTML = `
      <div class="daily-subscriptions-header">${formattedHeaderDate}</div>
      <div class="empty-list-message">Нет подписок на этот день</div>
    `;
  } else {
    let html = `<div class="daily-subscriptions-header">${formattedHeaderDate}</div>`;
    html += '<div class="daily-subscriptions-list">';
    
    subsForDate.forEach(sub => {
      const nextBillingDate = getNextBillingDate(sub.billingDate, sub.isYearly, sub.isWeekly);
      const formattedDate = formatDate(nextBillingDate);
      
      // Получаем отформатированную цену или "Бесплатно" для триальных подписок
      const formattedPrice = sub.isTrial ? 'Бесплатно' : formatCurrency(sub.price);
      const period = formatSubscriptionPeriod(sub);
      
      // Генерируем HTML с поддержкой иконки
      let iconHtml = '';
      if (sub.iconUrl) {
        // Проверяем, локальная ли это иконка
        if (sub.iconUrl.startsWith('data:local,')) {
          try {
            // Парсим данные локальной иконки
            const iconDataStr = sub.iconUrl.replace('data:local,', '');
            const iconData = JSON.parse(iconDataStr);
            
            // Создаем HTML для локальной иконки
            iconHtml = `
              <div class="subscription-icon local-icon" style="background-color: ${iconData.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                <span>${iconData.letter}</span>
              </div>
            `;
          } catch (e) {
            console.error('Ошибка при парсинге данных локальной иконки в календаре:', e);
            // Если не удалось распарсить, создаем стандартную иконку
            iconHtml = `
              <div class="subscription-icon local-icon" style="background-color: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                <span>${sub.name.charAt(0).toUpperCase()}</span>
              </div>
            `;
          }
        } else {
          // Формируем URL для иконки с учетом того, содержит ли он уже параметры
          let optimizedIconUrl;
          if (sub.iconUrl.includes('?')) {
            // URL уже содержит параметры, добавляем только размер и формат
            optimizedIconUrl = `${sub.iconUrl}&format=png&size=64`;
          } else {
            // URL без параметров, добавляем токен, размер и формат
            optimizedIconUrl = `${sub.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
          }
          
          iconHtml = `
            <div class="subscription-icon">
              <img src="${optimizedIconUrl}" alt="${sub.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 24 24%22><rect width=%2224%22 height=%2224%22 fill=%22%233498db%22 rx=%224%22 /><text x=%2250%%22 y=%2250%%22 dy=%22.35em%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2214%22 font-weight=%22bold%22>${sub.name.charAt(0).toUpperCase()}</text></svg>';">
            </div>
          `;
        }
      }
      
      // Формируем HTML для блока с ценой и периодом - разный для триальных и обычных подписок
      let priceHtml = '';
      if (sub.isTrial) {
        priceHtml = `
          <div class="subscription-price-group">
            <span class="subscription-price trial-price">Триал</span>
          </div>
        `;
      } else {
        priceHtml = `
          <div class="subscription-price-group">
            <span class="subscription-price">${formattedPrice}</span>
            <span class="subscription-period">за ${period}</span>
          </div>
        `;
      }
      
      html += `
        <div class="daily-subscription-item">
          <div class="subscription-content">
            ${iconHtml}
            <div class="subscription-details">
              <div class="subscription-name">${sub.name}</div>
              ${priceHtml}
            </div>
          </div>
          <div class="payment-date">
            <svg class="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${sub.isTrial ? 'Закончится' : 'Оплата'} ${formattedDate}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    dailySubscriptions.innerHTML = html;
    
    // Добавляем обработчики событий для карточек
    const cards = dailySubscriptions.querySelectorAll('.daily-subscription-item');
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        openEditSubscriptionForm(subsForDate[index]);
      });
    });
  }
}

// Функция для поиска брендов через Brand Search API
async function searchBrands(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    console.log('Выполняется поиск брендов для:', query);
    
    // Формируем URL запроса к Brand Search API точно как в примере
    const apiUrl = `https://api.logo.dev/search?q=${encodeURIComponent(query)}`;
    
    console.log('Запрос к Brand Search API:', apiUrl);
    console.log('Используемый токен:', BRAND_SEARCH_API_TOKEN);
    
    // Используем точно тот же формат запроса, что и в примере
    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer: ${BRAND_SEARCH_API_TOKEN}`
      }
    });
    
    // Проверяем успешность запроса и логируем результаты
    console.log('Статус ответа от Brand Search API:', response.status, response.statusText);
    console.log('Заголовки ответа:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Ошибка в ответе Brand Search API:', responseText);
      throw new Error(`Brand Search API returned status: ${response.status}, текст: ${responseText}`);
    }
    
    // Получаем результаты
    const results = await response.json();
    console.log('Получены результаты Brand Search:', results);
    
    // Проверяем, что результаты имеют правильный формат
    if (Array.isArray(results) && results.length > 0) {
      // Результаты от Brand Search API должны содержать name и domain
      if (results[0].name && results[0].domain) {
        return results;
      } else {
        console.warn('Brand Search API вернул результаты в неожиданном формате:', results);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Ошибка при поиске брендов:', error.message);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

// Поиск иконок приложений через API logo.dev
async function searchAppIcons(query) {
  console.log('Запуск поиска иконок для:', query);
  
  if (!query || query.trim().length < 2) {
    return;
  }
  
  // Проверяем, инициализированы ли необходимые переменные
  if (!searchDropdown) {
    console.error('searchDropdown не инициализирован!');
    return;
  }
  
  // Показываем индикатор загрузки
  searchDropdown.innerHTML = `
    <div class="search-loading">
      <div class="loading-spinner"></div>
      <span>Поиск сервисов...</span>
    </div>
  `;
  searchDropdown.classList.add('active');
  
  try {
    // Параметры API для получения оптимальных логотипов
    const apiParams = `format=png&size=64&fallback=monogram`;
    
    // Подготовка результатов
    let searchResults = [];
    let apiAccessible = true;
    
    // Сначала пробуем использовать Brand Search API для получения точных доменов
    try {
      console.log('Используем Brand Search API для поиска брендов');
      const brandResults = await searchBrands(query);
      
      if (brandResults && brandResults.length > 0) {
        console.log('Найдены бренды через Brand Search API:', brandResults);
        
        // Преобразуем результаты Brand Search в формат для отображения
        searchResults = brandResults.map(brand => ({
          url: `https://img.logo.dev/${brand.domain}?token=${API_TOKEN}`,
          domain: brand.domain,
          name: brand.name
        }));
        
        console.log('Созданы результаты на основе Brand Search:', searchResults);
      } else {
        console.log('Brand Search API не вернул результатов. API_TOKEN:', API_TOKEN);
      }
    } catch (error) {
      console.warn('Ошибка при использовании Brand Search API:', error.message);
      console.error('Полная информация об ошибке:', error);
      
      // Продолжим с другими методами, если Brand Search не сработал
    }
    
    // Если Brand Search не дал результатов, используем прямое получение логотипов по домену
    if (searchResults.length === 0) {
      try {
        console.log('Использую прямой доступ к изображениям через img.logo.dev');
        
        // Предполагаемые домены на основе поискового запроса
        const searchTerms = query.toLowerCase().trim();
        const domains = [
          `${searchTerms}.com`,
          `${searchTerms}.ru`,
          `${searchTerms}.io`,
          `${searchTerms}.app`,
          `${searchTerms}.net`
        ];
        
        // Добавляем домены без пробелов и с дефисами для мультисловных запросов
        if (searchTerms.includes(' ')) {
          const withoutSpaces = searchTerms.replace(/\s+/g, '');
          const withDashes = searchTerms.replace(/\s+/g, '-');
          
          domains.push(`${withoutSpaces}.com`);
          domains.push(`${withDashes}.com`);
        }
        
        console.log('Пробуем домены:', domains);
        
        // Создаем результаты для всех возможных доменов
        searchResults = domains.map(domain => ({
          url: `https://img.logo.dev/${domain}?token=${API_TOKEN}`,
          domain: domain,
          name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
        }));
        
        console.log('Созданы результаты для доменов:', searchResults);
      } catch (error) {
        console.warn('Ошибка при создании URL для img.logo.dev:', error.message);
        apiAccessible = false;
      }
    }
    
    // Если API недоступен или результатов нет, используем локальную генерацию иконок
    if (searchResults.length === 0 || !apiAccessible) {
      console.log('Используем локальную генерацию иконок');
      
      // Спецальный список популярных сервисов
      const lowerCaseQuery = query.toLowerCase().trim();
      const specialServices = {
        'telegram': { 
          name: 'Telegram', 
          color: '#0088cc',
          letter: 'T'
        },
        'netflix': { 
          name: 'Netflix', 
          color: '#e50914',
          letter: 'N'
        },
        'spotify': { 
          name: 'Spotify', 
          color: '#1DB954',
          letter: 'S'
        },
        'youtube': { 
          name: 'YouTube', 
          color: '#ff0000',
          letter: 'Y'
        },
        'discord': { 
          name: 'Discord', 
          color: '#5865F2',
          letter: 'D'
        },
        'twitch': { 
          name: 'Twitch', 
          color: '#9146ff',
          letter: 'T'
        },
        'steam': { 
          name: 'Steam', 
          color: '#171a21',
          letter: 'S'
        },
        'amazon': { 
          name: 'Amazon', 
          color: '#ff9900',
          letter: 'A'
        },
        'apple': { 
          name: 'Apple', 
          color: '#555555',
          letter: 'A'
        },
        'google': { 
          name: 'Google', 
          color: '#4285f4',
          letter: 'G'
        }
      };
      
      // Проверяем, если запрос соответствует известному сервису
      const matchedService = Object.keys(specialServices).find(key => 
        lowerCaseQuery.includes(key));
      
      if (matchedService) {
        const service = specialServices[matchedService];
        // Создаем локальную иконку для известного сервиса
        searchResults = [{
          url: 'local',
          domain: matchedService + '.com',
          name: service.name,
          color: service.color,
          letter: service.letter
        }];
      } else {
        // Если сервис не известен, создаем общую иконку
        const firstLetter = query.charAt(0).toUpperCase();
        const randomColors = [
          '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
          '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
        
        console.log('Создание монограммы для:', query, 'Буква:', firstLetter, 'Цвет:', randomColor);
        
        searchResults = [{
          url: 'local',
          domain: query.toLowerCase().replace(/\s+/g, '') + '.com',
          name: capitalizeFirstLetter(query),
          color: randomColor,
          letter: firstLetter
        }];
        
        console.log('Созданная локальная иконка:', searchResults[0]);
      }
    }
    
    // Очищаем контейнер
    searchDropdown.innerHTML = ``;
    
    if (searchResults.length === 0) {
      console.log('Нет результатов для отображения');
      searchDropdown.innerHTML += '<div class="search-empty">Сервисы не найдены</div>';
      return;
    }
    
    console.log('Отображаем результаты поиска:', searchResults.length, 'иконок');
    
    // Ограничиваем до 10 результатов
    const resultsToShow = searchResults.slice(0, 10);
    
    // Отображаем найденные иконки в выпадающем списке
    resultsToShow.forEach(result => {
      const searchItem = document.createElement('div');
      searchItem.className = 'search-item';
      
      // Форматируем домен для отображения
      const displayDomain = formatDomainForDisplay(result.domain);
      
      let iconHtml = '';
      
      // Проверяем, локальная ли это иконка
      if (result.url === 'local') {
        // Создаем SVG-монограмму с первой буквой названия
        iconHtml = `
          <div class="search-item-icon local-icon" style="background-color: ${result.color};">
            <span class="icon-letter">${result.letter}</span>
          </div>
        `;
      } else {
        // Используем обычную иконку из API с параметрами для отображения
        const iconDisplayUrl = `${result.url}&format=png&size=64`;
        iconHtml = `
          <div class="search-item-icon">
            <img src="${iconDisplayUrl}" alt="${result.name}" onerror="this.style.display='none'">
          </div>
        `;
      }
      
      searchItem.innerHTML = `
        ${iconHtml}
        <div class="search-item-details">
          <div class="search-item-name">${result.name}</div>
          <div class="search-item-domain">${displayDomain}</div>
        </div>
        <div class="search-item-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 7V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
      `;
      
      // Обработчик выбора сервиса
      searchItem.addEventListener('click', () => {
        if (result.url === 'local') {
          // Для локальных иконок используем другой способ отображения
          selectLocalIcon(result.letter, result.color, result.name);
        } else {
          selectAppIcon(result.url);
          console.log('Выбран сервис:', result.name, 'с URL:', result.url);
        }
        // Не меняем название, оставляем то, что ввел пользователь
        searchDropdown.classList.remove('active');
      });
      
      searchDropdown.appendChild(searchItem);
    });
    
  } catch (error) {
    console.error('Ошибка при поиске иконок:', error.message, error.stack);
    searchDropdown.innerHTML = '<div class="search-empty">Ошибка при поиске сервисов</div>';
    console.log('API Token:', API_TOKEN, 'BRAND_SEARCH_API_TOKEN используется:', BRAND_SEARCH_API_TOKEN ? 'да' : 'нет');
    
    // Создаем локальную иконку в случае ошибки
    const query = nameInput.value.trim();
    if (query) {
      const firstLetter = query.charAt(0).toUpperCase();
      const randomColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      
      console.log('Создаем локальную иконку из-за ошибки API');
      selectLocalIcon(firstLetter, randomColor, capitalizeFirstLetter(query));
    }
  }
}

// Выбор локальной иконки (монограммы)
function selectLocalIcon(letter, color, serviceName) {
  // Создаем и сохраняем данные для локальной иконки
  const iconData = {
    type: 'local',
    letter: letter,
    color: color,
    name: serviceName
  };
  
  // Сохраняем в JSON строку для возможности хранения в localStorage
  selectedIconUrl = 'data:local,' + JSON.stringify(iconData);
  
  // Обновляем скрытое поле с URL иконки
  document.getElementById('app-icon-url').value = selectedIconUrl;
  
  // Обновляем превью
  const selectedIcon = document.getElementById('selected-icon');
  
  if (selectedIcon) {
    // Заменяем тег img на div с буквой для превью
    const iconPreviewContainer = document.getElementById('icon-preview');
    iconPreviewContainer.innerHTML = `
      <div id="selected-icon" class="local-icon-preview" style="background-color: ${color}; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; color: white; font-weight: bold;">
        ${letter}
      </div>
    `;
  }
}

// Форматирование домена для отображения
function formatDomainForDisplay(domain) {
  // Удаляем 'http://' или 'https://' если они есть
  let formattedDomain = domain.replace(/^https?:\/\//, '');
  
  // Если домен содержит путь (например, drive.google.com), оставляем только основной домен
  if (formattedDomain.includes('/')) {
    formattedDomain = formattedDomain.split('/')[0];
  }
  
  return formattedDomain;
}

// Функция для капитализации первой буквы
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Выбор иконки приложения
function selectAppIcon(iconUrl) {
  // Если URL уже указывает на локальную иконку, просто используем его напрямую
  if (iconUrl === 'local') {
    return; // Локальные иконки обрабатываются через selectLocalIcon
  }
  
  console.log('Выбрана иконка URL:', iconUrl);

  // Сохраняем полный URL с токеном
  selectedIconUrl = iconUrl;
  
  // Обновляем скрытое поле с URL иконки
  document.getElementById('app-icon-url').value = iconUrl;
  
  // Проверяем, содержит ли URL уже параметры (токен)
  let previewUrl;
  if (iconUrl.includes('?')) {
    // URL уже содержит параметры, добавляем только размер и формат
    previewUrl = `${iconUrl}&format=png&size=64`;
  } else {
    // URL без параметров, добавляем токен, размер и формат
    previewUrl = `${iconUrl}?token=${API_TOKEN}&format=png&size=64`;
  }
  
  const selectedIcon = document.getElementById('selected-icon');
  
  if (selectedIcon) {
    // Проверяем доступность изображения перед отображением
    const img = new Image();
    img.onload = function() {
      // Успешно загружено, отображаем
      const iconPreviewContainer = document.getElementById('icon-preview');
      iconPreviewContainer.innerHTML = `
        <img id="selected-icon" src="${previewUrl}" alt="Иконка сервиса" style="display: block; width: 32px; height: 32px; border-radius: 8px; object-fit: contain;">
      `;
    };
    
    img.onerror = function() {
      // Если первая попытка не удалась, попробуем еще раз с другим форматом URL
      console.log('Ошибка загрузки иконки, пробуем альтернативный формат URL');
      
      // Создаем альтернативный URL с явным указанием токена
      const altUrl = iconUrl.includes('?') 
        ? `${iconUrl.split('?')[0]}?token=${API_TOKEN}&format=png&size=64`
        : `${iconUrl}?token=${API_TOKEN}&format=png&size=64`;
      
      // Пробуем загрузить с альтернативным URL
      const altImg = new Image();
      altImg.onload = function() {
        const iconPreviewContainer = document.getElementById('icon-preview');
        iconPreviewContainer.innerHTML = `
          <img id="selected-icon" src="${altUrl}" alt="Иконка сервиса" style="display: block; width: 32px; height: 32px; border-radius: 8px; object-fit: contain;">
        `;
      };
      
      altImg.onerror = function() {
        // Если и альтернативный URL не работает, создаем локальную иконку
        console.log('Не удалось загрузить иконку из API, создаем локальную');
        
        // Получаем имя сервиса из поля ввода
        const serviceName = document.getElementById('name').value.trim();
        const firstLetter = serviceName.charAt(0).toUpperCase();
        
        // Выбираем случайный цвет
        const randomColors = [
          '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
          '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
        
        // Создаем локальную иконку
        selectLocalIcon(firstLetter, randomColor, serviceName);
      };
      
      altImg.src = altUrl;
    };
    
    // Начинаем загрузку изображения
    img.src = previewUrl;
  }
}

// Сброс выбранной иконки при открытии формы
function resetAppIcon() {
  selectedIconUrl = '';
  document.getElementById('app-icon-url').value = '';
  
  const selectedIcon = document.getElementById('selected-icon');
  
  if (selectedIcon) {
    selectedIcon.src = '';
    selectedIcon.style.display = 'none';
  }
  
  if (searchDropdown) {
    searchDropdown.innerHTML = '';
    searchDropdown.classList.remove('active');
  }
}

// Helper функция для склонения слова "день"
function getDaysString(days) {
  if (days % 10 === 1 && days % 100 !== 11) {
    return 'день';
  } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
    return 'дня';
  } else {
    return 'дней';
  }
}

// Вспомогательная функция для определения периода подписки
function formatSubscriptionPeriod(subscription) {
  if (subscription.isYearly) {
    return 'год';
  } else if (subscription.isWeekly) {
    return 'неделю';
  } else {
    return 'месяц';
  }
}

// Вспомогательная функция для короткого форматирования периода подписки
function formatSubscriptionPeriodShort(subscription) {
  if (subscription.isYearly) {
    return '/ год';
  } else if (subscription.isWeekly) {
    return '/ нед.';
  } else {
    return '/ мес.';
  }
}

// Также обрабатываем чекбокс при редактировании подписки
function resetTrialCheckbox() {
  if (trialCheckbox && priceInput) {
    trialCheckbox.checked = false;
    priceInput.disabled = false;
    priceInput.placeholder = 'например, 20';
  }
}

// Показать модальное окно подтверждения удаления
function showConfirmDeleteModal(id) {
  subscriptionToDeleteId = id;
  
  confirmDeleteModal.style.opacity = '0';
  confirmDeleteModal.style.visibility = 'visible';
  setTimeout(() => {
    confirmDeleteModal.style.opacity = '1';
  }, 10);
}

// Закрыть модальное окно подтверждения удаления
function closeConfirmDeleteModal() {
  confirmDeleteModal.style.opacity = '0';
  setTimeout(() => {
    confirmDeleteModal.style.visibility = 'hidden';
    subscriptionToDeleteId = null;
  }, 300);
}

// Подтверждение удаления
async function confirmDelete() {
  if (subscriptionToDeleteId !== null) {
    // Удаляем локально
    subscriptions = subscriptions.filter(sub => sub.id !== subscriptionToDeleteId);
    await saveSubscriptionsToLocalStorage();
    
    closeConfirmDeleteModal();
    updateUI();
  }
}

// Открытие формы добавления подписки
function openSubscriptionForm() {
  // Сбрасываем режим формы на добавление
  formMode = 'add';
  formTitle.textContent = 'Добавить подписку';
  formSubmitBtn.textContent = 'Добавить';
  subscriptionIdInput.value = '';
  
  // Установка текущей даты по умолчанию
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('billing-date').value = formattedDate;
  
  // Сброс формы
  subscriptionForm.reset();
  resetTrialCheckbox();
  
  // Снова устанавливаем текущую дату (после сброса формы)
  document.getElementById('billing-date').value = formattedDate;
  
  // Сброс выбранной иконки
  resetAppIcon();
  
  // Установка цвета по умолчанию
  document.getElementById('color').value = DEFAULT_SUBSCRIPTION_COLOR;
  
  // Отображение формы
  subscriptionFormModal.style.opacity = '0';
  subscriptionFormModal.style.visibility = 'visible';
  setTimeout(() => {
    subscriptionFormModal.style.opacity = '1';
  }, 10);
}

// Открытие формы редактирования подписки
function openEditSubscriptionForm(subscription) {
  // Устанавливаем режим формы на редактирование
  formMode = 'edit';
  formTitle.textContent = 'Редактировать подписку';
  formSubmitBtn.textContent = 'Сохранить';
  
  // Заполняем форму данными подписки
  subscriptionIdInput.value = subscription.id;
  nameInput.value = subscription.name;
  
  // Проверяем, является ли подписка бесплатной (триальной)
  if (subscription.isTrial) {
    document.getElementById('trial-checkbox').checked = true;
    priceInput.disabled = true;
    priceInput.value = '';
    priceInput.placeholder = 'Триал';
  } else {
    document.getElementById('trial-checkbox').checked = false;
    priceInput.disabled = false;
    document.getElementById('price').value = subscription.price;
  }
  
  // Устанавливаем периодичность
  if (subscription.isYearly) {
    document.getElementById('yearly').checked = true;
  } else if (subscription.isWeekly) {
    document.getElementById('weekly').checked = true;
  } else {
    document.getElementById('monthly').checked = true;
  }
  
  // Устанавливаем дату
  const dateString = subscription.billingDate.toISOString().split('T')[0];
  document.getElementById('billing-date').value = dateString;
  
  // Устанавливаем цвет по умолчанию
  document.getElementById('color').value = DEFAULT_SUBSCRIPTION_COLOR;
  
  // Устанавливаем иконку, если она есть
  if (subscription.iconUrl) {
    if (subscription.iconUrl.startsWith('data:local,')) {
      // Для локальных иконок
      try {
        const iconDataStr = subscription.iconUrl.replace('data:local,', '');
        const iconData = JSON.parse(iconDataStr);
        
        // Используем функцию для выбора локальной иконки
        selectLocalIcon(iconData.letter, iconData.color, iconData.name || subscription.name);
      } catch (e) {
        console.error('Ошибка при парсинге данных локальной иконки:', e);
        resetAppIcon();
      }
    } else {
      // Для обычных иконок из API
      // Проверяем, содержит ли URL токен API
      const iconUrl = subscription.iconUrl.includes('token=') 
        ? subscription.iconUrl 
        : (subscription.iconUrl.includes('?') 
            ? `${subscription.iconUrl}&token=${API_TOKEN}` 
            : `${subscription.iconUrl}?token=${API_TOKEN}`);
      
      selectAppIcon(iconUrl);
    }
  } else {
    resetAppIcon();
  }
  
  // Отображение формы
  subscriptionFormModal.style.opacity = '0';
  subscriptionFormModal.style.visibility = 'visible';
  setTimeout(() => {
    subscriptionFormModal.style.opacity = '1';
  }, 10);
}

// Закрытие формы добавления подписки
function closeSubscriptionForm() {
  subscriptionFormModal.style.opacity = '0';
  setTimeout(() => {
    subscriptionFormModal.style.visibility = 'hidden';
  }, 300);
}

/// Обработка отправки формы (добавление или редактирование)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const isTrial = document.getElementById('trial-checkbox').checked;
  const price = isTrial ? 0 : parseFloat(document.getElementById('price').value);
  const billingDateStr = document.getElementById('billing-date').value;
  const billingDate = new Date(billingDateStr);
  const isYearly = document.getElementById('yearly').checked;
  const isWeekly = document.getElementById('weekly').checked;
  const color = colorInput.value;
  const iconUrl = document.getElementById('app-icon-url').value;
  const id = subscriptionIdInput.value;
  
  if (!name || (!isTrial && (isNaN(price) || price < 0)) || !billingDate) {
    alert('Пожалуйста, заполните все обязательные поля формы');
    return;
  }
  
  // Подготовка объекта подписки
  const subscription = {
    id: id || Date.now().toString(), // Если нет ID, создаем временный ID
    name,
    price,
    isTrial,
    billingDate,
    color,
    isYearly,
    isWeekly,
    iconUrl
  };
  
  // Сохранение подписки
  if (formMode === 'edit') {
    // Для редактирования находим индекс подписки в массиве
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      // Заменяем существующую подписку на обновленную
      subscriptions[index] = subscription;
    }
  } else {
    // Для новой подписки просто добавляем в массив
    subscriptions.push(subscription);
  }
  
  // Сохраняем в localStorage
  await saveSubscriptionsToLocalStorage();
  
  closeSubscriptionForm();
  updateUI();
}