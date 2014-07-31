
REVOKE CONNECT ON DATABASE DBNAME FROM public;
ALTER DATABASE DBNAME CONNECTION LIMIT 0;

-- 9.1
SELECT pg_terminate_backend(procpid)
FROM pg_stat_get_activity(NULL::integer)
WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');

-- SELECT pg_terminate_backend(pg_stat_activity.procpid)
-- FROM pg_stat_activity
-- WHERE pg_stat_activity.datname = 'DBNAME'
--   AND procpid <> pg_backend_pid();

-- 9.2+
SELECT pg_terminate_backend(pid)
FROM pg_stat_get_activity(NULL::integer)
WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');

-- SELECT pg_terminate_backend(pid)
--  FROM pg_stat_activity
--  WHERE pid <> pg_backend_pid()
--  AND datname='DBNAME';

DROP DATABASE IF EXISTS DBNAME;
DROP ROLE IF EXISTS USERNAME;

CREATE ROLE USERNAME ENCRYPTED PASSWORD 'PASSWD' LOGIN INHERIT SUPERUSER;
CREATE DATABASE DBNAME OWNER USERNAME;
GRANT ALL PRIVILEGES ON DATABASE DBNAME TO USERNAME;
