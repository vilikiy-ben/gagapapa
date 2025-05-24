// Конфигурация для приложения SubsViewer
// Эти данные закодированы для базовой защиты

// Константы приложения
export const APP_CONFIG = {
  // Закодированные данные Supabase - НЕ ИСПОЛЬЗУЙТЕ этот подход для реальных секретов!
  // Для продакшн-версии лучше использовать серверное API или аутентификацию через OAuth
  encodedSupabaseUrl: "aHR0cHM6Ly9jdXFjb21rYnF2cXFhb3pmZ29ycy5zdXBhYmFzZS5jbw==", // Base64
  encodedAnonKey: "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1OMWNXTnZiV3RpY1haeGNXRnZlbVpuYjNKeklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTkRneE1USXpNVGdzSW1WNGNDSTZNakEyTXpZNE9ETXhPSDAuYXBUZXR2clFza2dpX1N0REtYZm1kVm1YOTAwSFBiQnlsaFY5MmYtdDBSVQ===", // Base64
  
  // Другие настройки приложения
  appName: "SubsViewer",
  appVersion: "2.0.0",
  apiVersion: "1.0"
};

// Функция для декодирования данных
export async function decodeConfig() {
  try {
    // Проверяем наличие локальной конфигурации для разработки
    let localConfig;
    try {
      localConfig = await import('./config.local.js')
        .then(module => module.getLocalConfig())
        .catch(() => null);
      
      // Если нашли локальную конфигурацию и она содержит ключи - используем их
      if (localConfig && localConfig.supabaseUrl && localConfig.supabaseKey) {
        console.log('Используем локальную конфигурацию для разработки');
        return {
          supabaseUrl: localConfig.supabaseUrl,
          supabaseKey: localConfig.supabaseKey,
          isDevelopment: true
        };
      }
    } catch (importError) {
      console.log('Локальная конфигурация не найдена, используем закодированные данные');
    }
    
    // Если локальной конфигурации нет, используем закодированные данные
    const url = atob(APP_CONFIG.encodedSupabaseUrl);
    const key = atob(APP_CONFIG.encodedAnonKey);
    
    return { 
      supabaseUrl: url, 
      supabaseKey: key,
      isDevelopment: false
    };
  } catch (error) {
    console.error('Ошибка при декодировании конфигурации:', error);
    return { 
      supabaseUrl: null, 
      supabaseKey: null,
      isDevelopment: false
    };
  }
} 