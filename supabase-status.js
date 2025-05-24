// Мониторинг статуса подключения к Supabase
import { supabase } from './supabase.js';

// Элементы DOM
let statusIndicator;
let statusText;
let statusContainer;

// Инициализация
export function initStatusMonitor() {
  statusIndicator = document.getElementById('status-indicator');
  statusText = document.getElementById('status-text');
  statusContainer = document.getElementById('supabase-status');
  
  if (!statusIndicator || !statusText || !statusContainer) {
    console.error('Не найдены элементы для индикатора статуса');
    return;
  }
  
  // Начальное состояние
  updateStatus('connecting', 'Подключение...');
  
  // Проверяем подключение
  checkConnection();
  
  // Периодически проверяем состояние
  setInterval(checkConnection, 30000); // каждые 30 секунд
  
  // Скрываем через 5 секунд, если всё в порядке
  setTimeout(() => {
    if (statusIndicator.classList.contains('connected')) {
      statusContainer.style.opacity = '0';
      setTimeout(() => {
        statusContainer.style.display = 'none';
      }, 1000);
    }
  }, 5000);
}

// Проверка подключения к Supabase
async function checkConnection() {
  try {
    // Простой запрос к базе данных для проверки подключения
    // Не используем агрегатную функцию count(), а просто запрашиваем 1 запись
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // Подключение успешно
    updateStatus('connected', 'Подключено');
    
    // Если в статусе ошибка и она успешно исправлена, скрываем через 3 секунды
    if (statusContainer.style.display !== 'none') {
      setTimeout(() => {
        statusContainer.style.opacity = '0';
        setTimeout(() => {
          statusContainer.style.display = 'none';
        }, 1000);
      }, 3000);
    }
    
    return true;
  } catch (error) {
    // Ошибка подключения
    console.error('Ошибка подключения к Supabase:', error.message);
    updateStatus('error', 'Ошибка подключения');
    
    // Показываем индикатор в случае ошибки
    statusContainer.style.display = 'flex';
    statusContainer.style.opacity = '1';
    
    return false;
  }
}

// Обновление статуса
function updateStatus(status, message) {
  if (!statusIndicator || !statusText) return;
  
  // Удаляем все классы
  statusIndicator.classList.remove('connected', 'error');
  
  // Добавляем соответствующий класс
  if (status === 'connected') {
    statusIndicator.classList.add('connected');
  } else if (status === 'error') {
    statusIndicator.classList.add('error');
  }
  
  // Обновляем текст
  statusText.textContent = message;
}

// Публичный метод для обновления статуса из других модулей
export function setConnectionStatus(status, message) {
  updateStatus(status, message);
}

// Публичный метод для принудительной проверки соединения
export async function checkSupabaseConnection() {
  return await checkConnection();
} 