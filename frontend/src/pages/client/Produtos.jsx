import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '../../components/ui/Container.jsx'
import ProductCard from '../../components/domain/ProductCard.jsx'
import { catalogApi } from '../../services/api.js'
import { adaptProductList, adaptCategoryList } from '../../services/adapters.js'

export default function Produtos() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // -------- carrega categorias só uma vez --------
  useEffect(() => {
    catalogApi.getCategories()
      .then((data) => setCategories(adaptCategoryList(data)))
      .catch(() => {})
  }, [])

  // -------- carrega produtos conforme o slug --------
  useEffect(() => {
    setLoading(true)
    setError('')

    const promise = slug
      ? catalogApi.getProductsByCategorySlug(slug)
      : catalogApi.getProducts()

    promise
      .then((data) => setProducts(adaptProductList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os produtos.')
      })
      .finally(() => setLoading(false))
  }, [slug])

  // -------- título da página --------
  const currentCategory = slug
    ? categories.find((c) => c.slug === slug)
    : null

  const header = currentCategory
    ? {
        label: 'Categoria',
        title: currentCategory.name,
        text: currentCategory.description || 'Explore nossa seleção.',
      }
    : {
        label: 'Coleção',
        title: 'Todos os produtos',
        text: 'Explore a seleção completa da Candlede.',
      }

  // -------- filtros --------
  const filters = [{ slug: 'todos', name: 'Todos' }, ...categories]

  const handleFilter = (filterSlug) => {
    if (filterSlug === 'todos') navigate('/produtos')
    else navigate(`/categorias/${filterSlug}`)
  }

  return (
    <Container>
      <header className="catalog-head">
        <p className="catalog-head__label">{header.label}</p>
        <h1 className="catalog-head__title">{header.title}</h1>
        <p className="catalog-head__text">{header.text}</p>
      </header>

      <div className="filter-bar">
        {filters.map((c) => {
          const active =
            (c.slug === 'todos' && !slug) || c.slug === slug
          return (
            <button
              key={c.slug}
              onClick={() => handleFilter(c.slug)}
              className={`filter-pill${active ? ' is-active' : ''}`}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-muted" style={{ padding: '48px 0' }}>
          Carregando produtos…
        </p>
      ) : error ? (
        <p className="text-muted" style={{ padding: '48px 0' }}>{error}</p>
      ) : products.length === 0 ? (
        <p className="empty-state">Nenhum produto nessa categoria.</p>
      ) : (
        <div className="product-grid product-grid--catalog">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  )
}