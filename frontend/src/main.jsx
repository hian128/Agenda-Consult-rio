import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ClienteAgendamento from './ClienteAgendamento.jsx'
import './index.css'
import AgendamentoPaciente from './AgendamentoPaciente.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota da Pública do Paciente */}
        <Route path="/agendar" element={<AgendamentoPaciente />} />

        {/* Rota do Painel Interno da Sua Mãe (Recepção) */}
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)