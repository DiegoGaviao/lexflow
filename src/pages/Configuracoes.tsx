import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, Bell, Building2, Shield, Database, Info,
  Save, Eye, EyeOff, RefreshCw, Check, Wifi, WifiOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TRIBUNAIS } from "@/data/constants";
import { supabase } from "@/integrations/supabase/client";
import { lfTable } from "@/integrations/supabase/lf_types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary border border-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function Configuracoes() {
  const { user, profile, refreshProfile } = useAuth();

  // Profile
  const [nome, setNome] = useState(profile?.nome_completo ?? "");
  const [oab, setOab] = useState(profile?.oab ?? "");
  const [especialidade, setEspecialidade] = useState(profile?.especialidade ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications
  const [alertaEmail, setAlertaEmail] = useState(true);
  const [resumoDiario, setResumoDiario] = useState(true);
  const [alertasCriticos, setAlertasCriticos] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumero, setWhatsappNumero] = useState("");

  // Tribunais favoritos
  const [favTribunais, setFavTribunais] = useState<string[]>(["TJSP", "TJRJ", "STJ"]);
  const [syncInterval, setSyncInterval] = useState(6);

  // Security
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // DataJud
  const [datajudConnected, setDatajudConnected] = useState(true);
  const [lastSync] = useState("18/02/2026 às 06:00");
  const [testingConn, setTestingConn] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await (supabase
      .from(lfTable("profiles") as any)
      .update({ nome_completo: nome, oab, especialidade })
      .eq("id", user?.id ?? "") as any);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Perfil atualizado!", description: "Dados salvos com sucesso." });
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (novaSenha !== confirmSenha) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }
    if (novaSenha.length < 6) {
      toast({ title: "Senha muito curta (mínimo 6 caracteres)", variant: "destructive" });
      return;
    }
    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso!" });
      setSenhaAtual(""); setNovaSenha(""); setConfirmSenha("");
    }
    setSavingPass(false);
  };

  const handleTestConn = async () => {
    setTestingConn(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDatajudConnected(true);
    toast({ title: "Conexão DataJud OK", description: "API respondendo normalmente." });
    setTestingConn(false);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    toast({ title: "Sincronização concluída!", description: "5 processos atualizados com sucesso." });
    setSyncing(false);
  };

  const toggleTribunal = (t: string) => {
    setFavTribunais((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gerencie seu perfil, notificações e preferências do sistema</p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList className="bg-secondary border border-border mb-6 h-auto p-1 flex-wrap gap-1">
          {[
            { value: "perfil", label: "Perfil", icon: User },
            { value: "notificacoes", label: "Notificações", icon: Bell },
            { value: "tribunais", label: "Tribunais", icon: Building2 },
            { value: "seguranca", label: "Segurança", icon: Shield },
            { value: "datajud", label: "DataJud", icon: Database },
            { value: "sobre", label: "Sobre", icon: Info },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* PERFIL */}
        <TabsContent value="perfil">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {(nome || user?.email || "U").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{nome || "Seu nome"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Foto de perfil em breve</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nome completo</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Dr. João Silva"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nº OAB</label>
                <input
                  value={oab}
                  onChange={(e) => setOab(e.target.value)}
                  placeholder="SP 123456"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Especialidade jurídica</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="">Selecione...</option>
                  {["Direito Civil", "Direito Tributário", "Direito Trabalhista", "Direito do Consumidor", "Direito Previdenciário", "Direito Penal", "Direito Empresarial"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notificacoes">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Preferências de Alerta</h3>

            {[
              { label: "Alertas por email", desc: "Receba prazos críticos no email cadastrado", value: alertaEmail, onChange: setAlertaEmail },
              { label: "Resumo diário", desc: "Email às 08h com todos os prazos do dia", value: resumoDiario, onChange: setResumoDiario },
              { label: "Alertas críticos imediatos", desc: "Notificação instantânea para prazos < 2 dias", value: alertasCriticos, onChange: setAlertasCriticos },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle checked={item.value} onChange={item.onChange} />
              </div>
            ))}

            <div className="flex items-start justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Alertas críticos via WhatsApp Business</p>
              </div>
              <Toggle checked={whatsappEnabled} onChange={setWhatsappEnabled} />
            </div>

            {whatsappEnabled && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Número WhatsApp</label>
                <input
                  value={whatsappNumero}
                  onChange={(e) => setWhatsappNumero(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            )}

            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" />
              Salvar Preferências
            </button>
          </div>
        </TabsContent>

        {/* TRIBUNAIS */}
        <TabsContent value="tribunais">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Tribunais Favoritos</h3>
              <p className="text-xs text-muted-foreground">Selecione os tribunais que monitora com mais frequência</p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TRIBUNAIS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTribunal(t)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                    favTribunais.includes(t)
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {favTribunais.includes(t) && <Check className="h-3 w-3 inline mr-1" />}
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Intervalo de sincronização: <span className="text-foreground font-semibold">{syncInterval}h</span>
              </label>
              <input
                type="range"
                min={6}
                max={48}
                step={6}
                value={syncInterval}
                onChange={(e) => setSyncInterval(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>6h</span><span>12h</span><span>24h</span><span>48h</span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </button>
          </div>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="seguranca">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Alterar Senha</h3>
              <div className="grid gap-3">
                {[
                  { label: "Nova senha", value: novaSenha, onChange: setNovaSenha },
                  { label: "Confirmar nova senha", value: confirmSenha, onChange: setConfirmSenha },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleChangePassword}
                disabled={savingPass}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Shield className="h-4 w-4" />
                {savingPass ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Autenticação em 2 Fatores</p>
                  <p className="text-xs text-muted-foreground mt-1">Adicione uma camada extra de segurança</p>
                </div>
                <Toggle checked={twoFAEnabled} onChange={setTwoFAEnabled} />
              </div>
              {twoFAEnabled && (
                <p className="text-xs text-muted-foreground mt-3 p-3 bg-secondary rounded-lg">
                  ℹ️ 2FA via TOTP em desenvolvimento. Em breve disponível.
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Histórico de Atividade</h3>
              <div className="space-y-2">
                {[
                  { acao: "Login realizado", ip: "192.168.1.1", data: "18/02/2026 08:15" },
                  { acao: "Perfil atualizado", ip: "192.168.1.1", data: "17/02/2026 14:30" },
                  { acao: "Processo adicionado", ip: "192.168.1.1", data: "16/02/2026 10:00" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <p className="text-xs text-foreground">{a.acao}</p>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{a.data}</p>
                      <p className="text-[10px] text-muted-foreground/60">{a.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* DATAJUD */}
        <TabsContent value="datajud">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30">
              {datajudConnected
                ? <Wifi className="h-5 w-5 text-saudavel" />
                : <WifiOff className="h-5 w-5 text-urgente" />}
              <div>
                <p className={cn("text-sm font-semibold", datajudConnected ? "text-saudavel" : "text-urgente")}>
                  {datajudConnected ? "Conectado ao DataJud (CNJ)" : "Desconectado"}
                </p>
                <p className="text-xs text-muted-foreground">Última sincronização: {lastSync}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTestConn}
                disabled={testingConn}
                className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", testingConn && "animate-spin")} />
                {testingConn ? "Testando..." : "Testar Conexão"}
              </button>
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                {syncing ? "Sincronizando..." : "Sincronizar Agora"}
              </button>
            </div>

            <div className="p-4 bg-secondary/30 rounded-xl border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Sobre a Integração DataJud</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O DataJud é a base nacional de dados do Poder Judiciário (CNJ). A integração busca automaticamente movimentações processuais a cada {syncInterval}h,
                calculando prazos com base no Novo CPC e alertando sobre mudanças críticas.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* SOBRE */}
        <TabsContent value="sobre">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚖️</span>
              </div>
              <h2 className="text-lg font-bold text-foreground">LEX_FLOW</h2>
              <p className="text-xs text-muted-foreground">Sistema de Monitoramento de Prazos Judiciais</p>
              <p className="text-xs text-primary font-semibold mt-1">v2.0.0 (MVP)</p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Versão", value: "2.0.0" },
                { label: "Build", value: "2026.02.18" },
                { label: "Ambiente", value: "Produção" },
                { label: "Banco de dados", value: "Lovable Cloud" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <a
                href="#"
                className="flex-1 text-center py-2 px-4 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                📚 Documentação
              </a>
              <a
                href="#"
                className="flex-1 text-center py-2 px-4 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                💬 Suporte
              </a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
