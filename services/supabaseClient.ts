import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avgnqdnyicuhbwibxwsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gIyN7EJqhY7wQS5xZfehaA_5_PiYBH9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
