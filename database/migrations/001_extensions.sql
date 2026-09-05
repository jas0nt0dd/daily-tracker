-- 001_extensions.sql
-- Enable extensions required by later migrations.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- gen_random_uuid()
