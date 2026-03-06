import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Scale, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erro ao entrar", description: "Email ou senha incorretos.", variant: "destructive" });
      }
    } else {
      if (!nome) {
        toast({ title: "Nome obrigatório", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, nome);
      if (error) {
        toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Faça login para continuar." });
        setMode("login");
      }
    }
    setIsSubmitting(false);
  };

  const fillDemo = (type: "admin" | "adv1" | "adv2") => {
    const demos = {
      admin: { email: "admin@lexflow.com.br", password: "lexflow123" },
      adv1: { email: "maria@lexflow.com.br", password: "lexflow123" },
      adv2: { email: "joao@lexflow.com.br", password: "lexflow123" },
    };
    setEmail(demos[type].email);
    setPassword(demos[type].password);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex-col items-center justify-center p-12 border-r border-border">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Scale className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">LEX_FLOW</h1>
              <p className="text-xs text-muted-foreground">Sistema de Prazos Judiciais</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">
            Nunca mais perca um prazo processual
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Monitoramento inteligente de processos judiciais com cálculo automático de prazos,
            integração com DataJud e alertas em tempo real para todos os tribunais brasileiros.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Tribunais", value: "90+" },
              { label: "Precisão", value: "99.9%" },
              { label: "Alertas", value: "24/7" },
            ].map((s) => (
              <div key={s.label} className="bg-card/50 rounded-xl p-3 border border-border">
                <p className="text-lg font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-black text-xl text-foreground">LEX_FLOW</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Entre na sua conta para continuar" : "Preencha os dados para criar sua conta"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nome completo</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Dr. João Silva"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
            </button>
          </div>

          {/* Demo accounts */}
          {mode === "login" && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3">👋 Contas demo para testar:</p>
              <div className="space-y-2">
                {[
                  { label: "Admin", type: "admin" as const, desc: "admin@lexflow.com.br" },
                  { label: "Advogada Maria", type: "adv1" as const, desc: "maria@lexflow.com.br" },
                  { label: "Advogado João", type: "adv2" as const, desc: "joao@lexflow.com.br" },
                ].map((d) => (
                  <button
                    key={d.type}
                    onClick={() => fillDemo(d.type)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors text-left"
                  >
                    <span className="text-xs font-medium text-foreground">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{d.desc}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">* Crie essas contas primeiro clicando em "Criar agora"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
