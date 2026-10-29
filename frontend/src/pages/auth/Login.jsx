import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || null

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  try {
    const user = await login(form)

    if (user.role === 'pending_2fa') {
      navigate('/verificar-2fa', { state: { pendingToken: user.pendingToken }, replace: true })
      return
    }

    if (user.role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    // Volta pra onde tentou acessar
    navigate(redirectTo || '/', { replace: true })
  } catch (err) {
    setError(err.message)
  }
}

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-form__title">Entrar</h1>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <button
        type="submit"
        className="btn btn--primary auth-form__submit"
        disabled={loading}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      <Link to="/recuperar-senha" className="auth-form__link">
        Esqueci minha senha
      </Link>

      <div className="auth-form__divider" />

      <p className="auth-form__helper">Ainda não possui conta?</p>
      <Link to="/cadastro" className="auth-form__link auth-form__link--strong">
        Criar conta
      </Link>
    </form>
  )
}