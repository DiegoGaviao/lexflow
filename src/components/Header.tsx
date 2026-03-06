import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Search, ChevronDown, Sun, Moon, LogOut, User, Settings, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { useProcessos } from "@/hooks/useProcessos";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";

type Theme = "dark" | "light";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [datajudResult, setDatajudResult] = useState<any>(null);
  const [datajudLoading, setDatajudLoading] = useState(false);
  const [datajudError, setDatajudError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { notificacoes, unreadCount } = useNotificacoes();
  const { processos, addProcesso } = useProcessos();

  const displayName = profile?.nome_completo || user?.email?.split("@")[0] || "Usuário";
  const initials = getInitials(profile?.nome_completo || user?.email);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // CNJ pattern detection
  const isCNJ = (q: string) => /^\d{7}-?\d{2}\.?\d{4}\.?\d\.?\d{2}\.?\d{4}$/.test(q.replace(/\s/g, ""));

  const searchDataJud = useCallback(async (cnj: string) => {
    if (!cnj) return;

    // Pequeno delay para garantir que o estado de loading apareceu
    setDatajudLoading(true);
    setDatajudError(null);
    setDatajudResult(null);

    console.log("🚀 Iniciando Busca Direta para:", cnj);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consulta-datajud`;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'apikey': key
        },
        body: JSON.stringify({ numero_cnj: cnj })
      });

      console.log("📡 Resposta recebida. Status:", response.status);

      if (!response.ok) {
        const errData = await response.json();
        console.error("❌ Erro da Função:", errData);
        if (response.status === 404) {
          setDatajudError("Processo não encontrado no DataJud.");
        } else {
          setDatajudError(errData.error || "Erro ao consultar o tribunal.");
        }
        return;
      }

      const data = await response.json();
      console.log("✅ Dados carregados com sucesso!");
      setDatajudResult(data);

    } catch (e: any) {
      console.error("🔥 Exceção Fatal na Busca:", e);
      setDatajudError("Falha crítica na conexão. Verifique sua internet.");
    } finally {
      setDatajudLoading(false);
    }
  }, []);

  // Debounce DataJud search when query looks like CNJ
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || !isCNJ(searchQuery)) {
      setDatajudResult(null);
      setDatajudError(null);
      setDatajudLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchDataJud(searchQuery);
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, searchDataJud]);

  const handleAddFromDataJud = async () => {
    if (!datajudResult) return;
    try {
      await addProcesso({
        numero: datajudResult.numero,
        tribunal: datajudResult.tribunal,
        tribunal_sigla: datajudResult.tribunal_sigla,
        assunto: datajudResult.assunto,
        autor: datajudResult.autor,
        reu: datajudResult.reu,
        uf: datajudResult.uf,
        movimentacoes: datajudResult.movimentacoes,
      });
      toast({ title: "Processo adicionado!", description: `${datajudResult.numero} cadastrado com sucesso.` });
      setCommandOpen(false);
      setSearchQuery("");
      setDatajudResult(null);
    } catch (e: any) {
      toast({ title: "Erro ao adicionar", description: e.message, variant: "destructive" });
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logout realizado", description: "Até logo!" });
    navigate("/login");
  };

  const handleCommandSelect = (processoId: string) => {
    setCommandOpen(false);
    navigate(`/processos/${processoId}`);
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30">
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">Buscar processo, cliente...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-2xs font-mono text-muted-foreground">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={toggleTheme} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }} className="relative h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-[18px] w-[18px] rounded-full bg-urgente text-urgente-foreground text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-11 w-80 glass rounded-xl shadow-card-lg z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold">Notificações</p>
                  <span className="badge-urgente px-2 py-0.5 rounded-md text-xs font-bold">{unreadCount} novas</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                  {notificacoes.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-muted-foreground text-center">Sem notificações</p>
                  ) : notificacoes.slice(0, 5).map((n) => (
                    <div key={n.id} className={cn("px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors", !n.lida && "bg-primary/5")}>
                      <div className="flex items-start gap-2">
                        {!n.lida ? <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" /> : <span className="h-2 w-2 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{n.titulo}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{n.descricao}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(n.data), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border/50">
                  <button onClick={() => { navigate("/notificacoes"); setShowNotif(false); }} className="text-xs text-primary hover:underline font-medium">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
              <div className="h-6 w-6 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{initials}</span>
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:inline">{displayName}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-11 w-48 glass rounded-xl shadow-card-lg z-50 overflow-hidden animate-fade-in">
                <div className="px-3 py-2.5 border-b border-border/50">
                  <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate("/configuracoes"); setShowUserMenu(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Meu Perfil
                  </button>
                  <button onClick={() => { navigate("/configuracoes"); setShowUserMenu(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Configurações
                  </button>
                  <div className="border-t border-border/50 my-1" />
                  <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-urgente hover:bg-urgente/10 transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {(showNotif || showUserMenu) && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowUserMenu(false); }} />
        )}
      </header>

      <CommandDialog open={commandOpen} onOpenChange={(open) => { setCommandOpen(open); if (!open) { setSearchQuery(""); setDatajudResult(null); setDatajudError(null); } }}>
        <CommandInput placeholder="Buscar por CNJ, parte ou assunto..." value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList>
          {!datajudLoading && !datajudResult && !datajudError && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}

          {/* Local results */}
          {processos.length > 0 && (
            <CommandGroup heading="Processos cadastrados">
              {processos.map((p) => (
                <CommandItem key={p.id} value={`${p.numero} ${p.partes} ${p.assunto}`} onSelect={() => handleCommandSelect(p.id)}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{p.numero}</span>
                    <span className="text-sm font-medium">{p.assunto}</span>
                    <span className="text-xs text-muted-foreground">{p.partes}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* DataJud loading */}
          {datajudLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground italic">Consultando DataJud...</p>
                <p className="text-[10px] mt-1 opacity-70">O Tribunal pode levar até 60s para responder.</p>
              </div>
            </div>
          )}

          {/* DataJud error */}
          {datajudError && !datajudLoading && (
            <div className="py-4 px-4 text-center text-sm text-muted-foreground">
              {datajudError}
            </div>
          )}

          {/* DataJud result */}
          {datajudResult && !datajudLoading && (
            <CommandGroup heading="Resultado DataJud (CNJ)">
              <CommandItem value={`datajud-${datajudResult.numero}`} onSelect={handleAddFromDataJud}>
                <div className="flex items-center gap-3 w-full">
                  <Plus className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground">{datajudResult.numero}</span>
                    <span className="text-sm font-medium truncate">{datajudResult.assunto}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {datajudResult.tribunal} • {[datajudResult.autor, datajudResult.reu].filter(Boolean).join(" × ")}
                    </span>
                  </div>
                  <span className="text-[10px] text-primary font-medium shrink-0">Adicionar</span>
                </div>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
