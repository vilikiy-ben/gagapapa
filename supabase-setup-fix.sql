-- Исправления для SQL-кода Supabase

-- 1. Исправление доступа к схеме subsviewer
GRANT USAGE ON SCHEMA subsviewer TO anon, authenticated;

-- 2. Скопировать функцию в схему public для совместимости
CREATE OR REPLACE FUNCTION public.create_user_if_not_exists(
    p_telegram_id BIGINT,
    p_username TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_language_code TEXT
) RETURNS UUID AS $$
BEGIN
    -- Вызываем существующую функцию из схемы subsviewer
    RETURN subsviewer.create_user_if_not_exists(
        p_telegram_id, 
        p_username, 
        p_first_name, 
        p_last_name, 
        p_language_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Предоставляем доступ к public функции
GRANT EXECUTE ON FUNCTION public.create_user_if_not_exists TO anon, authenticated;

-- 4. Предоставляем доступ к таблицам для анонимных пользователей
GRANT SELECT ON subsviewer.subscriptions TO anon;
GRANT SELECT ON subsviewer.users TO anon; 