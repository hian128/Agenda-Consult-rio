const express = require("express");
const router = express.Router();

const {criarAgendamento,listarAgendamentos,atualizarStatus} = require("../controllers/AgendamentoController")

//rota para adicionar agendamentos
router.post('/agendamento' , criarAgendamento)

// rota para LER os dados
router.get('/agendamento', listarAgendamentos);

// Nova rota para ATUALIZAR status
router.patch('/agendamento/:id/status', atualizarStatus);




module.exports = router;