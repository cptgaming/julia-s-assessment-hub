import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Gauge,
  ShieldCheck,
  TrendingUp,
  HeartPulse,
  Moon,
  Zap,
  Flame,
  Droplet,
  Apple,
  Brain,
  Smile,
  Target,
  BarChart3,
  Sliders,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Star,
  ClipboardCheck,
  User,
} from "lucide-react";
import bpsLogo from "@/assets/bps-logo.png";
import type { Assessment, AssessmentData, Level } from "@/lib/assessment-types";
import { LEVEL_LABEL, ZONAS } from "@/lib/assessment-types";
import { levelClasses } from "@/lib/level-styles";
import { LevelPicker } from "./LevelPicker";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  assessment: Assessment;
  history?: Assessment[]; // up to 3 (most recent first) including current
  editable?: boolean;
  fillHeight?: boolean;
  onChange?: (patch: Partial<Assessment>) => void;
  onDataChange?: (patch: Partial<AssessmentData>) => void;
};

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const fmtDateSlash = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d} / ${m} / ${y}`;
};

const shortDate = (iso: string) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-dark text-xs font-bold text-white">
        {n}
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">{title}</h2>
      <div className="h-px flex-1 bg-brand-orange/40" />
    </div>
  );
}

function EditableText({
  value,
  onChange,
  editable,
  multiline,
  className,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}) {
  if (!editable) {
    return <span className={className}>{value || placeholder || "—"}</span>;
  }
  if (multiline) {
    return (
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn("min-h-[60px] resize-none border-dashed bg-transparent text-xs", className)}
      />
    );
  }
  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn("h-7 border-dashed bg-transparent px-2 text-xs", className)}
    />
  );
}

export function AssessmentReport({
  assessment,
  history = [],
  editable = false,
  onChange,
  onDataChange,
}: Props) {
  const d = assessment.data;
  const setData = (patch: Partial<AssessmentData>) => onDataChange?.(patch);
  const setMeta = (patch: Partial<Assessment>) => onChange?.(patch);

  // Up to 3 most recent (oldest -> newest) for charts
  const series = useMemo(() => {
    const items = history.slice(0, 3).reverse();
    if (items.length === 0) return [{ ...assessment }];
    return items;
  }, [history, assessment]);

  const fcSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fc_repouso.valor }));
  const sonoSeries = series.map((a) => {
    // Convert "Xh Ymin" to a 0-10 score-like number; if not parseable, fall back to a heuristic by level
    const horas = a.data.indicadores.qualidade_sono.horas;
    const m = horas.match(/(\d+)h\s*(\d+)?/);
    let score = 6;
    if (m) {
      const h = parseInt(m[1] || "0");
      const min = parseInt(m[2] || "0");
      const total = h + min / 60;
      score = Math.min(10, Math.round(total * 1.1));
    }
    return { x: shortDate(a.assessment_date), y: score };
  });
  const energiaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.energia.valor }));
  const fadigaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fadiga_nivel.valor }));

  return (
    <div
      id="bps-report"
      className="mx-auto w-[820px] bg-background p-8 text-foreground"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* HEADER */}
      <header className="mb-6 grid grid-cols-[180px_1fr_220px] items-center gap-4 border-b-2 border-brand-orange pb-4">
        <img src={bpsLogo} alt="BPS Método Bioperformance System" className="h-20 w-auto object-contain" />
        <div className="text-center">
          <h1 className="text-3xl font-extrabold leading-none tracking-tight text-brand-dark">
            RELATÓRIO DE
          </h1>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-orange">
            AVALIAÇÃO
          </h1>
          <div className="mx-auto mt-1 h-1 w-24 rounded bg-brand-orange/60" />
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border border-border bg-card px-4 py-2 text-left text-xs">
            <div>
              <span className="font-bold text-brand-dark">NOME DO ATLETA: </span>
              <EditableText
                value={assessment.athlete_name}
                editable={editable}
                onChange={(v) => setMeta({ athlete_name: v })}
                placeholder="Nome"
              />
            </div>
            <div>
              <span className="font-bold text-brand-dark">IDADE: </span>
              {editable ? (
                <Input
                  type="number"
                  value={assessment.age ?? ""}
                  onChange={(e) => setMeta({ age: e.target.value ? Number(e.target.value) : null })}
                  className="inline-block h-6 w-20 border-dashed bg-transparent px-2 text-xs"
                />
              ) : (
                <span>{assessment.age ?? "—"} anos</span>
              )}
            </div>
            <div>
              <span className="font-bold text-brand-dark">MODALIDADE: </span>
              <EditableText
                value={assessment.modality}
                editable={editable}
                onChange={(v) => setMeta({ modality: v })}
                placeholder="Modalidade"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
            <div>
              <div className="font-bold text-brand-dark">DATA DA AVALIAÇÃO:</div>
              {editable ? (
                <Input
                  type="date"
                  value={assessment.assessment_date}
                  onChange={(e) => setMeta({ assessment_date: e.target.value })}
                  className="h-6 border-dashed bg-transparent px-2 text-xs"
                />
              ) : (
                <div>{fmtDateSlash(assessment.assessment_date)}</div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
            <div>
              <div className="font-bold text-brand-dark">TIPO DE AVALIAÇÃO:</div>
              <EditableText
                value={assessment.assessment_type}
                editable={editable}
                onChange={(v) => setMeta({ assessment_type: v })}
              />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
            <div>
              <div className="font-bold text-brand-dark">AVALIADO POR:</div>
              <div>{assessment.evaluator_name}</div>
              <div className="text-muted-foreground">{assessment.evaluator_role}</div>
              <div className="text-muted-foreground">{assessment.evaluator_cref}</div>
            </div>
          </div>
        </div>
      </header>

      {/* 1. DIAGNOSTICO GERAL */}
      <section className="mb-5">
        <SectionTitle n={1} title="Diagnóstico Geral" />
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: "estado_atual", label: "ESTADO ATUAL", icon: Activity, value: d.diagnostico.estado_atual },
            { key: "fadiga", label: "NÍVEL DE FADIGA", icon: Gauge, value: d.diagnostico.fadiga },
            { key: "risco_lesao", label: "RISCO DE LESÃO", icon: ShieldCheck, value: d.diagnostico.risco_lesao },
            { key: "evolucao", label: "EVOLUÇÃO", icon: TrendingUp, value: d.diagnostico.evolucao },
          ].map((c) => {
            const cls = levelClasses(c.value.level);
            const Icon = c.icon;
            return (
              <div key={c.key} className="rounded-lg border border-border bg-card p-3 text-center">
                <Icon className={cn("mx-auto mb-1 h-5 w-5", cls.text)} />
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </div>
                <div className={cn("my-1 text-base font-extrabold uppercase", cls.text)}>
                  {LEVEL_LABEL[c.value.level]}
                </div>
                {editable && (
                  <div className="mb-1 flex justify-center">
                    <LevelPicker
                      value={c.value.level}
                      onChange={(level) =>
                        setData({
                          diagnostico: {
                            ...d.diagnostico,
                            [c.key]: { ...c.value, level },
                          } as typeof d.diagnostico,
                        })
                      }
                    />
                  </div>
                )}
                <EditableText
                  value={c.value.descricao}
                  editable={editable}
                  multiline
                  onChange={(v) =>
                    setData({
                      diagnostico: {
                        ...d.diagnostico,
                        [c.key]: { ...c.value, descricao: v },
                      } as typeof d.diagnostico,
                    })
                  }
                  className="text-[10px] leading-tight text-muted-foreground"
                />
              </div>
            );
          })}
          <div className="rounded-lg border border-[var(--level-ideal)]/40 bg-[var(--level-ideal-soft)] p-3">
            <div className="text-[10px] font-bold uppercase text-brand-dark">Resumo em uma frase</div>
            <div className="mt-1 text-[10px] italic leading-snug text-foreground">
              <EditableText
                value={d.diagnostico.resumo}
                editable={editable}
                multiline
                onChange={(v) => setData({ diagnostico: { ...d.diagnostico, resumo: v } })}
                className="text-[10px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2 + 3 INDICADORES + EVOLUCAO */}
      <section className="mb-5 grid grid-cols-2 gap-4">
        <div>
          <SectionTitle n={2} title="Indicadores-chave" />
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-[10px]">
              <thead className="bg-muted/60 text-brand-dark">
                <tr>
                  <th className="p-2 text-left font-bold">INDICADOR</th>
                  <th className="p-2 text-left font-bold">VALOR ATUAL</th>
                  <th className="p-2 text-left font-bold">INTERPRETAÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                <tr>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="h-4 w-4 text-brand-orange" />
                      <span className="font-semibold">FC DE REPOUSO<br /><span className="text-[9px] text-muted-foreground">(FC BASAL)</span></span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold">
                      {editable ? (
                        <Input
                          type="number"
                          value={d.indicadores.fc_repouso.valor}
                          onChange={(e) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, valor: Number(e.target.value) } } })}
                          className="inline-block h-6 w-16 border-dashed bg-transparent px-1 text-xs"
                        />
                      ) : (
                        d.indicadores.fc_repouso.valor
                      )} bpm
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {editable ? (
                        <Input
                          type="number"
                          value={d.indicadores.fc_repouso.delta}
                          onChange={(e) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, delta: Number(e.target.value) } } })}
                          className="inline-block h-5 w-14 border-dashed bg-transparent px-1 text-[9px]"
                        />
                      ) : (
                        <>{d.indicadores.fc_repouso.delta > 0 ? "▲" : "▼"} {Math.abs(d.indicadores.fc_repouso.delta)}</>
                      )}
                      <div>vs última avaliação</div>
                    </div>
                  </td>
                  <td className="p-2 text-muted-foreground">
                    <EditableText
                      value={d.indicadores.fc_repouso.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, interpretacao: v } } })}
                      className="text-[10px]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Moon className="h-4 w-4 text-[var(--level-estavel)]" />
                      <span className="font-semibold">QUALIDADE DO SONO</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <EditableText
                      value={d.indicadores.qualidade_sono.horas}
                      editable={editable}
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, horas: v } } })}
                      className="text-xs font-bold"
                    />
                    <LevelInline
                      level={d.indicadores.qualidade_sono.level}
                      editable={editable}
                      onChange={(level) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, level } } })}
                    />
                  </td>
                  <td className="p-2 text-muted-foreground">
                    <EditableText
                      value={d.indicadores.qualidade_sono.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, interpretacao: v } } })}
                      className="text-[10px]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-[var(--level-atencao)]" />
                      <span className="font-semibold">NÍVEL DE ENERGIA</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold">
                      {editable ? (
                        <Input type="number" value={d.indicadores.energia.valor} onChange={(e) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, valor: Number(e.target.value) } } })} className="inline-block h-6 w-12 border-dashed bg-transparent px-1 text-xs" />
                      ) : (
                        d.indicadores.energia.valor
                      )} / 10
                    </div>
                    <LevelInline
                      level={d.indicadores.energia.level}
                      editable={editable}
                      onChange={(level) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, level } } })}
                    />
                  </td>
                  <td className="p-2 text-muted-foreground">
                    <EditableText
                      value={d.indicadores.energia.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, interpretacao: v } } })}
                      className="text-[10px]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-[var(--level-critico)]" />
                      <span className="font-semibold">NÍVEL DE FADIGA</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold">
                      {editable ? (
                        <Input type="number" value={d.indicadores.fadiga_nivel.valor} onChange={(e) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, valor: Number(e.target.value) } } })} className="inline-block h-6 w-12 border-dashed bg-transparent px-1 text-xs" />
                      ) : (
                        d.indicadores.fadiga_nivel.valor
                      )} / 10
                    </div>
                    <LevelInline
                      level={d.indicadores.fadiga_nivel.level}
                      editable={editable}
                      onChange={(level) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, level } } })}
                    />
                  </td>
                  <td className="p-2 text-muted-foreground">
                    <EditableText
                      value={d.indicadores.fadiga_nivel.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, interpretacao: v } } })}
                      className="text-[10px]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Droplet className="h-4 w-4 text-[var(--level-estavel)]" />
                      <span className="font-semibold">HIDRATAÇÃO</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <LevelInline
                      level={d.indicadores.hidratacao.level}
                      editable={editable}
                      onChange={(level) => setData({ indicadores: { ...d.indicadores, hidratacao: { ...d.indicadores.hidratacao, level } } })}
                      showLabel
                    />
                  </td>
                  <td className="p-2 text-muted-foreground">
                    <EditableText
                      value={d.indicadores.hidratacao.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, hidratacao: { ...d.indicadores.hidratacao, interpretacao: v } } })}
                      className="text-[10px]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionTitle n={3} title="Evolução dos indicadores" />
          <div className="grid grid-cols-2 gap-2">
            <MiniChart title="FC DE REPOUSO (bpm)" data={fcSeries} color="oklch(0.72 0.19 50)" domain={[40, 70]} icon={HeartPulse} />
            <MiniChart title="QUALIDADE DO SONO (0-10)" data={sonoSeries} color="oklch(0.65 0.15 230)" domain={[0, 10]} icon={Moon} />
            <MiniChart title="NÍVEL DE ENERGIA (0-10)" data={energiaSeries} color="oklch(0.65 0.18 145)" domain={[0, 10]} icon={Zap} />
            <MiniChart title="NÍVEL DE FADIGA (0-10)" data={fadigaSeries} color="oklch(0.6 0.22 25)" domain={[0, 10]} icon={Flame} />
          </div>
          <div className="mt-2 rounded border border-border bg-[var(--level-ideal-soft)] px-2 py-1 text-[10px]">
            <span className="font-bold">📋 Análise:</span>{" "}
            {history.length >= 2 ? "Tendência de melhora em todos os indicadores." : "Aguardando mais avaliações para análise de tendência."}
          </div>
        </div>
      </section>

      {/* 4. ZONAS */}
      <section className="mb-5">
        <SectionTitle n={4} title="Zonas de Treinamento Personalizadas" />
        <div className="grid grid-cols-[1fr_240px] gap-3">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-[10px]">
              <thead className="bg-muted/60 text-brand-dark">
                <tr>
                  <th className="p-1.5 text-left font-bold">ZONA</th>
                  <th className="p-1.5 text-left font-bold">% DA FC MÁX</th>
                  <th className="p-1.5 text-left font-bold">FAIXA (bpm)</th>
                  <th className="p-1.5 text-left font-bold">PERCEPÇÃO</th>
                  <th className="p-1.5 text-left font-bold">FOCO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {ZONAS.map((z) => {
                  const colors: Record<string, string> = {
                    Z1: "bg-[var(--level-estavel)]",
                    Z2: "bg-[var(--level-ideal)]",
                    Z3: "bg-[var(--level-atencao)]",
                    Z4: "bg-brand-orange",
                    Z5: "bg-[var(--level-critico)]",
                  };
                  return (
                    <tr key={z.id}>
                      <td className="p-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold text-white", colors[z.id])}>{z.id}</span>
                          <span className="font-semibold">{z.nome}</span>
                        </div>
                      </td>
                      <td className="p-1.5">{z.pct}</td>
                      <td className="p-1.5">{z.faixa}</td>
                      <td className="p-1.5">{z.percep}</td>
                      <td className="p-1.5 text-muted-foreground">{z.foco}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-brand-orange/40 bg-brand-orange-soft p-3">
            <div className="text-[10px] font-bold uppercase text-brand-dark">Zona principal recomendada</div>
            {editable ? (
              <select
                value={d.zona_recomendada.zona}
                onChange={(e) => setData({ zona_recomendada: { ...d.zona_recomendada, zona: e.target.value as typeof d.zona_recomendada.zona } })}
                className="mt-1 w-full rounded border border-dashed border-border bg-transparent px-1 py-0.5 text-base font-extrabold text-brand-orange"
              >
                <option>Z1 — RECUPERAÇÃO</option>
                <option>Z2 — BASE AERÓBICA</option>
                <option>Z3 — MODERADO</option>
                <option>Z4 — LIMIAR</option>
                <option>Z5 — VO2 MAX</option>
              </select>
            ) : (
              <div className="my-1 text-base font-extrabold text-brand-orange">{d.zona_recomendada.zona}</div>
            )}
            <EditableText
              value={d.zona_recomendada.descricao}
              editable={editable}
              multiline
              onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, descricao: v } })}
              className="text-[10px] text-foreground"
            />
            <div className="mt-2 space-y-0.5 text-[10px]">
              <div>
                <span className="font-bold">Frequência sugerida:</span>{" "}
                <EditableText
                  value={d.zona_recomendada.frequencia}
                  editable={editable}
                  onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, frequencia: v } })}
                  className="text-[10px]"
                />
              </div>
              <div>
                <span className="font-bold">Duração sugerida:</span>{" "}
                <EditableText
                  value={d.zona_recomendada.duracao}
                  editable={editable}
                  onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, duracao: v } })}
                  className="text-[10px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 + 6 ESTILO + ALERTAS */}
      <section className="mb-5 grid grid-cols-2 gap-4">
        <div>
          <SectionTitle n={5} title="Estilo de Vida e Recuperação" />
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-2">
            {[
              { key: "sono", label: "SONO", icon: Moon },
              { key: "estresse", label: "ESTRESSE", icon: Brain },
              { key: "alimentacao", label: "ALIMENTAÇÃO", icon: Apple },
              { key: "hidratacao", label: "HIDRATAÇÃO", icon: Droplet },
              { key: "recuperacao", label: "RECUPERAÇÃO", icon: Smile },
            ].map((row) => {
              const v = (d.estilo_vida as Record<string, { level: Level; descricao: string }>)[row.key];
              const Icon = row.icon;
              const cls = levelClasses(v.level);
              return (
                <div key={row.key} className="grid grid-cols-[100px_110px_1fr] items-start gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-4 w-4", cls.text)} />
                    <span className="font-semibold">{row.label}</span>
                  </div>
                  <div>
                    <LevelInline
                      level={v.level}
                      editable={editable}
                      onChange={(level) =>
                        setData({
                          estilo_vida: { ...d.estilo_vida, [row.key]: { ...v, level } } as typeof d.estilo_vida,
                        })
                      }
                      showLabel
                    />
                  </div>
                  <EditableText
                    value={v.descricao}
                    editable={editable}
                    multiline
                    onChange={(text) =>
                      setData({
                        estilo_vida: { ...d.estilo_vida, [row.key]: { ...v, descricao: text } } as typeof d.estilo_vida,
                      })
                    }
                    className="text-muted-foreground"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle n={6} title="Alertas e Observações" />
          <div className="space-y-2">
            <div className="rounded-lg border border-[var(--level-atencao)]/40 bg-[var(--level-atencao-soft)] p-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--level-atencao)]" />
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase">Atenção</div>
                  <EditableText
                    value={d.alertas.atencao}
                    editable={editable}
                    multiline
                    onChange={(v) => setData({ alertas: { ...d.alertas, atencao: v } })}
                    className="text-[10px] text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--level-ideal)]/40 bg-[var(--level-ideal-soft)] p-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--level-ideal)]" />
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase">Pontos Positivos</div>
                  <EditableText
                    value={d.alertas.pontos_positivos}
                    editable={editable}
                    multiline
                    onChange={(v) => setData({ alertas: { ...d.alertas, pontos_positivos: v } })}
                    className="text-[10px] text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-2">
              <div className="text-[10px] font-bold uppercase">Observações</div>
              <EditableText
                value={d.alertas.observacoes}
                editable={editable}
                multiline
                onChange={(v) => setData({ alertas: { ...d.alertas, observacoes: v } })}
                placeholder="—"
                className="text-[10px] text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7 + 8 + 9 */}
      <section className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <SectionTitle n={7} title="Direcionamento Estratégico" />
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-2 text-[10px]">
            <Row icon={Target} label="FOCO PRINCIPAL" value={d.direcionamento.foco_principal} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, foco_principal: v } })} />
            <Row icon={BarChart3} label="ESTRATÉGIA" value={d.direcionamento.estrategia} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, estrategia: v } })} />
            <Row icon={Sliders} label="AJUSTES" value={d.direcionamento.ajustes} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, ajustes: v } })} />
          </div>
        </div>
        <div>
          <SectionTitle n={8} title="Recomendações Práticas" />
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-2 text-[10px]">
            {d.recomendacoes.map((rec, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--level-ideal)]" />
                <EditableText
                  value={rec}
                  editable={editable}
                  multiline
                  onChange={(v) => {
                    const next = [...d.recomendacoes];
                    next[i] = v;
                    setData({ recomendacoes: next });
                  }}
                  className="flex-1 text-[10px]"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle n={9} title="Próximos Passos" />
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-card p-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-orange" />
                <span className="font-bold">Próxima avaliação recomendada:</span>
              </div>
              {editable ? (
                <Input
                  type="date"
                  value={d.proximos_passos.proxima_avaliacao}
                  onChange={(e) => setData({ proximos_passos: { ...d.proximos_passos, proxima_avaliacao: e.target.value } })}
                  className="mt-1 h-6 border-dashed bg-transparent px-2 text-xs"
                />
              ) : (
                <div className="mt-1 text-base font-extrabold text-brand-dark">{fmtDate(d.proximos_passos.proxima_avaliacao)}</div>
              )}
            </div>
            <div className="rounded-lg border border-brand-orange/30 bg-brand-orange-soft p-2 text-center text-[10px] italic">
              <Star className="mx-auto mb-1 h-4 w-4 text-brand-orange" />
              <EditableText
                value={d.proximos_passos.mensagem}
                editable={editable}
                multiline
                onChange={(v) => setData({ proximos_passos: { ...d.proximos_passos, mensagem: v } })}
                className="text-[10px] italic"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-4 flex items-end justify-between border-t-2 border-brand-orange pt-3">
        <div className="flex items-start gap-2 text-[9px]">
          <Star className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
          <div>
            <div className="font-bold uppercase text-brand-dark">Importante</div>
            <div className="text-muted-foreground">
              Este relatório não substitui diagnóstico médico.<br />
              Em caso de dúvidas ou sintomas, procure um profissional de saúde.
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-extrabold tracking-widest text-brand-dark">JC</div>
          <div className="text-sm font-bold uppercase tracking-wider text-brand-dark">Julia Costa</div>
          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Fisiologista do Exercício</div>
        </div>
      </footer>
    </div>
  );
}

function Row({ icon: Icon, label, value, editable, onChange }: { icon: typeof Target; label: string; value: string; editable?: boolean; onChange?: (v: string) => void }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-brand-orange" />
        <span className="font-semibold">{label}</span>
      </div>
      <EditableText value={value} editable={editable} multiline onChange={onChange} className="text-muted-foreground" />
    </div>
  );
}

function LevelInline({ level, editable, onChange, showLabel }: { level: Level; editable?: boolean; onChange?: (l: Level) => void; showLabel?: boolean }) {
  const cls = levelClasses(level);
  if (editable) {
    return <LevelPicker value={level} onChange={(l) => onChange?.(l)} />;
  }
  return (
    <div className="flex items-center gap-1">
      <span className={cn("inline-block h-2 w-2 rounded-full", cls.dot)} />
      {showLabel && <span className={cn("text-[10px] font-semibold", cls.text)}>{LEVEL_LABEL[level]}</span>}
      {!showLabel && <span className={cn("text-[10px]", cls.text)}>{LEVEL_LABEL[level]}</span>}
    </div>
  );
}

function MiniChart({
  title,
  data,
  color,
  domain,
  icon: Icon,
}: {
  title: string;
  data: { x: string; y: number }[];
  color: string;
  domain: [number, number];
  icon: typeof HeartPulse;
}) {
  return (
    <div className="rounded border border-border bg-card p-1.5">
      <div className="mb-1 flex items-center gap-1 text-[9px] font-bold text-brand-dark">
        <Icon className="h-3 w-3" style={{ color }} />
        {title}
      </div>
      <div className="h-[70px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="x" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis domain={domain} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={domain[0]} stroke="transparent" />
            <Line
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              isAnimationActive={false}
              label={{ position: "top", fontSize: 9, fill: "hsl(var(--foreground))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
