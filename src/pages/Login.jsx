import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button, Field } from '../components/ui'
import { login, register } from '../services/api'
import { useApp } from '../hooks/useApp'

export default function Login() {
  const { signIn } = useApp()

  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errs, setErrs] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const submit = async (e) => {
    e.preventDefault()

    const v = {}

    if (!isLogin && f.name.trim().length < 2) {
      v.name = 'Name must be at least 2 characters.'
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      v.email = 'Enter a valid email address.'
    }

    if (f.password.length < 8) {
      v.password = 'Password must be at least 8 characters.'
    }

    setErrs(v)
    setError('')

    if (Object.keys(v).length) return

    setLoading(true)

    try {
      const response = isLogin
        ? await login(f.email, f.password)
        : await register(f.name.trim(), f.email, f.password)

      signIn(response, remember)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login')
    setError('')
    setErrs({})
    setF({ name: '', email: '', password: '' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} noValidate className="card w-full max-w-sm space-y-4 p-6">

        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="text-indigo-600" aria-hidden />
          LoanGuard AI
        </div>

        <div>
          <h1 className="text-xl font-semibold">
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>

          <p className="text-sm text-slate-500">
            {isLogin
              ? 'Sign in to the LoanGuard AI analytics platform.'
              : 'Create your LoanGuard AI analyst account.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        {!isLogin && (
          <Field
            id="name"
            label="Full name"
            type="text"
            autoComplete="name"
            value={f.name}
            error={errs.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        )}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={f.email}
          error={errs.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />

        <div className="relative">
          <Field
            id="password"
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={f.password}
            error={errs.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            style={{ paddingRight: 40 }}
          />

          <button
            type="button"
            className="absolute right-2 top-8 p-1 text-slate-500"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>



        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          Remember me
        </label>

        <Button type="submit" loading={loading} className="w-full">
          {loading
            ? (isLogin ? 'Signing inâ€¦' : 'Creating accountâ€¦')
            : (isLogin ? 'Sign in' : 'Create account')}
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>

          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isLogin ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}
