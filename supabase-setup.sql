-- SQL-код для настройки базы данных Supabase для приложения SubsViewer

-- Включаем расширение для UUID, если ещё не включено
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем схему для приложения
CREATE SCHEMA IF NOT EXISTS subsviewer;

-- Создаем таблицу пользователей
CREATE TABLE subsviewer.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    user_sequence SERIAL, -- порядковый номер пользователя
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    language_code TEXT
);

-- Создаем таблицу подписок
CREATE TABLE subsviewer.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES subsviewer.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_trial BOOLEAN DEFAULT FALSE,
    billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    color TEXT DEFAULT '#383838',
    is_yearly BOOLEAN DEFAULT FALSE,
    is_weekly BOOLEAN DEFAULT FALSE,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для улучшения производительности
CREATE INDEX idx_subscriptions_user_id ON subsviewer.subscriptions(user_id);
CREATE INDEX idx_users_telegram_id ON subsviewer.users(telegram_id);
CREATE INDEX idx_subscriptions_billing_date ON subsviewer.subscriptions(billing_date);

-- Включаем Row Level Security для обеих таблиц
ALTER TABLE subsviewer.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsviewer.subscriptions ENABLE ROW LEVEL SECURITY;

-- Создаем функцию для проверки аутентификации через Telegram
CREATE OR REPLACE FUNCTION subsviewer.get_telegram_user_id() RETURNS BIGINT AS $$
BEGIN
    RETURN nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::BIGINT;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем политики доступа для таблицы пользователей
CREATE POLICY users_select_policy ON subsviewer.users
    FOR SELECT USING (telegram_id = subsviewer.get_telegram_user_id());

CREATE POLICY users_insert_policy ON subsviewer.users
    FOR INSERT WITH CHECK (telegram_id = subsviewer.get_telegram_user_id());

CREATE POLICY users_update_policy ON subsviewer.users
    FOR UPDATE USING (telegram_id = subsviewer.get_telegram_user_id());

-- Создаем политики доступа для таблицы подписок
CREATE POLICY subscriptions_select_policy ON subsviewer.subscriptions
    FOR SELECT USING (user_id IN (SELECT id FROM subsviewer.users WHERE telegram_id = subsviewer.get_telegram_user_id()));

CREATE POLICY subscriptions_insert_policy ON subsviewer.subscriptions
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM subsviewer.users WHERE telegram_id = subsviewer.get_telegram_user_id()));

CREATE POLICY subscriptions_update_policy ON subsviewer.subscriptions
    FOR UPDATE USING (user_id IN (SELECT id FROM subsviewer.users WHERE telegram_id = subsviewer.get_telegram_user_id()));

CREATE POLICY subscriptions_delete_policy ON subsviewer.subscriptions
    FOR DELETE USING (user_id IN (SELECT id FROM subsviewer.users WHERE telegram_id = subsviewer.get_telegram_user_id()));

-- Создаем функцию триггера для обновления timestamp
CREATE OR REPLACE FUNCTION subsviewer.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для обновления timestamp при изменении подписки
CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON subsviewer.subscriptions
FOR EACH ROW
EXECUTE FUNCTION subsviewer.update_timestamp();

-- Создаем триггер для обновления last_active_at при действиях пользователя
CREATE OR REPLACE FUNCTION subsviewer.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE subsviewer.users
    SET last_active_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_activity
AFTER INSERT OR UPDATE ON subsviewer.subscriptions
FOR EACH ROW
EXECUTE FUNCTION subsviewer.update_user_last_active();

-- Функция для автоматического создания пользователя при первом входе
CREATE OR REPLACE FUNCTION subsviewer.create_user_if_not_exists(
    p_telegram_id BIGINT,
    p_username TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_language_code TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM subsviewer.users WHERE telegram_id = p_telegram_id;
    
    IF v_user_id IS NULL THEN
        INSERT INTO subsviewer.users (
            telegram_id, 
            username, 
            first_name, 
            last_name, 
            language_code
        ) VALUES (
            p_telegram_id, 
            p_username, 
            p_first_name, 
            p_last_name, 
            p_language_code
        ) RETURNING id INTO v_user_id;
    ELSE
        -- Обновляем информацию пользователя, если она изменилась
        UPDATE subsviewer.users 
        SET 
            username = p_username,
            first_name = p_first_name,
            last_name = p_last_name,
            language_code = p_language_code,
            last_active_at = NOW()
        WHERE telegram_id = p_telegram_id;
    END IF;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Предоставляем доступ для анонимных пользователей к функции создания
GRANT EXECUTE ON FUNCTION subsviewer.create_user_if_not_exists TO anon;

-- Предоставляем доступ к таблицам для аутентифицированных пользователей
GRANT SELECT, INSERT, UPDATE ON subsviewer.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subsviewer.subscriptions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE subsviewer.users_user_sequence_seq TO authenticated; 