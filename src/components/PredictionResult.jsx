import { Card, RiskBadge } from './ui'
import { ContribC } from './charts'
import { pct, dt, label, usd } from '../utils/format'

const bar = { LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-rose-500' }
export default function PredictionResult({ r, hideSummary }) {
  const ex = r.explanation, top = ex.contributions.slice(0, 5)
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Default risk" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3"><RiskBadge level={r.risk_level} /><span className="text-3xl font-semibold tabular-nums">{pct(r.default_probability)}</span><span className="text-sm text-slate-500">probability of default</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="img" aria-label={`Default probability ${pct(r.default_probability)}`}><div className={`h-full ${bar[r.risk_level]}`} style={{ width: pct(r.default_probability) }} /></div>
          <p className="mt-3 text-sm">{r.summary}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Confidence</dt><dd className="font-medium">{pct(r.confidence)}</dd></div><div><dt className="text-slate-500">Predicted at</dt><dd className="font-medium">{dt(r.predicted_at)}</dd></div><div><dt className="text-slate-500">Model version</dt><dd className="font-medium">{r.model_version}</dd></div></dl>
        </Card>
        <Card title="Recommendation"><p className="text-sm">{r.recommendation}</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top contributing factors" sub="Largest effects on this applicant's risk">
          <ol className="space-y-2 text-sm">{top.map((c) => <li key={c.feature} className="flex justify-between gap-2"><span>{label(c.feature)} <span className="text-slate-500">({c.value})</span></span><span className={c.impact > 0 ? 'text-rose-600' : 'text-emerald-600'}>{c.impact > 0 ? 'Raises risk' : 'Lowers risk'}</span></li>)}</ol>
        </Card>
        <Card title="Explanation (SHAP section)" sub={`Method: ${ex.method}`}>
          
          <ContribC data={ex.contributions} /><p className="text-xs text-slate-500">Red bars raise modeled default risk; green bars lower it. Explanation generated with SHAP TreeExplainer.</p>
        </Card>
      </div>
      {!hideSummary && r.applicant && <Card title="Applicant summary"><dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[['Loan amount', usd(r.applicant.loan_amnt)], ['Term', `${r.applicant.term} months`], ['Interest rate', r.applicant.int_rate + '%'], ['Grade', r.applicant.grade], ['Annual income', usd(r.applicant.annual_inc)], ['DTI', r.applicant.dti], ['Purpose', label(r.applicant.purpose)], ['State', r.applicant.addr_state]].map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></Card>}
    </div>)
}
