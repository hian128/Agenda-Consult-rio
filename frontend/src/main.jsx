import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Importação das  3 páginas principais
import LandingPage from './LandingPage.jsx'           
import ClienteAgendamento from './ClienteAgendamento.jsx' 
import App from './App.jsx'                           


import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz: A primeira coisa que as pessoas veem (Landing Page) */}
        <Route path="/" element={<LandingPage />} />

        {/* Rota Agendar: Para onde o botão do WhatsApp/Agendar aponta */}
        <Route path="/agendar" element={<ClienteAgendamento />} />

        {/* Rota Secreta: O painel de controlo administrativo */}
        <Route path="/admin" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)