const express = require("express");
const app = express();

// Importa o arquivo de rotas agendamentos
const agendamentoRoutes = require("../src/routes/agendamentoRoutes");

app.use(express.json()); // Permite o servidor entender JSON

// usa minhas rotas
app.use(agendamentoRoutes)

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
