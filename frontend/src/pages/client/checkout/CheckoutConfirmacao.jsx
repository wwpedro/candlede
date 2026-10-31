import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../../components/domain/CheckoutSteps.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import { useCheckout } from '../../../context/CheckoutContext.jsx'
import { orderApi, paymentApi, cartApi } from '../../../services/api.js'
import { adaptCart } from '../../../services/adapters.js'
import { calcularFrete } from '../../../utils/shipping.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function paymentMethodToApi(method) {
  const map = { pix: 'pix', credit: 'credit_card', debit: 'debit_card' }
  return map[method] || 'pix'
}

export default function CheckoutConfirmacao() {
  // Precisamos do refresh e do clear
  const { items, subtotal, clear: clearCart, refresh: refreshCart } = useCart() 
  const { address, payment, reset } = useCheckout()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cartChecked, setCartChecked] = useState(false)

  const shippingPrice = useMemo(() => {
    if (!address) return 0
    return calcularFrete(address.zip, subtotal)
  }, [address, subtotal])

  const totalComFrete = subtotal + shippingPrice

  useEffect(() => {
    if (!address) navigate('/checkout', { replace: true })
    if (!payment) navigate('/checkout/pagamento', { replace: true })
  }, [address, payment, navigate])

  useEffect(() => {
    if (items.length === 0 && cartChecked) {
      navigate('/carrinho', { replace: true })
    }
  }, [items.length, cartChecked, navigate])

  const confirm = async () => {
    setSubmitting(true)
    setError('')

    try {
      const cartData = await cartApi.get()
      const cart = adaptCart(cartData)
      setCartChecked(true)

      if (!cart.items || cart.items.length === 0) {
        setError('Seu carrinho está vazio. Adicione produtos antes de finalizar.')
        setTimeout(() => navigate('/carrinho', { replace: true }), 2000)
        return
      }

      const orderPayload = {
        cep: address.zip,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.district,
        city: address.city,
        state: address.state.toUpperCase().trim(),
        paymentMethod: paymentMethodToApi(payment.method).toUpperCase(),
      }

      const order = await orderApi.create(orderPayload)

      const paymentPayload = {
        orderId: order.id,
        paymentMethod: paymentMethodToApi(payment.method),
      }

      if (payment.method === 'pix') {
        paymentPayload.paymentToken = null
      } else {
        paymentPayload.paymentToken = payment.cardToken || ('tok_mock_' + Date.now())
        paymentPayload.paymentMethodId = payment.paymentMethodId || 'master'
        paymentPayload.paymentType = payment.paymentType || 'credit_card'
        paymentPayload.installments = payment.installments || 1
        paymentPayload.payerEmail = payment.payerEmail || address.email || null
      }

      const result = await paymentApi.process(paymentPayload)

      if (payment.method === 'pix') {
        // REGRA NOVA: NÃO LIMPA O CARRINHO AQUI!
        // O carrinho só será limpo se o PIX for aprovado (na tela de Status).
        reset() // Limpa apenas o contexto de checkout (endereço e cartão)
        navigate(`/checkout/status/${order.id}`, {
          replace: true,
          state: { transactionId: result.transactionId },
        })
      } else {
        // CARTÃO: Se aprovou na hora, o backend já limpou. Vamos sincronizar o front.
        if (result.status === 'APPROVED') {
          await refreshCart() // Atualiza o carrinho no React
          reset()
          navigate(`/meus-pedidos/${order.id}`, { replace: true })
        } else {
          // Recusado: mantém o carrinho para o cliente tentar de novo
          setError(result.statusDetail ? `Pagamento recusado: ${result.statusDetail}` : 'Pagamento recusado. Tente outro cartão.')
          setSubmitting(false)
        }
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Não foi possível finalizar o pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout">
      <header className="checkout__head">
        <h1 className="checkout__title">Confirmação</h1>
        <CheckoutSteps current={2} />
      </header>

      <div className="confirmation">
        <h2 className="confirmation__headline">Revise seu pedido</h2>
        <p className="confirmation__sub">Confira os dados antes de finalizar.</p>

        <hr className="hairline" />

        <div className="confirmation__block">
          <h3 className="section-label">Entrega</h3>
          <address>
            {address.street}, {address.number}
            {address.complement && ` — ${address.complement}`}<br />
            {address.district}<br />
            {address.city} — {address.state}<br />
            CEP {address.zip}
          </address>
        </div>

        <div className="confirmation__block">
          <h3 className="section-label">Pagamento</h3>
          <p>
            {payment.method === 'pix' && 'PIX'}
            {payment.method === 'credit' && 'Cartão de crédito'}
            {payment.method === 'debit' && 'Cartão de débito'}
          </p>
          {payment.method === 'pix' && (
            <p className="text-muted">
              Você receberá o QR Code após confirmar.
            </p>
          )}
        </div>

        <div className="confirmation__block">
          <h3 className="section-label">Itens do pedido</h3>
          <ul className="confirmation__items">
            {items.map((it) => (
              <li key={it.cartItemId}>
                <span>
                  {it.name} <span className="text-muted">x{it.qty}</span>
                </span>
                <span>{formatBRL(it.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="confirmation__totals">
            <div><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div>
              <span>Frete</span>
              <span>{shippingPrice === 0 ? 'grátis' : formatBRL(shippingPrice)}</span>
            </div>
            <div className="confirmation__totals--total">
              <span>Total</span><span>{formatBRL(totalComFrete)}</span>
            </div>
          </div>
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <hr className="hairline" />

        <div className="confirmation__actions">
          <button
            className="btn btn--primary"
            onClick={confirm}
            disabled={submitting}
          >
            {submitting ? 'Finalizando…' : 'Confirmar pedido'}
          </button>
          <Link to="/checkout/pagamento" className="btn btn--ghost">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}