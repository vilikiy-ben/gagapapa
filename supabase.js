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

// Функция для анонимной аутентификации пользователя
window.signInAnonymously = async function() {
  try {
    logDebug('Попытка анонимной аутентификации');
    
    // Генерируем уникальный ID для сессии с валидным форматом email
    const randomId = Math.random().toString(36).substring(2, 10);
    const email = `user_${randomId}@example.com`;
    const password = `password_${Date.now()}_${randomId}`;
    
    // Создаем анонимного пользователя с валидным email
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      logDebug('Ошибка при анонимной аутентификации', error);
      
      // Если email уже используется, попробуем просто авторизоваться
      if (error.message.includes('already registered')) {
        logDebug('Пробуем использовать аноним-гостя (service role)');
        
        // Вместо аутентификации просто будем полагаться на политику анонимного доступа
        return false;
      }
      return false;
    }
    
    logDebug('Анонимная аутентификация успешна', data?.user?.id);
    return true;
  } catch (err) {
    logDebug('Исключение при анонимной аутентификации', err.message);
    return false;
  }
}

try {
  // Создание клиента Supabase, доступного глобально
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  logDebug('Supabase клиент создан');
  
  // Выполняем анонимную аутентификацию сразу после создания клиента
  window.signInAnonymously()
    .then(success => {
      if (success) {
        logDebug('Пользователь успешно аутентифицирован анонимно');
      } else {
        logDebug('Не удалось выполнить анонимную аутентификацию');
      }
    });
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
    // Сначала проверим текущую сессию и при необходимости выполним анонимную аутентификацию
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session || !session.session) {
      logDebug('Активная сессия не найдена, выполняем анонимную аутентификацию');
      const authSuccess = await window.signInAnonymously();
      if (!authSuccess) {
        logDebug('Не удалось выполнить аутентификацию, но продолжаем работу');
      }
    } else {
      logDebug('Используем существующую сессию', session.session.user.id);
    }
    
    logDebug('Подготовка данных пользователя для Supabase');
    
    // Преобразуем ID пользователя к строке для совместимости с разными типами данных
    const userId = String(telegramUser.id);
    
    // Проверяем наличие пользователя в таблице profiles
    const { data: existingProfiles, error: selectError } = await window.supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', userId);
      
    if (selectError) {
      logDebug('Ошибка при проверке существования профиля', selectError);
      // Если происходит ошибка при проверке, проверяем, связана ли она с RLS
      if (selectError.code === '42501' || selectError.message.includes('policy')) {
        logDebug('Обнаружена ошибка RLS, пытаемся создать профиль');
        
        // Создаем новую запись профиля
        const profileData = {
          id: userId,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          last_active: new Date()
        };
        
        const { error: insertError } = await window.supabaseClient
          .from('profiles')
          .insert([profileData]);
          
        if (insertError) {
          logDebug('Не удалось создать профиль', insertError);
          
          // Даже если не удалось создать профиль, возвращаем ID пользователя
          // для продолжения работы приложения
          return userId;
        }
        
        logDebug('Профиль успешно создан');
        return userId;
      }
      
      // Возвращаем ID пользователя, чтобы приложение могло работать
      return userId;
    }
    
    // Если профиль не существует, создаем его
    if (!existingProfiles || existingProfiles.length === 0) {
      logDebug('Профиль не существует, создаем новый');
      
      const profileData = {
        id: userId,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        last_active: new Date()
      };
      
      const { error: insertError } = await window.supabaseClient
        .from('profiles')
        .insert([profileData]);
        
      if (insertError) {
        logDebug('Ошибка при создании профиля', insertError);
        
        // Даже если не удалось создать профиль, возвращаем ID пользователя
        return userId;
      }
      
      logDebug('Профиль успешно создан');
    } else {
      // Если профиль существует, обновляем время активности
      logDebug('Обновление времени последней активности');
      
      const { error: updateError } = await window.supabaseClient
        .from('profiles')
        .update({ last_active: new Date() })
        .eq('id', userId);
        
      if (updateError) {
        logDebug('Ошибка при обновлении времени активности', updateError);
        // Это не критично, основная информация у нас уже есть
      }
    }

    logDebug('Обработка профиля завершена', userId);
    return userId;
  } catch (error) {
    console.error('Исключение при сохранении профиля:', error);
    logDebug('Исключение при сохранении профиля', error.message);
    // Возвращаем ID пользователя чтобы приложение могло работать
    return String(telegramUser.id);
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
    // Проверяем текущую сессию и при необходимости выполняем анонимную аутентификацию
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session || !session.session) {
      logDebug('Активная сессия не найдена перед загрузкой подписок, выполняем анонимную аутентификацию');
      const authSuccess = await window.signInAnonymously();
      if (!authSuccess) {
        logDebug('Не удалось выполнить аутентификацию перед загрузкой подписок');
        // Продолжаем работу, но могут быть проблемы с RLS
      }
    } else {
      logDebug('Используем существующую сессию для загрузки подписок', session.session.user.id);
    }
    
    // Преобразуем ID пользователя к строке для совместимости с разными типами данных
    const userIdStr = String(userId);
    
    logDebug('Отправка запроса на загрузку подписок из Supabase');
    const { data, error } = await window.supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userIdStr);

    if (error) {
      console.error('Ошибка при загрузке подписок из Supabase:', error);
      logDebug('Ошибка при загрузке подписок из Supabase', error);
      
      // В случае ошибки RLS или других проблем с Supabase используем локальное хранилище
      return await loadFromLocalStorage();
    }

    logDebug(`Успешно загружено ${data?.length || 0} подписок из Supabase`);
    
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
    
    // Обновляем localStorage для синхронизации с сервером
    try {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      logDebug('Подписки из Supabase синхронизированы с localStorage');
    } catch (storageError) {
      logDebug('Ошибка при сохранении в localStorage', storageError.message);
      // Это не критично для работы
    }
    
    return subscriptions;
  } catch (error) {
    console.error('Исключение при загрузке подписок из Supabase:', error);
    logDebug('Исключение при загрузке подписок из Supabase, пробуем localStorage', error.message);
    
    // При любой ошибке используем localStorage
    return await loadFromLocalStorage();
  }
  
  // Вспомогательная функция для загрузки из localStorage
  async function loadFromLocalStorage() {
    logDebug('Загрузка подписок из localStorage');
    try {
      const storedData = localStorage.getItem('subscriptions');
      if (storedData) {
        const localSubscriptions = JSON.parse(storedData);
        logDebug('Загружены подписки из localStorage', localSubscriptions.length);
        
        // Преобразуем строковые даты в объекты Date и фильтруем по ID пользователя
        return localSubscriptions.map(sub => {
          if (typeof sub.billingDate === 'string') {
            return {
              ...sub,
              billingDate: new Date(sub.billingDate)
            };
          }
          return sub;
        }).filter(sub => String(sub.user_id) === String(userId)); // Строгое сравнение строковых представлений ID
      }
    } catch (localError) {
      logDebug('Ошибка при загрузке из localStorage', localError.message);
    }
    
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
    // Проверяем текущую сессию и при необходимости выполняем анонимную аутентификацию
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session || !session.session) {
      logDebug('Активная сессия не найдена перед сохранением подписки, выполняем анонимную аутентификацию');
      const authSuccess = await window.signInAnonymously();
      if (!authSuccess) {
        logDebug('Не удалось выполнить аутентификацию перед сохранением подписки');
        // Продолжаем работу, но могут быть проблемы с RLS
      }
    } else {
      logDebug('Используем существующую сессию для сохранения подписки', session.session.user.id);
    }
    
    // Преобразуем ID пользователя к строке для совместимости с разными типами данных
    const userIdStr = String(userId);
    
    // Преобразуем структуру подписки для Supabase
    const supabaseSubscription = {
      user_id: userIdStr,
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
    
    // Сохраняем в Supabase
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
      logDebug('Подписка успешно создана в Supabase', result?.id);
    }

    // Сохраняем копию в localStorage для резервного копирования
    try {
      // Получаем существующие подписки
      let localSubscriptions = [];
      const storedData = localStorage.getItem('subscriptions');
      if (storedData) {
        localSubscriptions = JSON.parse(storedData);
      }
      
      // Находим индекс подписки в массиве если она существует
      const index = localSubscriptions.findIndex(s => s.id === result.id);
      
      // Преобразуем для локального хранения
      const localSubscription = {
        id: result.id,
        user_id: userIdStr, // Используем строковое представление ID
        name: result.name,
        price: result.price,
        isYearly: result.is_yearly || false,
        isWeekly: result.is_weekly || false,
        isTrial: result.is_trial || false,
        billingDate: new Date(result.billing_date),
        iconUrl: result.icon_url || null,
        color: result.color || null
      };
      
      if (index !== -1) {
        // Обновляем существующую подписку
        localSubscriptions[index] = localSubscription;
      } else {
        // Добавляем новую
        localSubscriptions.push(localSubscription);
      }
      
      // Сохраняем в localStorage
      localStorage.setItem('subscriptions', JSON.stringify(localSubscriptions));
      logDebug('Подписка также сохранена в localStorage для резервного копирования');
    } catch (storageError) {
      logDebug('Ошибка при сохранении в localStorage, но в Supabase сохранено успешно', storageError.message);
      // Это не критично, так как данные уже сохранены в Supabase
    }

    // Преобразуем обратно в формат приложения для возврата
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
    console.error('Ошибка при сохранении подписки:', error);
    logDebug('Ошибка при сохранении подписки', error.message);
    
    // Если произошла ошибка при сохранении в Supabase, 
    // пытаемся временно сохранить только в localStorage
    logDebug('Пытаемся временно сохранить только в localStorage');
    try {
      // Получаем существующие подписки из localStorage
      let localSubscriptions = [];
      const storedData = localStorage.getItem('subscriptions');
      if (storedData) {
        localSubscriptions = JSON.parse(storedData);
      }
      
      // Создаем уникальный ID для локальной подписки
      const localId = subscription.id || 'local_' + Date.now();
      
      // Преобразуем для локального хранения
      const localSubscription = {
        id: localId,
        user_id: String(userId), // Используем строковое представление ID
        name: subscription.name,
        price: subscription.price,
        isYearly: subscription.isYearly || false,
        isWeekly: subscription.isWeekly || false,
        isTrial: subscription.isTrial || false,
        billingDate: subscription.billingDate,
        iconUrl: subscription.iconUrl || null,
        color: subscription.color || null
      };
      
      const index = localSubscriptions.findIndex(s => s.id === localId);
      if (index !== -1) {
        // Обновляем существующую подписку
        localSubscriptions[index] = localSubscription;
      } else {
        // Добавляем новую
        localSubscriptions.push(localSubscription);
      }
      
      // Сохраняем в localStorage
      localStorage.setItem('subscriptions', JSON.stringify(localSubscriptions));
      logDebug('Подписка временно сохранена в localStorage', localSubscription.id);
      
      return localSubscription;
    } catch (storageError) {
      logDebug('Не удалось сохранить даже в localStorage', storageError.message);
      return null;
    }
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
    // Проверяем текущую сессию и при необходимости выполняем анонимную аутентификацию
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session || !session.session) {
      logDebug('Активная сессия не найдена перед удалением подписки, выполняем анонимную аутентификацию');
      const authSuccess = await window.signInAnonymously();
      if (!authSuccess) {
        logDebug('Не удалось выполнить аутентификацию перед удалением подписки');
        // Продолжаем работу, но могут быть проблемы с RLS
      }
    } else {
      logDebug('Используем существующую сессию для удаления подписки', session.session.user.id);
    }
    
    // Преобразуем ID в строку для совместимости
    const subscriptionIdStr = String(subscriptionId);
    
    // Проверяем, является ли ID локальным
    const isLocalId = subscriptionIdStr.startsWith('local_');
    
    if (!isLocalId) {
      // Удаляем из Supabase
      logDebug('Отправка запроса на удаление подписки из Supabase');
      const { error } = await window.supabaseClient
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionIdStr);

      if (error) {
        console.error('Ошибка при удалении подписки из Supabase:', error);
        logDebug('Ошибка при удалении подписки из Supabase', error);
        throw error; // Пробрасываем ошибку для дальнейшей обработки
      }
      
      logDebug('Подписка успешно удалена из Supabase');
    } else {
      logDebug('Удаление локальной подписки (не из Supabase)');
    }
    
    // Также удаляем из localStorage, чтобы синхронизировать данные
    try {
      const storedData = localStorage.getItem('subscriptions');
      if (storedData) {
        const localSubscriptions = JSON.parse(storedData);
        const filteredSubscriptions = localSubscriptions.filter(sub => String(sub.id) !== subscriptionIdStr);
        
        if (filteredSubscriptions.length !== localSubscriptions.length) {
          // Если есть изменения, сохраняем обновленный список
          localStorage.setItem('subscriptions', JSON.stringify(filteredSubscriptions));
          logDebug('Подписка также удалена из localStorage');
        }
      }
    } catch (localError) {
      logDebug('Ошибка при удалении подписки из localStorage', localError.message);
      // Это не критично, так как из Supabase уже удалено
    }

    return true; // Возвращаем успех операции
  } catch (error) {
    console.error('Исключение при удалении подписки:', error);
    logDebug('Исключение при удалении подписки', error.message);
    
    // Если не удалось удалить из Supabase, но ID локальный, то пытаемся удалить только из localStorage
    if (String(subscriptionId).startsWith('local_')) {
      try {
        const storedData = localStorage.getItem('subscriptions');
        if (storedData) {
          const localSubscriptions = JSON.parse(storedData);
          const filteredSubscriptions = localSubscriptions.filter(sub => String(sub.id) !== String(subscriptionId));
          
          if (filteredSubscriptions.length !== localSubscriptions.length) {
            localStorage.setItem('subscriptions', JSON.stringify(filteredSubscriptions));
            logDebug('Локальная подписка удалена из localStorage');
            return true;
          }
        }
      } catch (e) {
        logDebug('Ошибка при удалении локальной подписки', e.message);
      }
    }
    
    return false;
  }
} 