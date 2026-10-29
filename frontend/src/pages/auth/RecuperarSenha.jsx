import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RecuperarSenha() {
  const { requestPasswordReset, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Erro ao enviar o e-mail. Verifique o endereço e tente novamente.')
    }
  }

  // =========================================================
  // POPUP DE SUCESSO (Estilo do site)
  // =========================================================
  if (sent) {
    return (
      <div className="modal-overlay" style={{ background: 'transparent', position: 'relative', padding: 0 }}>
        <div className="welcome-modal" style={{ padding: 0, margin: '0 auto' }}>
          <div className="welcome-modal__icon">✉️</div>
          <h1 className="welcome-modal__title">Verifique seu e-mail</h1>
          
          <p className="welcome-modal__text">
            Se existir uma conta com <strong>{email}</strong>, enviamos um link seguro para redefinir sua senha.
          </p>
          
          <div style={{
            background: 'var(--color-background)',
            borderLeft: '3px solid var(--color-black)',
            padding: '16px',
            margin: '24px 0',
            textAlign: 'left'
          }}>
            <p className="welcome-modal__hint" style={{ margin: 0, color: 'var(--color-black)', fontWeight: 500 }}>
              ⚠️ Verifique também a caixa de <strong>SPAM</strong> ou Lixo Eletrônico.
            </p>
            <p className="welcome-modal__hint" style={{ margin: '8px 0 0 0' }}>
              O e-mail pode levar alguns minutos para chegar.
            </p>
          </div>

          <Link to="/login" className="btn btn--primary welcome-modal__cta">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  // =========================================================
  // FORMULÁRIO
  // =========================================================
  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-form__title">Recuperar senha</h1>
      <p className="auth-form__helper">
        Informe seu e-mail e enviaremos um link seguro para redefinir a senha.
      </p>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="seu@email.com"
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <button 
        type="submit" 
        className="btn btn--primary auth-form__submit" 
        disabled={loading}
      >
        {loading ? 'Enviando…' : 'Enviar link'}
      </button>

      <Link to="/login" className="auth-form__link">
        Voltar para o login
      </Link>
    </form>
  )
}