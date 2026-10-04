import { createContext, useContext, useState, useEffect, useCallback } from 'react'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
const readAuth = () => { try { return JSON.parse(localStorage.getItem('auth') || sessionStorage.getItem('auth') || 'null') } catch { return null } }

export function AppProvider({ children }) {
  const [user, setUser] = useState(readAuth)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [toasts, setToasts] = useState([])
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme) }, [theme])
  const signIn = (u, remember) => { (remember ? localStorage : sessionStorage).setItem('auth', JSON.stringify(u)); setUser(u) }
  const signOut = () => { localStorage.removeItem('auth'); sessionStorage.removeItem('auth'); setUser(null) }
  const toast = useCallback((message, type = 'info') => {
    const id = Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <Ctx.Provider value={{ user, signIn, signOut, theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] space-y-2">
        {toasts.map((t) => <div key={t.id} role="status" className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg ${t.type === 'error' ? 'bg-rose-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800'}`}>{t.message}</div>)}
      </div>
    </Ctx.Provider>
  )
}
