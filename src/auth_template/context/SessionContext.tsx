import { createContext, useContext } from 'react';

interface SessionContextProps {
  sessionData: any;
}

const SessionContext = createContext<SessionContextProps>({
  sessionData: null,
});

export { SessionContext };
export const useSession = () => useContext(SessionContext);