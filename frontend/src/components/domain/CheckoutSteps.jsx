const STEPS = [
  { key: 'dados',       label: '01 Dados' },
  { key: 'pagamento',   label: '02 Pagamento' },
  { key: 'confirmacao', label: '03 Confirmação' },
]

export default function CheckoutSteps({ current = 0 }) {
  return (
    <ol className="checkout-steps">
      {STEPS.map((s, i) => {
        const state = i < current ? 'is-done' : i === current ? 'is-active' : 'is-next'
        return (
          <li key={s.key} className={`checkout-steps__item ${state}`}>
            <span>{s.label}</span>
            {i < STEPS.length - 1 && <span className="checkout-steps__line" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}