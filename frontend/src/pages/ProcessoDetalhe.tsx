import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [processo, setProcesso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editFornecedorId, setEditFornecedorId] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [destinoSetorId, setDestinoSetorId] = useState('');
  const [novoStatus, setNovoStatus] = useState('');
  const [setores, setSetores] = useState<any[]>([]);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [secretariaId, setSecretariaId] = useState('');

  const setoresFiltrados = secretariaId
    ? setores.filter((s) => s.secretariaId === secretariaId)
    : setores;

  const fetch = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/processos/${id}`),
      api.get('/setores'),
      api.get('/fornecedores'),
      api.get('/secretarias'),
    ]).then(([p, s, f, sec]) => {
      setProcesso(p.data);
      setSetores(s.data);
      setFornecedores(f.data);
      setSecretarias(sec.data);
      setEditTitulo(p.data.titulo);
      setEditDescricao(p.data.descricao);
      setEditFornecedorId(p.data.fornecedorId || '');
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [id]);

  const handleTramitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processo || !destinoSetorId || !novoStatus || !mensagem) return;
    try {
      await api.post(`/processos/${processo.id}/tramitar`, {
        destinoSetorId,
        mensagem,
        status: novoStatus,
      });
      setMensagem('');
      setDestinoSetorId('');
      setNovoStatus('');
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao tramitar');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processo) return;
    try {
      const body: any = { titulo: editTitulo, descricao: editDescricao };
      if (editFornecedorId) body.fornecedorId = editFornecedorId;
      else body.fornecedorId = null;
      const res = await api.patch(`/processos/${processo.id}`, body);
      setProcesso(res.data);
      setEditando(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar');
    }
  };

  const handleDelete = async () => {
    if (!processo) return;
    if (!confirm('Excluir este processo permanentemente?')) return;
    try {
      await api.delete(`/processos/${processo.id}`);
      navigate('/processos');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const podeEditar = usuario?.id === processo?.criadoPor?.id && processo?.historicos?.length === 0;

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-bank-600 border-t-transparent rounded-full" /></div>;
  if (!processo) return <p className="text-red-500">Processo não encontrado</p>;

  return (
    <div className="max-w-5xl">
      <Link to="/processos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para Processos
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{processo.titulo}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${statusColors[processo.status] || ''}`}>
                {processo.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">{processo.descricao}</p>
          </div>
          {podeEditar && (
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={() => { setEditando(!editando); }} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${editando ? 'btn-secondary' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                {editando ? 'Cancelar' : 'Editar'}
              </button>
              <button onClick={handleDelete} className="text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                Excluir
              </button>
            </div>
          )}
        </div>

        {editando ? (
          <form onSubmit={handleUpdate} className="space-y-4 border-t border-gray-100 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Título</label>
                <input value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} required className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Fornecedor</label>
                <select value={editFornecedorId} onChange={(e) => setEditFornecedorId(e.target.value)} className="select">
                  <option value="">Sem fornecedor</option>
                  {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Descrição</label>
              <textarea value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} required rows={3} className="input" />
            </div>
            <button type="submit" className="btn-primary">Salvar</button>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Setor Responsável</p>
                <p className="font-medium text-gray-900">{processo.setorResponsavel?.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Secretaria</p>
                <p className="font-medium text-gray-900">{processo.setorResponsavel?.secretaria?.sigla || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Fornecedor</p>
                <p className="font-medium text-gray-900">{processo.fornecedor?.razaoSocial || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Criado por</p>
                <p className="font-medium text-gray-900">{processo.criadoPor?.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Modelo</p>
                <p className="font-medium text-gray-900">{processo.modelo?.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Criado em</p>
                <p className="font-medium text-gray-900">{new Date(processo.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {processo.anexos?.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Anexos</p>
                <div className="flex flex-wrap gap-2">
                  {processo.anexos.map((url: string, idx: number) => (
                    <a key={idx} href={`${API_URL}${url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Anexo {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Histórico de Tramitação</h2>
          {processo.historicos?.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma tramitação registrada.</p>
          ) : (
            <div className="space-y-4">
              {processo.historicos?.map((h: any) => (
                <div key={h.id} className="relative pl-6 border-l-2 border-bank-200 pb-5 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-bank-500 border-2 border-white shadow-sm" />
                  <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-800 mt-1">{h.mensagem}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{h.origem?.nome}</span>
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    <span className="font-medium text-gray-600">{h.destino?.nome}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[h.statusAlterado] || ''}`}>
                      {h.statusAlterado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tramitar Processo</h2>
          <form onSubmit={handleTramitar} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Secretaria</label>
              <select value={secretariaId} onChange={(e) => { setSecretariaId(e.target.value); setDestinoSetorId(''); }} className="select">
                <option value="">Todas as secretarias</option>
                {secretarias.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Setor de Destino</label>
              <select value={destinoSetorId} onChange={(e) => setDestinoSetorId(e.target.value)} required className="select">
                <option value="">Selecione...</option>
                {setoresFiltrados.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.secretaria?.sigla})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} required className="select">
                <option value="">Selecione...</option>
                {['EM_ANALISE', 'AJUSTE_SOLICITADO', 'RECEBIDO', 'NOTA_FISCAL_EMITIDA', 'CONCLUIDO', 'INDEFERIDO', 'EMITIR_NOTA', 'PARA_ANALISE', 'CONFERENCIA', 'CONFERIDO', 'CORRECAO'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Mensagem</label>
              <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} required rows={3} className="input" placeholder="Descreva a tramitação..." />
            </div>
            <button type="submit" className="btn-primary">Tramitar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
