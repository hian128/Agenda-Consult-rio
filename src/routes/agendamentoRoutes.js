const express = require("express");
const router = express.Router();

const {criarAgendamento,listarAgendamentos,atualizarStatus,cancelarAgendamento,excluirAgendamento} = require("../controllers/AgendamentoController")

//rota para adicionar agendamentos
router.post('/agendamentos' , criarAgendamento)

// rota para LER os dados
router.get('/agendamentos', listarAgendamentos);

// Nova rota para ATUALIZAR status
router.patch('/agendamentos/:id/status', atualizarStatus);

// Nova Rota para Cancelar (Passando o ID na URL)
router.patch('/agendamentos/:id/cancelar', cancelarAgendamento);

router.delete('/agendamentos/:id', excluirAgendamento)






module.exports = router;