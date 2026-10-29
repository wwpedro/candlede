import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { orderApi, paymentApi } from '../../../services/api.js'
import { adaptOrder } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

// Gera um "QR visual" (não é escaneável, é decorativo)
function qrCells(seed = 7, size = 21) {
  const cells = []
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size)
    const col = i % size

    const isTopLeft = row < 7 && col < 7
    const isTopRight = row < 7 && col >= size - 7
    const isBottomLeft = row >= size - 7 && col < 7
    const isCorner = isTopLeft || isTopRight || isBottomLeft

    if (isCorner) {
      const cornerRow = isBottomLeft ? row - (size - 7) : row
      const cornerCol = isTopRight ? col - (size - 7) : col
      const isBorder = cornerRow === 0 || cornerRow === 6 || cornerCol === 0 || cornerCol === 6
      const isCenter = cornerRow >= 2 && cornerRow <= 4 && cornerCol >= 2 && cornerCol <= 4
      cells.push(isBorder || isCenter)
      continue
    }

    const hash = (row * 31 + col * 17 + seed * 7) % 13
    cells.push(hash < 5)
  }
  return cells
}

export default function CheckoutStatus() {
  const { id } = useParams()
  const location = useLocation()
  const transactionId = location.state?.transactionId

  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // ---------- polling ----------
  useEffect(() => {
    let timer
    let mounted = true

    const load = async () => {
      try {
        const orderData = await orderApi.get(id)
        if (!mounted) return
        const adapted = adaptOrder(orderData)
        setOrder(adapted)

        if (transactionId) {
          try {
            const pay = await paymentApi.get(transactionId)
            if (mounted) setPayment(pay)
          } catch (err) {
            console.error('Erro ao buscar pagamento:', err)
          }
        }

        setLoading(false)

        if (adapted.payment.status === 'pending') {
          timer = setTimeout(load, 5000)
        }
      } catch (err) {
        console.error(err)
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false; clearTimeout(timer) }
  }, [id, transactionId])

  const copy = async () => {
    const text = payment?.qrCodeText
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading || !order) {
    return (
      <div className="checkout">
        <p className="text-muted" style={{ padding: '80px 0', textAlign: 'center' }}>
          Carregando pedido…
        </p>
      </div>
    )
  }

  // =========================================================
  // APROVADO
  // =========================================================
  if (order.payment.status === 'approved') {
    return (
      <div className="checkout">
        <div className="confirmation confirmation--centered">
          <div className="confirmation__icon confirmation__icon--success">✓</div>
          <h2 className="confirmation__headline">Pagamento confirmado</h2>
          <p className="confirmation__sub">Recebemos seu pagamento com sucesso.</p>

          <div className="confirmation__order-box">
            <p className="confirmation__order">Pedido #{order.id}</p>
            <p className="confirmation__value">{formatBRL(order.total)}</p>
          </div>

          <hr className="hairline" />

          <div className="confirmation__notice">
            <p className="confirmation__notice-title">
              Aguarde o fornecedor preparar seu pedido
            </p>
            <p className="confirmation__notice-text">
              Este processo leva <strong>até 24 horas</strong>.
            </p>
          </div>

          <div className="confirmation__actions">
            <Link to={`/meus-pedidos/${order.id}`} className="btn btn--primary">
              Acompanhar pedido
            </Link>
            <Link to="/produtos" className="btn btn--ghost">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // RECUSADO
  // =========================================================
  if (order.payment.status === 'refused' || order.payment.status === 'rejected') {
    return (
      <div className="checkout">
        <div className="confirmation confirmation--centered">
          <div className="confirmation__icon confirmation__icon--error">×</div>
          <h2 className="confirmation__headline">Pagamento não aprovado</h2>
          <div className="confirmation__actions">
            <Link to={`/meus-pedidos/${order.id}`} className="btn btn--ghost">
              Ver pedido
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // AGUARDANDO PIX
  // =========================================================
  const hasRealQr = Boolean(payment?.qrCode)
  const hasDemoQr = !hasRealQr && Boolean(payment?.qrCodeText)

  return (
    <div className="checkout">
      <div className="pix">
        <p className="section-label">Pagamento PIX</p>
        <h2 className="pix__headline">Aguardando pagamento</h2>

        {/* QR Real do MP */}
        {hasRealQr && (
          <div className="pix__qr-real">
            <img
              src={`data:image/png;base64,${payment.qrCode}`}
              alt="QR Code PIX"
            />
          </div>
        )}

        {/* QR de demonstração (quando não tem QR real) */}
        {hasDemoQr && (
          <div className="pix__qr-real">
            <div className="pix__qr-grid" aria-hidden="true">
              {qrCells(7).map((on, i) => (
                <span key={i} className={on ? 'is-on' : ''} />
              ))}
            </div>
          </div>
        )}

        {/* Carregando */}
        {!hasRealQr && !hasDemoQr && (
          <p className="text-muted" style={{ padding: 40, textAlign: 'center' }}>
            Carregando QR Code…
          </p>
        )}

        <p className="pix__value">{formatBRL(order.total)}</p>

        {payment?.qrCodeText && (
          <>
            <p className="section-label" style={{ marginTop: 24 }}>
              PIX Copia e Cola
            </p>
            <div className="pix__code">
              <code>{payment.qrCodeText}</code>
            </div>

            <button className="btn btn--primary pix__copy" onClick={copy}>
              {copied ? 'Copiado ✓' : 'Copiar código'}
            </button>
          </>
        )}

        <hr className="hairline" />

        <p className="text-muted">Pedido #{order.id}</p>
        <p className="text-muted">
          Esta página será atualizada automaticamente.
        </p>

        <div className="pix__info">
          <p className="pix__info-title">Como pagar</p>
          <ol className="pix__info-steps">
            <li>Abra o app do seu banco</li>
            <li>Escolha <strong>PIX</strong> → <strong>Ler QR Code</strong></li>
            <li>Aponte a câmera para o código acima</li>
            <li>Confirme o pagamento de <strong>{formatBRL(order.total)}</strong></li>
          </ol>
        </div>

        {payment?.ticketUrl && (
          <a
            href={payment.ticketUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn--ghost"
            style={{ marginTop: 12 }}
          >
            Abrir no Mercado Pago
          </a>
        )}

        <Link
          to={`/meus-pedidos/${order.id}`}
          className="btn btn--ghost"
          style={{ marginTop: 8 }}
        >
          Ver pedido
        </Link>
      </div>
    </div>
  )
}