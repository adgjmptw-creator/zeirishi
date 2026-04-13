import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Cards from './pages/Cards.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
