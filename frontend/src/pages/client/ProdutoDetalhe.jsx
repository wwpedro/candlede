import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async' // <-- IMPORTANTE: Importação do SEO
import Container from '../../components/ui/Container.jsx'
import ProductCard from '../../components/domain/ProductCard.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { catalogApi } from '../../services/api.js'
import { adaptProduct, adaptProductList } from '../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

export default function ProdutoDetalhe() {
  const { id } = useParams()
  const { add } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setProduct(null)
    setRelated([])

    catalogApi.getProduct(id)
      .then((data) => {
        if (!mounted) return
        const adapted = adaptProduct(data)
        setProduct(adapted)

        // Busca relacionados da mesma categoria
        if (adapted.categoryId) {
          return catalogApi.getProductsByCategory(adapted.categoryId)
            .then((list) => {
              if (!mounted) return
              const outros = adaptProductList(list)
                .filter((p) => p.id !== adapted.id)
                .slice(0, 4)
              setRelated(outros)
            })
        }
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Produto não encontrado.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [id])

  const handleAdd = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/produto/${id}` } })
      return
    }
    try {
      await add(product)
      setFeedback('Adicionado à sacola ✓')
      setTimeout(() => setFeedback(''), 2000)
    } catch (err) {
      setFeedback(err.response?.data?.message || err.message)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <Container>
        <div className="product-detail-loading">
          <p className="text-muted">Carregando produto…</p>
        </div>
      </Container>
    )
  }

  // =========================================================
  // ERRO
  // =========================================================
  if (error || !product) {
    return (
      <Container>
        <div className="product-detail-notfound">
          <p className="text-muted">{error || 'Produto não encontrado.'}</p>
          <Link to="/produtos" className="btn btn--ghost">
            Ver todos os produtos
          </Link>
        </div>
      </Container>
    )
  }

  const soldOut = product.stock === 0

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* ========================================== */}
      {/* SEO E REDES SOCIAIS (Dinâmico)             */}
      {/* ========================================== */}
      <Helmet>
        <title>{product.name} | Candlede</title>
        
        {/* Descrição para o Google (limitada a 155 caracteres) */}
        <meta 
          name="description" 
          content={product.description?.substring(0, 155) + '...'} 
        />
        
        {/* Open Graph (WhatsApp / Instagram) */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | Candlede`} />
        <meta property="og:description" content={product.description?.substring(0, 155) + '...'} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={`https://candlede.com.br/produto/${id}`} />

        {/* JSON-LD (Dados Estruturados para o Google mostrar preço e estoque) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.image,
            "description": product.description,
            "offers": {
              "@type": "Offer",
              "url": `https://candlede.com.br/produto/${id}`,
              "priceCurrency": "BRL",
              "price": product.price,
              "availability": soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      <Container>
        {/* ---------- BREADCRUMB ---------- */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/produtos">Produtos</Link>
          {product.categoryName && (
            <>
              <span>/</span>
              <span>{product.categoryName}</span>
            </>
          )}
        </nav>

        {/* ---------- DETALHE ---------- */}
        <article className="product-detail">
          <div className="product-detail__media">
            {/* Adicionado um alt descritivo para SEO e Image Search */}
            <img 
              src={product.image} 
              alt={`Vela aromática ${product.name} - Candlede`} 
            />
            {soldOut && (
              <span className="product-detail__badge">Esgotado</span>
            )}
          </div>

          <div className="product-detail__info">
            <p className="product-detail__line">
              {product.line || product.categoryName}
            </p>

            <h1 className="product-detail__title">{product.name}</h1>

            <p className="product-detail__price">{formatBRL(product.price)}</p>

            <p className="product-detail__description">{product.description}</p>

            <hr className="hairline" />

            <div className="product-detail__actions">
              <button
                onClick={handleAdd}
                className="btn btn--primary"
                disabled={soldOut}
              >
                {soldOut ? 'Produto esgotado' : 'Adicionar à sacola'}
              </button>

              <Link to="/carrinho" className="btn btn--ghost">
                Ver carrinho
              </Link>
            </div>

            {feedback && (
              <p className="product-detail__feedback">{feedback}</p>
            )}

            {!soldOut && product.stock <= 5 && (
              <p className="product-detail__stock-warning">
                Últimas {product.stock} unidades disponíveis
              </p>
            )}
          </div>
        </article>

        {/* ---------- RELACIONADOS ---------- */}
        {related.length > 0 && (
          <section className="related">
            <header className="related__head">
              <p className="eyebrow">Você pode gostar</p>
              <h2 className="related__title">
                Mais de {product.categoryName || 'nossa coleção'}
              </h2>
            </header>

            <div className="product-grid product-grid--catalog">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  )
}