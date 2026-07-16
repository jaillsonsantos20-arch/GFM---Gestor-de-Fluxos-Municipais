import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setErro('');
    setSucesso('');
    setSetupLoading(true);
    try {
      const res = await api.post('/auth/setup');
      setSucesso(res.data.message + (res.data.email ? ` (${res.data.email})` : ''));
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao configurar sistema');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bank-900 via-bank-800 to-bank-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white" />
        </div>
        <div className="relative text-white max-w-md">
          <img src="/logo.png" alt="GFM" className="h-45 mb-8 brightness-0 invert" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <img src="/logo.png" alt="GFM" className="h-20 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">GFM</h1>
            <p className="text-sm text-gray-500 mt-1">Gerenciador de Fluxos Municipais</p>
          </div>

          <div className="hidden lg:block text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Acessar</h1>
            <p className="text-sm text-gray-500 mt-1">Entre com suas credenciais</p>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erro}</div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{sucesso}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="admin@gfm.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="input"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleSetup}
              disabled={setupLoading}
              className="text-sm text-bank-600 hover:text-bank-800 font-medium"
            >
              {setupLoading ? 'Configurando...' : 'Primeiro acesso? Configurar sistema'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Credenciais de teste:</p>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400"><span className="font-mono text-gray-600">admin@gfm.com</span> / <span className="font-mono text-gray-600">admin123</span></p>
              <p className="text-xs text-gray-400"><span className="font-mono text-gray-600">joao@gfm.com</span> / <span className="font-mono text-gray-600">operador123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
