-- Предварительно сохраняем данные во временную таблицу, чтобы не потерять их при миграции
CREATE TEMPORARY TABLE temp_subscriptions AS 
SELECT * FROM subscriptions;

-- Проверяем, что данные скопировались успешно
SELECT count(*) FROM temp_subscriptions;

-- Временно удаляем внешний ключ и ограничения, если они есть
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_fkey' AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
    END IF;
END $$;

-- Изменяем тип поля user_id на TEXT с явным преобразованием
ALTER TABLE subscriptions 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Восстанавливаем внешний ключ, если таблица profiles существует
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
END $$;

-- Проверяем, что миграция успешно завершена
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'subscriptions' AND column_name = 'user_id'; 