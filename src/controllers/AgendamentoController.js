const { criarAgendamentoComPaciente, criarAgendamentoNoBanco, buscarServicoPorId, listarAgendamentosNoBanco, atualizarStatusNoBanco, cancelarAgendamentoNoBanco, buscarAgendamentoPorId, excluirAgendamentoNoBanco } = require("../models/Agendamento");
const { buscarPacientePorCpf, criarPacienteNoBanco } = require("../models/Paciente");
// Função matemática rigorosa para validar se um CPF é real (Colocar FORA da criarAgendamento)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove tudo o que não é número
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Tua função atualizada e blindada
async function criarAgendamento(req, res) {
    // 1. Recebemos os dados do paciente e do agendamento
    const {
        paciente_nome, paciente_cpf, paciente_telefone,
        profissional_id, servico_id, data_hora_inicio, sintomas_cliente
    } = req.body;

    // 2. Validação básica de campos
    if (!paciente_nome || !paciente_cpf || !paciente_telefone || !profissional_id || !servico_id || !data_hora_inicio) {
        return res.status(400).json({ msg: "Faltam campos obrigatórios!" });
    }

    // --- NOVA BLINDAGEM DE DADOS ---
    // Limpa os caracteres especiais (deixa só números)
    const cpfLimpo = paciente_cpf.replace(/\D/g, '');
    const telefoneLimpo = paciente_telefone.replace(/\D/g, '');

    // Valida se o CPF existe matematicamente
    if (!validarCPF(cpfLimpo)) {
        return res.status(400).json({ msg: "CPF inválido. Verifique os números digitados." });
    }

    // Valida se o telefone tem o tamanho certo no Brasil (DDD + 8 ou 9 dígitos)
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        return res.status(400).json({ msg: "Telefone inválido. Insira o DDD e o número completo." });
    }
    // -------------------------------

    // 3. Bloqueio de viagem no tempo
    const dataInicioSolicitada = new Date(data_hora_inicio);
    const dataAtual = new Date();

    if (dataInicioSolicitada < dataAtual) {
        return res.status(400).json({ msg: "Não é possível agendar consultas em datas passadas." });
    }

    try {
        // 4. Buscar serviço e calcular hora final
        const servico = await buscarServicoPorId(servico_id);
        if (!servico) {
            return res.status(404).json({ msg: "Serviço não encontrado." });
        }

        const duracaoMs = servico.duracao_minutos * 60 * 1000;
        const data_hora_fim = new Date(dataInicioSolicitada.getTime() + duracaoMs);

        // Prepara os dados limpos para enviar para o Model
        const dadosLimpos = {
            paciente_nome,
            paciente_cpf: cpfLimpo,
            paciente_telefone: telefoneLimpo,
            profissional_id,
            servico_id,
            data_hora_inicio: dataInicioSolicitada,
            sintomas_cliente
        };

        let adicionar;

        // Verifica se o paciente já existe pelo CPF
        const pacienteExistente = await buscarPacientePorCpf(cpfLimpo);

        if (pacienteExistente) {
            // SE EXISTE: Mantemos o teu código original! Cria só o agendamento
            const status = 'pendente';
            adicionar = await criarAgendamentoNoBanco(
                pacienteExistente.id,
                profissional_id,
                servico_id,
                dataInicioSolicitada,
                data_hora_fim,
                status,
                sintomas_cliente
            );
        } else {
            // SE NÃO EXISTE: Chama a nossa nova TRANSAÇÃO para criar os 2 ao mesmo tempo!
            adicionar = await criarAgendamentoComPaciente(dadosLimpos, data_hora_fim);
        }

        res.status(201).json({
            msg: "Agendamento criado com sucesso!",
            informacoes: adicionar
        });

    } catch (error) {
        if (error.code === '23P01' || error.code === '23505') { // Adicionei 23505 por segurança de chave duplicada
            return res.status(409).json({ msg: "Horário Indisponível ou conflito de dados." });
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