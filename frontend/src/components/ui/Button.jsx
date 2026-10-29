import { Link } from 'react-router-dom'

export default function Button({
  variant = 'primary',
  to,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const cls = `btn btn--${variant} ${className}`.trim()
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  return <button type={type} className={cls} {...props}>{children}</button>
}