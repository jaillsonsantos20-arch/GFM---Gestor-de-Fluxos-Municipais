import { useEffect, useState } from 'react';
import api from '../services/api';

interface Modelo {
  id: number;
  nome: string;
  fluxoSequencial: { etapa: number; setorId: string }[];
}

export default function ModelosFluxo() {
  const [items, setItems] = useState<Modelo[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [etapas, setEtapas] = useState<{ etapa: number; setorId: string }[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => Promise.all([
    api.get('/modelos-fluxo').then((r) => setItems(r.data)),
    api.get('/setores').then((r) => setSetores(r.data)),
  ]).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const addEtapa = () => {
    setEtapas([...etapas, { etapa: etapas.length + 1, setorId: '' }]);
  };

  const removeEtapa = (idx: number) => {
    const nova = etapas.filter((_, i) => i !== idx).map((e, i) => ({ ...e, etapa: i + 1 }));
    setEtapas(nova);
  };

  const updateEtapa = (idx: number, setorId: string) => {
    const nova = [...etapas];
    nova[idx] = { ...nova[idx], setorId };
    setEtapas(nova);
  };

  const resetForm = () => {
    setNome('');
    setEtapas([]);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || etapas.length === 0 || etapas.some((e) => !e.setorId)) {
      alert('Preencha o nome e todas as etapas');
      return;
    }
    setLoading(true);
    try {
      const body = { nome, fluxoSequencial: etapas };
      if (editId) {
        await api.patch(`/modelos-fluxo/${editId}`, body);
      } else {
        await api.post('/modelos-fluxo', body);
      }
      resetForm();
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Modelo) => {
    setNome(item.nome);
    setEtapas(item.fluxoSequencial.map((e) => ({ etapa: e.etapa, setorId: e.setorId })));
    setEditId(item.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este modelo de fluxo?')) return;
    try { await api.delete(`/modelos-fluxo/${id}`); fetch(); } catch { alert('Erro ao excluir'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Modelos de Fluxo</h1>
        <p className="text-sm text-gray-500 mt-1">Defina modelos de tramitação entre setores</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Modelo</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required className="input max-w-md" placeholder="Ex: Fluxo padrão de licitação" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Etapas do Fluxo</label>
            <button type="button" onClick={addEtapa} className="text-xs bg-bank-50 text-bank-700 hover:bg-bank-100 font-medium px-3 py-1.5 rounded-lg transition-colors">
              + Adicionar Etapa
            </button>
          </div>

          {etapas.length === 0 && <p className="text-sm text-gray-400">Nenhuma etapa cadastrada. Clique em "Adicionar Etapa".</p>}

          <div className="space-y-2">
            {etapas.map((etapa, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-500 w-16">Etapa {idx + 1}</span>
                <select value={etapa.setorId} onChange={(e) => updateEtapa(idx, e.target.value)} required className="select flex-1">
                  <option value="">Selecione o setor...</option>
                  {setores.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.secretaria?.sigla})</option>)}
                </select>
                <button type="button" onClick={() => removeEtapa(idx)} className="text-red-500 hover:text-red-700 text-sm p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Criar Modelo'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Etapas</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-900">{item.nome}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {item.fluxoSequencial?.length || 0} etapa(s)
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-bank-600 hover:text-bank-800 text-xs font-medium mr-3">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Nenhum modelo cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
