import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../../components/domain/CheckoutSteps.jsx'
import OrderSummary from '../../../components/domain/OrderSummary.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import { useCheckout } from '../../../context/CheckoutContext.jsx'
import { addressApi, shippingApi } from '../../../services/api.js'
import { adaptAddressList, toApiAddress } from '../../../services/adapters.js'

const EMPTY = {
  zip: '', street: '', number: '', complement: '',
  district: '', city: '', state: '',
}

export default function Checkout() {
  const { items, subtotal } = useCart()
  const { address, setAddress, shipping, setShipping } = useCheckout()
  const navigate = useNavigate()

  const [list, setList] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados para o Frete Dinâmico
  const [shippingOptions, setShippingOptions] = useState([])
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  useEffect(() => {
    if (items.length === 0) navigate('/carrinho', { replace: true })
  }, [items.length, navigate])

  useEffect(() => {
    let mounted = true
    addressApi.list()
      .then((data) => {
        if (!mounted) return
        const adapted = adaptAddressList(data)
        setList(adapted)
        if (adapted.length === 1 && !address) setAddress(adapted[0])
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Não foi possível carregar seus endereços.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, []) // eslint-disable-line

  // =========================================================
  // BUSCA AS OPÇÕES DE FRETE NO BACKEND (Melhor Envio)
  // =========================================================
  useEffect(() => {
    if (!address?.zip) {
      setShippingOptions([])
      setShipping(null)
      return
    }

    setCalculatingShipping(true)
    setShippingOptions([])
    setShipping(null)
    setError('')

    shippingApi.calculate(address.zip)
      .then((options) => {
        // FILTRO AQUI: Mantém apenas as opções dos Correios (PAC, SEDEX)
        const correiosOptions = options.filter(opt => 
          opt.company && opt.company.toLowerCase().includes('correios')
        )

        setShippingOptions(correiosOptions)
        
        // Se só tiver uma opção (ex: só PAC), já seleciona automaticamente
        if (correiosOptions.length === 1) setShipping(correiosOptions[0])
      })
      .catch((err) => {
        console.error("Erro no frete:", err)
        setError("Não foi possível calcular o frete para este CEP. Verifique o endereço.")
      })
      .finally(() => setCalculatingShipping(false))
  }, [address?.zip, setShipping]) // eslint-disable-line

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const saveNew = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const created = await addressApi.create(toApiAddress(form))
      const adapted = adaptAddressList([created])[0]
      setList([...list, adapted])
      setAddress(adapted)
      setEditing(false)
      setForm(EMPTY)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço.')
    }
  }

  const handleContinue = () => {
    if (!address || !shipping) return
    navigate('/checkout/pagamento')
  }

  const isSelected = (a) => {
    if (!address) return false
    if (address.id && a.id) return address.id === a.id
    return address.zip === a.zip && address.number === a.number && address.complement === a.complement
  }

  return (
    <div className="checkout">
      <header className="checkout__head">
        <h1 className="checkout__title">Finalize seu pedido</h1>
        <CheckoutSteps current={0} />
      </header>

      <div className="checkout__grid">
        <div className="checkout__main">
          <h2 className="section-label">Endereço de entrega</h2>

          {loading ? (
            <p className="text-muted">Carregando endereços…</p>
          ) : (
            <>
              {list.length === 0 && !editing && (
                <p className="text-muted">Você ainda não cadastrou endereços.</p>
              )}

              <div className="address-options">
                {list.map((a, i) => (
                  <button
                    key={a.id ?? i}
                    type="button"
                    className={`address-option${isSelected(a) ? ' is-selected' : ''}`}
                    onClick={() => {
                      setAddress(a)
                      setEditing(false)
                    }}
                  >
                    <span className="address-option__radio" aria-hidden="true" />
                    <div className="address-option__body">
                      <address>
                        {a.street}, {a.number}
                        {a.complement && ` — ${a.complement}`}<br />
                        {a.district}<br />
                        {a.city} — {a.state}<br />
                        CEP {a.zip}
                      </address>
                    </div>
                  </button>
                ))}
              </div>

              {/* =========================================================
                  SEÇÃO DE FRETE DINÂMICO
                  ========================================================= */}
              {address && (
                <div style={{ marginTop: 32 }}>
                  <h2 className="section-label">Opções de Entrega</h2>
                  
                  {calculatingShipping ? (
                    <p className="text-muted" style={{ padding: '16px 0' }}>
                      Calculando frete para o CEP {address.zip}...
                    </p>
                  ) : shippingOptions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {shippingOptions.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          className={`address-option${shipping?.name === opt.name ? ' is-selected' : ''}`}
                          onClick={() => setShipping(opt)}
                        >
                          <span className="address-option__radio" aria-hidden="true" />
                          <div className="address-option__body" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 600, margin: 0 }}>{opt.company} - {opt.name}</p>
                              <p className="text-muted" style={{ margin: 0 }}>Até {opt.deliveryTime} dias úteis</p>
                            </div>
                            <p style={{ fontWeight: 600, margin: 0 }}>
                              {opt.price === 0 ? 'Grátis' : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Nenhuma transportadora disponível para este CEP.</p>
                  )}
                </div>
              )}

              {!editing && (
                <button
                  type="button"
                  className="link-quiet address-options__add"
                  onClick={() => {
                    setEditing(true)
                    setAddress(null)
                  }}
                  style={{ marginTop: 24 }}
                >
                  + Adicionar novo endereço
                </button>
              )}

              {editing && (
                <form className="address-form address-form--inline" onSubmit={saveNew}>
                  <div className="address-form__row">
                    <div className="field"><label>CEP</label><input name="zip" value={form.zip} onChange={handleChange} required /></div>
                    <div className="field"><label>Rua</label><input name="street" value={form.street} onChange={handleChange} required /></div>
                  </div>
                  <div className="address-form__row">
                    <div className="field"><label>Número</label><input name="number" value={form.number} onChange={handleChange} required /></div>
                    <div className="field"><label>Complemento</label><input name="complement" value={form.complement} onChange={handleChange} /></div>
                  </div>
                  <div className="field"><label>Bairro</label><input name="district" value={form.district} onChange={handleChange} required /></div>
                  <div className="address-form__row">
                    <div className="field"><label>Cidade</label><input name="city" value={form.city} onChange={handleChange} required /></div>
                    <div className="field">
                      <label>UF</label>
                      <input 
                        name="state" 
                        value={form.state} 
                        onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} 
                        maxLength={2} 
                        placeholder="Ex: AL" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="modal__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => { setEditing(false); setForm(EMPTY) }}>Cancelar</button>
                    <button type="submit" className="btn btn--primary">Salvar endereço</button>
                  </div>
                </form>
              )}

              {error && <p className="auth-form__error" style={{ marginTop: 16 }}>{error}</p>}
            </>
          )}
        </div>

        {/* O resumo agora recebe o valor real do frete selecionado */}
        <OrderSummary 
          onContinue={handleContinue} 
          disabled={!address || !shipping} 
          shipping={shipping ? shipping.price : null} 
        />
      </div>
    </div>
  )
}