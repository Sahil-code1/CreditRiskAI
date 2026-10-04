import { Users, Percent, ShieldAlert, ShieldCheck, Target, Activity } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getDashboardStats } from '../services/api'
import { Async, PageHeader, Kpi, Card, DemoNote } from '../components/ui'
import { BarC, PieC, LineC, ScatterC } from '../components/charts'
import PredictionTable from '../components/PredictionTable'
import { pct } from '../utils/format'

export default function Dashboard() {
  const s = useAsync(getDashboardStats)
  return (<>
    <PageHeader title="Executive dashboard" sub="Portfolio risk overview · historical LendingClub-style records scored with the P_137 model" /><DemoNote />
    <Async s={s}>{(d) => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Kpi label="Total applications" value={d.total.toLocaleString()} icon={Users} /><Kpi label="Default rate" value={pct(d.defaultRate)} icon={Percent} hint="Observed outcomes in the sample" />
          <Kpi label="High-risk applications" value={d.high} icon={ShieldAlert} /><Kpi label="Low-risk applications" value={d.low} icon={ShieldCheck} />
          <Kpi label="Model ROC-AUC" value={d.roc_auc.toFixed(3)} icon={Target} hint="Held-out evaluation split" /><Kpi label="New predictions (7 days)" value={d.volume7} icon={Activity} hint="Stored in application database" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <PieC title="Risk distribution" data={d.riskDist} /><BarC title="Default rate by loan grade" data={d.byGrade} x="grade" y="rate" unit="%" color="#f43f5e" />
          <BarC title="Interest rate distribution" sub="Applications per rate band (%)" data={d.rateHist} x="range" y="count" /><BarC title="Loan amount distribution" sub="Applications per amount band ($)" data={d.amtHist} x="range" y="count" color="#0ea5e9" />
          <ScatterC title="Income vs loan amount" data={d.scatter} />
          <LineC title="Recent prediction trend" sub="Daily prediction volume, last 30 days" data={d.trend} x="day" lines={[{ key: 'volume', name: 'Predictions', color: '#6366f1' }]} />
        </div>
        <Card title="Recent historical model scores" sub="Actual source rows with the trained P_137 model score applied"><PredictionTable rows={d.recent} /></Card>
      </div>)}</Async></>)
}
