import { useState } from 'react';
import fotoRecepcao from './assets/foto  clínica.png';
import fotoIrys from './assets/irys.jpg'

export default function ClienteAgendamento() {
  const [form, setForm] = useState({
    paciente_nome: '',
    paciente_cpf: '',
    paciente_telefone: '',
    servico_id: 'ID_DO_SERVICO',
    profissional_id: 'ID_DA_DRA',
    data_hora_inicio: '',
    sintomas_cliente: ''
  });

  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Preparamos os dados exatamente como o teu backend Thunder Client exige
    const dadosParaBackend = {
      // Usando um paciente de teste por agora (coloca um UUID válido da tua tabela pacientes)
      paciente_id: 'COLOQUE_AQUI_O_UUID_DE_UM_PACIENTE_DE_TESTE',
      profissional_id: form.profissional_id,
      servico_id: form.servico_id,
      data_hora_inicio: form.data_hora_inicio,
      sintomas_cliente: form.sintomas_cliente
      // O nome e telefone ainda não estão a ir para o banco, vamos resolver isso no próximo passo!
    };

    try {
      const resposta = await fetch('http://localhost:3000/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaBackend)
      });

      if (!resposta.ok) {
        const erroBack = await resposta.json();
        throw new Error(erroBack.msg || 'Erro ao enviar solicitação.');
      }

      setSucesso(true);
      setForm({ ...form, paciente_nome: '', paciente_telefone: '', data_hora_inicio: '', sintomas_cliente: '' });
    } catch (err) {
      setErro(err.message || 'Não foi possível realizar o agendamento. Tente novamente.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 overflow-hidden">

      {/* Fundo com a foto da clínica/recepção desfocada e camada escura elegante */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${fotoRecepcao})` }}
      />
      <div className="absolute inset-0 bg-[#103b30]/75 z-0" /> {/* Camada translúcida verde da marca */}

      {/* Caixa do Formulário Flutuante */}
      <div className="relative z-10 max-w-lg w-full bg-white/95 backdrop-blur-md rounded-[30px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#d7c2a5]">

        {/* Cabeçalho Humanizado */}
        <div className="text-center mb-6">
          <div className="inline-block p-1 bg-[#efe5d6] rounded-full mb-3 shadow-inner">
            <img
              src={fotoIrys}
              alt="Doutora Letiery"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#0d8a7b]"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#103b30]">Clínica Letiery</h1>
          <p className="text-sm text-[#17352d] opacity-90 mt-1">Cuidado humanizado e sorrisos renovados. Solicite o seu horário!</p>
        </div>

        {sucesso ? (
          <div className="bg-[#103b30] text-white p-6 rounded-2xl text-center shadow-lg">
            <h3 className="text-lg font-bold mb-2">Solicitação Enviada com Sucesso! 🎉</h3>
            <p className="text-sm text-[#efe5d6] leading-relaxed">Recebemos o seu pedido. A nossa equipa irá analisar a disponibilidade e entraremos em contacto para confirmar.</p>
            <button
              onClick={() => setSucesso(false)}
              className="mt-6 bg-[#0d8a7b] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
            >
              Fazer novo agendamento
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium">{erro}</div>}

            <div>
              <label className="block text-xs font-bold text-[#17352d] uppercase tracking-wider mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#d7c2a5] focus:outline-none focus:ring-2 focus:ring-[#0d8a7b] text-[#17352d] bg-white"
                placeholder="Ex: Maria Silva"
                value={form.paciente_nome}
                onChange={(e) => setForm({ ...form, paciente_nome: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17352d] uppercase tracking-wider mb-1">CPF</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#d7c2a5] focus:outline-none focus:ring-2 focus:ring-[#0d8a7b] text-[#17352d] bg-white"
                placeholder="Apenas números"
                value={form.paciente_cpf}
                onChange={(e) => setForm({ ...form, paciente_cpf: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17352d] uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#d7c2a5] focus:outline-none focus:ring-2 focus:ring-[#0d8a7b] text-[#17352d] bg-white"
                placeholder="(00) 00000-0000"
                value={form.paciente_telefone}
                onChange={(e) => setForm({ ...form, paciente_telefone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17352d] uppercase tracking-wider mb-1">Data e Hora Desejada</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#d7c2a5] focus:outline-none focus:ring-2 focus:ring-[#0d8a7b] text-[#17352d] bg-white"
                value={form.data_hora_inicio}
                onChange={(e) => setForm({ ...form, data_hora_inicio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17352d] uppercase tracking-wider mb-1">O que está a sentir? / Motivo</label>
              <textarea
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-[#d7c2a5] focus:outline-none focus:ring-2 focus:ring-[#0d8a7b] text-[#17352d] bg-white"
                placeholder="Descreva brevemente os sintomas ou tratamento..."
                value={form.sintomas_cliente}
                onChange={(e) => setForm({ ...form, sintomas_cliente: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#103b30] text-white py-3.5 rounded-xl font-bold hover:bg-[#0d8a7b] transition-all shadow-lg tracking-wide uppercase text-sm"
            >
              Enviar Solicitação de Horário
            </button>
          </form>
        )}

      </div>
    </div>
  );
}