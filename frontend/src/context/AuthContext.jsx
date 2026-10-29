import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)
const USER_KEY = 'candlede:user'
const TOKEN_KEY = 'candlede:token'

// Backend devolve "ADMIN"/"CUSTOMER"/"PENDING_2FA"
const normalizeRole = (role) => (role || '').toLowerCase()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })

      // ---------- Se for 2FA pendente, NÃO seta user ----------
      if (data.role === 'PENDING_2FA') {
        return { role: 'pending_2fa', pendingToken: data.token }
      }

      // ---------- Login normal ----------
      localStorage.setItem(TOKEN_KEY, data.token)

      const safe = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizeRole(data.role),
      }
      setUser(safe)
      return safe
    } catch (err) {
      const msg = err.response?.data?.message || 'E-mail ou senha incorretos.'
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // VERIFY 2FA — chamado depois que o usuário digita o código
  // =========================================================
  const verify2fa = async (pendingToken, code) => {
    setLoading(true)
    try {
      const data = await authApi.verify2fa(pendingToken, code)

      localStorage.setItem(TOKEN_KEY, data.token)

      const safe = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizeRole(data.role),
      }
      setUser(safe)
      return safe
    } catch (err) {
      const msg = err.response?.data?.message || 'Código inválido.'
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // CADASTRO
  // =========================================================
  const register = async ({ name, email, password, phone }) => {
    setLoading(true)
    try {
      const data = await authApi.register({ name, email, password, phone })
      localStorage.setItem(TOKEN_KEY, data.token)

      const safe = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizeRole(data.role),
      }
      setUser(safe)
      return safe
    } catch (err) {
      const msg = err.response?.data?.message || 'Não foi possível criar a conta.'
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = async () => {
    try {
      await authApi.logout()
    } catch {}
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  // =========================================================
  // UPDATE LOCAL
  // =========================================================
  const updateUser = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  // =========================================================
  // RECUPERAR SENHA
  // =========================================================
  const requestPasswordReset = async (email) => {
    await authApi.forgotPassword(email)
    return { ok: true }
  }

  // =========================================================
  // REDEFINIR SENHA
  // =========================================================
  const resetPassword = async ({ token, password }) => {
    await authApi.resetPassword(token, password)
    return { ok: true }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      verify2fa,
      register,
      logout,
      updateUser,
      requestPasswordReset,
      resetPassword,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}