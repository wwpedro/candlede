import { Link } from 'react-router-dom'

// ============================================================
// ÍCONES (SVG inline)
// ============================================================
const ICONS = {
  candle: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h6v11H9z" />
      <path d="M12 8V5" />
      <path d="M12 5c0-1 1-1.5 1-2.5S12 1 12 1s-1 .5-1 1.5S12 4 12 5z" />
    </svg>
  ),
  perfume: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h6v12H9z" />
      <path d="M10.5 8V5.5h3V8" />
      <path d="M12 5.5V3" />
    </svg>
  ),
  cream: ( // Usado para Cuidados com a Pele
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="8" height="12" rx="1" />
      <path d="M9 8V6h6v2" />
      <path d="M12 12v4" /> 
    </svg>
  ),
  spray: ( // NOVO: Para Home Sprays
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12h6v9H8z" />
      <path d="M11 12V8h2v4" />
      <path d="M14 6h3v4" />
      <path d="M17 4l2 2M19 4l-2 2" />
    </svg>
  ),
  diffuser: ( // Usado para aromatizadores/difusores
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 9h4v11h-4z" />
      <path d="M11 9V6h2v3" />
      <path d="M16 4l2 2M18 4l-2 2" />
    </svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
}

// ============================================================
// MAPEAMENTO NOME → ÍCONE (Atualizado com as suas categorias)
// ============================================================
function pickIcon(category) {
  const name = (category.name || '').toLowerCase()

  if (name.includes('vela')) return ICONS.candle
  if (name.includes('parfum') || name.includes('perfume')) return ICONS.perfume
  if (name.includes('pele') || name.includes('creme') || name.includes('skincare')) return ICONS.cream
  if (name.includes('spray') || name.includes('home')) return ICONS.spray
  if (name.includes('aromatiz') || name.includes('difusor') || name.includes('ambient')) return ICONS.diffuser

  return ICONS.default
}

export default function CategoryCard({ category }) {
  return (
    <Link to={`/categorias/${category.slug}`} className="category-card">
      <span className="category-card__icon" aria-hidden="true">
        {pickIcon(category)}
      </span>
      <span className="category-card__name">{category.name}</span>
    </Link>
  )
}