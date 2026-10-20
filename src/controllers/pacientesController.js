const { listarPacientesNoBanco, deletarPacienteNoBanco } = require('../models/Paciente')


async function listarPacientes(req, res) {
    try {
        const listaPacientes = await listarPacientesNoBanco();

        res.status(200).json(listaPacientes);
    }
    catch (error) {
        console.error("Erro ao listar pacientes:", error);
        res.status(500).json({ msg: "Erro interno ao buscar por pacientes." });
    }

}

async function deletarPacientes(req, res) {

    const id = req.params.id

    try {
        const apagar = await deletarPacienteNoBanco(id);
        if (apagar) {
            res.status(200).json({ msg: "Paciente excluído com sucesso!" });
        } else {
            res.status(404).json({ msg: "Paciente não encontrado." });
        }
    } catch (error) {
        console.error("Erro ao excluir paciente:", error);
        // Proteção caso o paciente tenha agendamentos
        if (error.code === '23503') {
            return res.status(409).json({ msg: "Não é possível excluir um paciente que possui consultas na agenda. Cancele ou exclua os agendamentos dele primeiro." });
        }

        res.status(500).json({ msg: "Erro interno ao excluir paciente." });
    }
}


module.exports = {
    listarPacientes,
    deletarPacientes


};