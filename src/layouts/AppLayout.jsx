import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calculator, History, BarChart3, Activity, Menu, X, Sun, Moon, LogOut, ShieldCheck } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { Badge } from '../components/ui'
import { health } from '../services/api'


const nav = [['/', 'Dashboard', LayoutDashboard], ['/predict', 'Risk prediction', Calculator], ['/history', 'Prediction history', History], ['/analytics', 'Analytics', BarChart3], ['/monitoring', 'Model monitoring', Activity]]
export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, signOut, theme, toggleTheme } = useApp()
  const [backendUp, setBackendUp] = useState(false)
  useLocation()
  useEffect(() => { let active = true; health().then(() => active && setBackendUp(true)).catch(() => active && setBackendUp(false)); return () => { active = false } }, [])
  return (
    <div className="min-h-screen lg:pl-64">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center justify-between px-4"><div className="flex items-center gap-2 font-semibold"><ShieldCheck className="text-indigo-600" size={22} aria-hidden />P_137 Credit Risk</div>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-2">{nav.map(([to, text, Icon]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon size={18} aria-hidden />{text}</NavLink>))}</nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800"><p className="truncate font-medium text-slate-700 dark:text-slate-200">{user?.name || 'Analyst'}</p><p className="truncate">{user?.email}</p></div>
      </aside>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/95 px-4 dark:border-slate-800 dark:bg-slate-900/95">
        <button className="btn-ghost lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={18} /></button>
        <div className="ml-auto flex items-center gap-2"><Badge tone={backendUp ? 'LOW' : 'HIGH'}>{backendUp ? 'Live PostgreSQL' : 'API offline'}</Badge>
          <button className="btn-ghost" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="btn-ghost" onClick={signOut}><LogOut size={16} aria-hidden /><span className="hidden sm:inline">Sign out</span></button></div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl p-4 md:p-6"><Outlet /></main>
    </div>)
}
