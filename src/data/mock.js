// DEMO DATA ONLY. Deterministic mock records; nothing here comes from a trained model or real portfolio.
let seed = 42
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
const pick = (a) => a[Math.floor(rnd() * a.length)]
const sig = (x) => 1 / (1 + Math.exp(-x))
export const GRADES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const PURPOSES = ['debt_consolidation', 'credit_card', 'home_improvement', 'major_purchase', 'small_business', 'car', 'medical', 'other']
export const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'WA']

// Transparent demo scoring: logit = intercept + sum(weight * z-score). Per-feature terms double as the
// demo "explanation" (linear contributions, NOT SHAP). Replace with backend output when connected.
const FEATS = { int_rate: [0.55, 13, 4.5], dti: [0.3, 18, 8], revol_util: [0.2, 55, 25], annual_inc: [-0.4, 75000, 40000], loan_amnt: [0.25, 14000, 8000], delinq_2yrs: [0.25, 0.3, 0.8], inq_last_6mths: [0.2, 0.8, 1], pub_rec: [0.15, 0.1, 0.4], emp_length: [-0.1, 6, 3.5] }
const B0 = -1.6
export const level = (p) => (p < 0.2 ? 'LOW' : p < 0.4 ? 'MEDIUM' : 'HIGH')
const statusOf = (l) => ({ LOW: 'Approved', MEDIUM: 'Under review', HIGH: 'Declined' })[l]
const installment = (a, r, n) => { const i = r / 1200; return Math.round((a * i) / (1 - Math.pow(1 + i, -n))) }

export function buildPrediction(f, at = new Date().toISOString()) {
  const c = Object.entries(FEATS).map(([k, [w, mu, sd]]) => ({ feature: k, value: +f[k], impact: +(w * ((+f[k] - mu) / sd)).toFixed(3) })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  const p = sig(B0 + c.reduce((s, x) => s + x.impact, 0)), l = level(p)
  const up = c.filter((x) => x.impact > 0).slice(0, 2).map((x) => x.feature.replace(/_/g, ' '))
  const rec = { LOW: 'Eligible for standard approval. Complete routine income and identity verification.', MEDIUM: 'Refer to manual underwriting. Consider a lower amount or shorter term.', HIGH: 'Decline, or require a guarantor or collateral and senior credit review.' }[l]
  return { applicant_id: f.applicant_id, risk_level: l, default_probability: p, confidence: Math.max(p, 1 - p), predicted_at: at, model_version: 'demo-0.0.0', source: 'mock',
    explanation: { method: 'demo-linear-heuristic', is_demo: true, base_value: sig(B0), contributions: c },
    summary: up.length ? `Risk is driven mainly by ${up.join(' and ')}.` : 'No feature pushes risk above the demo baseline.', recommendation: rec, applicant: f }
}

const now = Date.now()
export const applicants = Array.from({ length: 90 }, (_, i) => {
  const gi = Math.min(6, Math.floor(Math.abs(rnd() + rnd() - 0.6) * 5)), amt = Math.round((3000 + rnd() * 30000) / 100) * 100, term = pick([36, 60]), rate = +(6 + gi * 2.6 + rnd() * 3).toFixed(1)
  const f = { applicant_id: `APP-${10001 + i}`, loan_amnt: amt, funded_amnt: amt, funded_amnt_inv: amt - 200, term, int_rate: rate, installment: installment(amt, rate, term), grade: GRADES[gi], sub_grade: GRADES[gi] + (1 + Math.floor(rnd() * 5)),
    emp_length: Math.floor(rnd() * 11), home_ownership: pick(['RENT', 'MORTGAGE', 'OWN']), annual_inc: Math.round(30000 + rnd() * 120000), verification_status: pick(['Verified', 'Source Verified', 'Not Verified']),
    purpose: pick(PURPOSES), addr_state: pick(STATES), dti: +(5 + rnd() * 30).toFixed(1), delinq_2yrs: rnd() < 0.8 ? 0 : Math.ceil(rnd() * 3), inq_last_6mths: Math.floor(rnd() * 4), open_acc: 4 + Math.floor(rnd() * 14),
    pub_rec: rnd() < 0.9 ? 0 : 1, revol_bal: Math.round(2000 + rnd() * 30000), revol_util: +(rnd() * 95).toFixed(1), total_acc: 10 + Math.floor(rnd() * 30), pub_rec_bankruptcies: rnd() < 0.93 ? 0 : 1 }
  const r = buildPrediction(f, new Date(now - Math.floor(rnd() * 30) * 864e5 - Math.floor(rnd() * 864e5)).toISOString())
  return { ...f, probability: r.default_probability, risk_level: r.risk_level, status: statusOf(r.risk_level), defaulted: rnd() < r.default_probability, date: r.predicted_at }
}).sort((a, b) => b.date.localeCompare(a.date))

export function registerPrediction(f) {
  const r = buildPrediction({ ...f, applicant_id: `APP-${String(Date.now()).slice(-6)}` })
  applicants.unshift({ ...r.applicant, probability: r.default_probability, risk_level: r.risk_level, status: statusOf(r.risk_level), defaulted: false, date: r.predicted_at })
  return r
}

const k = (n) => n / 1000 + 'k'
const hist = (l, key, edges, fmt = (x) => x) => edges.slice(0, -1).map((lo, i) => ({ range: `${fmt(lo)}–${fmt(edges[i + 1])}`, count: l.filter((x) => x[key] >= lo && x[key] < edges[i + 1]).length }))
export const summarize = (l) => ({
  total: l.length, defaultRate: l.length ? l.filter((x) => x.defaulted).length / l.length : 0,
  high: l.filter((x) => x.risk_level === 'HIGH').length, low: l.filter((x) => x.risk_level === 'LOW').length,
  riskDist: ['LOW', 'MEDIUM', 'HIGH'].map((name) => ({ name, value: l.filter((x) => x.risk_level === name).length })),
  byGrade: GRADES.map((grade) => { const a = l.filter((x) => x.grade === grade); return { grade, count: a.length, rate: a.length ? +((100 * a.filter((x) => x.defaulted).length) / a.length).toFixed(1) : 0 } }),
  rateHist: hist(l, 'int_rate', [0, 8, 12, 16, 20, 24, 40]), amtHist: hist(l, 'loan_amnt', [0, 5000, 10000, 15000, 20000, 25000, 40000], k),
  incomeHist: hist(l, 'annual_inc', [0, 40000, 60000, 80000, 100000, 150000, 300000], k), utilHist: hist(l, 'revol_util', [0, 20, 40, 60, 80, 100, 200]),
  scatter: l.map((x) => ({ income: x.annual_inc, amount: x.loan_amnt, risk: x.risk_level })),
  trend: Array.from({ length: 30 }, (_, i) => { const d = new Date(now - (29 - i) * 864e5).toISOString().slice(0, 10), a = l.filter((x) => x.date.slice(0, 10) === d)
    return { day: d.slice(5), volume: a.length, avgProb: a.length ? +((100 * a.reduce((s, x) => s + x.probability, 0)) / a.length).toFixed(1) : null } }),
})

export const monitoring = () => {
  const drift = [['int_rate', 0.04], ['dti', 0.07], ['revol_util', 0.13], ['annual_inc', 0.05], ['loan_amnt', 0.09], ['inq_last_6mths', 0.27], ['emp_length', 0.02]].map(([feature, psi]) => ({ feature, psi, status: psi < 0.1 ? 'Stable' : psi < 0.25 ? 'Watch' : 'Drift' }))
  return { is_demo: true, model_version: 'demo-0.0.0', last_trained: '2026-09-01T00:00:00Z', status: 'Demo', metrics: { roc_auc: 0.871, precision: 0.742, recall: 0.681, f1: 0.71 },
    drift_status: drift.some((d) => d.status === 'Drift') ? 'Drift detected' : drift.some((d) => d.status === 'Watch') ? 'Watch' : 'Stable', drift, trend: summarize(applicants).trend }
}
