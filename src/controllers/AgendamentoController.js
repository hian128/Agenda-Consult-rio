const { criarAgendamentoNoBanco, buscarServicoPorId, listarAgendamentosNoBanco,atualizarStatusNoBanco } = require("../models/Agendamento");

// Função para criar agendamento 
async function criarAgendamento(req, res) {
    // 1. Recebemos APENAS o que o usuário digita 
    const { paciente_id, profissional_id, servico_id, data_hora_inicio, sintomas_cliente } = req.body;

    // 2. Validação : Se faltar algo obrigatório, barramos na porta
    if (!paciente_id || !profissional_id || !servico_id || !data_hora_inicio) {
        return res.status(400).json({ msg: "Faltam campos obrigatórios!" });
    }

    try {
        // 3. Regra de Negócio: Buscar detalhes do serviço para saber a duração e se exige PIX

        const servico = await buscarServicoPorId(servico_id);

        if (!servico) {
            return res.status(404).json({ msg: "Serviço não encontrado." });
        }

        // 4. Calcular a data final automaticamente no Node (Obrigatório)
        const inicio = new Date(data_hora_inicio);
        const duracaoMs = servico.duracao_minutos * 60 * 1000;
        const data_hora_fim = new Date(inicio.getTime() + duracaoMs);

        // 5. Definir o status (Avaliação exige PIX -> pendente. Outros -> confirmado)
        const status = servico.exige_pagamento_previo ? 'pendente' : 'confirmado';

        // 6. Finalmente, chamamos o banco com os dados seguros
        const adicionar = await criarAgendamentoNoBanco(
            paciente_id,
            profissional_id,
            servico_id,
            inicio,
            data_hora_fim,
            status,
            sintomas_cliente
        );

        // 7. Resposta de sucesso
        res.status(201).json({
            msg: "Agendamento criado com sucesso!",
            informacoes: adicionar
        });

    } catch (error) {
        // 8. Tratamento de Erros: A Trava do PostgreSQL entra aqui!
        if (error.code === '23P01') { // Código de erro do Postgres para conflito na tabela (EXCLUDE)
            return res.status(409).json({ msg: "Horário Indisponível! O dentista já tem consulta neste horário." });
        }

        // Se for outro erro (ex: banco offline)
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ msg: "Erro interno no servidor." });
    }
}


async function listarAgendamentos(req, res) {
    try {
        const agendamentos = await listarAgendamentosNoBanco();

        // Se a agenda estiver vazia, retorna um array vazio tranquilamente
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        res.status(500).json({ msg: "Erro interno ao buscar a agenda." });
    }
}

async function atualizarStatus(req, res) {
    // Pegamos o ID que vem na URL (ex: /agendamentos/123)
    const { id } = req.params;
    // Pegamos o status que vem no corpo da requisição
    const { status } = req.body;

    // Trava de segurança: Garante que só aceitamos estes 5 status exatos
    const statusPermitidos = ['pendente', 'confirmado', 'recusado', 'cancelado', 'concluido'];
    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ msg: "Status inválido." });
    }

    try {
        const agendamentoAtualizado = await atualizarStatusNoBanco(id, status);

        // Se a consulta no banco não retornar nada, é porque o ID não existe
        if (!agendamentoAtualizado) {
            return res.status(404).json({ msg: "Agendamento não encontrado." });
        }

        res.status(200).json({
            msg: "Status atualizado com sucesso!",
            agendamento: agendamentoAtualizado
        });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        res.status(500).json({ msg: "Erro interno no servidor." });
    }
}

module.exports = {
    criarAgendamento,
    listarAgendamentos,
    atualizarStatus
};