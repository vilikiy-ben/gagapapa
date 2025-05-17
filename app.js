// SubsViewer - мини-приложение для Telegram
// Инициализация Telegram Mini App
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

// Инициализация приложения
async function initApp() {
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
  subscriptionElement.style.borderTopColor = subscription.color;
  
  const nextBillingDate = getNextBillingDate(subscription.billingDate, subscription.isYearly);
  const formattedDate = formatDate(nextBillingDate);
  const formattedPrice = formatCurrency(subscription.price);
  const period = subscription.isYearly ? 'год' : 'месяц';
  
  subscriptionElement.innerHTML = `
    <div class="subscription-card-name">${subscription.name}</div>
    <div class="subscription-card-price">${formattedPrice}</div>
    <div class="subscription-card-period">за ${period}</div>
    <div class="subscription-card-date">Оплата ${formattedDate}</div>
    <button class="subscription-delete" data-id="${subscription.id}">&times;</button>
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
        nextPaymentDate: normalizedNextPaymentDate
      });
    }
  });
  
  upcomingPaymentsList.sort((a, b) => a.nextPaymentDate - b.nextPaymentDate);
  
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
  
  // Создаем индикатор-точки
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'scroll-dots-container';
  
  // Получаем ширину контейнера и карточки для расчета видимых элементов
  const isMobile = window.innerWidth <= 480;
  const itemsPerView = isMobile ? 2 : 3;
  
  // Рассчитываем количество точек (1 точка на каждые itemsPerView карточки, минимум 1)
  const totalDots = Math.max(1, Math.ceil(upcomingPaymentsList.length / itemsPerView));
  
  // Создаем точки
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.className = i === 0 ? 'scroll-dot active' : 'scroll-dot';
    dotsContainer.appendChild(dot);
  }
  
  // Добавляем контейнер и точки в DOM
  upcomingPayments.appendChild(scrollContainer);
  if (totalDots > 1) {
    upcomingPayments.appendChild(dotsContainer);
  }
  
  // Проверяем необходимость скролла и добавляем/убираем индикатор
  setTimeout(() => {
    const hasScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    
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
  paymentElement.style.setProperty('--primary-color', payment.color || 'var(--primary-color)');
  paymentElement.style.borderBottomColor = payment.color || 'var(--primary-color)';
  
  const date = payment.nextPaymentDate;
  // Формат даты: "ДД мес", например, "15 мая"
  const formattedPaymentDate = `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'short' })}`;
  
  const formattedPrice = formatCurrency(payment.price);
  const periodSuffix = payment.isYearly ? '/год' : '/мес';

  const today = new Date();
  today.setHours(0,0,0,0);
  const paymentDateOnly = new Date(payment.nextPaymentDate);

  const diffTime = paymentDateOnly - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let termText = '';
  let termClass = '';
  let termEmoji = '';

  if (diffDays === 0) {
    termText = 'Сегодня';
    termClass = 'uupi-term-critical';
    termEmoji = '⚡';
  } else if (diffDays === 1) {
    termText = 'Завтра';
    termClass = 'uupi-term-critical';
    termEmoji = '⏰';
  } else if (diffDays >= 2 && diffDays <= 3) {
    termText = `Через ${diffDays} д.`;
    termClass = 'uupi-term-warning';
    termEmoji = '⚠️';
  } else if (diffDays >= 4 && diffDays <= 7) {
    termText = `Через ${diffDays} д.`;
    termClass = 'uupi-term-notice';
    termEmoji = '📆';
  } else if (diffDays > 7) {
    termText = `Через ${diffDays} д.`;
    termClass = 'uupi-term-normal';
    termEmoji = '🕑';
  }
  
  paymentElement.innerHTML = `
    <div class="upcoming-payment-item-content">
      <div class="uupi-name">${payment.name}</div>
      <div class="uupi-meta-info">
        <span class="uupi-price">${formattedPrice} ${periodSuffix}</span>
        <span class="uupi-billing-date">${formattedPaymentDate}</span>
      </div>
      <div class="uupi-term ${termClass}">${termEmoji} ${termText}</div>
    </div>
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
  document.getElementById('name').value = subscription.name;
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
  
  if (!name || isNaN(price) || !billingDate) {
    alert('Пожалуйста, заполните все поля формы');
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
      isYearly
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
        isYearly
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
  return '$' + amount.toFixed(2);
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
      
      html += `
        <div class="daily-subscription-item">
          <div class="subscription-color" style="background-color: ${sub.color}"></div>
          <div class="subscription-info">
            <div class="subscription-name">${sub.name}</div>
            <div class="subscription-price">${formattedPrice} / ${period}</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    dailySubscriptions.innerHTML = html;
  }
} 