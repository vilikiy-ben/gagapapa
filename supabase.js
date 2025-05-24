// Конфигурация для Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.36.0/+esm';
import { decodeConfig } from './config.js';

// Переменные для хранения клиента Supabase
let supabase = null;

// Инициализация Supabase клиента
export async function initSupabase() {
  if (supabase) {
    return supabase;
  }

  try {
    // Получаем URL и ключ из конфигурации
    const { supabaseUrl, supabaseKey } = await decodeConfig();

    // Проверяем, что конфигурация загружена успешно
    if (!supabaseUrl || !supabaseKey) {
      console.error('Не удалось загрузить конфигурацию Supabase');
      return null;
    }

    // Создаем клиент Supabase
    supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
  } catch (error) {
    console.error('Ошибка при инициализации Supabase:', error);
    return null;
  }
}

// Получить инстанс клиента Supabase
export async function getSupabase() {
  if (!supabase) {
    return await initSupabase();
  }
  return supabase;
}

// Функция для создания или обновления пользователя
export async function createOrUpdateUser(telegramUser) {
  if (!telegramUser || !telegramUser.id) {
    console.error('Отсутствуют данные пользователя Telegram');
    return null;
  }

  try {
    const client = await getSupabase();
    if (!client) {
      throw new Error('Supabase клиент не инициализирован');
    }

    // Используем функцию из схемы public (куда мы добавили обертку)
    const { data, error } = await client.rpc('create_user_if_not_exists', {
      p_telegram_id: telegramUser.id,
      p_username: telegramUser.username || null,
      p_first_name: telegramUser.first_name || null,
      p_last_name: telegramUser.last_name || null,
      p_language_code: telegramUser.language_code || 'ru'
    });

    if (error) {
      console.error('Ошибка при создании/обновлении пользователя:', error.message);
      return null;
    }

    return data; // UUID пользователя
  } catch (error) {
    console.error('Ошибка при вызове API Supabase:', error.message);
    return null;
  }
}

// Получить подписки пользователя
export async function getUserSubscriptions() {
  try {
    const client = await getSupabase();
    if (!client) {
      throw new Error('Supabase клиент не инициализирован');
    }

    // Указываем схему subsviewer для таблицы subscriptions
    const { data, error } = await client
      .from('subsviewer.subscriptions')
      .select('*')
      .order('billing_date', { ascending: true });

    if (error) {
      console.error('Ошибка при получении подписок:', error.message);
      return [];
    }

    // Преобразуем данные из БД в формат, подходящий для приложения
    return data.map(sub => ({
      id: sub.id,
      name: sub.name,
      price: parseFloat(sub.price),
      isTrial: sub.is_trial,
      billingDate: new Date(sub.billing_date),
      color: sub.color || '#383838',
      isYearly: sub.is_yearly,
      isWeekly: sub.is_weekly,
      iconUrl: sub.icon_url
    }));
  } catch (error) {
    console.error('Ошибка при получении подписок:', error.message);
    return [];
  }
}

// Сохранить подписку
export async function saveSubscription(subscription, userId) {
  try {
    const client = await getSupabase();
    if (!client) {
      throw new Error('Supabase клиент не инициализирован');
    }

    // Преобразуем данные в формат БД
    const subData = {
      user_id: userId,
      name: subscription.name,
      price: subscription.price,
      is_trial: subscription.isTrial,
      billing_date: subscription.billingDate.toISOString(),
      color: subscription.color || '#383838',
      is_yearly: subscription.isYearly,
      is_weekly: subscription.isWeekly,
      icon_url: subscription.iconUrl
    };

    // Если есть ID, обновляем существующую подписку
    if (subscription.id && subscription.id.length > 10) { // Проверка на UUID
      // Указываем схему subsviewer для таблицы subscriptions
      const { data, error } = await client
        .from('subsviewer.subscriptions')
        .update(subData)
        .eq('id', subscription.id)
        .select();

      if (error) {
        console.error('Ошибка при обновлении подписки:', error.message);
        return null;
      }

      return data[0];
    } else {
      // Иначе создаем новую
      // Указываем схему subsviewer для таблицы subscriptions
      const { data, error } = await client
        .from('subsviewer.subscriptions')
        .insert(subData)
        .select();

      if (error) {
        console.error('Ошибка при создании подписки:', error.message);
        return null;
      }

      return data[0];
    }
  } catch (error) {
    console.error('Ошибка при сохранении подписки:', error.message);
    return null;
  }
}

// Удалить подписку
export async function deleteSubscription(subscriptionId) {
  try {
    const client = await getSupabase();
    if (!client) {
      throw new Error('Supabase клиент не инициализирован');
    }

    // Указываем схему subsviewer для таблицы subscriptions
    const { error } = await client
      .from('subsviewer.subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error('Ошибка при удалении подписки:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Ошибка при удалении подписки:', error.message);
    return false;
  }
}

// Миграция данных из localStorage в Supabase
export async function migrateFromLocalStorage(userId) {
  try {
    // Получаем данные из localStorage
    const storedData = localStorage.getItem('subscriptions');
    
    if (!storedData) {
      console.log('В localStorage нет данных для миграции');
      return false;
    }
    
    const localSubscriptions = JSON.parse(storedData);
    
    if (!Array.isArray(localSubscriptions) || localSubscriptions.length === 0) {
      console.log('Нет данных для миграции или данные в неверном формате');
      return false;
    }
    
    console.log(`Начинаем миграцию ${localSubscriptions.length} подписок`);
    
    // Преобразуем и сохраняем каждую подписку
    for (const sub of localSubscriptions) {
      const subscription = {
        id: null, // Новая запись в БД
        name: sub.name,
        price: sub.price,
        isTrial: sub.isTrial || false,
        billingDate: sub.billingDate instanceof Date ? sub.billingDate : new Date(sub.billingDate),
        color: sub.color || '#383838',
        isYearly: sub.isYearly || false,
        isWeekly: sub.isWeekly || false,
        iconUrl: sub.iconUrl || null
      };
      
      await saveSubscription(subscription, userId);
    }
    
    console.log('Миграция успешно завершена');
    
    // Очищаем localStorage после успешной миграции
    localStorage.removeItem('subscriptions');
    
    return true;
  } catch (error) {
    console.error('Ошибка при миграции данных:', error.message);
    return false;
  }
} 