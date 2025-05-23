// Конфигурация Supabase для подключения к базе данных
// Используем глобальный объект Supabase, загруженный через CDN

// Функция для логирования
function logDebug(message, data) {
  console.log(`[Supabase Debug] ${message}`, data || '');
  
  // Создаем элемент для вывода на страницу
  if (document.body) {
    const logDiv = document.createElement('div');
    logDiv.style.background = 'rgba(0, 0, 255, 0.6)';
    logDiv.style.color = 'white';
    logDiv.style.padding = '5px';
    logDiv.style.margin = '2px';
    logDiv.style.fontFamily = 'monospace';
    logDiv.style.fontSize = '10px';
    logDiv.style.position = 'fixed';
    logDiv.style.bottom = '0';
    logDiv.style.left = '0';
    logDiv.style.right = '0';
    logDiv.style.zIndex = '9999';
    logDiv.textContent = message + (data ? ` ${JSON.stringify(data).slice(0, 100)}...` : '');
    document.body.appendChild(logDiv);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
      document.body.removeChild(logDiv);
    }, 5000);
  }
}

// Учетные данные Supabase
const supabaseUrl = 'https://kfzrrdppyjmspsswpuij.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmenJyZHBweWptc3Bzc3dwdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjY2MzIsImV4cCI6MjA2MzYwMjYzMn0.nxKuQrJuzwM4Cnpbuo7ByLsuZG2dAPgAgZgSQB5IDQs'

logDebug('Supabase инициализация, проверка объекта', typeof window.supabase);

try {
  // Создание клиента Supabase, доступного глобально
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  logDebug('Supabase клиент создан');
} catch (error) {
  console.error('Ошибка при создании клиента Supabase:', error);
  logDebug('Ошибка при создании клиента Supabase', error.message);
  
  // Создаем заглушку для предотвращения ошибок
  window.supabaseClient = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      upsert: () => ({ data: [], error: null }),
      eq: () => ({ data: [], error: null })
    })
  };
}

// Функция для сохранения профиля пользователя из Telegram
window.saveUserProfile = async function(telegramUser) {
  logDebug('Сохранение профиля пользователя', telegramUser?.id);
  
  if (!telegramUser || !telegramUser.id) {
    console.error('Ошибка: не удалось получить данные пользователя Telegram');
    logDebug('Нет данных пользователя Telegram');
    return null;
  }

  try {
    logDebug('Отправка запроса на сохранение профиля');
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .upsert({
        id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        last_active: new Date()
      }, {
        onConflict: 'id',
        returning: 'minimal'
      });

    if (error) {
      console.error('Ошибка при сохранении профиля:', error);
      logDebug('Ошибка при сохранении профиля', error);
      return null;
    }

    logDebug('Профиль успешно сохранен', telegramUser.id);
    return telegramUser.id;
  } catch (error) {
    console.error('Исключение при сохранении профиля:', error);
    logDebug('Исключение при сохранении профиля', error.message);
    return null;
  }
}

// Функция для загрузки подписок пользователя
window.loadUserSubscriptions = async function(userId) {
  logDebug('Загрузка подписок пользователя', userId);
  
  if (!userId) {
    logDebug('ID пользователя не предоставлен');
    return [];
  }

  try {
    logDebug('Отправка запроса на загрузку подписок');
    const { data, error } = await window.supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Ошибка при загрузке подписок:', error);
      logDebug('Ошибка при загрузке подписок', error);
      return [];
    }

    logDebug(`Загружено ${data?.length || 0} подписок`);
    
    // Преобразуем строковые даты в объекты Date
    return (data || []).map(sub => ({
      ...sub,
      id: sub.id, // UUID из базы данных
      billingDate: new Date(sub.billing_date),
      isYearly: sub.is_yearly,
      isWeekly: sub.is_weekly,
      isTrial: sub.is_trial,
      iconUrl: sub.icon_url
    }));
  } catch (error) {
    console.error('Исключение при загрузке подписок:', error);
    logDebug('Исключение при загрузке подписок', error.message);
    return [];
  }
}

// Функция для сохранения подписки пользователя
window.saveSubscription = async function(userId, subscription) {
  logDebug('Сохранение подписки', { userId, subscriptionName: subscription?.name });
  
  if (!userId || !subscription) {
    logDebug('Отсутствует ID пользователя или данные подписки');
    return null;
  }

  try {
    // Преобразуем структуру подписки для Supabase
    const supabaseSubscription = {
      user_id: userId,
      name: subscription.name,
      price: subscription.price,
      is_yearly: subscription.isYearly || false,
      is_weekly: subscription.isWeekly || false,
      is_trial: subscription.isTrial || false,
      billing_date: subscription.billingDate.toISOString().split('T')[0], // Формат YYYY-MM-DD
      icon_url: subscription.iconUrl || null,
      color: subscription.color || null
    };

    logDebug('Подготовлены данные для Supabase', supabaseSubscription);
    
    let result;
    
    if (subscription.id && !subscription.id.startsWith('local_')) {
      // Обновление существующей подписки
      logDebug('Обновление существующей подписки', subscription.id);
      const { data, error } = await window.supabaseClient
        .from('subscriptions')
        .update(supabaseSubscription)
        .eq('id', subscription.id)
        .select();

      if (error) {
        logDebug('Ошибка при обновлении подписки', error);
        throw error;
      }
      
      result = data[0];
      logDebug('Подписка успешно обновлена', result?.id);
    } else {
      // Создание новой подписки
      logDebug('Создание новой подписки');
      const { data, error } = await window.supabaseClient
        .from('subscriptions')
        .insert(supabaseSubscription)
        .select();

      if (error) {
        logDebug('Ошибка при создании подписки', error);
        throw error;
      }
      
      result = data[0];
      logDebug('Подписка успешно создана', result?.id);
    }

    // Преобразуем обратно в формат приложения
    return {
      ...subscription,
      id: result.id,
      billingDate: new Date(result.billing_date),
      isYearly: result.is_yearly,
      isWeekly: result.is_weekly,
      isTrial: result.is_trial,
      iconUrl: result.icon_url
    };
  } catch (error) {
    console.error('Исключение при сохранении подписки:', error);
    logDebug('Исключение при сохранении подписки', error.message);
    return null;
  }
}

// Функция для удаления подписки
window.deleteSubscription = async function(subscriptionId) {
  logDebug('Удаление подписки', subscriptionId);
  
  if (!subscriptionId) {
    logDebug('ID подписки не предоставлен');
    return false;
  }

  try {
    logDebug('Отправка запроса на удаление подписки');
    const { error } = await window.supabaseClient
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error('Ошибка при удалении подписки:', error);
      logDebug('Ошибка при удалении подписки', error);
      return false;
    }

    logDebug('Подписка успешно удалена');
    return true;
  } catch (error) {
    console.error('Исключение при удалении подписки:', error);
    logDebug('Исключение при удалении подписки', error.message);
    return false;
  }
} 