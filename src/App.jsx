import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './hooks/useApp'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Monitoring from './pages/Monitoring'
import Applicant from './pages/Applicant'

const Guard = () => (useApp().user ? <AppLayout /> : <Navigate to="/login" replace />)
export default function App() {
  const { user } = useApp()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Guard />}>
        <Route index element={<Dashboard />} /><Route path="predict" element={<Predict />} /><Route path="history" element={<History />} />
        <Route path="analytics" element={<Analytics />} /><Route path="monitoring" element={<Monitoring />} /><Route path="applicants/:id" element={<Applicant />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>)
}
