import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Shield, Briefcase, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { lf_profiles, lf_user_roles, lf_processos, lfTable } from "@/integrations/supabase/lf_types";

interface UserProfile {
  id: string;
  nome_completo: string | null;
  oab: string | null;
  especialidade: string | null;
  email?: string;
  role?: string;
  processos_count?: number;
}

export default function Admin() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalProcessos: 0, totalNotifs: 0 });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    // Fetch profiles (admin can see all via RLS)
    const { data: profiles } = await (supabase.from(lfTable("profiles") as any).select("*") as any);
    const { data: roles } = await (supabase.from(lfTable("user_roles") as any).select("*") as any);
    const { data: processos } = await (supabase.from(lfTable("processos") as any).select("id, user_id") as any);

    const profilesTyped = (profiles as lf_profiles[]) || [];
    const rolesTyped = (roles as lf_user_roles[]) || [];
    const procsTyped = (processos as Pick<lf_processos, 'id' | 'user_id'>[]) || [];

    const roleMap: Record<string, string> = {};
    rolesTyped.forEach((r) => { roleMap[r.user_id] = r.role; });

    const procCountMap: Record<string, number> = {};
    procsTyped.forEach((p) => {
      procCountMap[p.user_id] = (procCountMap[p.user_id] || 0) + 1;
    });

    const mapped: UserProfile[] = profilesTyped.map((p) => ({
      id: p.id,
      nome_completo: p.nome_completo,
      oab: p.oab,
      especialidade: p.especialidade,
      role: roleMap[p.id] || "advogado",
      processos_count: procCountMap[p.id] || 0,
    }));

    setUsers(mapped);
    setStats({
      totalUsers: mapped.length,
      totalProcessos: ((processos as any[]) || []).length,
      totalNotifs: 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await (supabase
      .from(lfTable("user_roles") as any)
      .update({ role: newRole as any })
      .eq("user_id", userId) as any);
    if (error) {
      toast({ title: "Erro ao atualizar role", variant: "destructive" });
    } else {
      toast({ title: "Role atualizado!" });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  if (role !== "admin") {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
        <Shield className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gerenciamento de usuários e visão geral do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Usuários", value: stats.totalUsers, color: "text-primary" },
          { icon: Briefcase, label: "Processos Total", value: stats.totalProcessos, color: "text-saudavel" },
          { icon: Shield, label: "Administradores", value: users.filter((u) => u.role === "admin").length, color: "text-atencao" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Usuários do Sistema</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Usuário</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OAB</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Especialidade</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Processos</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-2xs font-bold text-primary">
                          {(u.nome_completo || "?").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{u.nome_completo || "Sem nome"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{u.oab || "—"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{u.especialidade || "—"}</td>
                  <td className="px-5 py-3 text-xs font-medium text-foreground">{u.processos_count}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role || "advogado"}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-md border transition-colors",
                        u.role === "admin" ? "bg-primary/10 border-primary/20 text-primary" :
                          u.role === "operacional" ? "bg-atencao/10 border-atencao/20 text-atencao" :
                            "bg-saudavel/10 border-saudavel/20 text-saudavel"
                      )}
                    >
                      <option value="admin">Admin</option>
                      <option value="advogado">Advogado</option>
                      <option value="operacional">Operacional</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
