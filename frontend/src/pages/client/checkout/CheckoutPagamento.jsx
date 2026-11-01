import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../../components/domain/CheckoutSteps.jsx'
import OrderSummary from '../../../components/domain/OrderSummary.jsx'
import CardPaymentForm from '../../../components/domain/CardPaymentForm.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import { useCheckout } from '../../../context/CheckoutContext.jsx'

const METHODS = [
  { key: 'pix',    title: 'PIX',               desc: 'Pagamento instantâneo. Aprovação após confirmação.' },
  { key: 'credit', title: 'Cartão de crédito', desc: 'Visa, Mastercard e outros.' },
  { key: 'debit',  title: 'Cartão de débito',  desc: '' },
]

export default function CheckoutPagamento() {
  const { items, subtotal } = useCart()
  const { address, shipping, payment, setPayment } = useCheckout()
  const navigate = useNavigate()

  const [method, setMethod] = useState(payment?.method || 'pix')
  const [cardTokenData, setCardTokenData] = useState(null)
  const [brickError, setBrickError] = useState('')

  // Frete real selecionado na etapa anterior (vindo do CheckoutContext).
  // `?? null` distingue "não calculado" (null) de "grátis" (0).
  const shippingPrice = shipping?.price ?? null
  const totalComFrete = subtotal + (shippingPrice || 0)

  // Se o usuário chegar aqui sem endereço ou sem frete escolhido,
  // volta para a etapa anterior. Também protege contra carrinho vazio.
  useEffect(() => {
    if (!address) navigate('/checkout', { replace: true })
    else if (!shipping) navigate('/checkout', { replace: true })
    else if (items.length === 0) navigate('/carrinho', { replace: true })
  }, [address, shipping, items.length, navigate])

  const handlePixContinue = () => {
    setPayment({ method: 'pix' })
    navigate('/checkout/confirmacao')
  }

  const handleCardSubmit = async (tokenData) => {
    setBrickError('')
    setCardTokenData(tokenData)
    setPayment({
      method: tokenData.paymentType === 'debit_card' ? 'debit' : 'credit',
      cardToken: tokenData.token,
      paymentMethodId: tokenData.paymentMethodId,
      paymentType: tokenData.paymentType,
      installments: tokenData.installments,
      issuerId: tokenData.issuerId,
      payerEmail: tokenData.payerEmail,
      payerIdentification: tokenData.payerIdentification,
    })
    navigate('/checkout/confirmacao')
  }

  return (
    <div className="checkout">
      <header className="checkout__head">
        <h1 className="checkout__title">Pagamento</h1>
        <CheckoutSteps current={1} />
      </header>

      <div className="checkout__grid">
        <div className="checkout__main">
          <h2 className="section-label">Forma de pagamento</h2>
          <p className="text-muted" style={{ marginBottom: 24 }}>
            Escolha como deseja pagar.
          </p>

          <div className="payment-options">
            {METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`payment-option${method === m.key ? ' is-selected' : ''}`}
                onClick={() => setMethod(m.key)}
              >
                <span className="payment-option__radio" aria-hidden="true" />
                <div className="payment-option__body">
                  <p className="payment-option__title">{m.title}</p>
                  {m.desc && <p className="payment-option__desc">{m.desc}</p>}
                </div>
              </button>
            ))}
          </div>

          {(method === 'credit' || method === 'debit') && (
            <div className="card-payment-wrapper">
              <p className="section-label" style={{ marginTop: 32 }}>
                Dados do cartão
              </p>
              <p className="text-muted" style={{ marginBottom: 16, fontSize: 12 }}>
                🔒 Os dados são criptografados pelo Mercado Pago e não passam pelos nossos servidores.
              </p>
              <CardPaymentForm
                amount={totalComFrete}
                onSubmit={handleCardSubmit}
                onError={() => setBrickError('Erro ao processar cartão. Tente novamente.')}
              />
              {brickError && (
                <p className="auth-form__error" style={{ marginTop: 12 }}>
                  {brickError}
                </p>
              )}
            </div>
          )}

          {method === 'pix' && (
            <div style={{ marginTop: 32 }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handlePixContinue}
              >
                Continuar com PIX →
              </button>
            </div>
          )}
        </div>

        <OrderSummary shipping={shippingPrice} />
      </div>
    </div>
  )
}