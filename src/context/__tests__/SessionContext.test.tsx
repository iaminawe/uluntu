import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Session, User, AuthChangeEvent, Subscription } from '@supabase/supabase-js'
import { SessionProvider, useSession } from '../SessionContext'
import { supabase } from '@/lib/supabase'

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          }
        }
      })),
      signOut: jest.fn()
    }
  }
}))

const mockUser: User = {
  id: 'mock-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  identities: [],
  factors: []
}

const mockSession: Session = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1234567890,
  user: mockUser
}

// Test component to consume context
const TestConsumer = () => {
  const { session, user, loading, signOut } = useSession()
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('SessionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    })

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })

  it('should handle successful session retrieval', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: mockSession },
      error: null
    })

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('session')).toHaveTextContent('has-session')
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!)
    })
  })

  it('should handle auth state changes', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: null },
      error: null
    })

    // Setup auth state change handler
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void = () => {}
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback as typeof authChangeCallback
      return {
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          } as Subscription
        }
      }
    })

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    )

    // Simulate auth state change
    authChangeCallback('SIGNED_IN', mockSession)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('session')).toHaveTextContent('has-session')
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!)
    })
  })

  it('should handle sign out', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: mockSession },
      error: null
    })
    jest.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    await userEvent.click(signOutButton)

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(screen.getByTestId('session')).toHaveTextContent('no-session')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should throw error when useSession is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useSession must be used within a SessionProvider')

    consoleSpy.mockRestore()
  })

  it('should clean up subscription on unmount', async () => {
    const unsubscribeMock = jest.fn()
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: null },
      error: null 
    })
    jest.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          id: 'mock-sub-id',
          callback: () => {},
          unsubscribe: unsubscribeMock
        } as Subscription
      }
    })

    const { unmount } = render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    )

    unmount()
    expect(unsubscribeMock).toHaveBeenCalled()
  })
})