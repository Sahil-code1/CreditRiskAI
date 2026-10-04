import { useState } from 'react'
import { Loader2, AlertCircle, Inbox, ChevronLeft, ChevronRight, DatabaseZap } from 'lucide-react'
import { USE_MOCK } from '../services/api'

const tones = {
  LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  HIGH: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', DEMO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', NEUTRAL: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
export const Badge = ({ tone = 'NEUTRAL', children }) => <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
export const RiskBadge = ({ level }) => <Badge tone={level}>{level}</Badge>
export const Button = ({ loading, variant, children, className = '', ...p }) => (
  <button {...p} disabled={p.disabled || loading} className={`${variant === 'ghost' ? 'btn-ghost' : 'btn'} ${className}`}>{loading && <Loader2 size={16} className="animate-spin" aria-hidden />}{children}</button>)
export const Field = ({ label, id, error, options, className = '', ...p }) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
    {options ? <select id={id} className="field" aria-invalid={!!error} {...p}>{options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option> })}</select>
      : <input id={id} className="field" aria-invalid={!!error} aria-describedby={error ? id + '-e' : undefined} {...p} />}
    {error && <p id={id + '-e'} className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>)
export const Card = ({ title, sub, children, className = '' }) => (
  <section className={`card ${className}`}>{title && <header className="mb-3"><h3 className="text-sm font-semibold">{title}</h3>{sub && <p className="text-xs text-slate-500">{sub}</p>}</header>}{children}</section>)
export const PageHeader = ({ title, sub, children }) => (
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>{sub && <p className="text-sm text-slate-500">{sub}</p>}</div>{children}</div>)
export const Kpi = ({ label, value, icon: Icon, hint, demo }) => (
  <div className="card flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}{demo && <Badge tone="DEMO">Demo value</Badge>}</div>
    {Icon && <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Icon size={20} aria-hidden /></span>}</div>)
export const Loading = () => <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} />Loading…</div>
export const ErrorState = ({ message, onRetry }) => (
  <div role="alert" className="card flex flex-col items-center gap-2 py-10 text-center"><AlertCircle className="text-rose-500" /><p className="text-sm font-medium">Something went wrong</p><p className="text-sm text-slate-500">{message}</p>{onRetry && <Button variant="ghost" onClick={onRetry}>Try again</Button>}</div>)
export const EmptyState = ({ title }) => <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-slate-500"><Inbox aria-hidden />{title}</div>
export const Async = ({ s, children }) => (s.loading && !s.data ? <Loading /> : s.error ? <ErrorState message={s.error} onRetry={s.reload} /> : s.data ? children(s.data) : null)
export const DemoNote = ({ children }) => (
  <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
    <DatabaseZap size={16} className="mt-0.5 shrink-0" aria-hidden /><span>{children || 'Live mode: analytics are sourced from the PostgreSQL-backed P_137 dataset and the trained XGBoost model.'}</span></div>)

export function Table({ cols, rows, pageSize = 8, empty = 'No results match your filters.' }) {
  const [p, setP] = useState(0)
  const n = Math.max(1, Math.ceil(rows.length / pageSize))
  if (!rows.length) return <EmptyState title={empty} />
  const slice = rows.slice(p * pageSize, (p + 1) * pageSize)
  return (<>
    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
      <thead><tr>{cols.map((c) => <th key={c.label} scope="col" className="th">{c.label}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{slice.map((r, i) => <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">{cols.map((c) => <td key={c.label} className="td">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody></table></div>
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{p * pageSize + 1}–{Math.min(rows.length, (p + 1) * pageSize)} of {rows.length}</span>
      <div className="flex items-center gap-2"><button className="btn-ghost" aria-label="Previous page" disabled={p === 0} onClick={() => setP(p - 1)}><ChevronLeft size={16} /></button><span>Page {p + 1} of {n}</span>
        <button className="btn-ghost" aria-label="Next page" disabled={p >= n - 1} onClick={() => setP(p + 1)}><ChevronRight size={16} /></button></div></div></>)
}
