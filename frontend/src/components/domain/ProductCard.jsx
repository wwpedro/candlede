import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const soldOut = product.stock === 0
  return (
    <Link
      to={`/produto/${product.id}`}
      className={`product-card${soldOut ? ' product-card--sold-out' : ''}`}
    >
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {soldOut && <span className="product-card__badge">Esgotado</span>}
      </div>

      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__line">{product.line}</p>

        <div className="product-card__price-row">
          <span className="product-card__price">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </Link>
  )
}