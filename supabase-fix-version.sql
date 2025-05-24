-- Создаем функцию version, чтобы можно было проверить соединение без запроса к таблицам

CREATE OR REPLACE FUNCTION public.version()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('server_version');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Даем права на выполнение функции анонимным пользователям
GRANT EXECUTE ON FUNCTION public.version() TO anon, authenticated; 