import { createBrowserRouter } from "react-router-dom"
import HomePage from "../pages/HomePage"
import SignInPage from "../pages/auth/SignInPage"
import SignUpPage from "../pages/auth/SignUpPage"
import ProtectedPage from "../pages/ProtectedPage"
import NotFoundPage from "../pages/404Page"
import AuthProtectedRoute from "./AuthProtectedRoute"
import Providers from "../Providers"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

export default router