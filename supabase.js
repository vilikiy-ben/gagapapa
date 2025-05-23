// Конфигурация Supabase для подключения к базе данных
// Используем глобальный объект Supabase, загруженный через CDN

// Учетные данные Supabase
const supabaseUrl = 'https://kfzrrdppyjmspsswpuij.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmenJyZHBweWptc3Bzc3dwdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjY2MzIsImV4cCI6MjA2MzYwMjYzMn0.nxKuQrJuzwM4Cnpbuo7ByLsuZG2dAPgAgZgSQB5IDQs'

// Создание клиента Supabase, доступного глобально
window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// Функция для сохранения профиля пользователя из Telegram
window.saveUserProfile = async function(telegramUser) {
  if (!telegramUser || !telegramUser.id) {
    console.error('Ошибка: не удалось получить данные пользователя Telegram')
    return null
  }

  try {
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
      })

    if (error) {
      console.error('Ошибка при сохранении профиля:', error)
      return null
    }

    return telegramUser.id
  } catch (error) {
    console.error('Ошибка при сохранении профиля:', error)
    return null
  }
}

// Функция для загрузки подписок пользователя
window.loadUserSubscriptions = async function(userId) {
  if (!userId) return []

  try {
    const { data, error } = await window.supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Ошибка при загрузке подписок:', error)
      return []
    }

    // Преобразуем строковые даты в объекты Date
    return data.map(sub => ({
      ...sub,
      id: sub.id, // UUID из базы данных
      billingDate: new Date(sub.billing_date),
      isYearly: sub.is_yearly,
      isWeekly: sub.is_weekly,
      isTrial: sub.is_trial,
      iconUrl: sub.icon_url
    }))
  } catch (error) {
    console.error('Ошибка при загрузке подписок:', error)
    return []
  }
}

// Функция для сохранения подписки пользователя
window.saveSubscription = async function(userId, subscription) {
  if (!userId || !subscription) return null

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
    }

    let result
    
    if (subscription.id && !subscription.id.startsWith('local_')) {
      // Обновление существующей подписки
      const { data, error } = await window.supabaseClient
        .from('subscriptions')
        .update(supabaseSubscription)
        .eq('id', subscription.id)
        .select()

      if (error) throw error
      result = data[0]
    } else {
      // Создание новой подписки
      const { data, error } = await window.supabaseClient
        .from('subscriptions')
        .insert(supabaseSubscription)
        .select()

      if (error) throw error
      result = data[0]
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
    }
  } catch (error) {
    console.error('Ошибка при сохранении подписки:', error)
    return null
  }
}

// Функция для удаления подписки
window.deleteSubscription = async function(subscriptionId) {
  if (!subscriptionId) return false

  try {
    const { error } = await window.supabaseClient
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)

    if (error) {
      console.error('Ошибка при удалении подписки:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Ошибка при удалении подписки:', error)
    return false
  }
} 