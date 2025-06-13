import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables. Our Jest AST transformer will handle import.meta.env.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single instance to be reused across the app
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache for session conversions using WeakMap
export const sessionCache = new WeakMap();

export default supabaseClient;