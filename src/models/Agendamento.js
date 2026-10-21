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

async function buscarAgendamentoPorId(id) {
    const resultado = await pool.query("SELECT * FROM agendamentos WHERE id = $1", [id]);
    return resultado.rows[0];
}

async function cancelarAgendamentoNoBanco(id, multa_cancelamento) {
    const resultado = await pool.query(
        "UPDATE agendamentos SET status = 'cancelado', multa_cancelamento = $1 WHERE id = $2 RETURNING *",
        [multa_cancelamento, id]
    );
    return resultado.rows[0];
}

// Função para apagar definitivamente do banco
async function excluirAgendamentoNoBanco(id) {
    const resultado = await pool.query(
        "DELETE FROM agendamentos WHERE id = $1 RETURNING *",
        [id]
    );
    return resultado.rows[0]; // Retorna os dados apagados, ou undefined se o ID não existir
}

// NOVA FUNÇÃO: Criar Paciente + Agendamento (Combo 2 em 1 usando Transação)
async function criarAgendamentoComPaciente(dados, data_hora_fim) {
    const client = await pool.connect(); // Abre a conexão especial para transação

    try {
        await client.query('BEGIN'); // Inicia a transação

        // 1. Inserir o Paciente
        const queryPaciente = `
            INSERT INTO pacientes (nome_completo, cpf, telefone) 
            VALUES ($1, $2, $3) 
            RETURNING id;
        `;
        const valoresPaciente = [dados.paciente_nome, dados.paciente_cpf, dados.paciente_telefone];
        const resultPaciente = await client.query(queryPaciente, valoresPaciente);

        const novoPacienteId = resultPaciente.rows[0].id;

        // 2. Inserir o Agendamento (já com status 'pendente')
        const queryAgendamento = `
            INSERT INTO agendamentos 
            (paciente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, status, sintomas_cliente) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;
        `;
        const valoresAgendamento = [
            novoPacienteId,
            dados.profissional_id,
            dados.servico_id,
            dados.data_hora_inicio,
            data_hora_fim, 
            'pendente',    // Status inicial padrão
            dados.sintomas_cliente
        ];
        const resultAgendamento = await client.query(queryAgendamento, valoresAgendamento);

        await client.query('COMMIT'); // Salva tudo no banco!
        return resultAgendamento.rows[0];

    } catch (error) {
        await client.query('ROLLBACK'); // Desfaz tudo se der erro!
        throw error;
    } finally {
        client.release(); // Liberta a conexão
    }
}

module.exports = {
    criarAgendamentoNoBanco,
    buscarServicoPorId,
    listarAgendamentosNoBanco,
    atualizarStatusNoBanco,
    buscarAgendamentoPorId,
    cancelarAgendamentoNoBanco,
    excluirAgendamentoNoBanco,
    criarAgendamentoComPaciente
};