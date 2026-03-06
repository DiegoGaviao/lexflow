import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  BarChart3,
  Calendar,
  Settings,
  Scale,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  FolderOpen,
  Hash,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Processos", href: "/processos", icon: Briefcase },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Notificações", href: "/notificacoes", icon: Bell, badge: 3 },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Admin", href: "/admin", icon: Shield },
];

interface ListItem {
  id: string;
  label: string;
  color: string;
  count: number;
}

const INITIAL_LISTS: ListItem[] = [
  { id: "1", label: "VIP", color: "bg-list-vip", count: 4 },
  { id: "2", label: "Trabalhista", color: "bg-list-trabalhista", count: 12 },
  { id: "3", label: "Urgente", color: "bg-list-urgente", count: 3 },
];

const INITIAL_SEARCHES: string[] = [
  "0000001-34.2025.8.26",
  "0007823-91.2024.8.19",
  "0023456-78.2024.8.13",
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const displayName = profile?.nome_completo || user?.email?.split("@")[0] || "Usuário";
  const initials = getInitials(profile?.nome_completo || user?.email);
  const [listsOpen, setListsOpen] = useState(true);
  const [lists, setLists] = useState<ListItem[]>(INITIAL_LISTS);
  const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_SEARCHES);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logout realizado", description: "Até logo!" });
    navigate("/login");
  };

  const handleRenameList = (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (list) {
      setEditingListId(id);
      setEditingName(list.label);
    }
  };

  const commitRename = () => {
    if (editingListId && editingName.trim()) {
      setLists((prev) =>
        prev.map((l) => (l.id === editingListId ? { ...l, label: editingName.trim() } : l))
      );
      toast({ title: "Lista renomeada" });
    }
    setEditingListId(null);
    setEditingName("");
  };

  const handleDeleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Lista removida" });
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out",
        collapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border h-12", collapsed ? "px-2 justify-center" : "px-4 gap-2.5")}>
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary shrink-0">
          <Scale className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-xs tracking-wide text-foreground">LEX_FLOW</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 px-1.5 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-100",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.badge && collapsed && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-urgente" />
                )}
              </div>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-2xs font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Minhas Listas */}
        {!collapsed && (
          <div className="pt-4">
            <button
              onClick={() => setListsOpen(!listsOpen)}
              className="flex items-center justify-between w-full px-2.5 mb-1"
            >
              <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Minhas Listas
              </span>
              <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform duration-150", listsOpen && "rotate-90")} />
            </button>
            {listsOpen && (
              <div className="space-y-0.5">
                {lists.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                    <FolderOpen className="h-5 w-5 text-muted-foreground/30" strokeWidth={1.5} />
                    <p className="text-2xs text-muted-foreground/50">Nenhuma lista criada</p>
                  </div>
                ) : lists.map((list) => (
                  <div key={list.id} className="flex items-center group">
                    {editingListId === list.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => e.key === "Enter" && commitRename()}
                        className="flex-1 bg-secondary border border-primary/30 rounded px-2.5 py-[5px] text-[13px] text-foreground outline-none"
                      />
                    ) : (
                      <button className="flex items-center gap-2.5 flex-1 rounded-md px-2.5 py-[6px] text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors duration-100">
                        <span className={cn("list-dot", list.color)} />
                        <span className="truncate">{list.label}</span>
                        <span className="ml-auto text-2xs text-muted-foreground">{list.count}</span>
                      </button>
                    )}
                    {editingListId !== list.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-sidebar-accent/60 text-muted-foreground hover:text-foreground transition-all mr-0.5">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => handleRenameList(list.id)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteList(list.id)} className="text-urgente focus:text-urgente">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
                <button className="flex items-center gap-2 w-full rounded-md px-2.5 py-[6px] text-[13px] text-muted-foreground hover:text-sidebar-foreground transition-colors duration-100">
                  <FolderPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Nova lista...</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buscas Recentes */}
        {!collapsed && (
          <div className="pt-4">
            <span className="flex items-center gap-1.5 px-2.5 mb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Search className="h-3 w-3" />
              Buscas Recentes
            </span>
            <div className="space-y-0.5">
              {recentSearches.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                  <Search className="h-5 w-5 text-muted-foreground/30" strokeWidth={1.5} />
                  <p className="text-2xs text-muted-foreground/50">Nenhuma busca recente</p>
                </div>
              ) : recentSearches.map((cnj) => (
                <button
                  key={cnj}
                  className="flex items-center gap-2 w-full rounded-md px-2.5 py-[5px] text-[12px] font-mono text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors duration-100 truncate"
                >
                  <Hash className="h-3 w-3 shrink-0 opacity-50" />
                  <span className="truncate">{cnj}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border py-2 px-1.5 space-y-0.5">
        <NavLink
          to="/configuracoes"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-100",
            location.pathname === "/configuracoes"
              ? "bg-sidebar-accent text-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Configurações" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Configurações</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-100 w-full text-muted-foreground hover:text-urgente hover:bg-urgente-bg",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Sair</span>}
        </button>

        {/* User */}
        <div className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 mt-0.5", collapsed && "justify-center px-0")}>
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-2xs font-bold text-primary">{initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{displayName}</p>
              <p className="text-2xs text-muted-foreground leading-none">Advogado(a)</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="px-2.5 pt-2 pb-1 text-[10px] text-muted-foreground/30 text-center font-mono uppercase tracking-tighter">
            v1.0.4-FUNC-FIX
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
