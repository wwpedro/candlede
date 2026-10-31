import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/ui/Container.jsx'
import Button from '../../components/ui/Button.jsx'
import ProductCard from '../../components/domain/ProductCard.jsx'
import CategoryCard from '../../components/domain/CategoryCard.jsx'
import { catalogApi, bannerApi, contentApi } from '../../services/api.js'
import { adaptProductList, adaptCategoryList, adaptBannerList } from '../../services/adapters.js'

// ============================================================
// Banner de fallback — MÓDULO (fora do componente, tá ok)
// ============================================================
const FALLBACK_BANNER = {
  title: 'Aromas que\ntransformam momentos.',
  subtitle: 'Descubra a coleção Candlede.',
  imageUrl: '/images/hero.jpg',
  videoUrl: '/videos/hero.mp4',
  buttonText: 'Conhecer produtos',
  buttonLink: '/produtos',
}

// ============================================================
// Ritual de fallback — MÓDULO (fora do componente, tá ok)
// ============================================================
const FALLBACK_RITUAL = {
  eyebrow: 'Ritual',
  title: 'Linha de Cuidados',
  text: 'Cada produto foi pensado como um pequeno ritual. Aromas que convidam à pausa, ao cuidado e à presença.',
  buttonText: 'Explorar Coleção',
  buttonLink: '/categorias/cuidados-com-a-pele',
  image: '/images/ritual.jpeg', 
}

export default function Home() {
  // =========================================================
  // STATE — DENTRO do componente ✅
  // =========================================================
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banner, setBanner] = useState(null)
  const [ritual, setRitual] = useState(FALLBACK_RITUAL)
  const [loading, setLoading] = useState(true)

  // =========================================================
  // BANNERS
  // =========================================================
  useEffect(() => {
    let mounted = true

    bannerApi.getActive()
      .then((data) => {
        if (!mounted) return
        const list = adaptBannerList(data)
        if (list.length > 0) {
          setBanner(list[0])
        } else {
          console.warn('[HOME] Nenhum banner ativo, usando fallback')
        }
      })
      .catch((err) => {
        console.error('[HOME] Erro ao buscar banners:', err)
      })

    return () => { mounted = false }
  }, [])

  // =========================================================
  // PRODUTOS + CATEGORIAS
  // =========================================================
  useEffect(() => {
    let mounted = true

    Promise.all([
      catalogApi.getProducts(),
      catalogApi.getCategories(),
    ])
      .then(([productsData, categoriesData]) => {
        if (!mounted) return
        setProducts(adaptProductList(productsData))
        setCategories(adaptCategoryList(categoriesData))
      })
      .catch((err) => console.error('Erro ao carregar home:', err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [])

  // =========================================================
  // RITUAL (Textos vêm do banco, Imagem é estática)
  // =========================================================
  useEffect(() => {
    let mounted = true

    Promise.all([
      contentApi.getByKey('home_ritual_eyebrow').catch(() => null),
      contentApi.getByKey('home_ritual_title').catch(() => null),
      contentApi.getByKey('home_ritual_text').catch(() => null),
      contentApi.getByKey('home_ritual_button_text').catch(() => null),
      contentApi.getByKey('home_ritual_button_link').catch(() => null),
      // REMOVIDO: contentApi.getByKey('home_ritual_image')
    ]).then(([eb, ti, tx, bt, bl]) => {
      if (!mounted) return
      setRitual({
        eyebrow: eb?.content || FALLBACK_RITUAL.eyebrow,
        title: ti?.content || FALLBACK_RITUAL.title,
        text: tx?.content || FALLBACK_RITUAL.text,
        buttonText: bt?.content || FALLBACK_RITUAL.buttonText,
        buttonLink: bl?.content || FALLBACK_RITUAL.buttonLink,
        image: FALLBACK_RITUAL.image, // <--- SEMPRE ESTÁTICO
      })
    })

    return () => { mounted = false }
  }, [])

  // =========================================================
  // DERIVADOS
  // =========================================================
  const destaques = products.slice(0, 4)
  const hero = banner || FALLBACK_BANNER
  const hasVideo = Boolean(hero.videoUrl && hero.videoUrl.trim() !== '')

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        {hasVideo ? (
          <video
            key={hero.videoUrl}
            className="hero__video"
            src={hero.videoUrl}
            poster={hero.imageUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={hero.imageUrl || '/images/hero.jpg'}
            alt={hero.title}
            className="hero__image"
          />
        )}

        <div className="hero__overlay" />

        <Container className="hero__content">
          <p className="eyebrow hero__eyebrow">Coleção 2026</p>
          <h1 className="hero__title">{hero.title}</h1>
          {hero.subtitle && (
            <p className="hero__subtitle">{hero.subtitle}</p>
          )}
          {hero.buttonText && (
            <Button
              variant="primary"
              to={hero.buttonLink || '/produtos'}
              className="hero__cta"
            >
              {hero.buttonText}
            </Button>
          )}
        </Container>
      </section>

      {/* ---------- CATEGORIAS ---------- */}
      <section className="section">
        <Container>
          <header className="section-head">
            <p className="eyebrow">Explore</p>
            <h2>Categorias</h2>
          </header>

          {loading ? (
            <p className="text-muted">Carregando categorias…</p>
          ) : categories.length === 0 ? (
            <p className="text-muted">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="category-grid">
              {categories.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ---------- DESTAQUES ---------- */}
      <section className="section section--soft">
        <Container>
          <header className="section-head section-head--row">
            <div>
              <p className="eyebrow">Seleção</p>
              <h2>Destaques da Candlede</h2>
            </div>
            <Link to="/produtos" className="link-quiet">Ver tudo</Link>
          </header>

          {loading ? (
            <p className="text-muted">Carregando produtos…</p>
          ) : destaques.length === 0 ? (
            <p className="text-muted">Nenhum produto cadastrado.</p>
          ) : (
            <div className="product-grid">
              {destaques.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ---------- LINHA DE CUIDADOS ---------- */}
      <section className="section">
        <Container>
          <div className="editorial">
            <div className="editorial__text">
              <p className="eyebrow">{ritual.eyebrow}</p>
              <h2>{ritual.title}</h2>
              <p className="editorial__paragraph">{ritual.text}</p>
              <Button variant="ghost" to={ritual.buttonLink}>
                {ritual.buttonText}
              </Button>
            </div>

            <div className="editorial__media">
              <img src={ritual.image} alt={ritual.title} />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}