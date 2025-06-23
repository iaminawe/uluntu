import { QueryClient } from '@tanstack/react-query';

export function clearAllCaches(queryClient: QueryClient) {
  // Clear React Query cache
  queryClient.clear();
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage  
  sessionStorage.clear();
  
  console.log('All caches cleared!');
}

// Function to run in browser console
(window as any).clearCaches = () => {
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
};