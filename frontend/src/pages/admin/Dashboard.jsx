import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/admin/PageHeader.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../services/api.js'
import {
  adaptAdminProductList,
  adaptOrderList,
} from '../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

const STATUS_LABEL = {
  received: 'Pedido recebido',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

const STATUS_TONE = {
  received: 'dark',
  preparing: 'dark',
  shipped: 'muted',
  delivered: 'muted',
  canceled: 'muted',
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      adminApi.dashboard(),
      adminApi.orders(),
      adminApi.products(),
    ])
      .then(([dash, ordersData, productsData]) => {
        if (!mounted) return
        setKpis(dash)
        setOrders(adaptOrderList(ordersData))
        setProducts(adaptAdminProductList(productsData))
      })
      .catch((err) => console.error('Erro dashboard:', err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading || !kpis) {
    return (
      <div className="admin-page">
        <PageHeader title="Dashboard" subtitle="Visão geral da loja" />
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  const recentOrders = orders.slice(0, 5)
  const lowStock = products.filter((p) => p.lowStock).slice(0, 5)

  return (
    <div className="admin-page">
      <PageHeader title="Dashboard" subtitle="Visão geral da sua loja" />

      <section className="admin-kpis">
        <div className="admin-kpi">
          <p className="admin-kpi__label">Pedidos</p>
          <p className="admin-kpi__value">{kpis.totalOrders}</p>
          <p className="admin-kpi__hint">no total</p>
        </div>
        <div className="admin-kpi">
          <p className="admin-kpi__label">Vendas</p>
          <p className="admin-kpi__value">{formatBRL(kpis.totalSales)}</p>
          <p className="admin-kpi__hint">total</p>
        </div>
        <div className="admin-kpi">
          <p className="admin-kpi__label">Produtos</p>
          <p className="admin-kpi__value">{kpis.totalProducts}</p>
          <p className="admin-kpi__hint">cadastrados</p>
        </div>
        <div className="admin-kpi">
          <p className="admin-kpi__label">Estoque baixo</p>
          <p className="admin-kpi__value">{kpis.lowStockProducts}</p>
          <p className="admin-kpi__hint">precisam atenção</p>
        </div>
      </section>

      <section className="admin-block">
        <header className="admin-block__head">
          <h2 className="admin-block__title">Pedidos recentes</h2>
          <Link to="/admin/pedidos" className="link-quiet">Ver todos →</Link>
        </header>

        {recentOrders.length === 0 ? (
          <p className="admin-table-empty">Nenhum pedido ainda.</p>
        ) : (
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/pedidos/${o.id}`}>#{o.id}</Link></td>
                  <td>{o.customer.name}</td>
                  <td>{formatBRL(o.total)}</td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[o.status]}>
                      {STATUS_LABEL[o.status]}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-block">
        <header className="admin-block__head">
          <h2 className="admin-block__title">Estoque baixo</h2>
          <Link to="/admin/estoque" className="link-quiet">Ver estoque →</Link>
        </header>

        {lowStock.length === 0 ? (
          <p className="admin-table-empty">Nenhum produto em estoque baixo.</p>
        ) : (
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>{p.minimumStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}