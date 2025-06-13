import { SessionProvider } from '@/shared/contexts/SessionContext'
import { Outlet } from "react-router-dom"

const Providers = () => {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  )
}

export default Providers