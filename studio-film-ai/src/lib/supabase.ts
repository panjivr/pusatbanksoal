import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localClient } from './local-store';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const storageMode = url && anonKey && !url.includes('your-project') && anonKey !== 'your-anon-key' ? 'cloud' : 'local';
// Public deployment defaults to local storage. A configured instance retains the upstream API.
export const supabase: SupabaseClient = storageMode === 'cloud'
  ? createClient(url!, anonKey!)
  : localClient as unknown as SupabaseClient;
