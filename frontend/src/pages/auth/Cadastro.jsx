import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// ============================================================
// VALIDAÇÕES
// ============================================================
const validators = {
  name: (v) => {
    if (!v.trim()) return 'Nome é obrigatório.'
    if (v.trim().length < 3) return 'Nome muito curto.'
    if (v.trim().length > 150) return 'Nome muito longo.'
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(v)) return 'Nome não pode ter números ou caracteres especiais.'
    return ''
  },
  email: (v) => {
    if (!v.trim()) return 'E-mail é obrigatório.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido.'
    return ''
  },
  phone: (v) => {
    if (!v.trim()) return 'Telefone é obrigatório.'
    const digits = v.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos (com DDD).'
    }
    return ''
  },
  password: (v) => {
  if (!v) return 'Senha é obrigatória.'
  if (v.length < 8) return 'Senha deve ter pelo menos 8 caracteres.'
  if (v.length > 100) return 'Senha muito longa.'
  if (!/[A-Za-z]/.test(v)) return 'A senha deve conter pelo menos uma letra.'
  if (!/\d/.test(v)) return 'A senha deve conter pelo menos um número.'
  return ''
},
  confirm: (v, form) => {
    if (!v) return 'Confirme sua senha.'
    if (v !== form.password) return 'As senhas não coincidem.'
    return ''
  },
}

// ============================================================
// MÁSCARA DE TELEFONE
// ============================================================
function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function Cadastro() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')

  const [showWelcome, setShowWelcome] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  // ---------- valida campo ----------
  const validateField = (name, value, currentForm = form) => {
    const validator = validators[name]
    if (!validator) return ''
    return validator(value, currentForm)
  }

  // ---------- mudança ----------
  const handleChange = (e) => {
    const { name } = e.target
    let value = e.target.value

    // máscara de telefone
    if (name === 'phone') {
      value = maskPhone(value)
    }

    const nextForm = { ...form, [name]: value }
    setForm(nextForm)

    // valida em tempo real se já foi tocado
    if (touched[name]) {
      const error = validateField(name, value, nextForm)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    // se mexeu na senha, revalida o "confirm"
    if (name === 'password' && touched.confirm) {
      const confirmError = validateField('confirm', nextForm.confirm, nextForm)
      setErrors((prev) => ({ ...prev, confirm: confirmError }))
    }
  }

  // ---------- blur ----------
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    // valida todos
    const newErrors = {}
    let hasError = false
    Object.keys(validators).forEach((field) => {
      const err = validateField(field, form[field], form)
      if (err) { newErrors[field] = err; hasError = true }
    })
    setErrors(newErrors)
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true })
    if (hasError) return

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ''),
        password: form.password,
      })

      // MUDOU: em vez de navigate, mostra o modal
      setRegisteredEmail(form.email.trim().toLowerCase())
      setShowWelcome(true)
    } catch (err) {
      setServerError(err.message || 'Não foi possível criar a conta.')
    }
  }

  // ---------- helper visual ----------
  const fieldClass = (name) => {
    if (!touched[name] || !errors[name]) return 'field'
    return 'field field--error'
  }

  return (
    <>
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-form__title">Criar conta</h1>

      {/* ---------- NOME ---------- */}
      <div className={fieldClass('name')}>
        <label htmlFor="name">Nome *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="name"
        />
        {touched.name && errors.name && (
          <small className="field__error">{errors.name}</small>
        )}
      </div>

      {/* ---------- EMAIL ---------- */}
      <div className={fieldClass('email')}>
        <label htmlFor="email">E-mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
        />
        {touched.email && errors.email && (
          <small className="field__error">{errors.email}</small>
        )}
      </div>

      {/* ---------- TELEFONE ---------- */}
      <div className={fieldClass('phone')}>
        <label htmlFor="phone">Telefone *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="(82) 99999-9999"
          autoComplete="tel"
        />
        {touched.phone && errors.phone && (
          <small className="field__error">{errors.phone}</small>
        )}
      </div>

      {/* ---------- SENHA ---------- */}
      <div className={fieldClass('password')}>
        <label htmlFor="password">Senha *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="new-password"
        />
        {touched.password && errors.password ? (
          <small className="field__error">{errors.password}</small>
        ) : (
          <small className="field__hint">
  Mínimo 8 caracteres, com pelo menos uma letra e um número
</small>
        )}
      </div>

      {/* ---------- CONFIRMAR ---------- */}
      <div className={fieldClass('confirm')}>
        <label htmlFor="confirm">Confirmar senha *</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="new-password"
        />
        {touched.confirm && errors.confirm && (
          <small className="field__error">{errors.confirm}</small>
        )}
      </div>

      {/* ---------- ERRO DO SERVIDOR ---------- */}
      {serverError && <p className="auth-form__error">{serverError}</p>}

      <button
        type="submit"
        className="btn btn--primary auth-form__submit"
        disabled={loading}
      >
        {loading ? 'Criando…' : 'Criar conta'}
      </button>

      <div className="auth-form__divider" />

      <p className="auth-form__helper">Já possui uma conta?</p>
      <Link to="/login" className="auth-form__link auth-form__link--strong">
        Entrar
      </Link>
    </form>

     {showWelcome && (
        <div className="modal-overlay">
          <div className="modal modal--sm welcome-modal">
            <div className="welcome-modal__icon">✉️</div>
            <h2 className="welcome-modal__title">Conta criada!</h2>
            <p className="welcome-modal__text">
              Enviamos um e-mail de boas-vindas para:
            </p>
            <p className="welcome-modal__email">{registeredEmail}</p>
            <p className="welcome-modal__hint">
              Verifique sua caixa de entrada (ou o spam).
            </p>
            <button
              className="btn btn--primary welcome-modal__cta"
              onClick={() => navigate('/', { replace: true })}
            >
              Explorar a loja
            </button>
          </div>
        </div>
      )}
    </>
  )
}