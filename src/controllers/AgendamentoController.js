const { criarAgendamentoNoBanco, buscarServicoPorId, listarAgendamentosNoBanco, atualizarStatusNoBanco, cancelarAgendamentoNoBanco, buscarAgendamentoPorId, excluirAgendamentoNoBanco } = require("../models/Agendamento");
const { buscarPacientePorCpf, criarPacienteNoBanco } = require("../models/Paciente");
// Função para criar agendamento 
async function criarAgendamento(req, res) {
    // 1. Agora recebemos os dados do paciente em vez do paciente_id
    const {
        paciente_nome, paciente_cpf, paciente_telefone,
        profissional_id, servico_id, data_hora_inicio, sintomas_cliente
    } = req.body;

    // 2. Validação atualizada
    if (!paciente_nome || !paciente_cpf || !paciente_telefone || !profissional_id || !servico_id || !data_hora_inicio) {
        return res.status(400).json({ msg: "Faltam campos obrigatórios!" });
    }

    // 3. Bloqueio de viagem no tempo
    const dataInicioSolicitada = new Date(data_hora_inicio);
    const dataAtual = new Date();

    if (dataInicioSolicitada < dataAtual) {
        return res.status(400).json({ msg: "Não é possível agendar consultas em datas passadas." });
    }

    try {
        // --- NOVA LÓGICA DE PACIENTES ---
        let paciente_id;

        // Verifica se o paciente já existe pelo CPF
        const pacienteExistente = await buscarPacientePorCpf(paciente_cpf);

        if (pacienteExistente) {
            // Se existe, usamos o ID dele
            paciente_id = pacienteExistente.id;
        } else {
            // Se não existe, criamos na hora!
            const novoPaciente = await criarPacienteNoBanco(paciente_nome, paciente_cpf, paciente_telefone);
            paciente_id = novoPaciente.id;
        }
        // --------------------------------

        // 4. Buscar serviço e calcular hora final
        const servico = await buscarServicoPorId(servico_id);
        if (!servico) {
            return res.status(404).json({ msg: "Serviço não encontrado." });
        }

        const duracaoMs = servico.duracao_minutos * 60 * 1000;
        const data_hora_fim = new Date(dataInicioSolicitada.getTime() + duracaoMs);
        const status = 'pendente';

        // 5. Salvar o agendamento no banco
        const adicionar = await criarAgendamentoNoBanco(
            paciente_id, // Usamos o UUID encontrado ou recém-gerado!
            profissional_id,
            servico_id,
            dataInicioSolicitada,
            data_hora_fim,
            status,
            sintomas_cliente
        );

        res.status(201).json({
            msg: "Agendamento criado com sucesso!",
            informacoes: adicionar
        });

    } catch (error) {
        if (error.code === '23P01') {
            return res.status(409).json({ msg: "Horário Indisponível! O dentista já tem consulta neste horário." });
        }
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

async function cancelarAgendamento(req, res) {
    const { id } = req.params;

    try {
        // 1. Busca o agendamento no banco
        const agendamento = await buscarAgendamentoPorId(id);

        if (!agendamento) {
            return res.status(404).json({ msg: "Agendamento não encontrado." });
        }

        if (agendamento.status === 'cancelado') {
            return res.status(400).json({ msg: "Este agendamento já foi cancelado." });
        }

        // 2. A MÁGICA DO TEMPO (Regra das 24 horas)
        const agora = new Date(); // Data e hora de hoje (exato momento do clique)
        const dataConsulta = new Date(agendamento.data_hora_inicio);

        // Subtrai uma data da outra (o resultado sai em milissegundos)
        const diferencaEmMilissegundos = dataConsulta.getTime() - agora.getTime();

        // Converte milissegundos para horas (1000ms * 60seg * 60min)
        const horasRestantes = diferencaEmMilissegundos / (1000 * 60 * 60);

        // Se faltam menos de 24 horas (ou se a pessoa faltou e a consulta já passou), aplica a multa!
        const cobrarMulta = horasRestantes < 24;

        // 3. Atualiza no banco
        const agendamentoCancelado = await cancelarAgendamentoNoBanco(id, cobrarMulta);

        // 4. Responde com uma mensagem amigável dependendo da situação
        if (cobrarMulta) {
            res.status(200).json({
                msg: "Agendamento cancelado. ATENÇÃO: Como foi cancelado com menos de 24h, uma taxa de R$ 50,00 foi gerada no sistema.",
                agendamento: agendamentoCancelado
            });
        } else {
            res.status(200).json({
                msg: "Agendamento cancelado com sucesso sem custo (aviso com mais de 24h de antecedência).",
                agendamento: agendamentoCancelado
            });
        }

    } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        res.status(500).json({ msg: "Erro interno no servidor." });
    }
}

// Nova função para deletar
async function excluirAgendamento(req, res) {
    const { id } = req.params; // Pega o UUID que vem na URL (ex: /agendamentos/123)

    try {
        const agendamentoExcluido = await excluirAgendamentoNoBanco(id);

        if (!agendamentoExcluido) {
            return res.status(404).json({ msg: "Agendamento não encontrado para exclusão." });
        }

        res.status(200).json({
            msg: "Agendamento excluído permanentemente do sistema!"
        });

    } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        res.status(500).json({ msg: "Erro interno no servidor." });
    }
}

module.exports = {
    criarAgendamento,
    listarAgendamentos,
    atualizarStatus,
    cancelarAgendamento,
    excluirAgendamento
};