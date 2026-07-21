import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = AuthContext.Provider;

export function useUsuarioAutenticado() {
  return useContext(AuthContext);
}
