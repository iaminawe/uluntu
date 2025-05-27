import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || '';

// Create a single instance to be reused across the app
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache for session conversions using WeakMap
export const sessionCache = new WeakMap();

export default supabaseClient;