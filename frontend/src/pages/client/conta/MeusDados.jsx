import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { userApi } from '../../../services/api.js'

export default function MeusDados() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // ---------- carregar dados atuais ----------
  useEffect(() => {
    let mounted = true
    userApi.getMe()
      .then((data) => {
        if (!mounted) return
        setForm({ name: data.name || '', phone: data.phone || '' })
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Não foi possível carregar seus dados.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await userApi.update({
        name: form.name,
        phone: form.phone,
      })
      // Atualiza o AuthContext (mantém a sessão sincronizada)
      updateUser({ name: data.name })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar alterações.')
    }
  }

  if (loading) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Meus dados</h1>
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="account-page">
      <header className="account-page__head">
        <h1 className="account-page__title">Meus dados</h1>
        <p className="account-page__subtitle">
          Atualize suas informações pessoais.
        </p>
      </header>

      <form className="account-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            readOnly
            disabled
          />
          <small className="field__hint">Não editável</small>
        </div>

        <div className="field">
          <label htmlFor="phone">Telefone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <div className="account-form__actions">
          <button type="submit" className="btn btn--primary">
            Salvar alterações
          </button>
          {saved && <span className="account-form__saved">Alterações salvas.</span>}
        </div>
      </form>
    </div>
  )
}