export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      movimentacoes: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          id: string
          prazo_dias: number | null
          prazo_final: string | null
          processo_id: string
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          prazo_dias?: number | null
          prazo_final?: string | null
          processo_id: string
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          prazo_dias?: number | null
          prazo_final?: string | null
          processo_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      lf_movimentacoes: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          id: string
          prazo_dias: number | null
          prazo_final: string | null
          processo_id: string
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          prazo_dias?: number | null
          prazo_final?: string | null
          processo_id: string
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          prazo_dias?: number | null
          prazo_final?: string | null
          processo_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lf_movimentacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "lf_processos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          data: string | null
          descricao: string | null
          id: string
          lida: boolean | null
          processo_id: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          data?: string | null
          descricao?: string | null
          id?: string
          lida?: boolean | null
          processo_id?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          data?: string | null
          descricao?: string | null
          id?: string
          lida?: boolean | null
          processo_id?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      lf_notificacoes: {
        Row: {
          data: string | null
          descricao: string | null
          id: string
          lida: boolean | null
          processo_id: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          data?: string | null
          descricao?: string | null
          id?: string
          lida?: boolean | null
          processo_id?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          data?: string | null
          descricao?: string | null
          id?: string
          lida?: boolean | null
          processo_id?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lf_notificacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "lf_processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          assunto: string | null
          autor: string | null
          created_at: string | null
          data_ultimo_movimento: string | null
          deleted_at: string | null
          dias_para_prazo: number | null
          id: string
          numero: string
          partes: string | null
          proxima_data_critica: string | null
          responsavel: string | null
          reu: string | null
          status: string | null
          status_prazo: string | null
          tribunal: string
          tribunal_sigla: string
          uf: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assunto?: string | null
          autor?: string | null
          created_at?: string | null
          data_ultimo_movimento?: string | null
          deleted_at?: string | null
          dias_para_prazo?: number | null
          id?: string
          numero: string
          partes?: string | null
          proxima_data_critica?: string | null
          responsavel?: string | null
          reu?: string | null
          status?: string | null
          status_prazo?: string | null
          tribunal: string
          tribunal_sigla: string
          uf?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assunto?: string | null
          autor?: string | null
          created_at?: string | null
          data_ultimo_movimento?: string | null
          deleted_at?: string | null
          dias_para_prazo?: number | null
          id?: string
          numero?: string
          partes?: string | null
          proxima_data_critica?: string | null
          responsavel?: string | null
          reu?: string | null
          status?: string | null
          status_prazo?: string | null
          tribunal?: string
          tribunal_sigla?: string
          uf?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lf_processos: {
        Row: {
          assunto: string | null
          autor: string | null
          created_at: string | null
          data_ultimo_movimento: string | null
          deleted_at: string | null
          dias_para_prazo: number | null
          id: string
          numero: string
          partes: string | null
          proxima_data_critica: string | null
          responsavel: string | null
          reu: string | null
          status: string | null
          status_prazo: string | null
          tribunal: string
          tribunal_sigla: string
          uf: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assunto?: string | null
          autor?: string | null
          created_at?: string | null
          data_ultimo_movimento?: string | null
          deleted_at?: string | null
          dias_para_prazo?: number | null
          id?: string
          numero: string
          partes?: string | null
          proxima_data_critica?: string | null
          responsavel?: string | null
          reu?: string | null
          status?: string | null
          status_prazo?: string | null
          tribunal: string
          tribunal_sigla: string
          uf?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assunto?: string | null
          autor?: string | null
          created_at?: string | null
          data_ultimo_movimento?: string | null
          deleted_at?: string | null
          dias_para_prazo?: number | null
          id?: string
          numero?: string
          partes?: string | null
          proxima_data_critica?: string | null
          responsavel?: string | null
          reu?: string | null
          status?: string | null
          status_prazo?: string | null
          tribunal?: string
          tribunal_sigla?: string
          uf?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          especialidade: string | null
          id: string
          nome_completo: string | null
          oab: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          especialidade?: string | null
          id: string
          nome_completo?: string | null
          oab?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          especialidade?: string | null
          id?: string
          nome_completo?: string | null
          oab?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lf_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          especialidade: string | null
          id: string
          nome_completo: string | null
          oab: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          especialidade?: string | null
          id: string
          nome_completo?: string | null
          oab?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          especialidade?: string | null
          id?: string
          nome_completo?: string | null
          oab?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          alerta_email: boolean | null
          alertas_criticos: boolean | null
          created_at: string | null
          id: string
          resumo_diario: boolean | null
          sync_interval_hours: number | null
          theme: string | null
          tribunais_favoritos: string[] | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
          whatsapp_numero: string | null
        }
        Insert: {
          alerta_email?: boolean | null
          alertas_criticos?: boolean | null
          created_at?: string | null
          id?: string
          resumo_diario?: boolean | null
          sync_interval_hours?: number | null
          theme?: string | null
          tribunais_favoritos?: string[] | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
          whatsapp_numero?: string | null
        }
        Update: {
          alerta_email?: boolean | null
          alertas_criticos?: boolean | null
          created_at?: string | null
          id?: string
          resumo_diario?: boolean | null
          sync_interval_hours?: number | null
          theme?: string | null
          tribunais_favoritos?: string[] | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
          whatsapp_numero?: string | null
        }
        Relationships: []
      }
      lf_user_preferences: {
        Row: {
          alerta_email: boolean | null
          alertas_criticos: boolean | null
          created_at: string | null
          id: string
          resumo_diario: boolean | null
          sync_interval_hours: number | null
          theme: string | null
          tribunais_favoritos: string[] | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
          whatsapp_numero: string | null
        }
        Insert: {
          alerta_email?: boolean | null
          alertas_criticos?: boolean | null
          created_at?: string | null
          id?: string
          resumo_diario?: boolean | null
          sync_interval_hours?: number | null
          theme?: string | null
          tribunais_favoritos?: string[] | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
          whatsapp_numero?: string | null
        }
        Update: {
          alerta_email?: boolean | null
          alertas_criticos?: boolean | null
          created_at?: string | null
          id?: string
          resumo_diario?: boolean | null
          sync_interval_hours?: number | null
          theme?: string | null
          tribunais_favoritos?: string[] | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
          whatsapp_numero?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      lf_user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["lf_app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["lf_app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["lf_app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lf_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["lf_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      lf_app_role: "admin" | "advogado" | "operacional"
      app_role: "admin" | "advogado" | "operacional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      lf_app_role: ["admin", "advogado", "operacional"],
      app_role: ["admin", "advogado", "operacional"],
    },
  },
} as const
