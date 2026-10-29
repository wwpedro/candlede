import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptInventory, adaptMovementList } from '../../../services/adapters.js'

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const MOVEMENT_LABEL = {
  ENTRY: 'Entrada',
  SALE: 'Venda',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolução',
}

export default function AdminEstoqueDetalhe() {
  const { id } = useParams()   // productId
  const [inventory, setInventory] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'entry' | 'adjust'

  const load = async () => {
    setLoading(true)
    try {
      const [inv, moves] = await Promise.all([
        adminApi.inventoryByProduct(id),
        adminApi.inventoryMovements(id),
      ])
      setInventory(adaptInventory(inv))
      setHistory(adaptMovementList(moves))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar o estoque deste produto.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  if (error || !inventory) {
    return (
      <div className="admin-page">
        <PageHeader title="Estoque não encontrado" />
        <Link to="/admin/estoque" className="btn btn--ghost">Voltar</Link>
      </div>
    )
  }

  const situation = inventory.quantity === 0
    ? { tone: 'muted', label: 'Sem estoque' }
    : inventory.lowStock
      ? { tone: 'muted', label: 'Estoque baixo' }
      : { tone: 'dark', label: 'Normal' }

  return (
    <div className="admin-page">
      <Link to="/admin/estoque" className="back-link">← Voltar para estoque</Link>

      <PageHeader title={inventory.productName} subtitle="Controle de estoque" />

      <section className="admin-kpis">
        <div className="admin-kpi">
          <p className="admin-kpi__label">Estoque atual</p>
          <p className="admin-kpi__value">{inventory.quantity}</p>
          <p className="admin-kpi__hint">unidades</p>
        </div>
        <div className="admin-kpi">
          <p className="admin-kpi__label">Estoque mínimo</p>
          <p className="admin-kpi__value">{inventory.minimumQuantity}</p>
          <p className="admin-kpi__hint">unidades</p>
        </div>
        <div className="admin-kpi">
          <p className="admin-kpi__label">Situação</p>
          <p style={{ marginTop: 12 }}>
            <StatusBadge tone={situation.tone}>{situation.label}</StatusBadge>
          </p>
        </div>
      </section>

      <section className="admin-actions-row">
        <button className="btn btn--primary" onClick={() => setModal('entry')}>
          + Entrada de estoque
        </button>
        <button className="btn btn--ghost" onClick={() => setModal('adjust')}>
          Ajustar estoque
        </button>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Histórico de movimentações</h2>

        {history.length === 0 ? (
          <p className="admin-table-empty">Nenhuma movimentação registrada.</p>
        ) : (
          <ul className="admin-stock-history">
            {history.map((h) => (
              <li key={h.id}>
                <div className="admin-stock-history__head">
                  <span className={`admin-stock-history__type admin-stock-history__type--${h.type.toLowerCase()}`}>
                    {MOVEMENT_LABEL[h.type] || h.type}
                  </span>
                  <span className="admin-stock-history__qty">
                    {h.qty > 0 ? `+${h.qty}` : h.qty} un
                  </span>
                </div>
                <p className="admin-text--muted">{formatDate(h.date)}</p>
                {h.reason && <p className="admin-text">{h.reason}</p>}
                <p className="admin-text--muted">
                  Saldo anterior: {h.before} · Novo saldo: {h.after}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal === 'entry' && (
        <EntryModal
          productName={inventory.productName}
          current={inventory.quantity}
          onClose={() => setModal(null)}
          onSave={async (qty, reason) => {
            try {
              await adminApi.inventoryEntry(id, qty, reason)
              await load()
              setModal(null)
            } catch (err) {
              alert(err.response?.data?.message || 'Erro ao registrar entrada.')
            }
          }}
        />
      )}

      {modal === 'adjust' && (
        <AdjustModal
          productName={inventory.productName}
          current={inventory.quantity}
          onClose={() => setModal(null)}
          onSave={async (newQty, reason) => {
            try {
              await adminApi.inventoryAdjustment(id, newQty, reason)
              await load()
              setModal(null)
            } catch (err) {
              alert(err.response?.data?.message || 'Erro ao ajustar estoque.')
            }
          }}
        />
      )}
    </div>
  )
}

/* ---------- ENTRADA ---------- */
function EntryModal({ productName, current, onClose, onSave }) {
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('Reposição de fornecedor')

  const n = Number(qty) || 0
  const after = current + n

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Entrada de estoque</h2>

        <div className="field">
          <label>Produto</label>
          <input value={productName} disabled />
        </div>

        <div className="field">
          <label>Quantidade</label>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
        </div>

        <div className="field">
          <label>Motivo</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="admin-modal-summary">
          <div><span>Estoque atual</span><span>{current}</span></div>
          <div><span>Após a entrada</span><span>{after}</span></div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn--primary" disabled={n <= 0} onClick={() => onSave(n, reason)}>
            Registrar entrada
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- AJUSTE ---------- */
function AdjustModal({ productName, current, onClose, onSave }) {
  const [newStock, setNewStock] = useState(String(current))
  const [reason, setReason] = useState('Contagem física')

  const n = Number(newStock)
  const diff = n - current

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Ajuste de estoque</h2>

        <div className="field">
          <label>Produto</label>
          <input value={productName} disabled />
        </div>

        <div className="field">
          <label>Estoque atual</label>
          <input value={current} disabled />
        </div>

        <div className="field">
          <label>Novo estoque</label>
          <input type="number" min="0" value={newStock} onChange={(e) => setNewStock(e.target.value)} autoFocus />
        </div>

        <div className="field">
          <label>Motivo</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="admin-modal-summary">
          <div>
            <span>Diferença</span>
            <span>{diff > 0 ? `+${diff}` : diff} un</span>
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn--primary"
            disabled={n < 0 || Number.isNaN(n) || n === current}
            onClick={() => onSave(n, reason)}
          >
            Confirmar ajuste
          </button>
        </div>
      </div>
    </div>
  )
}