import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Verificar2FA() {
  const { verify2fa, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const pendingToken = location.state?.pendingToken

  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // Se acessar a URL direto sem passar pelo login, volta pro login
  useEffect(() => {
    if (!pendingToken) {
      navigate('/login', { replace: true })
    }
  }, [pendingToken, navigate])

  const handleChange = (e) => {
    // Só aceita números, máximo 6 dígitos
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('Digite os 6 dígitos do código.')
      return
    }

    try {
      await verify2fa(pendingToken, code)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setCode('')   // limpa o campo pra nova tentativa
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-form__title">Verificação em 2 etapas</h1>

      <p className="auth-form__helper">
        Enviamos um código de 6 dígitos para o seu e-mail.
        <br />
        Ele é válido por 10 minutos.
      </p>

      <div className="field">
        <label htmlFor="code">Código</label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          onChange={handleChange}
          maxLength={6}
          autoFocus
          style={{
            fontSize: 24,
            letterSpacing: '0.5em',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <button
        type="submit"
        className="btn btn--primary auth-form__submit"
        disabled={loading || code.length !== 6}
      >
        {loading ? 'Verificando…' : 'Confirmar'}
      </button>

      <Link to="/login" className="auth-form__link">
        Voltar para o login
      </Link>
    </form>
  )
}