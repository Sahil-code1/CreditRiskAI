import { Target, Gauge, Crosshair, Sigma, Activity, GitBranch, Database } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getModelMonitoring } from '../services/api'
import { Async, PageHeader, Kpi, Card, Table, Badge, DemoNote } from '../components/ui'
import { LineC } from '../components/charts'
import { dt } from '../utils/format'

const tone = { Stable: 'LOW', Watch: 'MEDIUM', Drift: 'HIGH' }
export default function Monitoring() {
  const s = useAsync(getModelMonitoring)
  return (<>
    <PageHeader title="Model monitoring" sub="Held-out evaluation metrics and production prediction readiness" />
    <DemoNote>Reference metrics are from the real P_137 holdout evaluation. Live drift starts after production predictions accumulate in PostgreSQL.</DemoNote>
    <Async s={s}>{(d) => (<div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="ROC-AUC" value={d.metrics.roc_auc.toFixed(3)} icon={Target} />
        <Kpi label="Precision (default)" value={d.metrics.precision.toFixed(3)} icon={Crosshair} />
        <Kpi label="Recall (default)" value={d.metrics.recall.toFixed(3)} icon={Gauge} />
        <Kpi label="F1 (default)" value={d.metrics.f1.toFixed(3)} icon={Sigma} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Evaluation scope" value={d.status} icon={Activity} />
        <Kpi label="Live drift" value={d.drift_status} icon={GitBranch} />
        <Kpi label="Stored predictions" value={d.prediction_count.toLocaleString()} icon={Database} />
      </div>
      <Card title="Model provenance" sub={`Version ${d.model_version} · reference metrics from the held-out evaluation split`}>
        <p className="text-sm text-slate-600 dark:text-slate-300">{d.note}</p>
      </Card>
      <Card title="Reference feature drift" sub="PSI comparison between training and held-out evaluation samples">
        <Table pageSize={10} cols={[{ label: 'Feature', key: 'feature' }, { label: 'PSI', render: (r) => r.psi.toFixed(4) }, { label: 'Status', render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge> }]} rows={d.drift} />
      </Card>
    </div>)}</Async></>)
}
