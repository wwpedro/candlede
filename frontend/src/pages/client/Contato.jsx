import { useState, useEffect } from 'react'
import Container from '../../components/ui/Container.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { contactApi } from '../../services/api.js'

export default function Contato() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Preenche o nome automaticamente se o usuário estiver logado
  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name }))
    }
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Verifica se está logado
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 2. Envia usando o email do usuário logado
      await contactApi.send({
        name: form.name,
        email: user.email, 
        subject: form.subject,
        message: form.message,
      })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = () => {
    setSent(false)
    setForm({ name: user?.name || '', subject: '', message: '' })
  }

  return (
    <Container>
      <section className="contact">
        <header className="contact__head">
          <p className="contact__label">Atendimento</p>
          <h1 className="contact__title">Fale conosco</h1>
          <p className="contact__text">
            Respondemos em até um dia útil, de segunda a sexta.<br />
            Para trocas, tenha o número do pedido em mãos.
          </p>
          
          {/* LINK DO INSTAGRAM ADICIONADO AQUI */}
          <div style={{ marginTop: 16 }}>
            <p className="contact__text" style={{ margin: 0 }}>
              Siga-nos no Instagram:{' '}
              <a 
                href="https://www.instagram.com/candlede._/" 
                target="_blank" 
                rel="noreferrer"
                style={{ textDecoration: 'underline', fontWeight: 600, color: 'var(--color-black)' }}
              >
                @candlede._
              </a>
            </p>
          </div>
        </header>

        {sent ? (
          <div className="contact__success">
            <div className="confirmation__icon">✓</div>
            <h2 className="confirmation__headline">Mensagem enviada!</h2>
            <p className="confirmation__sub">
              Sua mensagem foi enviada com sucesso.
              <br />
              Responderemos para o e-mail <strong>{user?.email}</strong> em breve.
            </p>
            <button className="btn btn--ghost" onClick={handleNewMessage}>
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form className="contact__form" onSubmit={handleSubmit} noValidate>
            <div className="contact__row">
              <div className="field">
                <label htmlFor="name">Nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={!!user} // Trava o nome se estiver logado
                />
              </div>

              <div className="field">
                <label htmlFor="subject">Título</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                name="message"
                rows={10}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {!user && (
              <p className="text-muted" style={{ fontSize: 13 }}>
                * Você precisa estar logado para enviar uma mensagem.
              </p>
            )}

            {error && <p className="auth-form__error">{error}</p>}

            <button type="submit" className="btn contact__submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        )}
      </section>

      {/* ==========================================
          POPUP DE NÃO LOGADO
          ========================================== */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2 className="modal__title">Atenção</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Você precisa estar logado para enviar uma mensagem. Faça login para continuar.
            </p>
            <div className="modal__actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn--ghost" onClick={() => setShowLoginModal(false)}>
                Cancelar
              </button>
              <a href="/login" className="btn btn--primary">
                Fazer Login
              </a>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}