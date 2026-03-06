import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
const CHART_DATA = [
  { dia: "Seg", cumpridos: 3, risco: 1 },
  { dia: "Ter", cumpridos: 2, risco: 2 },
  { dia: "Qua", cumpridos: 4, risco: 0 },
  { dia: "Qui", cumpridos: 1, risco: 3 },
  { dia: "Sex", cumpridos: 5, risco: 1 },
  { dia: "Sáb", cumpridos: 2, risco: 0 },
  { dia: "Dom", cumpridos: 0, risco: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-card-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PrazoChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Prazos — Última Semana</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cumpridos vs em risco</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/80" />
            Cumpridos
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-urgente/80" />
            Em risco
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={CHART_DATA} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 18% 18%)" vertical={false} />
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215 16% 55%)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215 16% 55%)", fontSize: 11 }}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 18% 18% / 0.5)" }} />
          <Bar dataKey="cumpridos" name="Cumpridos" fill="hsl(214 72% 52% / 0.8)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="risco" name="Em risco" fill="hsl(0 72% 52% / 0.8)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
