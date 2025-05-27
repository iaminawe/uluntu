import { Navigate, Outlet } from "react-router-dom"
import { useSession } from "../context/SessionContext"

const AuthProtectedRoute = () => {
  const { session, loading } = useSession()

  if (loading) {
    return null // Or loading component
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return <Outlet />
}

export default AuthProtectedRoute