const express = require("express");
const router = express.Router();

const {listarPacientes,deletarPacientes} = require('../controllers/pacientesController')


// rota para listar os pacientes 
router.get('/pacientes' , listarPacientes);
// rota para deletar paciente 
router.delete('/pacientes/:id' , deletarPacientes)



module.exports = router;
