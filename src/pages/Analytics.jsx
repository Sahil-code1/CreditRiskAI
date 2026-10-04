import { useState } from 'react'
import useAsync from '../hooks/useAsync'
import { getAnalytics } from '../services/api'
import { GRADES } from '../data/mock'
import { Async, PageHeader, Kpi, Field, DemoNote, Card } from '../components/ui'
import { BarC, PieC } from '../components/charts'
import { pct } from '../utils/format'

export default function Analytics() {
  const [grade, setGrade] = useState(''), [risk, setRisk] = useState(''), [days, setDays] = useState(0)
  const s = useAsync(() => getAnalytics({ grade, risk, days }), [grade, risk, days])
  return (<>
    <PageHeader title="Analytics" sub="Segment the historical portfolio by grade and model-scored risk" /><DemoNote />
    <Card className="mb-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field id="g" label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} options={[['', 'All grades'], ...GRADES]} />
      <Field id="r" label="Risk level" value={risk} onChange={(e) => setRisk(e.target.value)} options={[['', 'All risk levels'], 'LOW', 'MEDIUM', 'HIGH']} />
      <Field id="d" label="Date range" value={days} onChange={(e) => setDays(+e.target.value)} options={[[0, 'All time'], [7, 'Last 7 days'], [14, 'Last 14 days']]} /></div></Card>
    <Async s={s}>{(d) => d.total === 0 ? <Card><p className="py-8 text-center text-sm text-slate-500">No applications match these filters. Widen the date range or clear a filter.</p></Card> : (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Kpi label="Applications" value={d.total} /><Kpi label="Default rate" value={pct(d.defaultRate)} /><Kpi label="High risk" value={d.high} /><Kpi label="Low risk" value={d.low} /></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarC title="Default rate by grade" data={d.byGrade} x="grade" y="rate" unit="%" color="#f43f5e" /><PieC title="Risk segmentation" data={d.riskDist} />
          <BarC title="Loan amount analysis" sub="Applications per amount band ($)" data={d.amtHist} x="range" y="count" color="#0ea5e9" /><BarC title="Interest rate analysis" sub="Applications per rate band (%)" data={d.rateHist} x="range" y="count" />
          <BarC title="Income analysis" sub="Applications per annual income band ($)" data={d.incomeHist} x="range" y="count" color="#14b8a6" /><BarC title="Credit utilization analysis" sub="Applications per revolving utilization band (%)" data={d.utilHist} x="range" y="count" color="#f59e0b" />
        </div></div>)}</Async></>)
}
