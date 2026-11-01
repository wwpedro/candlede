import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import { IconInstagram, IconMail } from '../ui/Icons.jsx'
import { catalogApi } from '../../services/api.js'
import { adaptCategoryList } from '../../services/adapters.js'
import {
  Visa,
  Mastercard,
  AmericanExpress,
  Elo,
  Hipercard,
} from 'react-svg-credit-card-payment-icons/icons/flat-rounded'

export default function Footer() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let mounted = true
    catalogApi.getCategories()
      .then((data) => {
        if (mounted) setCategories(adaptCategoryList(data))
      })
      .catch((err) => console.error('Erro ao carregar categorias no footer:', err))
    return () => { mounted = false }
  }, [])

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          {/* Bloco esquerdo */}
          <div className="site-footer__brand-block">
            <Link to="/" className="site-footer__brand">Candlede</Link>

            <ul className="site-footer__contacts">
              <li>
                <IconInstagram size={14} />
                <a href="https://www.instagram.com/candlede._/" target="_blank" rel="noreferrer">
                  @candlede._
                </a>
              </li>
              <li>
                <IconMail size={14} />
                <a href="mailto:candledecontato@gmail.com">candledecontato@gmail.com</a>
              </li>
            </ul>

            {/* Formas de Pagamento */}
            <div className="site-footer__payments">
              <p className="site-footer__payments-title">Formas de pagamento</p>
              <div className="payment-icons-grid">
                                {/* PIX */}
                <div className="payment-icon" title="PIX">
                  <svg width="32" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {/* O losango verde de fundo */}
                    <path d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z" fill="#32BCAD"/>
                    {/* O X branco cortando o losango */}
                    <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                {/* Bandeiras via biblioteca */}
                <div className="payment-icon" title="Visa">
                  <Visa width={32} height={20} />
                </div>
                <div className="payment-icon" title="Mastercard">
                  <Mastercard width={32} height={20} />
                </div>
                <div className="payment-icon" title="American Express">
                  <AmericanExpress width={32} height={20} />
                </div>
                <div className="payment-icon" title="Elo">
                  <Elo width={32} height={20} />
                </div>
                <div className="payment-icon" title="Hipercard">
                  <Hipercard width={32} height={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco direito (Loja e Ajuda) */}
          <div className="site-footer__links">
            <div className="site-footer__col">
              <h4>Loja</h4>
              <ul>
                <li><Link to="/produtos">Todos os produtos</Link></li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/categorias/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer__col">
              <h4>Ajuda</h4>
              <ul>
                <li><Link to="/carrinho">Carrinho</Link></li>
                <li><Link to="/contato">Atendimento</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Candlede. Todos os direitos reservados.</span>
        </div>
      </Container>
    </footer>
  )
}