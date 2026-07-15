import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusColors: Record<string, string> = {
  ABERTO: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  EM_ANALISE: 'bg-blue-50 text-blue-700 border border-blue-200',
  AJUSTE_SOLICITADO: 'bg-red-50 text-red-700 border border-red-200',
  RECEBIDO: 'bg-purple-50 text-purple-700 border border-purple-200',
  NOTA_FISCAL_EMITIDA: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  CONCLUIDO: 'bg-green-50 text-green-700 border border-green-200',
  INDEFERIDO: 'bg-gray-50 text-gray-600 border border-gray-200',
  EMITIR_NOTA: 'bg-sky-50 text-sky-700 border border-sky-200',
  PARA_ANALISE: 'bg-orange-50 text-orange-700 border border-orange-200',
  CONFERENCIA: 'bg-teal-50 text-teal-700 border border-teal-200',
  CONFERIDO: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CORRECAO: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const statusList = ['', 'ABERTO', 'EM_ANALISE', 'AJUSTE_SOLICITADO', 'RECEBIDO', 'NOTA_FISCAL_EMITIDA', 'CONCLUIDO', 'INDEFERIDO', 'EMITIR_NOTA', 'PARA_ANALISE', 'CONFERENCIA', 'CONFERIDO', 'CORRECAO'];

export default function Processos() {
  const { usuario } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [filtroSecretariaId, setFiltroSecretariaId] = useState('');
  const [filtroSetorId, setFiltroSetorId] = useState('');
  const [filtroFornecedorId, setFiltroFornecedorId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const setoresFiltrados = filtroSecretariaId
    ? setores.filter((s) => s.secretariaId === filtroSecretariaId)
    : setores;

  const fetchProcessos = () => {
    const params = new URLSearchParams();
    if (statusFiltro) params.set('status', statusFiltro);
    if (filtroSecretariaId) params.set('secretariaId', filtroSecretariaId);
    if (filtroSetorId) params.set('setorId', filtroSetorId);
    if (filtroFornecedorId) params.set('fornecedorId', filtroFornecedorId);
    if (dataInicio) params.set('dataInicio', dataInicio);
    if (dataFim) params.set('dataFim', dataFim);
    const qs = params.toString();
    api.get(`/processos${qs ? `?${qs}` : ''}`).then((r) => setItems(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get('/secretarias').then((r) => setSecretarias(r.data)).catch(() => {});
    api.get('/setores').then((r) => setSetores(r.data)).catch(() => {});
    api.get('/fornecedores').then((r) => setFornecedores(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchProcessos(); }, [statusFiltro, filtroSecretariaId, filtroSetorId, filtroFornecedorId, dataInicio, dataFim]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este processo?')) return;
    try { await api.delete(`/processos/${id}`); fetchProcessos(); } catch { alert('Erro ao excluir'); }
  };

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('Relatório de Processos', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 22, { align: 'center' });

    const filtrosAplicados: string[] = [];
    if (statusFiltro) filtrosAplicados.push(`Status: ${statusFiltro.replace('_', ' ')}`);
    if (filtroSecretariaId) {
      const sec = secretarias.find(s => s.id === filtroSecretariaId);
      if (sec) filtrosAplicados.push(`Secretaria: ${sec.nome}`);
    }
    if (filtroSetorId) {
      const set = setores.find(s => s.id === filtroSetorId);
      if (set) filtrosAplicados.push(`Setor: ${set.nome}`);
    }
    if (filtroFornecedorId) {
      const forn = fornecedores.find(f => f.id === filtroFornecedorId);
      if (forn) filtrosAplicados.push(`Fornecedor: ${forn.razaoSocial}`);
    }
    if (dataInicio) filtrosAplicados.push(`Data início: ${new Date(dataInicio).toLocaleDateString('pt-BR')}`);
    if (dataFim) filtrosAplicados.push(`Data fim: ${new Date(dataFim).toLocaleDateString('pt-BR')}`);

    if (filtrosAplicados.length > 0) {
      doc.setFontSize(9);
      doc.text('Filtros: ' + filtrosAplicados.join(' | '), 14, 30);
    }

    const yStart = filtrosAplicados.length > 0 ? 36 : 28;

    const body = items.map((p: any) => [
      p.titulo,
      p.status.replace('_', ' '),
      p.setorResponsavel?.nome || '—',
      p.fornecedor?.razaoSocial || '—',
      new Date(p.createdAt).toLocaleDateString('pt-BR'),
    ]);

    autoTable(doc, {
      startY: yStart,
      head: [['Título', 'Status', 'Setor', 'Fornecedor', 'Criado em']],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 42, 74] },
    });

    doc.save('relatorio-processos.pdf');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Processos</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} processo(s) encontrado(s)</p>
        </div>
        <Link to="/processos/novo" className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Processo
        </Link>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="select">
              <option value="">Todos</option>
              {statusList.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Secretaria</label>
            <select value={filtroSecretariaId} onChange={(e) => { setFiltroSecretariaId(e.target.value); setFiltroSetorId(''); }} className="select">
              <option value="">Todas</option>
              {secretarias.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Setor</label>
            <select value={filtroSetorId} onChange={(e) => setFiltroSetorId(e.target.value)} className="select">
              <option value="">Todos</option>
              {setoresFiltrados.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.secretaria?.sigla})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fornecedor</label>
            <select value={filtroFornecedorId} onChange={(e) => setFiltroFornecedorId(e.target.value)} className="select">
              <option value="">Todos</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data início</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data fim</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input" />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={gerarRelatorioPDF} className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v6a2 2 0 002 2h6" /></svg>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Título</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Setor</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Fornecedor</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Criado em</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{p.titulo}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[p.status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{p.setorResponsavel?.nome || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{p.fornecedor?.razaoSocial || '—'}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/processos/${p.id}`} className="text-bank-600 hover:text-bank-800 text-xs font-medium">Detalhes</Link>
                      {usuario?.id === p.criadoPor?.id && (
                        <>
                          {p.historicos?.length === 0 && (
                            <Link to={`/processos/${p.id}`} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Editar</Link>
                          )}
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Nenhum processo encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
