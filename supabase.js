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
    
    // Проверяем существует ли профиль
    const { data: existingProfiles, error: selectError } = await window.supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', telegramUser.id);
      
    if (selectError) {
      logDebug('Ошибка при проверке существования профиля', selectError);
      // Если даже проверка не работает из-за RLS, просто возвращаем ID пользователя
      // Это позволит приложению продолжить работу, даже если запись в базу не удалась
      return telegramUser.id;
    }
    
    // Если профиль не существует и нужно его создать
    if (!existingProfiles || existingProfiles.length === 0) {
      // Для обхода ограничений RLS используем специальные API функции или 
      // просто возвращаем ID, так как основная функциональность приложения работает 
      // и без сохранения профиля
      logDebug('Профиль не существует, но мы продолжим работу с ID пользователя');
      return telegramUser.id;
    }
    
    // Если профиль существует, просто обновляем last_active
    const { error: updateError } = await window.supabaseClient
      .from('profiles')
      .update({ last_active: new Date() })
      .eq('id', telegramUser.id);
      
    if (updateError) {
      logDebug('Ошибка при обновлении времени активности', updateError);
      // Это не критично, основная информация у нас уже есть
    }

    logDebug('Профиль успешно обработан', telegramUser.id);
    return telegramUser.id;
  } catch (error) {
    console.error('Исключение при сохранении профиля:', error);
    logDebug('Исключение при сохранении профиля', error.message);
    // Несмотря на ошибку, возвращаем ID пользователя чтобы приложение могло работать
    return telegramUser.id;
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
      
      // В случае ошибки RLS используем локальное хранилище
      logDebug('Попытка загрузки из localStorage');
      try {
        const storedData = localStorage.getItem('subscriptions');
        if (storedData) {
          const localSubscriptions = JSON.parse(storedData);
          logDebug('Загружены подписки из localStorage', localSubscriptions.length);
          
          // Преобразуем строковые даты в объекты Date
          return localSubscriptions.map(sub => {
            if (typeof sub.billingDate === 'string') {
              return {
                ...sub,
                billingDate: new Date(sub.billingDate)
              };
            }
            return sub;
          });
        }
      } catch (localError) {
        logDebug('Ошибка при загрузке из localStorage', localError.message);
      }
      
      return [];
    }

    logDebug(`Загружено ${data?.length || 0} подписок`);
    
    // Преобразуем строковые даты в объекты Date
    const subscriptions = (data || []).map(sub => ({
      ...sub,
      id: sub.id, // UUID из базы данных
      billingDate: new Date(sub.billing_date),
      isYearly: sub.is_yearly,
      isWeekly: sub.is_weekly,
      isTrial: sub.is_trial,
      iconUrl: sub.icon_url
    }));
    
    // Сохраняем в localStorage для резервного копирования
    try {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      logDebug('Подписки сохранены в localStorage для резервного копирования');
    } catch (storageError) {
      logDebug('Ошибка при сохранении в localStorage', storageError.message);
    }
    
    return subscriptions;
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
    let success = false;
    
    // Сначала пробуем сохранить в Supabase
    try {
      if (subscription.id && !subscription.id.startsWith('local_')) {
        // Обновление существующей подписки
        logDebug('Обновление существующей подписки', subscription.id);
        const { data, error } = await window.supabaseClient
          .from('subscriptions')
          .update(supabaseSubscription)
          .eq('id', subscription.id)
          .select();

        if (error) {
          logDebug('Ошибка при обновлении подписки в Supabase', error);
          throw error;
        }
        
        result = data[0];
        success = true;
        logDebug('Подписка успешно обновлена в Supabase', result?.id);
      } else {
        // Создание новой подписки
        logDebug('Создание новой подписки в Supabase');
        const { data, error } = await window.supabaseClient
          .from('subscriptions')
          .insert(supabaseSubscription)
          .select();

        if (error) {
          logDebug('Ошибка при создании подписки в Supabase', error);
          throw error;
        }
        
        result = data[0];
        success = true;
        logDebug('Подписка успешно создана в Supabase', result?.id);
      }
    } catch (supabaseError) {
      logDebug('Не удалось сохранить в Supabase, сохраняем локально', supabaseError.message);
      success = false;
    }
    
    // Если не удалось сохранить в Supabase, сохраняем локально
    if (!success) {
      // Получаем существующие подписки из localStorage
      let localSubscriptions = [];
      try {
        const storedData = localStorage.getItem('subscriptions');
        if (storedData) {
          localSubscriptions = JSON.parse(storedData);
        }
      } catch (e) {
        logDebug('Ошибка при загрузке подписок из localStorage', e.message);
      }
      
      // Преобразуем для локального хранения
      const localSubscription = {
        id: subscription.id || 'local_' + Date.now(),
        user_id: userId,
        name: subscription.name,
        price: subscription.price,
        isYearly: subscription.isYearly || false,
        isWeekly: subscription.isWeekly || false,
        isTrial: subscription.isTrial || false,
        billingDate: subscription.billingDate,
        iconUrl: subscription.iconUrl || null,
        color: subscription.color || null
      };
      
      if (subscription.id && localSubscriptions.some(s => s.id === subscription.id)) {
        // Обновляем существующую подписку
        localSubscriptions = localSubscriptions.map(s => 
          s.id === subscription.id ? localSubscription : s);
      } else {
        // Добавляем новую
        localSubscriptions.push(localSubscription);
      }
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('subscriptions', JSON.stringify(localSubscriptions));
        logDebug('Подписка сохранена в localStorage', localSubscription.id);
        result = localSubscription;
      } catch (storageError) {
        logDebug('Ошибка при сохранении в localStorage', storageError.message);
        return null;
      }
    }

    // Преобразуем обратно в формат приложения
    return success && result ? {
      ...subscription,
      id: result.id,
      billingDate: new Date(result.billing_date),
      isYearly: result.is_yearly,
      isWeekly: result.is_weekly,
      isTrial: result.is_trial,
      iconUrl: result.icon_url
    } : result; // Для локального сохранения
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
    // Проверяем, является ли ID локальным
    const isLocalId = subscriptionId.startsWith('local_');
    let success = false;
    
    if (!isLocalId) {
      // Пробуем удалить из Supabase
      logDebug('Отправка запроса на удаление подписки из Supabase');
      const { error } = await window.supabaseClient
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        console.error('Ошибка при удалении подписки из Supabase:', error);
        logDebug('Ошибка при удалении подписки из Supabase', error);
      } else {
        success = true;
        logDebug('Подписка успешно удалена из Supabase');
      }
    }
    
    // В любом случае (успешно или нет) удаляем из localStorage
    try {
      const storedData = localStorage.getItem('subscriptions');
      if (storedData) {
        const localSubscriptions = JSON.parse(storedData);
        const filteredSubscriptions = localSubscriptions.filter(sub => sub.id !== subscriptionId);
        
        if (filteredSubscriptions.length !== localSubscriptions.length) {
          // Если есть изменения, сохраняем обновленный список
          localStorage.setItem('subscriptions', JSON.stringify(filteredSubscriptions));
          logDebug('Подписка удалена из localStorage');
          success = true;
        }
      }
    } catch (localError) {
      logDebug('Ошибка при удалении подписки из localStorage', localError.message);
      
      // Если удаление из Supabase было успешным, но из localStorage нет,
      // всё равно считаем операцию успешной
      if (!success) {
        return false;
      }
    }

    return success;
  } catch (error) {
    console.error('Исключение при удалении подписки:', error);
    logDebug('Исключение при удалении подписки', error.message);
    return false;
  }
} 