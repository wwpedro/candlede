export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle && <p className="admin-page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="admin-page-header__action">{action}</div>}
    </header>
  )
}