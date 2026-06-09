import { HashRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { PokemonDetail } from './pages/PokemonDetail'
import { Compare } from './pages/Compare'
import { Team } from './pages/Team'
import { useTheme } from './store/theme'

export default function App() {
  useTheme()
  return (
    <HashRouter>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
