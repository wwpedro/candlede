import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'

export default function MinhaConta() {
  const { user } = useAuth()
  const firstName = (user?.name || '').split(' ')[0] || 'Olá'

  return (
    <div className="account-page">
      <header className="account-page__head">
        <h1 className="account-page__title">Olá, {firstName}</h1>
        <p className="account-page__subtitle">
          Gerencie sua conta e acompanhe suas compras.
        </p>
      </header>

      <div className="account-cards">
        <Link to="/meus-pedidos" className="account-card">
          <h3 className="account-card__title">Meus pedidos</h3>
          <p className="account-card__text">Veja e acompanhe suas compras.</p>
          <span className="account-card__cta">Acessar →</span>
        </Link>

        <Link to="/minha-conta/enderecos" className="account-card">
          <h3 className="account-card__title">Meus endereços</h3>
          <p className="account-card__text">Gerencie seus endereços de entrega.</p>
          <span className="account-card__cta">Acessar →</span>
        </Link>

        <Link to="/minha-conta/dados" className="account-card account-card--wide">
          <h3 className="account-card__title">Meus dados</h3>
          <p className="account-card__text">Nome, e-mail e telefone.</p>
          <span className="account-card__cta">Editar dados →</span>
        </Link>
      </div>
    </div>
  )
}