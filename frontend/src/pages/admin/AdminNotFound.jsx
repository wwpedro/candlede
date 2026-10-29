import { Link } from 'react-router-dom'
import PageHeader from '../../components/admin/PageHeader.jsx'

export default function AdminNotFound() {
  return (
    <div className="admin-page">
      <PageHeader title="Página não encontrada" subtitle="A seção do admin que você tentou acessar não existe." />

      <div className="admin-block" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, margin: '0 0 12px' }}>404</p>
        <p className="admin-text--muted" style={{ marginBottom: 24 }}>
          Verifique o endereço ou volte para o dashboard.
        </p>
        <Link to="/admin" className="btn btn--primary">Voltar para o dashboard</Link>
      </div>
    </div>
  )
}