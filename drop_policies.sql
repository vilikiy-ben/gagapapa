-- Сначала получаем список всех политик для таблицы subscriptions
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Удаляем все существующие политики для таблицы subscriptions
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

-- Проверяем, что все политики удалены
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'subscriptions'; 