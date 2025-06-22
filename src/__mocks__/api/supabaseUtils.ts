// Mock supabaseUtils
export const supabase = {
  from: jest.fn()
};

export const handleSupabaseError = jest.fn((_error: any, context?: string) => {
  throw new Error(context ? `Error while ${context}` : 'Supabase error');
});