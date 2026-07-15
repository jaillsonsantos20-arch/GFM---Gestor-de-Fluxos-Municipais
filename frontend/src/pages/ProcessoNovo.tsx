import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProcessoNovo() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [setorId, setSetorId] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/fornecedores'),
      api.get('/modelos-fluxo'),
      api.get('/setores'),
    ]).then(([f, m, s]) => {
      setFornecedores(f.data);
      setModelos(m.data);
      setSetores(s.data);
    }).catch(() => {});
  }, []);

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setArquivos(Array.from(e.target.files));
  };

  const removerArquivo = (idx: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let anexos: string[] = [];

      if (arquivos.length > 0) {
        const formData = new FormData();
        arquivos.forEach((f) => formData.append('files', f));
        const uploadRes = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        anexos = uploadRes.data.map((u: any) => u.url);
      }

      const body: any = { titulo, descricao, anexos };
      if (fornecedorId) body.fornecedorId = fornecedorId;
      if (modeloId) body.modeloId = Number(modeloId);
      if (setorId) body.setorId = setorId;
      await api.post('/processos', body);
      navigate('/processos');
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || err.response?.data?.message || 'Erro ao criar processo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/processos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar
      </Link>

      <h1 className="page-title mb-6">Novo Processo</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="input" placeholder="Título do processo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição *</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required rows={4} className="input" placeholder="Descreva o processo..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fornecedor</label>
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} className="select">
              <option value="">Sem fornecedor</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Modelo de Fluxo</label>
            <select value={modeloId} onChange={(e) => { setModeloId(e.target.value); if (e.target.value) setSetorId(''); }} className="select">
              <option value="">Sem modelo</option>
              {modelos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          {!modeloId && !usuario?.setorId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Setor Responsável *</label>
              <select value={setorId} onChange={(e) => setSetorId(e.target.value)} className="select">
                <option value="">Selecione um setor...</option>
                {setores.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.secretaria?.sigla})</option>)}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Anexos (documentos)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-bank-300 transition-colors">
            <input type="file" multiple onChange={handleArquivoChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-bank-50 file:text-bank-700 hover:file:bg-bank-100 cursor-pointer" />
          </div>
          {arquivos.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {arquivos.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <span className="truncate">{f.name}</span>
                  </div>
                  <button type="button" onClick={() => removerArquivo(idx)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-2">Remover</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Criando...' : 'Criar Processo'}
          </button>
          <button type="button" onClick={() => navigate('/processos')} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
