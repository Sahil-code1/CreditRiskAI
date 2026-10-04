import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Field, Table, RiskBadge, Badge } from './ui'
import { pct, usd, dt } from '../utils/format'

export default function PredictionTable({ rows, showDates }) {
  const [q, setQ] = useState(''), [risk, setRisk] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState('')
  const f = rows.filter((r) => (!q || (r.applicant_id + r.purpose).toLowerCase().includes(q.toLowerCase())) && (!risk || r.risk_level === risk) && (!from || r.date.slice(0, 10) >= from) && (!to || r.date.slice(0, 10) <= to))
  const cols = [
    { label: 'Applicant', render: (r) => <Link className="font-medium text-indigo-600 hover:underline dark:text-indigo-400" to={`/applicants/${r.applicant_id}`}>{r.applicant_id}</Link> },
    { label: 'Date', render: (r) => dt(r.date) }, { label: 'Loan', render: (r) => usd(r.loan_amnt) }, { label: 'Grade', key: 'grade' },
    { label: 'Default probability', render: (r) => pct(r.probability) }, { label: 'Risk', render: (r) => <RiskBadge level={r.risk_level} /> },
    { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    { label: 'Details', render: (r) => <Link className="text-indigo-600 hover:underline dark:text-indigo-400" to={`/applicants/${r.applicant_id}`}>View details</Link> }]
  return (<>
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-[34px] text-slate-400" aria-hidden /><Field id={`q${showDates}`} label="Search" placeholder="Applicant ID or purpose" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} /></div>
      <Field id={`risk${showDates}`} label="Risk level" value={risk} onChange={(e) => setRisk(e.target.value)} options={[['', 'All risk levels'], 'LOW', 'MEDIUM', 'HIGH']} />
      {showDates && <><Field id="from" label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /><Field id="to" label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></>}
    </div>
    <Table key={q + risk + from + to} cols={cols} rows={f} empty="No predictions match these filters. Clear a filter or run a new prediction." /></>)
}
