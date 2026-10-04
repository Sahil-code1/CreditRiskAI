import { useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { predictLoan } from '../services/api'
import { useApp } from '../hooks/useApp'
import { PageHeader, Card, Field, Button, ErrorState, DemoNote } from '../components/ui'
import PredictionResult from '../components/PredictionResult'

const N = (name, label, def, max = Infinity) => ({ name, label, def, max })
const S = (name, label, options) => ({ name, label, options, def: options[0] })
const subs = 'ABCDEFG'.split('').flatMap((g) => [1, 2, 3, 4, 5].map((n) => g + n))
const groups = [
  ['Loan terms', [N('loan_amnt', 'Loan amount ($)', 15000), N('funded_amnt', 'Funded amount ($)', 15000), N('funded_amnt_inv', 'Funded amount, investors ($)', 14800), S('term', 'Term (months)', [36, 60]), N('int_rate', 'Interest rate (%)', 13.5, 40), N('installment', 'Installment ($)', 510), S('grade', 'Grade', 'ABCDEFG'.split('')), S('sub_grade', 'Sub grade', subs), S('purpose', 'Purpose', ['debt_consolidation', 'credit_card', 'home_improvement', 'major_purchase', 'small_business', 'car', 'medical', 'other'])]],
  ['Borrower profile', [N('emp_length', 'Employment length (years)', 5, 50), S('home_ownership', 'Home ownership', ['RENT', 'MORTGAGE', 'OWN', 'OTHER']), N('annual_inc', 'Annual income ($)', 72000), S('verification_status', 'Verification status', ['Verified', 'Source Verified', 'Not Verified']), S('addr_state', 'State', ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'WA'])]],
  ['Credit profile', [N('dti', 'DTI (%)', 18, 100), N('delinq_2yrs', 'Delinquencies (2 years)', 0), N('inq_last_6mths', 'Credit inquiries (6 months)', 1), N('open_acc', 'Open accounts', 9), N('pub_rec', 'Public records', 0), N('revol_bal', 'Revolving balance ($)', 12000), N('revol_util', 'Revolving utilization (%)', 52, 150), N('total_acc', 'Total accounts', 22), N('pub_rec_bankruptcies', 'Bankruptcy records', 0)]],
]
const all = groups.flatMap((g) => g[1])

export default function Predict() {
  const { toast } = useApp()
  const [v, setV] = useState(() => Object.fromEntries(all.map((f) => [f.name, f.def]))), [errs, setErrs] = useState({})
  const [loading, setLoading] = useState(false), [res, setRes] = useState(null), [error, setError] = useState('')
  const out = useRef(null)
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    all.forEach((f) => { if (f.options) return; const x = v[f.name]; if (x === '' || isNaN(+x)) er[f.name] = 'Required: enter a number.'; else if (+x < 0) er[f.name] = 'Must be 0 or more.'; else if (+x > f.max) er[f.name] = `Must be ${f.max} or less.` })
    if (!er.funded_amnt && !er.loan_amnt && +v.funded_amnt > +v.loan_amnt) er.funded_amnt = 'Cannot exceed the loan amount.'
    setErrs(er); setError('')
    if (Object.keys(er).length) { toast('Fix the highlighted fields.', 'error'); return }
    setLoading(true); setRes(null)
    try {
      const body = Object.fromEntries(all.map((f) => [f.name, f.options ? (f.name === 'term' ? +v[f.name] : v[f.name]) : +v[f.name]]))
      setRes(await predictLoan(body)); toast('Prediction complete.', 'success')
      setTimeout(() => out.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) { setError(err.message); toast('Prediction failed.', 'error') } finally { setLoading(false) }
  }
  return (<>
    <PageHeader title="Loan risk prediction" sub="Enter applicant details to estimate default risk" /><DemoNote />
    <form onSubmit={submit} noValidate className="space-y-4">
      {groups.map(([title, fs]) => <Card key={title} title={title}><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fs.map((f) => <Field key={f.name} id={f.name} label={f.label} error={errs[f.name]} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} {...(f.options ? { options: f.options } : { type: 'number', step: 'any', min: 0, inputMode: 'decimal' })} />)}</div></Card>)}
      <Button type="submit" loading={loading}><Calculator size={16} aria-hidden />{loading ? 'Scoring…' : 'Predict default risk'}</Button>
    </form>
    <div ref={out} className="mt-6">{error && <ErrorState message={error} />}{res && <PredictionResult r={res} />}</div></>)
}
