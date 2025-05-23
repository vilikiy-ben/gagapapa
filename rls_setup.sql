-- Включаем Row Level Security для таблицы subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Создаем политику для SELECT (просмотр подписок)
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text);

-- Создаем политику для INSERT (добавление подписок)
CREATE POLICY "Users can insert their own subscriptions" 
ON subscriptions FOR INSERT 
TO authenticated
WITH CHECK (user_id::text = (SELECT auth.uid())::text);

-- Создаем политику для UPDATE (обновление подписок)
CREATE POLICY "Users can update their own subscriptions" 
ON subscriptions FOR UPDATE
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text)
WITH CHECK (user_id::text = (SELECT auth.uid())::text);

-- Создаем политику для DELETE (удаление подписок)
CREATE POLICY "Users can delete their own subscriptions" 
ON subscriptions FOR DELETE
TO authenticated
USING (user_id::text = (SELECT auth.uid())::text); 