import { mockSupabaseClient } from '../supabaseMock';

// Export the mock client
export const supabaseClient = mockSupabaseClient;

// Export constants used in the real implementation
export const SUPABASE_URL = 'https://example.supabase.co';
export const SUPABASE_KEY = 'mock-supabase-key';

// Export session cache mock
export const sessionCache = new WeakMap();

// Default export
export default supabaseClient;
