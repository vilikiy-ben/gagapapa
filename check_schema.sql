-- Проверка и создание таблицы profiles, если она не существует
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Проверка и создание таблицы subscriptions, если она не существует
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL,
  billing_date DATE NOT NULL,
  is_yearly BOOLEAN DEFAULT FALSE,
  is_weekly BOOLEAN DEFAULT FALSE,
  is_trial BOOLEAN DEFAULT FALSE,
  icon_url TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Добавляем индекс для ускорения поиска подписок по user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Проверка типов данных в существующих таблицах
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'profiles';

SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'subscriptions'; 