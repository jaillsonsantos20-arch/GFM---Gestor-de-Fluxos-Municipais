import { useState } from 'react';
import { mockProcesso } from './mockData';
import { StatusProcesso } from './types';

const statusConfig: Record<StatusProcesso, { label: string; color: string }> = {
  ABERTO: { label: 'Aberto', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  AJUSTE_SOLICITADO: { label: 'Ajuste Solicitado', color: 'bg-red-100 text-red-800 border-red-300' },
  RECEBIDO: { label: 'Recebido', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  NOTA_FISCAL_EMITIDA: { label: 'Nota Fiscal Emitida', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-300' },
  INDEFERIDO: { label: 'Indeferido', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  EMITIR_NOTA: { label: 'Emitir Nota', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  PARA_ANALISE: { label: 'Para Análise', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  CONFERENCIA: { label: 'Conferência', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  CONFERIDO: { label: 'Conferido', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CORRECAO: { label: 'Correção', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: StatusProcesso }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function TimelineItem({
  origemNome,
  destinoNome,
  mensagem,
  anexos,
  createdAt,
  statusAlterado,
  isLast,
}: {
  origemNome: string;
  destinoNome: string;
  mensagem: string;
  anexos: string[];
  createdAt: string;
  statusAlterado: StatusProcesso;
  isLast: boolean;
}) {
  const cfg = statusConfig[statusAlterado];
  return (
    <div className="relative flex gap-6 pb-8">
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-2 z-10 shrink-0 mt-1.5 ${cfg.color.replace('bg-', 'border-').split(' ')[0]} ${cfg.color.split(' ')[0].replace('bg-', 'bg-')}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 -mt-0.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          <StatusBadge status={statusAlterado} />
        </div>
        <p className="text-xs text-gray-400 mb-2">
          <span className="font-medium text-gray-600">{origemNome}</span>
          {' enviou para '}
          <span className="font-medium text-gray-600">{destinoNome}</span>
        </p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
          {mensagem}
        </p>
        {anexos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {anexos.map((anexo) => (
              <span
                key={anexo}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 hover:bg-blue-100 cursor-default"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {anexo}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickResponseForm() {
  const [mensagem, setMensagem] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setArquivos([]);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Resposta Rápida</h3>
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite sua mensagem ou despacho..."
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{arquivos.length > 0 ? `${arquivos.length} arquivo(s) selecionado(s)` : 'Anexar arquivos'}</span>
          <input type="file" multiple onChange={handleFileChange} className="hidden" />
        </label>
        <button
          type="submit"
          disabled={!mensagem.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tramitar / Responder
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </form>
  );
}

export default function ProcessTimeline() {
  const processo = mockProcesso;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {processo.titulo}
              </h1>
              {processo.fornecedor && (
                <p className="text-sm text-gray-500 mt-1">
                  Fornecedor:{' '}
                  <span className="font-medium text-gray-700">
                    {processo.fornecedor.razaoSocial}
                  </span>
                  {' — '}
                  <span className="text-gray-400">{processo.fornecedor.cnpj}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Criado por <span className="font-medium text-gray-500">{processo.criadoPorNome}</span>
                {' em '}{formatDate(processo.createdAt)}
                {' | Responsável: '}<span className="font-medium text-gray-500">{processo.setorResponsavelNome}</span>
              </p>
            </div>
            <div className="shrink-0">
              <StatusBadge status={processo.status} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6">
            Linha do Tempo
          </h2>
          {[...processo.historicos]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((h, i, arr) => (
              <TimelineItem
                key={h.id}
                origemNome={h.origemNome}
                destinoNome={h.destinoNome}
                mensagem={h.mensagem}
                anexos={h.anexos}
                createdAt={h.createdAt}
                statusAlterado={h.statusAlterado}
                isLast={i === arr.length - 1}
              />
            ))}
        </div>

        <QuickResponseForm />
      </div>
    </div>
  );
}
