import { mockSupabaseClient } from './supabaseClient.ts';

// Create a session cache for optimized session conversion
export const sessionCache = new Map();

// Export the mock client as default export
export default mockSupabaseClient;
