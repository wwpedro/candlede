import { useEffect, useState } from 'react'

export default function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Escuta o evento disparado pelo api.js
    const handleExpired = () => setIsOpen(true)
    window.addEventListener('candlede:session-expired', handleExpired)

    return () => {
      window.removeEventListener('candlede:session-expired', handleExpired)
    }
  }, [])

  if (!isOpen) return null

  const handleLogin = () => {
    setIsOpen(false)
    // Redireciona para o login e recarrega a página para limpar estados
    window.location.href = '/login'
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal--sm" style={{ textAlign: 'center' }}>
        <h2 className="modal__title" style={{ marginBottom: '16px' }}>Sessão Expirada</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Por motivos de segurança, sua sessão expirou. Por favor, faça login novamente para continuar.
        </p>
        <div className="modal__actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn--primary" onClick={handleLogin}>
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  )
}