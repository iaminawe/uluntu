/**
 * Utility to clear onboarding flags for testing
 * Run this in browser console: clearOnboarding()
 */
export function clearOnboarding(userId?: string) {
  // Clear all onboarding-related localStorage keys
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('onboarding')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage too
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.includes('onboarding')) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  }
  
  console.log('Onboarding flags cleared. Refresh the page to see onboarding again.');
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearOnboarding = clearOnboarding;
}