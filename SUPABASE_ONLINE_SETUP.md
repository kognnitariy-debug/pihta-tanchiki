# ПИХТА-ТАНЧИКИ Build 2 Online

Сетевой режим работает через Supabase REST API и короткий polling. Backend в проект не добавлен.

## 1. Создать таблицу

В Supabase открой SQL Editor и выполни:

```sql
create table if not exists public.rooms (
  id text primary key,
  state jsonb not null,
  player1_token text not null,
  player2_token text,
  updated_at timestamptz default now()
);

alter table public.rooms enable row level security;

create policy "rooms_select_all"
on public.rooms for select
using (true);

create policy "rooms_insert_all"
on public.rooms for insert
with check (true);

create policy "rooms_update_all"
on public.rooms for update
using (true)
with check (true);
```

Для MVP безопасность держится на случайном коде комнаты и локальном токене игрока.
Позже можно ужесточить policies через RPC-функции.

## 2. Добавить env

Локально создай `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

В Vercel добавь такие же переменные в:

`Project Settings -> Environment Variables`

## 3. Как играть

1. Первый игрок открывает игру и жмёт `Сетевая игра`.
2. Жмёт `Создать комнату`.
3. Отправляет ссылку вида `/room/ABCDE` второму игроку.
4. Второй игрок открывает ссылку и жмёт `Войти`.
5. Кнопка броска активна только у игрока, чей сейчас ход.

## Ограничения Build 2 MVP

- Синхронизация идёт polling-ом примерно раз в 1.4 секунды.
- Нет регистрации и паролей.
- Если оба игрока одновременно откроют одну комнату с разных вкладок, локальный токен определит роль.
- Realtime WebSocket можно добавить позже, когда MVP будет проверен.
