import { NavLink } from 'react-router-dom'
import { useTheme } from '../store/theme'

export function Header() {
  const { theme, toggle } = useTheme()
  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <span className="ball" aria-hidden />
          Pokédex
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>
            Pokédex
          </NavLink>
          <NavLink to="/compare">Comparar</NavLink>
          <NavLink to="/team">Equipe</NavLink>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
