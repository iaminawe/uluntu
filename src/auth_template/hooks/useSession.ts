import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

const useSession = () => {
  return useContext(SessionContext);
};

export default useSession;