-- 1. Reset: Clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;

-- 2. Create profiles table with expanded fields
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text not null,
  role text not null check (role in ('STUDENT', 'CLUB_LEAD', 'ADMIN')),
  student_year text, -- 1st Year, 2nd Year, etc.
  department text,
  mentored_club text, -- For Faculty
  avatar_url text,
  joined_clubs text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. Create Policies
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select 
  using (true);

create policy "Users can update own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

-- 5. Robust Trigger Function
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
declare
  u_name text;
  u_role text;
  u_meta_role text;
  u_year text;
  u_dept text;
  u_mentor text;
begin
  -- Get metadata
  u_meta_role := new.raw_user_meta_data->>'role';
  u_year := new.raw_user_meta_data->>'studentYear';
  u_dept := new.raw_user_meta_data->>'department';
  u_mentor := new.raw_user_meta_data->>'mentoredClub';

  -- Normalize Role
  if u_meta_role is not null and upper(u_meta_role) in ('STUDENT', 'CLUB_LEAD', 'ADMIN') then
    u_role := upper(u_meta_role);
  else
    u_role := 'STUDENT';
  end if;

  -- Name fallback
  u_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  insert into public.profiles (id, email, name, role, student_year, department, mentored_club, avatar_url)
  values (
    new.id, 
    new.email, 
    u_name, 
    u_role,
    u_year,
    u_dept,
    u_mentor,
    'https://ui-avatars.com/api/?name=' || replace(u_name, ' ', '+') || '&background=random'
  );
  
  return new;
end;
$$;

-- 6. Attach Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
