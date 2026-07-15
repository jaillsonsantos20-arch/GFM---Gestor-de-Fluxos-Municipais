import { useEffect, useState } from 'react';
import api from '../services/api';

interface Secretaria {
  id: string;
  nome: string;
  sigla: string;
}

export default function Secretarias() {
  const [items, setItems] = useState<Secretaria[]>([]);
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/secretarias').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.patch(`/secretarias/${editId}`, { nome, sigla });
      } else {
        await api.post('/secretarias', { nome, sigla });
      }
      setNome('');
      setSigla('');
      setEditId(null);
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Secretaria) => {
    setNome(item.nome);
    setSigla(item.sigla);
    setEditId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta secretaria?')) return;
    try {
      await api.delete(`/secretarias/${id}`);
      fetch();
    } catch { alert('Erro ao excluir'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Secretarias</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie as secretarias municipais</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required className="input" placeholder="Secretaria Municipal de ..." />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Sigla</label>
          <input value={sigla} onChange={(e) => setSigla(e.target.value)} required maxLength={20} className="input uppercase" placeholder="SMS" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setNome(''); setSigla(''); setEditId(null); }} className="btn-secondary">
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
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider w-20">Sigla</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-900">{item.nome}</td>
                  <td className="px-5 py-4 font-mono text-sm font-medium text-gray-600">{item.sigla}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-bank-600 hover:text-bank-800 text-xs font-medium mr-3">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Nenhuma secretaria cadastrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
