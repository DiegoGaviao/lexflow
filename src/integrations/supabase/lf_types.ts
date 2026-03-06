
import { Database as GenDatabase } from './types';

export const lfTable = (tableName: string) => `lf_${tableName}`;

export type lf_app_role = 'admin' | 'advogado' | 'operacional';

export interface lf_profiles {
    id: string;
    nome_completo: string | null;
    oab: string | null;
    especialidade: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface lf_user_roles {
    id: string;
    user_id: string;
    role: lf_app_role;
}

export interface lf_processos {
    id: string;
    user_id: string;
    numero: string;
    tribunal: string;
    tribunal_sigla: string;
    partes: string | null;
    autor: string | null;
    reu: string | null;
    assunto: string | null;
    responsavel: string | null;
    data_ultimo_movimento: string | null;
    proxima_data_critica: string | null;
    dias_para_prazo: number | null;
    status_prazo: 'urgente' | 'atencao' | 'saudavel' | 'vencido' | null;
    status: 'ativo' | 'finalizado' | 'suspenso' | null;
    uf: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface lf_movimentacoes {
    id: string;
    processo_id: string;
    data: string;
    descricao: string;
    tipo: 'peticao' | 'sentenca' | 'despacho' | 'agravo' | 'citacao' | 'autuacao' | 'outro' | null;
    prazo_dias: number | null;
    prazo_final: string | null;
    created_at: string;
}

export interface lf_notificacoes {
    id: string;
    user_id: string;
    tipo: 'urgente' | 'atencao' | 'saudavel' | 'vencido' | 'info' | null;
    titulo: string;
    descricao: string | null;
    data: string;
    lida: boolean;
    processo_id: string | null;
}

export interface lf_user_preferences {
    id: string;
    user_id: string;
    alerta_email: boolean;
    resumo_diario: boolean;
    alertas_criticos: boolean;
    whatsapp_enabled: boolean;
    whatsapp_numero: string | null;
    tribunais_favoritos: string[];
    sync_interval_hours: number;
    theme: string;
    created_at: string;
    updated_at: string;
}

// Extends the original database type for local use
export type LFDatabase = GenDatabase & {
    public: GenDatabase['public'] & {
        Tables: GenDatabase['public']['Tables'] & {
            lf_profiles: {
                Row: lf_profiles;
                Insert: Partial<lf_profiles>;
                Update: Partial<lf_profiles>;
            };
            lf_user_roles: {
                Row: lf_user_roles;
                Insert: Partial<lf_user_roles>;
                Update: Partial<lf_user_roles>;
            };
            lf_processos: {
                Row: lf_processos;
                Insert: Partial<lf_processos>;
                Update: Partial<lf_processos>;
            };
            lf_movimentacoes: {
                Row: lf_movimentacoes;
                Insert: Partial<lf_movimentacoes>;
                Update: Partial<lf_movimentacoes>;
            };
            lf_notificacoes: {
                Row: lf_notificacoes;
                Insert: Partial<lf_notificacoes>;
                Update: Partial<lf_notificacoes>;
            };
            lf_user_preferences: {
                Row: lf_user_preferences;
                Insert: Partial<lf_user_preferences>;
                Update: Partial<lf_user_preferences>;
            };
        };
        Enums: GenDatabase['public']['Enums'] & {
            lf_app_role: lf_app_role;
        };
    };
};
