import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AuthProtectedRoute from '../AuthProtectedRoute'
import { SessionProvider } from '../../context/SessionContext'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn()
    }
  }
}))

const mockSession: Session = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1234567890,
  user: {
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
}

// Test components
const ProtectedContent = () => <div data-testid="protected">Protected Content</div>
const SignInPage = () => <div data-testid="sign-in">Sign In Page</div>

const renderWithRouter = (
  initialEntries = ['/protected']
) => {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<AuthProtectedRoute />}>
            <Route path="/protected" element={<ProtectedContent />} />
          </Route>
          <Route path="/auth/sign-in" element={<SignInPage />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>
  )
}

describe('AuthProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for onAuthStateChange
    jest.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          id: 'mock-sub-id',
          callback: () => {},
          unsubscribe: jest.fn()
        }
      }
    })
  })

  it('should show nothing while loading', () => {
    // Mock getSession to never resolve during this test
    jest.mocked(supabase.auth.getSession).mockImplementation(() => new Promise(() => {}))

    const { container } = render(
      <SessionProvider>
        <MemoryRouter>
          <AuthProtectedRoute />
        </MemoryRouter>
      </SessionProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should redirect to sign in when not authenticated', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { findByTestId } = renderWithRouter()

    const signInPage = await findByTestId('sign-in')
    expect(signInPage).toBeInTheDocument()
  })

  it('should render protected content when authenticated', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    const { findByTestId } = renderWithRouter()

    const protectedContent = await findByTestId('protected')
    expect(protectedContent).toBeInTheDocument()
  })

  it('should handle session changes', async () => {
    // Initial authenticated state
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Store the callback passed to onAuthStateChange
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void = () => {}
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          }
        }
      }
    })

    const { findByTestId } = renderWithRouter()

    // Initially should show protected content
    const protectedContent = await findByTestId('protected')
    expect(protectedContent).toBeInTheDocument()

    // Mock getSession to return null for next call
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Simulate session expiry/logout
    await waitFor(() => {
      authChangeCallback('SIGNED_OUT', null)
    })

    // Should redirect to sign in
    const signInPage = await findByTestId('sign-in')
    expect(signInPage).toBeInTheDocument()
  })
})