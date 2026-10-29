import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import { IconInstagram, IconMail, IconPhone } from '../ui/Icons.jsx'
import { catalogApi } from '../../services/api.js'
import { adaptCategoryList } from '../../services/adapters.js'

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

          {/* ---------- BLOCO ESQUERDO: marca + contatos ---------- */}
          <div className="site-footer__brand-block">
            <Link to="/" className="site-footer__brand">Candlede</Link>

            <ul className="site-footer__contacts">
              <li>
                <IconInstagram size={14} />
                <a href="https://www.instagram.com/candlede._/" target="_blank" rel="noreferrer">
                  @candlede
                </a>
              </li>
              <li>
                <IconMail size={14} />
                <a href="mailto:candledecontato@gmail.com">candlede@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* ---------- BLOCO DIREITO: Loja + Ajuda ---------- */}
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
                <li><Link to="/contato">Entrega</Link></li>
                <li><Link to="/contato">Trocas</Link></li>
                <li><Link to="/contato">Atendimento</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Candlede. Todos os direitos reservados.</span>
          <span>
            <Link to="/contato">Política de privacidade</Link>
            {' · '}
            <Link to="/contato">Termos de uso</Link>
          </span>
        </div>
      </Container>
    </footer>
  )
}