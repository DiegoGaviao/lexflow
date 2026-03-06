import { useState, useRef } from "react";
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon, Download,
  FileText, Filter, Calendar, Loader2, FileSpreadsheet, Inbox,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useProcessos } from "@/hooks/useProcessos";
import { TRIBUNAIS } from "@/data/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";

const MONTHLY_DATA = [
  { mes: "Ago", cumpridos: 18, perdidos: 2, taxa: 90 },
  { mes: "Set", cumpridos: 22, perdidos: 1, taxa: 96 },
  { mes: "Out", cumpridos: 15, perdidos: 3, taxa: 83 },
  { mes: "Nov", cumpridos: 25, perdidos: 0, taxa: 100 },
  { mes: "Dez", cumpridos: 10, perdidos: 1, taxa: 91 },
  { mes: "Jan", cumpridos: 20, perdidos: 2, taxa: 91 },
  { mes: "Fev", cumpridos: 16, perdidos: 1, taxa: 94 },
];

const STATUS_EVOLUCAO = [
  { mes: "Out", urgente: 3, atencao: 5, saudavel: 12, vencido: 1 },
  { mes: "Nov", urgente: 2, atencao: 4, saudavel: 15, vencido: 0 },
  { mes: "Dez", urgente: 4, atencao: 6, saudavel: 10, vencido: 1 },
  { mes: "Jan", urgente: 1, atencao: 3, saudavel: 18, vencido: 0 },
  { mes: "Fev", urgente: 2, atencao: 2, saudavel: 14, vencido: 0 },
];

const COLORS_STATUS: Record<string, string> = {
  urgente: "hsl(var(--urgente))",
  atencao: "hsl(var(--atencao))",
  saudavel: "hsl(var(--saudavel))",
  vencido: "hsl(var(--muted-foreground))",
};

export default function Relatorios() {
  const { processos, loading } = useProcessos();
  const [filterTribunal, setFilterTribunal] = useState("todos");
  const [filterResponsavel, setFilterResponsavel] = useState("todos");
  const [dataInicio, setDataInicio] = useState("2025-08-01");
  const [dataFim, setDataFim] = useState("2026-03-31");
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const responsaveis = useMemo(() => [...new Set(processos.map((p) => p.responsavel))], [processos]);

  const tribunalData = useMemo(() => {
    const map: Record<string, number> = {};
    processos.forEach((p) => {
      map[p.tribunal_sigla] = (map[p.tribunal_sigla] || 0) + 1;
    });
    const colors = ["hsl(var(--primary))", "hsl(var(--atencao))", "hsl(var(--saudavel))", "hsl(var(--urgente))", "#8b5cf6", "hsl(var(--muted-foreground))"];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [processos]);

  const riscoData = useMemo(() => {
    return processos.map((p) => ({
      numero: p.numero.slice(0, 14) + "...",
      dias: p.dias_para_prazo ?? 0,
      status: p.status_prazo,
    })).sort((a, b) => a.dias - b.dias);
  }, [processos]);

  const stats = useMemo(() => [
    { label: "Total Processos", value: String(processos.length), icon: "📋", color: "text-primary" },
    { label: "Urgentes", value: String(processos.filter((p) => p.status_prazo === "urgente").length), icon: "🔴", color: "text-urgente" },
    { label: "Saudáveis", value: String(processos.filter((p) => p.status_prazo === "saudavel").length), icon: "🟢", color: "text-saudavel" },
    { label: "Responsáveis", value: String(responsaveis.length), icon: "👥", color: "text-atencao" },
  ], [processos, responsaveis]);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

      doc.setFillColor(37, 99, 200);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("⚖ LEX_FLOW", 14, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema de Monitoramento de Prazos Judiciais", 14, 20);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Analytics", 14, 34);

      let y = 50;
      processos.sort((a, b) => (a.dias_para_prazo ?? 999) - (b.dias_para_prazo ?? 999)).forEach((p, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(`${p.numero} | ${p.tribunal_sigla} | ${p.assunto?.slice(0, 30)} | ${p.responsavel} | ${p.dias_para_prazo ?? "—"}d`, 14, y);
        y += 6;
      });

      const pageH = doc.internal.pageSize.getHeight();
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(`Gerado por LEX_FLOW em ${now}`, 14, pageH - 5);
      doc.save(`lexflow-relatorio-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF gerado com sucesso!" });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setExportingPDF(false);
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      const data = processos.map((p) => ({
        "Número": p.numero, "Tribunal": p.tribunal_sigla, "Assunto": p.assunto,
        "Autor": p.autor, "Réu": p.reu, "Responsável": p.responsavel,
        "Status Prazo": p.status_prazo, "Dias Restantes": p.dias_para_prazo ?? "—",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Processos");
      XLSX.writeFile(wb, `lexflow-relatorio-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast({ title: "Excel exportado!" });
    } catch {
      toast({ title: "Erro ao exportar Excel", variant: "destructive" });
    }
    setExportingExcel(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in" ref={reportRef}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Relatórios & Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Análise completa do desempenho do escritório</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} disabled={exportingPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
            {exportingPDF ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {exportingPDF ? "Gerando PDF..." : "Exportar PDF"}
          </button>
          <button onClick={handleExportExcel} disabled={exportingExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-saudavel/20 border border-saudavel/30 text-xs font-medium text-saudavel hover:bg-saudavel/30 transition-colors disabled:opacity-50">
            {exportingExcel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
            {exportingExcel ? "Exportando..." : "Exportar Excel"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={filterTribunal} onChange={(e) => setFilterTribunal(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none">
          <option value="todos">Todos os tribunais</option>
          {TRIBUNAIS.slice(0, 15).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none">
          <option value="todos">Todos os responsáveis</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {processos.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Inbox className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum dado para exibir</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Taxa de Cumprimento (%)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="taxa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Taxa %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-atencao" /> Evolução por Status
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={STATUS_EVOLUCAO}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="saudavel" stackId="1" stroke={COLORS_STATUS.saudavel} fill={COLORS_STATUS.saudavel} fillOpacity={0.3} name="Saudável" />
                  <Area type="monotone" dataKey="atencao" stackId="1" stroke={COLORS_STATUS.atencao} fill={COLORS_STATUS.atencao} fillOpacity={0.3} name="Atenção" />
                  <Area type="monotone" dataKey="urgente" stackId="1" stroke={COLORS_STATUS.urgente} fill={COLORS_STATUS.urgente} fillOpacity={0.3} name="Urgente" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {tribunalData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-primary" /> Distribuição por Tribunal
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={tribunalData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {tribunalData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {riscoData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-urgente" /> Processos por Urgência
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={riscoData.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="numero" type="category" width={100} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="dias" name="Dias restantes">
                      {riscoData.slice(0, 10).map((entry, i) => <Cell key={i} fill={COLORS_STATUS[entry.status] || COLORS_STATUS.saudavel} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
