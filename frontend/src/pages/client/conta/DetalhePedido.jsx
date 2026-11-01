import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi, reviewApi } from '../../../services/api.js'
import { adaptOrder } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const STEPS = ['received', 'paid', 'preparing', 'shipped', 'delivered', 'completed']
const STEP_LABEL = {
  received:  'Pedido recebido',
  paid:      'Pagamento confirmado',
  preparing: 'Preparando',
  shipped:   'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído'
}

export default function DetalhePedido() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados para a confirmação de entrega
  const [confirming, setConfirming] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Estados para as avaliações
  const [reviewsState, setReviewsState] = useState({})

  // =========================================================
  // CARREGA PEDIDO E AVALIAÇÕES EXISTENTES
  // =========================================================
  const loadOrder = () => {
    setLoading(true)
    Promise.all([
      orderApi.get(id),
      reviewApi.getByOrder(id).catch(() => []) // Se der erro, retorna lista vazia
    ])
      .then(([orderData, existingReviews]) => {
        setOrder(adaptOrder(orderData))
        
        // Popula o estado com as avaliações que já foram feitas
        const state = {}
        existingReviews.forEach(r => {
          state[r.productId] = { submitted: true, rating: r.rating, comment: '' }
        })
        setReviewsState(state)
      })
      .catch((err) => {
        console.error(err)
        setError('Pedido não encontrado.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  // ---------- CONFIRMAR ENTREGA ----------
  const handleConfirmDelivery = async () => {
    setConfirming(true)
    try {
      await orderApi.confirmDelivery(id)
      setShowConfirmModal(false)
      loadOrder() 
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao confirmar a entrega. Tente novamente.")
    } finally {
      setConfirming(false)
    }
  }

  // ---------- AVALIAÇÃO ----------
  const handleReviewChange = (productId, field, value) => {
    setReviewsState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  const handleSubmitReview = async (e, productId) => {
    e.preventDefault()
    const state = reviewsState[productId]
    
    if (!state?.rating) {
      return alert("Por favor, escolha de 1 a 5 estrelas.")
    }

    setReviewsState(prev => ({
      ...prev,
      [productId]: { ...prev[productId], loading: true }
    }))

    try {
      await reviewApi.create({
        orderId: Number(id),
        productId,
        rating: state.rating,
        comment: state.comment || ''
      })
      
      setReviewsState(prev => ({
        ...prev,
        [productId]: { ...prev[productId], loading: false, submitted: true }
      }))

      // MÁGICA AQUI: Avisa o Navbar para atualizar o sino de notificações
      window.dispatchEvent(new Event('candlede:refresh-notifications'))

    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar avaliação.")
      setReviewsState(prev => ({
        ...prev,
        [productId]: { ...prev[productId], loading: false }
      }))
    }
  }

  if (loading) {
    return (
      <div className="account-page">
        <p className="text-muted">Carregando pedido…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Pedido não encontrado</h1>
        <Link to="/meus-pedidos" className="btn btn--ghost">Voltar</Link>
      </div>
    )
  }

  const isCanceled = order.status === 'canceled'
  const isPaid = order.payment.status === 'approved'
  
  let currentIndex = STEPS.indexOf(order.status)
  if (order.status === 'received' && isPaid) currentIndex = 1

  const showPreparingNotice = isPaid && order.status === 'received' && !isCanceled

  // =========================================================
  // MÁGICA AQUI: Ordena os itens não avaliados para o topo
  // =========================================================
  const sortedItems = [...order.items].sort((a, b) => {
    const aReviewed = reviewsState[a.productId]?.submitted
    const bReviewed = reviewsState[b.productId]?.submitted
    if (aReviewed === bReviewed) return 0
    return aReviewed ? 1 : -1 // Se 'a' foi avaliado, ele vai para baixo
  })

  return (
    <div className="account-page">
      <Link to="/meus-pedidos" className="back-link">← Voltar para meus pedidos</Link>

      <header className="account-page__head">
        <h1 className="account-page__title">Pedido #{order.id}</h1>
        <p className="account-page__subtitle">{formatDate(order.date)}</p>
      </header>

      {showPreparingNotice && (
        <section className="order-notice">
          <div className="order-notice__icon">⏱</div>
          <div className="order-notice__content">
            <p className="order-notice__title">Aguardando preparação</p>
            <p className="order-notice__text">
              Seu pagamento foi confirmado. O fornecedor irá preparar seu pedido
              em <strong>até 24 horas</strong>. Você será notificado quando ele
              for enviado.
            </p>
          </div>
        </section>
      )}

      {/* ---------- TIMELINE ---------- */}
      <section className="order-status">
        <h2 className="section-label">Status</h2>

        {isCanceled ? (
          <p className="order-canceled">Este pedido foi cancelado.</p>
        ) : (
          <ol className="order-timeline">
            {STEPS.map((step, idx) => {
              const done = idx <= currentIndex
              return (
                <li
                  key={step}
                  className={`order-timeline__step${done ? ' is-done' : ''}`}
                >
                  <span className="order-timeline__dot" />
                  <span className="order-timeline__label">{STEP_LABEL[step]}</span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* ---------- CONFIRMAR ENTREGA ---------- */}
      {order.status === 'delivered' && (
        <section className="order-notice" style={{ background: 'var(--color-background)', borderLeft: '3px solid #27ae60' }}>
          <div className="order-notice__content" style={{ width: '100%', textAlign: 'center', padding: '10px 0' }}>
            <p className="order-notice__title" style={{ fontSize: 16 }}>O pedido chegou até você?</p>
            <p className="order-notice__text" style={{ marginBottom: 16 }}>Confirme o recebimento para liberar sua avaliação.</p>
            <button 
              className="btn btn--primary" 
              onClick={() => setShowConfirmModal(true)}
            >
              Sim, recebi meu pedido
            </button>
          </div>
        </section>
      )}

      {/* ---------- ITENS E AVALIAÇÕES ---------- */}
      <section className="order-section">
        <h2 className="section-label">Produtos</h2>
        <div className="order-items">
          {/* AQUI USAMOS O sortedItems */}
          {sortedItems.map((it) => {
            const state = reviewsState[it.productId] || { rating: 0, comment: '', submitted: false, loading: false }

            return (
              <div key={it.id} className="order-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                
                {/* Info do Produto */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="order-item__media">
                    <img src={it.image} alt={it.name} />
                  </div>
                  <div className="order-item__info" style={{ flex: 1 }}>
                    <p className="order-item__name">{it.name}</p>
                    <p className="order-item__qty">{it.qty} × {formatBRL(it.price)}</p>
                  </div>
                  <span className="order-item__total">{formatBRL(it.subtotal)}</span>
                </div>

                {/* ÁREA DE AVALIAÇÃO */}
                {order.status === 'completed' && (
                  <div style={{ 
                    marginTop: 20, 
                    padding: 20, 
                    background: '#f8f8f6', 
                    borderRadius: 4, 
                    border: '1px solid #e5e5e5',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {!state.submitted ? (
                      <form onSubmit={(e) => handleSubmitReview(e, it.productId)}>
                        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Avalie este produto:</p>
                        
                        {/* Estrelas */}
                        <div style={{ display: 'flex', gap: 8, fontSize: 28, cursor: 'pointer', marginBottom: 12 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              onClick={() => handleReviewChange(it.productId, 'rating', star)} 
                              style={{ color: star <= state.rating ? '#f1c40f' : '#ccc' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Comentário */}
                        <div className="field" style={{ marginBottom: 12 }}>
                          <textarea 
                            rows={2} 
                            value={state.comment} 
                            onChange={(e) => handleReviewChange(it.productId, 'comment', e.target.value)} 
                            placeholder="Deixe um comentário (opcional) sobre o cheiro, durabilidade..."
                            style={{ fontSize: 13, width: '100%' }}
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn--primary" 
                          disabled={state.loading}
                          style={{ padding: '8px 24px', fontSize: 12 }}
                        >
                          {state.loading ? 'Enviando...' : 'Enviar avaliação'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#27ae60' }}>
                        <p style={{ fontSize: 24, margin: '0 0 8px' }}>✓</p>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>Avaliação enviada com sucesso! Obrigado.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------- RESUMO ---------- */}
      <section className="order-section">
        <h2 className="section-label">Resumo</h2>
        <div className="order-summary">
          <div className="order-summary__row">
            <span>Subtotal</span><span>{formatBRL(order.subtotal)}</span>
          </div>
          <div className="order-summary__row">
            <span>Frete</span>
            <span>{order.shipping === 0 ? 'grátis' : formatBRL(order.shipping)}</span>
          </div>
          <hr className="order-summary__divider" />
          <div className="order-summary__row order-summary__row--total">
            <span>Total</span><span>{formatBRL(order.total)}</span>
          </div>
        </div>
      </section>

      {/* ---------- PAGAMENTO ---------- */}
      <section className="order-section">
        <h2 className="section-label">Pagamento</h2>
        <p className="order-text">
          {order.payment.method === 'pix' && 'PIX'}
          {order.payment.method === 'credit' && 'Cartão de crédito'}
          {order.payment.method === 'debit' && 'Cartão de débito'}
        </p>
        <p className="order-text text-muted">
          {order.payment.status === 'approved' && 'Pagamento aprovado'}
          {order.payment.status === 'pending' && 'Aguardando pagamento'}
          {order.payment.status === 'refused' && 'Pagamento recusado'}
          {order.payment.status === 'cancelled' && 'Pagamento cancelado'}
        </p>
      </section>

      {/* ---------- ENTREGA ---------- */}
      <section className="order-section">
        <h2 className="section-label">Entrega</h2>
        <address className="order-address">
          <strong>{order.address.name}</strong><br />
          {order.address.street}, {order.address.number}
          {order.address.complement && ` — ${order.address.complement}`}<br />
          {order.address.district}<br />
          {order.address.city} - {order.address.state}<br />
          {order.address.zip}
        </address>
      </section>

      {/* ---------- MODAL DE CONFIRMAÇÃO ---------- */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
            <h2 className="modal__title" style={{ marginBottom: 8 }}>Confirmar recebimento</h2>
            <p className="text-muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              Você confirma que já recebeu os produtos deste pedido? Esta ação não pode ser desfeita.
            </p>
            <div className="modal__actions" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn--ghost" 
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
              >
                Ainda não
              </button>
              <button 
                className="btn btn--primary" 
                onClick={handleConfirmDelivery} 
                disabled={confirming}
              >
                {confirming ? 'Confirmando...' : 'Sim, recebi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}