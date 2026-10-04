import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getApplicant } from '../services/api'
import { Async, PageHeader, Card, Badge, RiskBadge, DemoNote } from '../components/ui'
import PredictionResult from '../components/PredictionResult'
import PredictionTable from '../components/PredictionTable'
import { usd, label, dt } from '../utils/format'

const Dl = ({ items }) => <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{items.map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
export default function Applicant() {
  const { id } = useParams()
  const s = useAsync(() => getApplicant(id), [id])
  return (<>
    <Link to="/history" className="mb-3 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"><ArrowLeft size={14} aria-hidden />Prediction history</Link>
    <PageHeader title={`Applicant ${id}`} sub="Application, prediction and explanation" /><DemoNote />
    <Async s={s}>{({ applicant: a, prediction, history }) => (<div className="space-y-4">
      <Card title="Overview"><div className="mb-3 flex flex-wrap gap-2"><RiskBadge level={a.risk_level} /><Badge>{a.status}</Badge></div>
        <Dl items={[['Scored', dt(a.date)], ['Grade', `${a.grade} (${a.sub_grade})`], ['Purpose', label(a.purpose)], ['State', a.addr_state], ['Home ownership', label(a.home_ownership)], ['Employment length', `${a.emp_length} years`]]} /></Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Financial information"><Dl items={[['Loan amount', usd(a.loan_amnt)], ['Funded amount', usd(a.funded_amnt)], ['Funded by investors', usd(a.funded_amnt_inv)], ['Term', `${a.term} months`], ['Interest rate', a.int_rate + '%'], ['Installment', usd(a.installment)], ['Annual income', usd(a.annual_inc)], ['Verification', a.verification_status]]} /></Card>
        <Card title="Credit information"><Dl items={[['DTI', a.dti], ['Delinquencies (2y)', a.delinq_2yrs], ['Inquiries (6m)', a.inq_last_6mths], ['Open accounts', a.open_acc], ['Total accounts', a.total_acc], ['Public records', a.pub_rec], ['Revolving balance', usd(a.revol_bal)], ['Revolving utilization', a.revol_util + '%'], ['Bankruptcies', a.pub_rec_bankruptcies]]} /></Card></div>
      <PredictionResult r={prediction} hideSummary />
      <Card title="Prediction history"><PredictionTable rows={history} /></Card></div>)}</Async></>)
}
