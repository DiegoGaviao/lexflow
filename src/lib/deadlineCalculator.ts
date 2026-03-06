import { addDays, isWeekend, format, isBefore, isAfter, parseISO } from "date-fns";

// Feriados federais brasileiros 2025 e 2026
const FERIADOS_FEDERAIS = [
  // 2025
  "2025-01-01", "2025-04-18", "2025-04-21", "2025-05-01",
  "2025-06-19", "2025-09-07", "2025-10-12", "2025-11-02",
  "2025-11-15", "2025-11-20", "2025-12-25",
  // 2026
  "2026-01-01", "2026-04-03", "2026-04-21", "2026-05-01",
  "2026-06-04", "2026-09-07", "2026-10-12", "2026-11-02",
  "2026-11-15", "2026-11-20", "2026-12-25",
];

// Recesso forense: 20/12 a 20/01
function isRecessoForense(date: Date): boolean {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();
  return (month === 12 && day >= 20) || (month === 1 && day <= 20);
}

function isFeriado(date: Date): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  return FERIADOS_FEDERAIS.includes(dateStr);
}

function isDiaUtil(date: Date): boolean {
  return !isWeekend(date) && !isFeriado(date) && !isRecessoForense(date);
}

export interface DeadlineResult {
  dataFinal: string;
  diasUteis: number;
  feriadosExcluidos: string[];
  suspensoes: { periodo: string; motivo: string }[];
}

export function calculateDeadline(
  dataInicio: string,
  diasPrazo: number,
): DeadlineResult {
  const start = parseISO(dataInicio);
  const feriadosExcluidos: string[] = [];
  const suspensoes: Array<{ periodo: string; motivo: string }> = [];

  let diasUteisContados = 0;
  let current = addDays(start, 1); // Prazo conta a partir do dia seguinte
  let recessoStart: Date | null = null;

  while (diasUteisContados < diasPrazo) {
    if (isRecessoForense(current)) {
      if (!recessoStart) recessoStart = current;
    } else {
      if (recessoStart) {
        suspensoes.push({
          periodo: `${format(recessoStart, "dd/MM/yyyy")} - ${format(addDays(current, -1), "dd/MM/yyyy")}`,
          motivo: "Recesso forense (art. 220 CPC)",
        });
        recessoStart = null;
      }

      if (isWeekend(current)) {
        // skip silently
      } else if (isFeriado(current)) {
        feriadosExcluidos.push(format(current, "dd/MM/yyyy"));
      } else {
        diasUteisContados++;
      }
    }

    if (diasUteisContados < diasPrazo) {
      current = addDays(current, 1);
    }
  }

  // If deadline falls on non-working day, advance to next business day
  while (!isDiaUtil(current)) {
    current = addDays(current, 1);
  }

  return {
    dataFinal: format(current, "yyyy-MM-dd"),
    diasUteis: diasPrazo,
    feriadosExcluidos,
    suspensoes,
  };
}

export function calcularDiasRestantes(dataFinal: string): number {
  const hoje = new Date();
  const prazo = parseISO(dataFinal);
  let dias = 0;
  let current = addDays(hoje, 1);
  const goingForward = isBefore(hoje, prazo);

  if (!goingForward) return 0;

  while (isBefore(current, prazo) || format(current, "yyyy-MM-dd") === format(prazo, "yyyy-MM-dd")) {
    if (isDiaUtil(current)) dias++;
    if (format(current, "yyyy-MM-dd") === format(prazo, "yyyy-MM-dd")) break;
    current = addDays(current, 1);
  }
  return dias;
}

export function getStatusPrazo(diasRestantes: number | null): "urgente" | "atencao" | "saudavel" | "vencido" {
  if (diasRestantes === null) return "saudavel";
  if (diasRestantes < 0) return "vencido";
  if (diasRestantes <= 5) return "urgente";
  if (diasRestantes <= 10) return "atencao";
  return "saudavel";
}
