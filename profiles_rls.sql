-- Включаем Row Level Security для таблицы profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политику для SELECT (просмотр профилей)
CREATE POLICY "Пользователи могут видеть свой профиль" 
ON profiles FOR SELECT 
TO authenticated
USING (id::text = (SELECT auth.uid())::text);

-- Создаем политику для INSERT (создание профиля)
CREATE POLICY "Пользователи могут создать свой профиль" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (id::text = (SELECT auth.uid())::text);

-- Создаем политику для UPDATE (обновление профиля)
CREATE POLICY "Пользователи могут обновлять свой профиль" 
ON profiles FOR UPDATE
TO authenticated
USING (id::text = (SELECT auth.uid())::text)
WITH CHECK (id::text = (SELECT auth.uid())::text);

-- Создаем дополнительную политику для анонимных пользователей (создание профиля)
CREATE POLICY "Анонимные пользователи могут создать профиль" 
ON profiles FOR INSERT 
TO anon
WITH CHECK (true);

-- Добавляем политику для service role (полный доступ)
CREATE POLICY "Service role имеет полный доступ к профилям" 
ON profiles
USING (true); 