-- 1. Удаляем все существующие политики для таблицы subscriptions
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'subscriptions'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON subscriptions';
        RAISE NOTICE 'Политика % успешно удалена', policy_record.policyname;
    END LOOP;
END
$$;

-- 1.1. Удаляем все существующие политики для таблицы profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON profiles';
        RAISE NOTICE 'Политика % успешно удалена', policy_record.policyname;
    END LOOP;
END
$$;

-- 2. Проверяем и создаем таблицу profiles с правильным типом данных
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        -- Создаем таблицу profiles, если она не существует
        CREATE TABLE profiles (
            id TEXT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Таблица profiles создана';
    ELSE
        -- Проверяем тип поля id
        DECLARE
            id_type TEXT;
        BEGIN
            SELECT data_type INTO id_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'id';
            
            IF id_type != 'text' THEN
                -- Создаем временную таблицу для сохранения данных
                CREATE TEMPORARY TABLE temp_profiles AS 
                SELECT * FROM profiles;
                
                -- Удаляем существующую таблицу
                DROP TABLE profiles CASCADE;
                
                -- Создаем таблицу с правильным типом данных
                CREATE TABLE profiles (
                    id TEXT PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,
                    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Восстанавливаем данные с приведением типов
                INSERT INTO profiles (id, username, first_name, last_name, last_active)
                SELECT id::TEXT, username, first_name, last_name, last_active
                FROM temp_profiles;
                
                RAISE NOTICE 'Таблица profiles изменена, тип id изменен на TEXT';
            ELSE
                RAISE NOTICE 'Таблица profiles уже существует и имеет правильную структуру';
            END IF;
        END;
    END IF;
END $$;

-- 3. Изменяем тип поля user_id в таблице subscriptions
DO $$ 
BEGIN
    -- Предварительно сохраняем данные во временную таблицу, чтобы не потерять их при миграции
    CREATE TEMPORARY TABLE temp_subscriptions AS 
    SELECT * FROM subscriptions;
    
    -- Временно удаляем внешний ключ и ограничения, если они есть
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_fkey' AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
    END IF;
    
    -- Изменяем тип поля user_id на TEXT с явным преобразованием
    ALTER TABLE subscriptions 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    
    -- Восстанавливаем внешний ключ, если таблица profiles существует
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
    
    RAISE NOTICE 'Тип столбца user_id успешно изменен на TEXT';
END $$;

-- 4. Включаем Row Level Security для таблиц, если еще не включена
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Создаем новые политики для subscriptions с правильным преобразованием типов
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text);

CREATE POLICY "Users can insert their own subscriptions" 
ON subscriptions FOR INSERT 
TO authenticated
WITH CHECK (user_id::text = (SELECT auth.uid())::text);

CREATE POLICY "Users can update their own subscriptions" 
ON subscriptions FOR UPDATE
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text)
WITH CHECK (user_id::text = (SELECT auth.uid())::text);

CREATE POLICY "Users can delete their own subscriptions" 
ON subscriptions FOR DELETE
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text);

-- 6. Создаем политики для profiles
CREATE POLICY "Пользователи могут видеть свой профиль" 
ON profiles FOR SELECT 
TO authenticated
USING (id::text = (SELECT auth.uid())::text);

CREATE POLICY "Пользователи могут создать свой профиль" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (id::text = (SELECT auth.uid())::text);

CREATE POLICY "Пользователи могут обновлять свой профиль" 
ON profiles FOR UPDATE
TO authenticated
USING (id::text = (SELECT auth.uid())::text)
WITH CHECK (id::text = (SELECT auth.uid())::text);

CREATE POLICY "Анонимные пользователи могут создать профиль" 
ON profiles FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Service role имеет полный доступ к профилям" 
ON profiles
USING (true);

-- 7. Проверяем установленные политики
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename IN ('subscriptions', 'profiles');

-- 8. Проверяем структуру таблиц после миграции
SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns
WHERE 
  table_name = 'profiles' AND column_name = 'id';

SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns
WHERE 
  table_name = 'subscriptions' AND column_name = 'user_id'; 