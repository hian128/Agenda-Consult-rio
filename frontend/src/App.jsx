import { useState, useEffect } from 'react';
import logoImg from './assets/logo.jpg';
import fotoIrys from './assets/irys.jpg'

export default function App() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtro, setFiltro] = useState('hoje'); // 'hoje', 'semana', 'mes', 'pendentes', 'todos'
  const [menuAtivo, setMenuAtivo] = useState('agenda'); // 'agenda', 'pacientes', 'relatorios'

  const buscarAgendamentos = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/agendamentos');
      const dados = await resposta.json();
      setAgendamentos(dados);
    } catch (erro) {
      console.error("Erro ao buscar dados:", erro);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  const alterarStatus = async (id, novoStatus) => {
    try {
      const url = novoStatus === 'confirmado'
        ? `http://localhost:3000/agendamentos/${id}/status`
        : `http://localhost:3000/agendamentos/${id}/cancelar`;

      const resposta = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (resposta.ok) buscarAgendamentos();
      else alert('Erro ao atualizar o status.');
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  const agendamentosFiltrados = agendamentos.filter((item) => {
    const dataItemStr = item.data_hora_inicio.split('T')[0]; // Data YYYY-MM-DD
    const dataAg = new Date(item.data_hora_inicio);
    const hoje = new Date();

    if (filtro === 'hoje') {
      return dataItemStr === hojeStr;
    }

    if (filtro === 'pendentes') {
      return item.status === 'pendente';
    }

    if (filtro === 'semana') {
      const diffDias = (dataAg - hoje) / (1000 * 60 * 60 * 24);
      return diffDias >= 0 && diffDias <= 7;
    }

    if (filtro === 'mes') {
      // Correção aplicada aqui: uso de 'dataAg' em vez de 'dataAgendamento'
      return (
        dataAg.getMonth() === hoje.getMonth() &&
        dataAg.getFullYear() === hoje.getFullYear()
      );
    }

    // Se o filtro for 'todos' ou qualquer outro, retorna tudo
    return true;
  });

  const deletarAgendamento = async (id) => {
    const confirmar = window.confirm("Tem a certeza que deseja apagar este agendamento definitivamente?");
    if (!confirmar) return;

    try {
      const resposta = await fetch(`http://localhost:3000/agendamentos/${id}`, {
        method: 'DELETE',
      });

      if (resposta.ok) {
        buscarAgendamentos();
      } else {
        alert("Erro ao tentar excluir o agendamento.");
      }
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* 1. MENU LATERAL */}
      <aside className="w-full md:w-64 bg-[#103b30] text-white flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-6 border-b border-[#0d8a7b]/40">
            <img src={logoImg} alt="Logo Clínica Letiery" className="w-16 h-16 object-contain my-2 rounded-4xl" />
            <h2 className="text-xl font-bold tracking-wide">Clínica Letiery</h2>
            <p className="text-xs text-[#efe5d6] opacity-80 mt-1">Painel Administrativo</p>
          </div>

          <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => setMenuAtivo('agenda')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer
                ${menuAtivo === 'agenda' ? 'bg-[#0d8a7b] text-white shadow-md' : 'text-[#efe5d6] hover:bg-white/10'}`}
            >
              📅 Agenda
            </button>
            <button
              onClick={() => setMenuAtivo('pacientes')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer
                ${menuAtivo === 'pacientes' ? 'bg-[#0d8a7b] text-white shadow-md' : 'text-[#efe5d6] hover:bg-white/10'}`}
            >
              👥 Pacientes
            </button>
            <button
              onClick={() => setMenuAtivo('relatorios')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer
                ${menuAtivo === 'relatorios' ? 'bg-[#0d8a7b] text-white shadow-md' : 'text-[#efe5d6] hover:bg-white/10'}`}
            >
              📊 Relatórios
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#0d8a7b]/40 hidden md:block">
          <a
            href="/agendar"
            target="_blank"
            className="block text-center w-full bg-[#efe5d6] text-[#103b30] py-2.5 rounded-xl text-xs font-bold hover:bg-white transition-all shadow-sm"
          >
            🔗 Ver Página Pública
          </a>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Topo / Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-[#103b30]">
              {menuAtivo === 'agenda' && 'Gestão de Agenda'}
              {menuAtivo === 'pacientes' && 'Lista de Pacientes'}
              {menuAtivo === 'relatorios' && 'Relatórios e Métricas'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Controle do consultório</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Dra. Irys Letiery</span>
            <img
              className='w-14 h-14 object-cover my-5 rounded-full border-2 border-[#0d8a7b] shadow-sm'
              src={fotoIrys}
              alt="foto"
            />
          </div>
        </header>

        {/* Corpo Dinâmico */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto">

          {menuAtivo === 'agenda' && (
            <>
              {/* Barra de Filtros Estilo Dashboard */}
              <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs w-full md:w-fit">
                <button
                  onClick={() => setFiltro('hoje')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${filtro === 'hoje' ? 'bg-[#103b30] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  📅 Hoje
                </button>
                <button
                  onClick={() => setFiltro('semana')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${filtro === 'semana' ? 'bg-[#103b30] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  🗓️ 7 Dias
                </button>
                <button
                  onClick={() => setFiltro('mes')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${filtro === 'mes' ? 'bg-[#103b30] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  📅 Este Mês
                </button>
                <button
                  onClick={() => setFiltro('pendentes')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${filtro === 'pendentes' ? 'bg-yellow-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  ⏳ Pendentes
                </button>
                <button
                  onClick={() => setFiltro('todos')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${filtro === 'todos' ? 'bg-[#103b30] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  📋 Todos
                </button>
              </div>

              {/* Lista Organizada em Estilo Grade de Agenda */}
              <div className="space-y-4">
                {agendamentosFiltrados.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-xs">
                    <p className="text-lg font-medium">Nenhum agendamento encontrado para este filtro.</p>
                    <p className="text-xs text-slate-400 mt-1">Os pedidos feitos pelos pacientes aparecerão aqui instantaneamente.</p>
                  </div>
                ) : (
                  agendamentosFiltrados.map((item) => (
                    <div
                      key={item.agendamento_id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Horário Destacado */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="bg-[#efe5d6] text-[#103b30] border border-[#d7c2a5] px-4 py-3 rounded-xl text-center min-w-[100px]">
                          <span className="block text-xs font-bold uppercase tracking-wider text-[#0d8a7b]">Horário</span>
                          <span className="text-lg font-black">
                            {new Date(item.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900">{item.paciente_nome}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                              ${item.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${item.status === 'confirmado' ? 'bg-green-100 text-green-800' : ''}
                              ${item.status === 'cancelado' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {item.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            📞 {item.paciente_telefone} • <span className="font-medium text-slate-700">{item.servico_nome || 'Consulta Geral'}</span>
                          </p>

                          {item.sintomas_cliente && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                              Motivo: "{item.sintomas_cliente}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ações da Gestão */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        <span className="text-xs text-slate-400 mr-2 hidden lg:inline">
                          {new Date(item.data_hora_inicio).toLocaleDateString('pt-BR')}
                        </span>

                        {item.status === 'pendente' && (
                          <button
                            onClick={() => alterarStatus(item.agendamento_id, 'confirmado')}
                            className="bg-[#103b30] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0d8a7b] transition-all shadow-sm"
                          >
                            Aprovar
                          </button>
                        )}

                        {item.status !== 'cancelado' && (
                          <button
                            onClick={() => alterarStatus(item.agendamento_id, 'cancelado')}
                            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => deletarAgendamento(item.agendamento_id)}
                          className="text-xs px-3 py-1 ml-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Excluir Definitivamente"
                        >
                          🗑️ Excluir
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {menuAtivo === 'pacientes' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
              <h3 className="text-lg font-bold text-[#103b30] mb-2">Módulo de Pacientes</h3>
              <p className="text-sm text-slate-500">Aqui listaremos o cadastro completo dos pacientes da clínica em breve.</p>
            </div>
          )}

          {menuAtivo === 'relatorios' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
              <h3 className="text-lg font-bold text-[#103b30] mb-2">Relatórios e Estatísticas</h3>
              <p className="text-sm text-slate-500">Métricas de consultas mensais, faturamento e produtividade.</p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}