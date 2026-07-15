import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function NovoUsuario() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'GESTOR' | 'OPERADOR_SETOR'>('OPERADOR_SETOR');
  const [secretariaId, setSecretariaId] = useState('');
  const [setorId, setSetorId] = useState('');
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/secretarias').then((r) => setSecretarias(r.data)).catch(() => {});
    api.get('/setores').then((r) => setSetores(r.data)).catch(() => {});
  }, []);

  const setoresFiltrados = setores.filter((s) => s.secretariaId === secretariaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome, email, senha, role,
        secretariaId: secretariaId || undefined,
        setorId: setorId || undefined,
      });
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">Novo Usuário</h1>
        <p className="text-sm text-gray-500 mt-1">Crie uma conta para acesso ao sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha *</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Perfil</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="select">
              <option value="OPERADOR_SETOR">Operador de Setor</option>
              <option value="GESTOR">Gestor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Secretaria</label>
            <select value={secretariaId} onChange={(e) => { setSecretariaId(e.target.value); setSetorId(''); }} className="select">
              <option value="">Nenhuma</option>
              {secretarias.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Setor</label>
            <select value={setorId} onChange={(e) => setSetorId(e.target.value)} className="select">
              <option value="">Nenhum</option>
              {setoresFiltrados.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
