require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors()); 
app.use(express.json());

// Importa o arquivo de rotas agendamentos
const agendamentoRoutes = require("../src/routes/agendamentoRoutes");
const pacientesRoutes = require("../src/routes/pacientesRoutes")

app.use(express.json()); // Permite o servidor entender JSON

// usa minhas rotas
app.use(agendamentoRoutes)
app.use(pacientesRoutes)

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
