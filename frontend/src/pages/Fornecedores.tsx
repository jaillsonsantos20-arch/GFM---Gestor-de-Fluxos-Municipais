import { useEffect, useState } from 'react';
import api from '../services/api';

interface Fornecedor {
  id: string; cnpj: string; razaoSocial: string; contato: string;
}

export default function Fornecedores() {
  const [items, setItems] = useState<Fornecedor[]>([]);
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [contato, setContato] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/fornecedores').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.patch(`/fornecedores/${editId}`, { cnpj, razaoSocial, contato });
      } else {
        await api.post('/fornecedores', { cnpj, razaoSocial, contato });
      }
      setCnpj(''); setRazaoSocial(''); setContato(''); setEditId(null);
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Fornecedor) => {
    setCnpj(item.cnpj); setRazaoSocial(item.razaoSocial); setContato(item.contato); setEditId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este fornecedor?')) return;
    try { await api.delete(`/fornecedores/${id}`); fetch(); } catch { alert('Erro ao excluir'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Fornecedores</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie os fornecedores cadastrados</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="w-44">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">CNPJ</label>
          <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required className="input" placeholder="00.000.000/0001-00" />
        </div>
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Razão Social</label>
          <input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required className="input" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Contato</label>
          <input value={contato} onChange={(e) => setContato(e.target.value)} required className="input" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setCnpj(''); setRazaoSocial(''); setContato(''); setEditId(null); }} className="btn-secondary">
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
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">CNPJ</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Razão Social</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Contato</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-gray-600">{item.cnpj}</td>
                  <td className="px-5 py-4 text-gray-900">{item.razaoSocial}</td>
                  <td className="px-5 py-4 text-gray-600">{item.contato}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-bank-600 hover:text-bank-800 text-xs font-medium mr-3">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Nenhum fornecedor cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
