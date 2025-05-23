-- Сначала выведем список существующих политик для проверки
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Попробуем удалить каждую политику по конкретному имени
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Аутентифицированные пользователи могут видеть подписки" ON subscriptions;
DROP POLICY IF EXISTS "Аутентифицированные пользователи могут создавать подписки" ON subscriptions;
DROP POLICY IF EXISTS "Аутентифицированные пользователи могут обновлять подписки" ON subscriptions;
DROP POLICY IF EXISTS "Аутентифицированные пользователи могут удалять подписки" ON subscriptions;
DROP POLICY IF EXISTS "Аутентифицированные пользователи" ON subscriptions;

-- Убедимся, что все политики удалены
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Создаем политики с короткими уникальными именами
-- Разрешаем аутентифицированным пользователям видеть все подписки
CREATE POLICY "auth_select" 
ON subscriptions FOR SELECT 
TO authenticated
USING (true);

-- Разрешаем аутентифицированным пользователям создавать подписки
CREATE POLICY "auth_insert" 
ON subscriptions FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Разрешаем аутентифицированным пользователям обновлять подписки
CREATE POLICY "auth_update" 
ON subscriptions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Разрешаем аутентифицированным пользователям удалять подписки
CREATE POLICY "auth_delete" 
ON subscriptions FOR DELETE
TO authenticated
USING (true);

-- Проверяем установленные политики
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'subscriptions'; 