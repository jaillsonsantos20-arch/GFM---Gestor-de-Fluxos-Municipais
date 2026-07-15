import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface ProcessoResumido {
  id: string;
  titulo: string;
  status: string;
  createdAt: string;
  criadoPor: { nome: string };
  setorResponsavel: { nome: string };
}

const statusColors: Record<string, string> = {
  ABERTO: 'bg-yellow-100 text-yellow-800',
  EM_ANALISE: 'bg-blue-100 text-blue-800',
  AJUSTE_SOLICITADO: 'bg-red-100 text-red-800',
  RECEBIDO: 'bg-purple-100 text-purple-800',
  NOTA_FISCAL_EMITIDA: 'bg-indigo-100 text-indigo-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  INDEFERIDO: 'bg-gray-100 text-gray-800',
  EMITIR_NOTA: 'bg-sky-100 text-sky-800',
  PARA_ANALISE: 'bg-orange-100 text-orange-800',
  CONFERENCIA: 'bg-teal-100 text-teal-800',
  CONFERIDO: 'bg-emerald-100 text-emerald-800',
  CORRECAO: 'bg-rose-100 text-rose-800',
};

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [processos, setProcessos] = useState<ProcessoResumido[]>([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const limparNotificacoes = () => {
    setCount(0);
    setProcessos([]);
  };

  const fetchNovos = () => {
    api.get('/processos/novos').then((r) => {
      setCount(r.data.count);
      setProcessos(r.data.processos);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchNovos();
    const interval = setInterval(fetchNovos, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setAberto(!aberto)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 origin-top-right">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Novos Processos</p>
            <p className="text-xs text-gray-400">Últimas 24 horas</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {processos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum novo processo</p>
            ) : (
              processos.map((p) => (
                <Link key={p.id} to={`/processos/${p.id}`} onClick={() => { setAberto(false); limparNotificacoes(); }} className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                  <p className="text-sm font-medium text-gray-800 truncate leading-snug">{p.titulo}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${statusColors[p.status] || ''}`}>{p.status.replace('_', ' ')}</span>
                    <span className="text-[11px] text-gray-400">{p.criadoPor?.nome}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{p.setorResponsavel?.nome} &middot; {new Date(p.createdAt).toLocaleString('pt-BR')}</p>
                </Link>
              ))
            )}
          </div>
          <Link to="/processos" onClick={() => { setAberto(false); limparNotificacoes(); }} className="block px-4 py-2.5 text-xs text-center text-bank-600 hover:text-bank-800 hover:bg-bank-50 border-t border-gray-100 rounded-b-xl transition-colors">
            Ver todos os processos
          </Link>
        </div>
      )}
    </div>
  );
}
