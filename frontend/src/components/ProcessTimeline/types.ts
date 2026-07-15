export type StatusProcesso =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'AJUSTE_SOLICITADO'
  | 'RECEBIDO'
  | 'NOTA_FISCAL_EMITIDA'
  | 'CONCLUIDO'
  | 'INDEFERIDO'
  | 'EMITIR_NOTA'
  | 'PARA_ANALISE'
  | 'CONFERENCIA'
  | 'CONFERIDO'
  | 'CORRECAO';

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  contato: string;
}

export interface HistoricoTramitacao {
  id: string;
  processoId: string;
  origemId: string;
  origemNome: string;
  destinoId: string;
  destinoNome: string;
  mensagem: string;
  anexos: string[];
  statusAlterado: StatusProcesso;
  createdAt: string;
}

export interface Processo {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusProcesso;
  fornecedor: Fornecedor | null;
  setorResponsavelId: string;
  setorResponsavelNome: string;
  criadoPorId: string;
  criadoPorNome: string;
  createdAt: string;
  updatedAt: string;
  historicos: HistoricoTramitacao[];
}
