import { useState } from "react";
import { useFastAPIAdmin } from "@/hooks/useFastAPI";
import {
    Users,
    UserPlus,
    Mail,
    ShieldCheck,
    MoreVertical,
    Trash2,
    MailQuestion,
    Loader2,
    Scale
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function TeamManagement() {
    const { team, loading, inviteMember, fetchTeam } = useFastAPIAdmin();
    const [inviting, setInviting] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Advogado");

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setInviting(true);
        try {
            await inviteMember(email, role);
            toast({
                title: "Convite enviado!",
                description: `O convite para ${email} foi enviado com sucesso.`
            });
            setEmail("");
            await fetchTeam();
        } catch {
            toast({
                title: "Erro ao enviar convite",
                variant: "destructive"
            });
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header com Convite */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Convidar Profissional</h3>
                        <p className="text-xs text-muted-foreground">Adicione advogados ou administradores ao seu escritório</p>
                    </div>
                </div>

                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com.br"
                            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            required
                        />
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors sm:w-40"
                    >
                        <option value="Advogado">Advogado</option>
                        <option value="Admin">Administrador</option>
                        <option value="Estagiário">Estagiário</option>
                    </select>
                    <button
                        type="submit"
                        disabled={inviting || !email}
                        className="bg-primary text-primary-foreground text-sm font-medium px-6 py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Convidar
                    </button>
                </form>
            </div>

            {/* Lista de Membros */}
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Equipe do Escritório</h3>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 px-2 py-1 rounded">
                        {team.length} Membros
                    </span>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-xs text-muted-foreground">Carregando equipe...</p>
                        </div>
                    ) : team.length === 0 ? (
                        <div className="py-20 text-center">
                            <MailQuestion className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
                        </div>
                    ) : (
                        team.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                        {member.nome_completo?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">{member.nome_completo || member.email}</p>
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter border",
                                                member.role === 'Admin'
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {member.role || 'Advogado'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                        {member.oab && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Scale className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="text-[10px] text-muted-foreground">OAB {member.oab}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 text-[10px] text-saudavel font-medium">
                                            <div className="h-1 w-1 rounded-full bg-saudavel" />
                                            Ativo
                                        </div>
                                        <p className="text-[9px] text-muted-foreground mt-0.5">Entrou em Jan 2026</p>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem className="text-xs cursor-pointer flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" />
                                                Alterar Permissões
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-xs cursor-pointer text-urgente flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Remover do Escritório
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
