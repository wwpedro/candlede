export default function EmptyState({ title, message, action }) {
  return (
    <div className="admin-empty">
      <p className="admin-empty__title">{title}</p>
      {message && <p className="admin-empty__text">{message}</p>}
      {action}
    </div>
  )
}