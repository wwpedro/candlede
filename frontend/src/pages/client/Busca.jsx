import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Container from '../../components/ui/Container.jsx'
import ProductCard from '../../components/domain/ProductCard.jsx'
import { catalogApi } from '../../services/api.js'
import { adaptProductList } from '../../services/adapters.js'

export default function Busca() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setError('')

    catalogApi.searchProducts(query)
      .then((data) => {
        if (mounted) setResults(adaptProductList(data))
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Não foi possível buscar os produtos.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [query])

  return (
    <Container>
      <section className="search">
        <header className="search__head">
          <p className="search__label">Busca</p>
          <h1 className="search__title">
            Resultados para &ldquo;{query}&rdquo;
          </h1>
          {!loading && !error && query && (
            <p className="search__count">
              {results.length}{' '}
              {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          )}
        </header>

        {loading ? (
          <p className="text-muted" style={{ padding: '48px 0' }}>Buscando…</p>
        ) : error ? (
          <p className="text-muted" style={{ padding: '48px 0' }}>{error}</p>
        ) : results.length > 0 ? (
          <div className="product-grid product-grid--catalog">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="search__empty">
            <p className="search__empty-title">Nenhum produto encontrado.</p>
            {query && (
              <p className="search__empty-text">
                Não encontramos resultados para: <strong>&ldquo;{query}&rdquo;</strong>
              </p>
            )}
            <Link to="/produtos" className="btn btn--ghost">
              Ver todos os produtos
            </Link>
          </div>
        )}
      </section>
    </Container>
  )
}