// src/models/Paciente.js
const pool = require("../config/db");

async function buscarPacientePorCpf(cpf) {
    const resultado = await pool.query(
        "SELECT id FROM pacientes WHERE cpf = $1", 
        [cpf]
    );
    return resultado.rows[0]; // Retorna o paciente se existir, ou undefined se não existir
}

async function criarPacienteNoBanco(nome_completo, cpf, telefone) {
    const resultado = await pool.query(
        "INSERT INTO pacientes (nome_completo, cpf, telefone) VALUES ($1, $2, $3) RETURNING id",
        [nome_completo, cpf, telefone]
    );
    return resultado.rows[0]; // Retorna o ID recém-criado
}

module.exports = {
    buscarPacientePorCpf,
    criarPacienteNoBanco
};