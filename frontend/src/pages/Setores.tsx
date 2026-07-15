import { useEffect, useState } from 'react';
import api from '../services/api';

interface Secretaria { id: string; nome: string; sigla: string; }
interface Setor { id: string; nome: string; secretariaId: string; secretaria: Secretaria; }

export default function Setores() {
  const [items, setItems] = useState<Setor[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [nome, setNome] = useState('');
  const [secretariaId, setSecretariaId] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => Promise.all([
    api.get('/setores').then((r) => setItems(r.data)),
    api.get('/secretarias').then((r) => setSecretarias(r.data)),
  ]).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.patch(`/setores/${editId}`, { nome, secretariaId });
      } else {
        await api.post('/setores', { nome, secretariaId });
      }
      setNome('');
      setSecretariaId('');
      setEditId(null);
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Setor) => {
    setNome(item.nome);
    setSecretariaId(item.secretariaId);
    setEditId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este setor?')) return;
    try { await api.delete(`/setores/${id}`); fetch(); } catch { alert('Erro ao excluir'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Setores</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie os setores das secretarias</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required className="input" placeholder="Nome do setor" />
        </div>
        <div className="w-64">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Secretaria</label>
          <select value={secretariaId} onChange={(e) => setSecretariaId(e.target.value)} required className="select">
            <option value="">Selecione...</option>
            {secretarias.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setNome(''); setSecretariaId(''); setEditId(null); }} className="btn-secondary">
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
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Secretaria</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-900">{item.nome}</td>
                  <td className="px-5 py-4 text-gray-600">{item.secretaria?.sigla || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-bank-600 hover:text-bank-800 text-xs font-medium mr-3">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Nenhum setor cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
