const pool = require("../config/db");

// Criar agendamento no banco 
async function criarAgendamentoNoBanco(paciente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, status, sintomas_cliente) {
    const resultado = await pool.query(
        `INSERT INTO agendamentos 
        (paciente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, status, sintomas_cliente) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [paciente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, status, sintomas_cliente]
    );
    return resultado.rows[0];
}

// Buscar serviço por id 
async function buscarServicoPorId(servico_id) {

    const resultado = await pool.query("SELECT * FROM servicos WHERE id = $1", [servico_id]);


    return resultado.rows[0];
}



// Função para listar a agenda com os nomes bonitos (JOIN)
async function listarAgendamentosNoBanco() {
    const query = `
        SELECT 
            a.id AS agendamento_id,
            a.data_hora_inicio,
            a.data_hora_fim,
            a.status,
            a.sintomas_cliente,
            p.nome_completo AS paciente_nome,
            p.telefone AS paciente_telefone,
            d.nome AS dentista_nome,
            s.nome AS servico_nome
        FROM agendamentos a
        INNER JOIN pacientes p ON a.paciente_id = p.id
        INNER JOIN profissionais d ON a.profissional_id = d.id
        INNER JOIN servicos s ON a.servico_id = s.id
        ORDER BY a.data_hora_inicio ASC;
    `;

    const resultado = await pool.query(query);
    return resultado.rows; // Retorna todas as linhas (array)
}


// Atualizar apenas o status de um agendamento
async function atualizarStatusNoBanco(id, status) {
    const resultado = await pool.query(
        "UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
    );
    return resultado.rows[0]; // Retorna o agendamento atualizado (ou undefined se o ID não existir)
}

module.exports = {
    criarAgendamentoNoBanco,
    buscarServicoPorId,
    listarAgendamentosNoBanco,
    atualizarStatusNoBanco
};