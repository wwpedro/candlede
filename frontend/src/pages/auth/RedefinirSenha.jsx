import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RedefinirSenha() {
  const { token } = useParams()
  const { resetPassword, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validações alinhadas com o Backend
    if (form.password.length < 8) {
      return setError('A senha precisa ter pelo menos 8 caracteres.')
    }
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      return setError('A senha deve conter pelo menos uma letra e um número.')
    }
    if (form.password !== form.confirm) {
      return setError('As senhas não coincidem.')
    }

    try {
      await resetPassword({ token, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err) {
      setError(err.message || 'Link inválido ou expirado. Solicite um novo.')
    }
  }

  // POPUP DE SUCESSO
  if (success) {
    return (
      <div className="modal-overlay" style={{ background: 'transparent', position: 'relative', padding: 0 }}>
        <div className="welcome-modal" style={{ padding: 0, margin: '0 auto' }}>
          <div className="welcome-modal__icon">✓</div>
          <h1 className="welcome-modal__title">Senha alterada!</h1>
          <p className="welcome-modal__text">
            Sua senha foi redefinida com sucesso. Redirecionando para o login...
          </p>
          <Link to="/login" className="btn btn--primary welcome-modal__cta">
            Ir para o login agora
          </Link>
        </div>
      </div>
    )
  }

  // FORMULÁRIO
  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-form__title">Criar nova senha</h1>
      <p className="auth-form__helper">
        Escolha uma nova senha segura para sua conta.
      </p>

      <div className="field">
        <label htmlFor="password">Nova senha</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          required 
        />
        <small className="field__hint">
          Mínimo 8 caracteres, com pelo menos uma letra e um número.
        </small>
      </div>

      <div className="field">
        <label htmlFor="confirm">Confirmar nova senha</label>
        <input 
          id="confirm" 
          name="confirm" 
          type="password" 
          value={form.confirm} 
          onChange={handleChange} 
          required 
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
        {loading ? 'Salvando…' : 'Salvar nova senha'}
      </button>

      <Link to="/login" className="auth-form__link">
        Voltar para o login
      </Link>
    </form>
  )
}