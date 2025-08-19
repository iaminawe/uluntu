import React from 'react';
import { render } from '@testing-library/react';
import { MenuProvider } from '@/features/menu/contexts/MenuContext';
import { NavigationProvider } from '@/providers/NavigationProvider';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    }))
  }
}));

jest.mock('@/hooks/useSettings', () => ({
  useEnabledFeatures: () => ({
    features: {},
    isFeatureEnabled: jest.fn(() => false)
  })
}));

jest.mock('@/shared/contexts/SessionContextWithRedux', () => ({
  useSession: () => ({
    session: null,
    user: null
  })
}));

describe('Menu System Fixes', () => {
  it('should render MenuProvider and NavigationProvider without warnings', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const TestComponent = () => (
      <MenuProvider>
        <NavigationProvider>
          <div>Test Content</div>
        </NavigationProvider>
      </MenuProvider>
    );
    
    const { container } = render(<TestComponent />);
    
    // Check that no errors or warnings were logged
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Cannot update a component')
    );
    
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Unknown menu position')
    );
    
    // Clean up
    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });
});