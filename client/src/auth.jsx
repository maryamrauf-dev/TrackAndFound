import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fnm_user')); } catch { return null; }
  });

  const signIn = (token, u) => {
    localStorage.setItem('fnm_token', token);
    localStorage.setItem('fnm_user', JSON.stringify(u));
    setUser(u);
  };
  const signOut = () => {
    localStorage.removeItem('fnm_token');
    localStorage.removeItem('fnm_user');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>;
}
