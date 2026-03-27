## Supabase Postgres Best Practices

### 1. Schema Design

- **Use `uuid` for primary keys** instead of auto-incrementing integers
- **Use `timestamptz` for all timestamps** (not `timestamp`)
- **Use `text` instead of `varchar`** unless you have specific length constraints
- **Use `jsonb` for flexible data** instead of multiple columns
- **Use `enum` types** for status fields instead of text

### 2. Security

- **Use Row Level Security (RLS)** for all tables
- **Use `auth.uid()`** instead of user IDs in queries
- **Use `current_user_id()`** for RLS policies
- **Use `pgcrypto`** for sensitive data
- **Use `pgcrypto.gen_random_uuid()`** for generating UUIDs

### 3. Performance

- **Use `index` for frequently queried columns**
- **Use `partial index`** for filtering
- **Use `covering index`** for specific queries
- **Use `deferrable constraint`** for foreign keys
- **Use `materialized view`** for complex queries

### 4. Migrations

- **Use `supabase migration`** for all schema changes
- **Use `supabase db reset`** for development
- **Use `supabase db diff`** to check for changes
- **Use `supabase db push`** to apply changes
- **Use `supabase db pull`** to download schema

### 5. Best Practices

- **Use `async/await`** for all database operations
- **Use `try/catch`** for error handling
- **Use `console.log`** for debugging
- **Use `console.error`** for errors
- **Use `console.warn`** for warnings

### 6. Common Pitfalls

- **Don't use `timestamp`** - use `timestamptz` instead
- **Don't use `varchar`** - use `text` instead
- **Don't use `id`** - use `uuid` instead
- **Don't use `auth.uid()`** - use `current_user_id()` instead
- **Don't use `pgcrypto.gen_random_uuid()`** - use `uuid_generate_v4()` instead