// SubsViewer - мини-приложение для Telegram
// Инициализация Telegram Mini App

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
  
  // Функция для принудительного применения стилей на мобильных устройствах
  const forceMobileStyles = () => {
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
  };
  
  // Вызываем функцию сразу и добавляем в список обработчиков событий
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
let currentColorSelection = '#3498db';

// Инициализация переменных для работы с иконками
let nameInput = null;
let searchDropdown = null;
let iconPreview = null;
let selectedIconUrl = null;
const API_TOKEN = "pk_f-SKNQU7TJWnou-__dux7A"; // Токен API logo.dev
const SEARCH_DELAY = 500; // Задержка поиска после ввода (мс)
let searchTimeout = null;

// Добавим переменную для ключа API Brand Search
const BRAND_SEARCH_API_TOKEN = API_TOKEN; // Используем тот же ключ для начала, но может потребоваться другой

// DOM элементы
const subscriptionFormModal = document.getElementById('subscription-form-modal');
const subscriptionForm = document.getElementById('subscription-form');
const addSubscriptionBtn = document.getElementById('add-subscription-btn');
const closeFormBtn = document.getElementById('close-form-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const colorOptions = document.querySelectorAll('.color-option');
const colorInput = document.getElementById('color');
const subscriptionsList = document.getElementById('subscriptions-list');
const monthlyTotalElement = document.getElementById('monthly-total');
const yearlyTotalElement = document.getElementById('yearly-total');
const allSubscriptionsTitle = document.getElementById('all-subscriptions-title');
const calendarContainer = document.getElementById('calendar-container');
const dailySubscriptions = document.getElementById('daily-subscriptions');
const emptySubscriptionsMessage = document.getElementById('empty-subscriptions-message');
const upcomingPayments = document.getElementById('upcoming-payments');
const monthlyCountElement = document.getElementById('monthly-count');
const yearlyCountElement = document.getElementById('yearly-count');
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
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Функция инициализации приложения
async function initApp() {
  // Инициализация элементов для работы с иконками
  nameInput = document.getElementById('name');
  searchDropdown = document.getElementById('search-dropdown');
  iconPreview = document.getElementById('icon-preview');
  
  // Обработчик событий для поиска иконок при вводе
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      // Отменяем предыдущий таймер, если он есть
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      const query = nameInput.value.trim();
      
      // Если поле ввода пустое, скрываем выпадающий список
      if (!query) {
        searchDropdown.classList.remove('active');
        searchDropdown.innerHTML = '';
        return;
      }
      
      // Устанавливаем новый таймер для задержки поиска
      searchTimeout = setTimeout(() => {
        searchAppIcons(query);
      }, SEARCH_DELAY);
    });
    
    // Скрываем выпадающий список при клике вне его
    document.addEventListener('click', (e) => {
      if (!searchDropdown.contains(e.target) && e.target !== nameInput) {
        searchDropdown.classList.remove('active');
      }
    });
    
    // При фокусе на поле ввода, показываем выпадающий список, если в нем есть результаты
    nameInput.addEventListener('focus', () => {
      if (searchDropdown.innerHTML.trim() !== '') {
        searchDropdown.classList.add('active');
      }
    });
  }

  await loadSubscriptions();
  setupEventListeners();
  renderCalendar(selectedDate);
  updateUI();
  
  // Удаляем загрузочный экран, если он есть
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);
  }
  
  // Принудительная установка размеров логотипа, особенно для мобильных устройств
  try {
    const logoImg = document.querySelector('.app-logo img');
    if (logoImg) {
      logoImg.style.height = '30px';
      logoImg.style.width = '30px';
      logoImg.style.objectFit = 'contain';
    }
  } catch (error) {
    console.error("Error resizing logo via JS:", error);
  }
  
  // Исправляем стили для мобильной версии после инициализации
  if (tg) {
    setTimeout(() => {
      document.querySelectorAll('.toggle-container input[type="radio"]:checked + label').forEach(label => {
        label.style.backgroundColor = '#4a90e2';
        label.style.color = 'white';
      });
      
      // Вызываем функцию принудительного применения стилей
      forceMobileStyles();
    }, 500);
  }
}

// Загрузка подписок из localStorage
async function loadSubscriptions() {
  try {
    const storedData = localStorage.getItem('subscriptions');
    if (storedData) {
      subscriptions = JSON.parse(storedData);
      
      // Преобразуем строковые даты в объекты Date
      subscriptions = subscriptions.map(sub => {
        // Проверяем формат даты
        if (typeof sub.billingDate === 'string') {
          return {
            ...sub,
            billingDate: new Date(sub.billingDate)
          };
        }
        return sub;
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке подписок:', error);
    subscriptions = [];
  }
}

// Сохранение подписок в localStorage
async function saveSubscriptions() {
  try {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении подписок:', error);
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
  
  // Отправка формы
  subscriptionForm.addEventListener('submit', handleFormSubmit);
  
  // Выбор цвета
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.getAttribute('data-color');
      selectColor(color);
    });
  });
  
  // Обработчики для переключения периодичности (с принудительным применением стилей)
  document.getElementById('monthly').addEventListener('change', function() {
    if (this.checked && tg) {
      setTimeout(() => {
        const label = document.querySelector('label[for="monthly"]');
        if (label) {
          label.style.backgroundColor = '#4a90e2';
          label.style.color = 'white';
        }
        const yearlyLabel = document.querySelector('label[for="yearly"]');
        if (yearlyLabel) {
          yearlyLabel.style.backgroundColor = '';
          yearlyLabel.style.color = 'white';
        }
      }, 10);
    }
  });
  
  document.getElementById('yearly').addEventListener('change', function() {
    if (this.checked && tg) {
      setTimeout(() => {
        const label = document.querySelector('label[for="yearly"]');
        if (label) {
          label.style.backgroundColor = '#4a90e2';
          label.style.color = 'white';
        }
        const monthlyLabel = document.querySelector('label[for="monthly"]');
        if (monthlyLabel) {
          monthlyLabel.style.backgroundColor = '';
          monthlyLabel.style.color = 'white';
        }
      }, 10);
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
  renderAllSubscriptions();
  renderUpcomingPayments();
  updateTotals();
  renderDailySubscriptions();
  updateStatsData();
  renderCalendar(selectedDate);
}

// Рендеринг всех подписок
function renderAllSubscriptions() {
  subscriptionsList.innerHTML = '';
  
  if (subscriptions.length === 0) {
    emptySubscriptionsMessage.style.display = 'block';
  } else {
    emptySubscriptionsMessage.style.display = 'none';
    
    // Сортировка подписок по имени (можно добавить другие варианты сортировки)
    const sortedSubscriptions = [...subscriptions].sort((a, b) => a.name.localeCompare(b.name));
    
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
  
  const nextBillingDate = getNextBillingDate(subscription.billingDate, subscription.isYearly);
  const formattedDate = formatDate(nextBillingDate);
  const formattedPrice = formatCurrency(subscription.price);
  const period = subscription.isYearly ? 'год' : 'месяц';
  
  // Устанавливаем цвет элемента
  subscriptionElement.style.setProperty('--sub-color', subscription.color);
  
  // Генерируем HTML с поддержкой иконки
  let iconHtml = '';
  if (subscription.iconUrl) {
    // Добавляем параметры для оптимизации иконки в карточке
    const optimizedIconUrl = `${subscription.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
    iconHtml = `
      <div class="subscription-icon">
        <img src="${optimizedIconUrl}" alt="${subscription.name}" loading="lazy">
      </div>
    `;
  }
  
  subscriptionElement.innerHTML = `
    <button class="subscription-delete" data-id="${subscription.id}">&times;</button>
    <div class="subscription-content">
      ${iconHtml}
      <div class="subscription-details">
        <div class="subscription-name">${subscription.name}</div>
        <div class="subscription-price-group">
          <span class="subscription-price">${formattedPrice}</span>
          <span class="subscription-period">за ${period}</span>
        </div>
      </div>
    </div>
    <div class="payment-date">
      <svg class="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Оплата ${formattedDate}</span>
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
    const nextPaymentDate = getNextBillingDate(sub.billingDate, sub.isYearly);
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
  
  const formattedPrice = formatCurrency(payment.price);

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
    termClass = 'uupi-term-normal';
    cardColor = 'rgba(142, 142, 147, 0.5)'; // Серый
    importance = 2;
  }
  
  // Устанавливаем цвет карточки и важность (для CSS)
  paymentElement.setAttribute('style', `--card-custom-color: ${cardColor};`);
  paymentElement.setAttribute('data-importance', importance);
  
  // Добавляем поддержку иконки
  let iconHtml = '';
  if (payment.iconUrl) {
    // Используем больший размер для иконки в новом дизайне
    const optimizedIconUrl = `${payment.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
    iconHtml = `
      <div class="payment-app-icon">
        <img src="${optimizedIconUrl}" alt="${payment.name}" loading="lazy">
      </div>
    `;
  }
  
  paymentElement.innerHTML = `
    ${iconHtml}
    <div class="uupi-name">${payment.name}</div>
    <div class="uupi-meta-info">
      <span class="uupi-price">${formattedPrice}</span>
    </div>
    <div class="uupi-term ${termClass}">${termText}</div>
  `;
  
  return paymentElement;
}

// Обновление статистических данных
function updateStatsData() {
  // Количество подписок по типам
  const monthlyCount = subscriptions.filter(sub => !sub.isYearly).length;
  const yearlyCount = subscriptions.filter(sub => sub.isYearly).length;
  
  monthlyCountElement.textContent = monthlyCount;
  yearlyCountElement.textContent = yearlyCount;
  
  // Здесь можно добавить код для визуализации графиков
  // на основе данных подписок, если потребуется
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
    subscriptions = subscriptions.filter(sub => sub.id !== subscriptionToDeleteId);
    await saveSubscriptions();
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
  
  // Сброс выбранной иконки
  resetAppIcon();
  
  // Установка цвета по умолчанию
  selectColor('#3498db');
  
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
  document.getElementById('price').value = subscription.price;
  
  // Устанавливаем периодичность
  if (subscription.isYearly) {
    document.getElementById('yearly').checked = true;
  } else {
    document.getElementById('monthly').checked = true;
  }
  
  // Устанавливаем дату
  const dateString = subscription.billingDate.toISOString().split('T')[0];
  document.getElementById('billing-date').value = dateString;
  
  // Устанавливаем цвет
  selectColor(subscription.color);
  
  // Устанавливаем иконку, если она есть
  if (subscription.iconUrl) {
    selectAppIcon(subscription.iconUrl);
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

// Выбор цвета
function selectColor(color) {
  currentColorSelection = color;
  colorInput.value = color;
  
  // Обновление выбранного цвета
  colorOptions.forEach(option => {
    const optionColor = option.getAttribute('data-color');
    if (optionColor === color) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// Обработка отправки формы (добавление или редактирование)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const price = parseFloat(document.getElementById('price').value);
  const billingDateStr = document.getElementById('billing-date').value;
  const billingDate = new Date(billingDateStr);
  const isYearly = document.getElementById('yearly').checked;
  const color = colorInput.value;
  const iconUrl = document.getElementById('app-icon-url').value;
  
  if (!name || isNaN(price) || !billingDate) {
    alert('Пожалуйста, заполните все обязательные поля формы');
    return;
  }
  
  if (formMode === 'add') {
    // Добавление новой подписки
    const newSubscription = {
      id: Date.now(),
      name,
      price,
      billingDate,
      color,
      isYearly,
      iconUrl
    };
    
    subscriptions.push(newSubscription);
  } else {
    // Редактирование существующей подписки
    const id = parseInt(subscriptionIdInput.value);
    const index = subscriptions.findIndex(sub => sub.id === id);
    
    if (index !== -1) {
      subscriptions[index] = {
        ...subscriptions[index],
        name,
        price,
        billingDate,
        color,
        isYearly,
        iconUrl
      };
    }
  }
  
  await saveSubscriptions();
  closeSubscriptionForm();
  updateUI();
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
      const nextDate = getNextBillingDate(sub.billingDate, sub.isYearly);
      return { ...sub, nextDate };
    })
    .sort((a, b) => a.nextDate - b.nextDate)
    .find(sub => sub.nextDate >= today) || subscriptions[0];
}

// Расчет ежемесячной суммы
function calculateMonthlyTotal() {
  if (subscriptions.length === 0) return 0;
  
  return subscriptions.reduce((total, sub) => {
    if (sub.isYearly) {
      return total + (sub.price / 12); // разделить годовую сумму на 12 месяцев
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
function getNextBillingDate(billingDate, isYearly) {
  const today = new Date();
  // Создаем копию даты, чтобы не изменять оригинал
  const nextDate = new Date(billingDate);
  
  // Убеждаемся, что мы работаем с чистой датой (без времени)
  nextDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (isYearly) {
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
        <button class="calendar-nav-btn prev-month">&larr;</button>
        <button class="calendar-nav-btn next-month">&rarr;</button>
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
    let subscriptionColorForIndicator = null;

    if (hasSubscription) {
      subscriptionColorForIndicator = subscriptionOnThisDay.color;
    }
    
    // Определяем, выбран ли день
    const isSelected = currentDate.getTime() === selectedDate.getTime();
    
    // Определяем, является ли день сегодняшним
    const isToday = currentDate.getTime() === today.getTime();
    
    let dayClasses = 'calendar-day';
    if (isSelected) dayClasses += ' selected';
    if (isToday) dayClasses += ' today';
    if (hasSubscription) dayClasses += ' has-subscription';
    
    let styleAttribute = '';
    if (subscriptionColorForIndicator) {
      styleAttribute = `style="--subscription-indicator-color: ${subscriptionColorForIndicator};"`;
    }

    calendarHTML += `
      <div class="${dayClasses}" data-date="${currentDate.toISOString()}" ${styleAttribute}>
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
  return subscriptions.find(sub => {
    const initialBillingDate = new Date(sub.billingDate);
    initialBillingDate.setHours(0,0,0,0); // Нормализуем время

    const calendarDate = new Date(date);
    calendarDate.setHours(0,0,0,0); // Нормализуем время

    if (sub.isYearly) {
      // Для годовых подписок проверяем совпадение дня и месяца
      return initialBillingDate.getDate() === calendarDate.getDate() &&
             initialBillingDate.getMonth() === calendarDate.getMonth();
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
  }) || null;
}

// Рендеринг подписок на выбранный день
function renderDailySubscriptions() {
  // Фильтруем подписки для выбранной даты
  const subsForDate = [];
  
  subscriptions.forEach(sub => {
    const nextBillingDate = getNextBillingDate(sub.billingDate, sub.isYearly);
    
    // Проверяем только день и месяц, игнорируем год
    if (nextBillingDate.getDate() === selectedDate.getDate() && 
        nextBillingDate.getMonth() === selectedDate.getMonth()) {
      subsForDate.push({
        ...sub,
        nextBillingDate
      });
    }
  });

  // Обновляем отображение
  if (subsForDate.length === 0) {
    dailySubscriptions.innerHTML = '<div class="empty-list-message">Нет подписок на этот день</div>';
  } else {
    let html = '<div class="daily-subscriptions-list">';
    
    subsForDate.forEach(sub => {
      const formattedPrice = formatCurrency(sub.price);
      const period = sub.isYearly ? 'год' : 'месяц';
      
      // Подготавливаем HTML для иконки
      let iconHtml = '';
      if (sub.iconUrl) {
        // Используем увеличенный размер для детального отображения в календаре
        const optimizedIconUrl = `${sub.iconUrl}?token=${API_TOKEN}&format=png&size=64`;
        iconHtml = `
          <div class="subscription-icon">
            <img src="${optimizedIconUrl}" alt="${sub.name}" loading="lazy">
          </div>
        `;
      }
      
      html += `
        <div class="daily-subscription-item">
          <div class="subscription-color" style="background-color: ${sub.color}"></div>
          <div class="subscription-content">
            ${iconHtml}
            <div class="subscription-info">
              <div class="subscription-name">${sub.name}</div>
              <div class="subscription-price">${formattedPrice} / ${period}</div>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    dailySubscriptions.innerHTML = html;
  }
}

// Поиск иконок приложений через API logo.dev
async function searchAppIcons(query) {
  if (!query || query.trim().length < 2) {
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
    
    // Сначала пробуем получить результаты через Brand Search API
    try {
      const searchResponse = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${BRAND_SEARCH_API_TOKEN}`
        }
      });
      
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        // Преобразуем результаты API в нужный формат
        searchResults = data.map(item => ({
          url: `https://img.logo.dev/${item.domain}?token=${API_TOKEN}&${apiParams}`,
          domain: item.domain,
          name: item.name
        }));
      }
    } catch (error) {
      console.warn('Brand Search API недоступен, используем запасной вариант:', error);
    }
    
    // Если не удалось получить результаты через Brand Search API или результатов нет,
    // используем запасной вариант с предопределенными доменами
    if (searchResults.length === 0) {
      const lowerCaseQuery = query.toLowerCase().trim();
      
      // Специальный случай для Telegram
      if (lowerCaseQuery.includes('telegram')) {
        const telegramDomains = [
          { domain: 'telegram.org', name: 'Telegram Messenger' },
          { domain: 'telegram.com', name: 'Telegram' },
          { domain: 't.me', name: 'Telegram' }
        ];
        
        telegramDomains.forEach(item => {
          searchResults.push({
            url: `https://img.logo.dev/${item.domain}?token=${API_TOKEN}&${apiParams}`,
            domain: item.domain,
            name: item.name
          });
        });
      } else {
        // Предопределенные популярные сервисы
        const popularServices = {
          'steam': [
            { domain: 'steampowered.com', name: 'Steam (Valve Corporation)' },
            { domain: 'steamcommunity.com', name: 'Steam Community' },
            { domain: 'steam.com', name: 'Steam' }
          ],
          'netflix': [
            { domain: 'netflix.com', name: 'Netflix' },
            { domain: 'netflixinvestor.com', name: 'Netflix Investor' }
          ],
          'spotify': [
            { domain: 'spotify.com', name: 'Spotify' },
            { domain: 'spotifyforbrands.com', name: 'Spotify for Brands' }
          ],
          'amazon': [
            { domain: 'amazon.com', name: 'Amazon' },
            { domain: 'primevideo.com', name: 'Amazon Prime Video' },
            { domain: 'audible.com', name: 'Audible' }
          ],
          'google': [
            { domain: 'google.com', name: 'Google' },
            { domain: 'gmail.com', name: 'Gmail' },
            { domain: 'youtube.com', name: 'YouTube' }
          ],
          'apple': [
            { domain: 'apple.com', name: 'Apple' },
            { domain: 'icloud.com', name: 'iCloud' }
          ],
          'microsoft': [
            { domain: 'microsoft.com', name: 'Microsoft' },
            { domain: 'xbox.com', name: 'Xbox' },
            { domain: 'office.com', name: 'Microsoft Office' }
          ]
        };
        
        // Проверяем, есть ли запрос в популярных сервисах
        let foundPopularService = false;
        Object.keys(popularServices).forEach(service => {
          if (lowerCaseQuery.includes(service)) {
            foundPopularService = true;
            popularServices[service].forEach(item => {
              searchResults.push({
                url: `https://img.logo.dev/${item.domain}?token=${API_TOKEN}&${apiParams}`,
                domain: item.domain,
                name: item.name
              });
            });
          }
        });
        
        // Если не найдено в популярных сервисах, пробуем наиболее вероятные домены
        if (!foundPopularService) {
          // Очищаем запрос от пробелов и специальных символов
          const cleanQuery = lowerCaseQuery.replace(/[^a-z0-9]/gi, '');
          
          // Наиболее распространенные домены
          const commonDomains = ['.com', '.app', '.io', '.net', '.tv'];
          
          commonDomains.forEach(ext => {
            const domain = `${cleanQuery}${ext}`;
            searchResults.push({
              url: `https://img.logo.dev/${domain}?token=${API_TOKEN}&${apiParams}`,
              domain: domain,
              name: capitalizeFirstLetter(query)
            });
          });
        }
      }
    }
    
    // Выполняем запросы на получение логотипов параллельно
    const results = await Promise.all(
      searchResults.map(async (result) => {
        try {
          const response = await fetch(result.url);
          if (response.ok) {
            return {
              url: response.url,
              domain: result.domain,
              name: result.name
            };
          }
          return null;
        } catch (error) {
          console.error(`Ошибка при запросе ${result.url}:`, error);
          return null;
        }
      })
    );
    
    // Фильтруем успешные результаты и удаляем дубликаты
    const validResults = results.filter(result => result !== null);
    const uniqueDomains = {};
    const uniqueResults = validResults.filter(result => {
      if (uniqueDomains[result.domain]) {
        return false;
      }
      uniqueDomains[result.domain] = true;
      return true;
    });
    
    // Очищаем контейнер
    searchDropdown.innerHTML = '';
    
    if (uniqueResults.length === 0) {
      searchDropdown.innerHTML = '<div class="search-empty">Сервисы не найдены</div>';
      return;
    }
    
    // Ограничиваем до 10 результатов
    const resultsToShow = uniqueResults.slice(0, 10);
    
    // Отображаем найденные иконки в выпадающем списке
    resultsToShow.forEach(result => {
      const searchItem = document.createElement('div');
      searchItem.className = 'search-item';
      
      // Форматируем домен для отображения
      const displayDomain = formatDomainForDisplay(result.domain);
      
      searchItem.innerHTML = `
        <div class="search-item-icon">
          <img src="${result.url}" alt="${result.name}">
        </div>
        <div class="search-item-details">
          <div class="search-item-name">${result.name}</div>
          <div class="search-item-domain">${displayDomain}</div>
        </div>
      `;
      
      // Обработчик выбора сервиса
      searchItem.addEventListener('click', () => {
        selectAppIcon(result.url);
        // Не меняем название, оставляем то, что ввел пользователь
        searchDropdown.classList.remove('active');
      });
      
      searchDropdown.appendChild(searchItem);
    });
    
  } catch (error) {
    console.error('Ошибка при поиске иконок:', error);
    searchDropdown.innerHTML = '<div class="search-empty">Ошибка при поиске сервисов</div>';
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
  // Удаляем параметры из URL (token, size и т.д.), сохраняем только базовый URL
  let cleanIconUrl = iconUrl;
  if (iconUrl.includes('?')) {
    cleanIconUrl = iconUrl.split('?')[0];
  }
  
  selectedIconUrl = cleanIconUrl;
  
  // Обновляем скрытое поле с URL иконки
  document.getElementById('app-icon-url').value = cleanIconUrl;
  
  // Обновляем превью с размером, подходящим для превью
  const previewUrl = `${cleanIconUrl}?token=${API_TOKEN}&format=png&size=64`;
  const selectedIcon = document.getElementById('selected-icon');
  
  if (selectedIcon) {
    selectedIcon.src = previewUrl;
    selectedIcon.style.display = 'block';
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