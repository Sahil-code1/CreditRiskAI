import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card } from './ui'
export const RISK_COLOR = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f43f5e' }
const ax = { stroke: '#94a3b8', fontSize: 12, tickLine: false }
const tip = { contentStyle: { borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 } }
const Grid = () => <CartesianGrid strokeDasharray="3 3" stroke="#94a3b855" vertical={false} />
const Box = ({ title, sub, children }) => <Card title={title} sub={sub}><div className="h-60 w-full"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></Card>

export const BarC = ({ title, sub, data, x, y, color = '#6366f1', unit = '' }) => (
  <Box title={title} sub={sub}><BarChart data={data}><Grid /><XAxis dataKey={x} {...ax} /><YAxis {...ax} unit={unit} width={44} /><Tooltip {...tip} cursor={{ fill: '#94a3b822' }} /><Bar dataKey={y} fill={color} radius={[4, 4, 0, 0]} /></BarChart></Box>)
export const PieC = ({ title, sub, data }) => (
  <Box title={title} sub={sub}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>{data.map((d) => <Cell key={d.name} fill={RISK_COLOR[d.name]} />)}</Pie><Tooltip {...tip} /><Legend /></PieChart></Box>)
export const LineC = ({ title, sub, data, x, lines }) => (
  <Box title={title} sub={sub}><LineChart data={data}><Grid /><XAxis dataKey={x} {...ax} interval="preserveStartEnd" minTickGap={24} /><YAxis {...ax} width={36} /><Tooltip {...tip} />
    {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={false} connectNulls />)}{lines.length > 1 && <Legend />}</LineChart></Box>)
export const ScatterC = ({ title, sub, data }) => (
  <Box title={title} sub={sub}><ScatterChart><Grid /><XAxis dataKey="income" name="Income" type="number" {...ax} tickFormatter={(v) => v / 1000 + 'k'} /><YAxis dataKey="amount" name="Loan" type="number" {...ax} width={44} tickFormatter={(v) => v / 1000 + 'k'} /><Tooltip {...tip} cursor={{ strokeDasharray: '3 3' }} /><Legend />
    {Object.keys(RISK_COLOR).map((r) => <Scatter key={r} name={r} data={data.filter((d) => d.risk === r)} fill={RISK_COLOR[r]} fillOpacity={0.7} />)}</ScatterChart></Box>)
export const ContribC = ({ data }) => (
  <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#94a3b855" horizontal={false} /><XAxis type="number" {...ax} /><YAxis type="category" dataKey="feature" width={110} {...ax} /><Tooltip {...tip} />
    <Bar dataKey="impact" radius={3}>{data.map((d) => <Cell key={d.feature} fill={d.impact > 0 ? '#f43f5e' : '#10b981'} />)}</Bar></BarChart></ResponsiveContainer></div>)
