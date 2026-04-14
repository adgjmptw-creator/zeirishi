import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Gate from './components/Gate.jsx'
import { seedContent } from './db/seed.js'
import './index.css'

// Seed built-in content on first load (idempotent).
seedContent().catch((err) => {
  console.error('Content seeding failed:', err)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Gate>
      <BrowserRouter basename="/zeirishi">
        <App />
      </BrowserRouter>
    </Gate>
  </React.StrictMode>,
)
