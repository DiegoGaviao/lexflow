export type StatusPrazo = "urgente" | "atencao" | "saudavel" | "vencido";
export type StatusProcesso = "ativo" | "finalizado" | "suspenso";

export interface Movimentacao {
  data: string;
  descricao: string;
  tipo: "peticao" | "sentenca" | "despacho" | "agravo" | "citacao" | "autuacao" | "outro";
  prazo_dias?: number | null;
  prazo_final?: string | null;
}

export interface Processo {
  id: string;
  numero: string;
  tribunal: string;
  tribunal_sigla: string;
  partes: string;
  autor: string;
  reu: string;
  assunto: string;
  responsavel: string;
  data_ultimo_movimento: string;
  proxima_data_critica: string | null;
  dias_para_prazo: number | null;
  status_prazo: StatusPrazo;
  status: StatusProcesso;
  movimentacoes: Movimentacao[];
  uf: string;
}

export interface NotificacaoItem {
  id: string;
  tipo: StatusPrazo | "info";
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  processo_id?: string;
}

export interface DashboardStats {
  total: number;
  urgente: number;
  atencao: number;
  saudavel: number;
  vencido: number;
}
