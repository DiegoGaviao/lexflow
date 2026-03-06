import * as React from "react"
import { Search, Command as CommandIcon, ArrowRight, Scale } from "lucide-react"
import { PROCESSOS_MOCK } from "@/data/mockData"

export function CommandPalette({
    open,
    onOpenChange,
    items,
    onSelect
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: any[];
    onSelect: (item: any) => void;
}) {
    const [search, setSearch] = React.useState("")

    // Use provided items or fallback to mock for demo/offline purposes
    const allItems = React.useMemo(() => {
        return items.length > 0 ? items : PROCESSOS_MOCK;
    }, [items]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onOpenChange(!open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [open, onOpenChange])

    if (!open) return null

    const filteredItems = allItems.filter(item =>
        item.numero.toLowerCase().includes(search.toLowerCase()) ||
        item.assunto.toLowerCase().includes(search.toLowerCase()) ||
        item.partes.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8)

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div
                className="fixed inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative w-full max-w-xl bg-card border border-border/50 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 glass">
                <div className="flex items-center px-5 py-4 border-b border-border/30">
                    <Search className="h-5 w-5 text-primary mr-4" />
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/40 uppercase tracking-widest"
                        placeholder="O QUE VOCÊ PROCURA?"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-muted/50 px-2 font-mono text-[10px] font-bold text-muted-foreground opacity-100">
                            ESC
                        </kbd>
                    </div>
                </div>

                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredItems.length > 0 ? (
                        <div className="space-y-1">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item)
                                        onOpenChange(false)
                                        setSearch("")
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/10 transition-all text-left group border border-transparent hover:border-primary/20"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/40 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                                            <Scale className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-mono font-bold text-muted-foreground/60">{item.numero}</span>
                                            </div>
                                            <p className="text-xs font-black text-foreground uppercase tracking-tight truncate">{item.assunto}</p>
                                            <p className="text-[10px] text-muted-foreground/60 truncate font-semibold">{item.partes}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <CommandIcon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">Nenhum resultado localizado</p>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-border/20 bg-muted/20 flex items-center justify-between">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-black">↑↓</kbd>
                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Navegar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-black">↵</kbd>
                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Selecionar</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                        <Scale className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">LEX_FLOW INTELLIGENCE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
