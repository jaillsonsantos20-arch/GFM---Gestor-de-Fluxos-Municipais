import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Resumo {
  processos: number;
  secretarias: number;
  setores: number;
  fornecedores: number;
}

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    ABERTO: 'bg-yellow-100 text-yellow-800',
    EM_ANALISE: 'bg-blue-100 text-blue-800',
    AJUSTE_SOLICITADO: 'bg-red-100 text-red-800',
    CONCLUIDO: 'bg-green-100 text-green-800',
    INDEFERIDO: 'bg-gray-100 text-gray-800',
  };
  return `px-2 py-0.5 rounded-md text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`;
};

export default function Dashboard() {
  const [resumo, setResumo] = useState<Resumo>({ processos: 0, secretarias: 0, setores: 0, fornecedores: 0 });
  const [ultimosProcessos, setUltimosProcessos] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/processos'),
      api.get('/secretarias'),
      api.get('/setores'),
      api.get('/fornecedores'),
    ]).then(([p, s, st, f]) => {
      setResumo({
        processos: p.data.length,
        secretarias: s.data.length,
        setores: st.data.length,
        fornecedores: f.data.length,
      });
      setUltimosProcessos(p.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  const cards = [
    {
      label: 'Processos', value: resumo.processos, link: '/processos',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-bank-600', bg: 'bg-bank-50',
    },
    {
      label: 'Secretarias', value: resumo.secretarias, link: '/secretarias',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'text-emerald-600', bg: 'bg-emerald-50',
    },
    {
      label: 'Setores', value: resumo.setores, link: '/setores',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'text-purple-600', bg: 'bg-purple-50',
    },
    {
      label: 'Fornecedores', value: resumo.fornecedores, link: '/fornecedores',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'text-orange-600', bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Últimos Processos</h2>
            <p className="text-xs text-gray-400 mt-0.5">Os 5 processos mais recentes</p>
          </div>
          <Link to="/processos" className="text-sm font-medium text-bank-600 hover:text-bank-700 transition-colors">Ver todos</Link>
        </div>
        {ultimosProcessos.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">Nenhum processo cadastrado.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {ultimosProcessos.map((p: any) => (
              <Link key={p.id} to={`/processos/${p.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.setorResponsavel?.nome || '—'}</p>
                </div>
                <span className={statusBadge(p.status)}>{p.status.replace('_', ' ')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
