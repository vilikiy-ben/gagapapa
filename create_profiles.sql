-- Проверяем, существует ли таблица profiles
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

-- Проверяем структуру таблицы profiles
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'profiles'; 