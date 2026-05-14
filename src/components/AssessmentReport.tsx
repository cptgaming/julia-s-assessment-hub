import { useMemo, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Apple,
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Droplet,
  Flame,
  Gauge,
  HeartPulse,
  Moon,
  ShieldCheck,
  Sliders,
  Smile,
  Star,
  Target,
  TrendingUp,
  User,
  Zap,
  Brain,
} from "lucide-react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import bpsLogo from "@/assets/bps-logo.png";
import type { Assessment, AssessmentData, Level } from "@/lib/assessment-types";
import { LEVEL_LABEL, ZONAS } from "@/lib/assessment-types";
import { levelClasses } from "@/lib/level-styles";
import { cn } from "@/lib/utils";
import { LevelPicker } from "./LevelPicker";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Props = {
  assessment: Assessment;
  history?: Assessment[];
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
    <div className="mb-2.5 flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-brand-dark text-[10px] font-bold text-primary-foreground">
        {n}
      </span>
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-dark">{title}</h2>
      <div className="h-px flex-1 bg-brand-orange/35" />
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
        className={cn("min-h-[48px] resize-none border-dashed bg-transparent px-2 py-1 text-[10px]", className)}
      />
    );
  }

  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn("h-6 border-dashed bg-transparent px-2 text-[10px]", className)}
    />
  );
}

export function AssessmentReport({
  assessment,
  history = [],
  editable = false,
  fillHeight = false,
  onChange,
  onDataChange,
}: Props) {
  const d = assessment.data;
  const setData = (patch: Partial<AssessmentData>) => onDataChange?.(patch);
  const setMeta = (patch: Partial<Assessment>) => onChange?.(patch);

  const series = useMemo(() => {
    const items = history.slice(0, 3).reverse();
    if (items.length === 0) return [{ ...assessment }];
    return items;
  }, [history, assessment]);

  const fcSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fc_repouso.valor }));
  const sonoSeries = series.map((a) => {
    const horas = a.data.indicadores.qualidade_sono.horas;
    const match = horas.match(/(\d+)h\s*(\d+)?/);
    let score = 6;
    if (match) {
      const h = parseInt(match[1] || "0");
      const min = parseInt(match[2] || "0");
      const total = h + min / 60;
      score = Math.min(10, Math.round(total * 1.1));
    }
    return { x: shortDate(a.assessment_date), y: score };
  });
  const energiaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.energia.valor }));
  const fadigaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fadiga_nivel.valor }));

  return (
    <article
      id="bps-report"
      className={cn(
        "mx-auto grid w-[820px] grid-rows-[auto_auto_auto_auto_1fr_auto] gap-3 overflow-hidden bg-background px-7 py-6 text-foreground",
        fillHeight && "h-[1160px]",
      )}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="grid grid-cols-[152px_1fr_198px] items-start gap-4 border-b-2 border-brand-orange pb-3">
        <div className="flex h-full items-center justify-start">
          <img src={bpsLogo} alt="BPS Método Bioperformance System" className="h-16 w-auto object-contain" />
        </div>

        <div className="space-y-2 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[0.02em] text-brand-dark">
              RELATÓRIO DE <span className="text-brand-orange">AVALIAÇÃO</span>
            </h1>
            <div className="mt-1.5 h-1 w-28 rounded bg-brand-orange/70" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-border bg-card px-3 py-2 text-left text-[10px] leading-tight">
            <InfoField label="NOME DO ATLETA" editable={editable}>
              <EditableText
                value={assessment.athlete_name}
                editable={editable}
                onChange={(v) => setMeta({ athlete_name: v })}
                placeholder="Nome"
                className="font-semibold"
              />
            </InfoField>
            <InfoField label="IDADE" editable={editable}>
              {editable ? (
                <Input
                  type="number"
                  value={assessment.age ?? ""}
                  onChange={(e) => setMeta({ age: e.target.value ? Number(e.target.value) : null })}
                  className="h-6 w-16 border-dashed bg-transparent px-2 text-[10px]"
                />
              ) : (
                <span className="font-semibold">{assessment.age ?? "—"} anos</span>
              )}
            </InfoField>
            <InfoField label="MODALIDADE" editable={editable}>
              <EditableText
                value={assessment.modality}
                editable={editable}
                onChange={(v) => setMeta({ modality: v })}
                placeholder="Modalidade"
                className="font-semibold"
              />
            </InfoField>
            <InfoField label="DATA" editable={editable}>
              {editable ? (
                <Input
                  type="date"
                  value={assessment.assessment_date}
                  onChange={(e) => setMeta({ assessment_date: e.target.value })}
                  className="h-6 border-dashed bg-transparent px-2 text-[10px]"
                />
              ) : (
                <span className="font-semibold">{fmtDateSlash(assessment.assessment_date)}</span>
              )}
            </InfoField>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-border bg-card px-3 py-2 text-[10px] leading-tight">
          <MetaRow icon={ClipboardCheck} label="TIPO DE AVALIAÇÃO">
            <EditableText
              value={assessment.assessment_type}
              editable={editable}
              onChange={(v) => setMeta({ assessment_type: v })}
              className="font-semibold"
            />
          </MetaRow>
          <MetaRow icon={Calendar} label="DATA DA AVALIAÇÃO">
            <span className="font-semibold">{fmtDateSlash(assessment.assessment_date)}</span>
          </MetaRow>
          <MetaRow icon={User} label="AVALIADO POR">
            <div className="font-semibold">{assessment.evaluator_name}</div>
            <div className="text-muted-foreground">{assessment.evaluator_role}</div>
          </MetaRow>
        </div>
      </header>

      <section>
        <SectionTitle n={1} title="Diagnóstico Geral" />
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_180px] gap-2">
          {[
            { key: "estado_atual", label: "ESTADO ATUAL", icon: Activity, value: d.diagnostico.estado_atual },
            { key: "fadiga", label: "NÍVEL DE FADIGA", icon: Gauge, value: d.diagnostico.fadiga },
            { key: "risco_lesao", label: "RISCO DE LESÃO", icon: ShieldCheck, value: d.diagnostico.risco_lesao },
            { key: "evolucao", label: "EVOLUÇÃO", icon: TrendingUp, value: d.diagnostico.evolucao },
          ].map((c) => {
            const cls = levelClasses(c.value.level);
            const Icon = c.icon;
            return (
              <div key={c.key} className="rounded-md border border-border bg-card px-2.5 py-2 text-center shadow-sm">
                <Icon className={cn("mx-auto mb-1 h-4 w-4", cls.text)} />
                <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{c.label}</div>
                <div className={cn("mt-1 text-[13px] font-extrabold uppercase", cls.text)}>{LEVEL_LABEL[c.value.level]}</div>
                {editable && (
                  <div className="mt-1 flex justify-center">
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
                  className="mt-1 line-clamp-4 text-[9px] leading-[1.25] text-muted-foreground"
                />
              </div>
            );
          })}

          <div className="rounded-md border border-[var(--level-ideal)]/45 bg-[var(--level-ideal-soft)] px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-brand-dark">Resumo em uma frase</div>
            <EditableText
              value={d.diagnostico.resumo}
              editable={editable}
              multiline
              onChange={(v) => setData({ diagnostico: { ...d.diagnostico, resumo: v } })}
              className="mt-1 text-[10px] italic leading-[1.35] text-foreground"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1.06fr_0.94fr] gap-3">
        <div>
          <SectionTitle n={2} title="Indicadores-chave" />
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full table-fixed text-[9px] leading-tight">
              <thead className="bg-muted/60 text-brand-dark">
                <tr>
                  <th className="w-[128px] px-2 py-1.5 text-left font-bold">INDICADOR</th>
                  <th className="w-[88px] px-2 py-1.5 text-left font-bold">VALOR</th>
                  <th className="px-2 py-1.5 text-left font-bold">COMENTÁRIO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <IndicatorRow
                  icon={HeartPulse}
                  title="FC DE REPOUSO"
                  subtitle="(FC BASAL)"
                  value={
                    editable ? (
                      <>
                        <Input
                          type="number"
                          value={d.indicadores.fc_repouso.valor}
                          onChange={(e) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, valor: Number(e.target.value) } } })}
                          className="h-5 w-14 border-dashed bg-transparent px-1 text-[9px]"
                        />
                        <span> bpm</span>
                        <div className="mt-1 text-[8px] text-muted-foreground">
                          <Input
                            type="number"
                            value={d.indicadores.fc_repouso.delta}
                            onChange={(e) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, delta: Number(e.target.value) } } })}
                            className="inline-block h-4 w-10 border-dashed bg-transparent px-1 text-[8px]"
                          />
                          <span> vs última</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{d.indicadores.fc_repouso.valor} bpm</div>
                        <div className="text-[8px] text-muted-foreground">
                          {d.indicadores.fc_repouso.delta > 0 ? "+" : ""} {d.indicadores.fc_repouso.delta} vs última
                        </div>
                      </>
                    )
                  }
                  interpretation={
                    <EditableText
                      value={d.indicadores.fc_repouso.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, fc_repouso: { ...d.indicadores.fc_repouso, interpretacao: v } } })}
                      className="text-[9px]"
                    />
                  }
                />
                <IndicatorRow
                  icon={Moon}
                  title="QUALIDADE DO SONO"
                  value={
                    <>
                      <EditableText
                        value={d.indicadores.qualidade_sono.horas}
                        editable={editable}
                        onChange={(v) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, horas: v } } })}
                        className="text-[10px] font-bold"
                      />
                      <div className="mt-1">
                        <LevelInline
                          level={d.indicadores.qualidade_sono.level}
                          editable={editable}
                          onChange={(level) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, level } } })}
                        />
                      </div>
                    </>
                  }
                  interpretation={
                    <EditableText
                      value={d.indicadores.qualidade_sono.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, qualidade_sono: { ...d.indicadores.qualidade_sono, interpretacao: v } } })}
                      className="text-[9px]"
                    />
                  }
                />
                <IndicatorRow
                  icon={Zap}
                  title="NÍVEL DE ENERGIA"
                  value={
                    <>
                      <div className="font-bold">
                        {editable ? (
                          <Input
                            type="number"
                            value={d.indicadores.energia.valor}
                            onChange={(e) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, valor: Number(e.target.value) } } })}
                            className="inline-block h-5 w-10 border-dashed bg-transparent px-1 text-[9px]"
                          />
                        ) : (
                          d.indicadores.energia.valor
                        )}{" "}
                        / 10
                      </div>
                      <div className="mt-1">
                        <LevelInline
                          level={d.indicadores.energia.level}
                          editable={editable}
                          onChange={(level) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, level } } })}
                        />
                      </div>
                    </>
                  }
                  interpretation={
                    <EditableText
                      value={d.indicadores.energia.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, energia: { ...d.indicadores.energia, interpretacao: v } } })}
                      className="text-[9px]"
                    />
                  }
                />
                <IndicatorRow
                  icon={Flame}
                  title="NÍVEL DE FADIGA"
                  value={
                    <>
                      <div className="font-bold">
                        {editable ? (
                          <Input
                            type="number"
                            value={d.indicadores.fadiga_nivel.valor}
                            onChange={(e) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, valor: Number(e.target.value) } } })}
                            className="inline-block h-5 w-10 border-dashed bg-transparent px-1 text-[9px]"
                          />
                        ) : (
                          d.indicadores.fadiga_nivel.valor
                        )}{" "}
                        / 10
                      </div>
                      <div className="mt-1">
                        <LevelInline
                          level={d.indicadores.fadiga_nivel.level}
                          editable={editable}
                          onChange={(level) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, level } } })}
                        />
                      </div>
                    </>
                  }
                  interpretation={
                    <EditableText
                      value={d.indicadores.fadiga_nivel.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, fadiga_nivel: { ...d.indicadores.fadiga_nivel, interpretacao: v } } })}
                      className="text-[9px]"
                    />
                  }
                />
                <IndicatorRow
                  icon={Droplet}
                  title="HIDRATAÇÃO"
                  value={
                    <LevelInline
                      level={d.indicadores.hidratacao.level}
                      editable={editable}
                      onChange={(level) => setData({ indicadores: { ...d.indicadores, hidratacao: { ...d.indicadores.hidratacao, level } } })}
                      showLabel
                    />
                  }
                  interpretation={
                    <EditableText
                      value={d.indicadores.hidratacao.interpretacao}
                      editable={editable}
                      multiline
                      onChange={(v) => setData({ indicadores: { ...d.indicadores, hidratacao: { ...d.indicadores.hidratacao, interpretacao: v } } })}
                      className="text-[9px]"
                    />
                  }
                />
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionTitle n={3} title="Evolução dos indicadores" />
          <div className="grid grid-cols-2 gap-2">
            <MiniChart title="FC DE REPOUSO" data={fcSeries} color="oklch(0.72 0.19 50)" domain={[40, 70]} icon={HeartPulse} />
            <MiniChart title="QUALIDADE DO SONO" data={sonoSeries} color="oklch(0.65 0.15 230)" domain={[0, 10]} icon={Moon} />
            <MiniChart title="NÍVEL DE ENERGIA" data={energiaSeries} color="oklch(0.65 0.18 145)" domain={[0, 10]} icon={Zap} />
            <MiniChart title="NÍVEL DE FADIGA" data={fadigaSeries} color="oklch(0.6 0.22 25)" domain={[0, 10]} icon={Flame} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1.14fr_0.86fr] gap-3">
        <div>
          <SectionTitle n={4} title="Zonas de Treinamento Personalizadas" />
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full table-fixed text-[8.5px] leading-tight">
              <thead className="bg-muted/60 text-brand-dark">
                <tr>
                  <th className="w-[88px] px-1.5 py-1.5 text-left font-bold">ZONA</th>
                  <th className="w-[70px] px-1.5 py-1.5 text-left font-bold">% FC MÁX</th>
                  <th className="w-[70px] px-1.5 py-1.5 text-left font-bold">FAIXA</th>
                  <th className="w-[72px] px-1.5 py-1.5 text-left font-bold">PERCEPÇÃO</th>
                  <th className="px-1.5 py-1.5 text-left font-bold">FOCO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                      <td className="px-1.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("rounded px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground", colors[z.id])}>{z.id}</span>
                          <span className="font-semibold">{z.nome}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-1.5">{z.pct}</td>
                      <td className="px-1.5 py-1.5">{z.faixa} bpm</td>
                      <td className="px-1.5 py-1.5">{z.percep}</td>
                      <td className="px-1.5 py-1.5 text-muted-foreground">{z.foco}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionTitle n={5} title="Zona principal recomendada" />
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange-soft px-3 py-3">
            {editable ? (
              <select
                value={d.zona_recomendada.zona}
                onChange={(e) => setData({ zona_recomendada: { ...d.zona_recomendada, zona: e.target.value as typeof d.zona_recomendada.zona } })}
                className="w-full rounded border border-dashed border-border bg-transparent px-2 py-1 text-[16px] font-extrabold text-brand-orange"
              >
                <option>Z1 — RECUPERAÇÃO</option>
                <option>Z2 — BASE AERÓBICA</option>
                <option>Z3 — MODERADO</option>
                <option>Z4 — LIMIAR</option>
                <option>Z5 — VO2 MAX</option>
              </select>
            ) : (
              <div className="text-[19px] font-extrabold leading-tight text-brand-orange">{d.zona_recomendada.zona}</div>
            )}
            <EditableText
              value={d.zona_recomendada.descricao}
              editable={editable}
              multiline
              onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, descricao: v } })}
              className="mt-2 text-[10px] leading-[1.4] text-foreground"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px]">
              <div className="rounded border border-border/70 bg-card/70 px-2 py-1.5">
                <div className="font-bold uppercase text-brand-dark">Frequência</div>
                <EditableText
                  value={d.zona_recomendada.frequencia}
                  editable={editable}
                  onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, frequencia: v } })}
                  className="mt-0.5 font-medium"
                />
              </div>
              <div className="rounded border border-border/70 bg-card/70 px-2 py-1.5">
                <div className="font-bold uppercase text-brand-dark">Duração</div>
                <EditableText
                  value={d.zona_recomendada.duracao}
                  editable={editable}
                  onChange={(v) => setData({ zona_recomendada: { ...d.zona_recomendada, duracao: v } })}
                  className="mt-0.5 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-0 grid-cols-[0.96fr_1.04fr_0.92fr] gap-3">
        <div>
          <SectionTitle n={6} title="Estilo de Vida e Recuperação" />
          <div className="space-y-1.5 rounded-md border border-border bg-card p-2">
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
                <div key={row.key} className="space-y-1 text-[8.5px] leading-tight">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <Icon className={cn("h-3.5 w-3.5", cls.text)} />
                      <span className="font-semibold">{row.label}</span>
                    </div>
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
                    className="block w-full text-[8.5px] text-muted-foreground"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle n={7} title="Alertas e Observações" />
          <div className="grid h-full grid-rows-[auto_auto_auto_auto] gap-2">
            <AlertCard
              icon={AlertTriangle}
              title="Atenção"
              tone="warning"
              content={
                <EditableText
                  value={d.alertas.atencao}
                  editable={editable}
                  multiline
                  onChange={(v) => setData({ alertas: { ...d.alertas, atencao: v } })}
                  className="text-[9px] leading-[1.35]"
                />
              }
            />
            <AlertCard
              icon={CheckCircle2}
              title="Pontos Positivos"
              tone="success"
              content={
                <EditableText
                  value={d.alertas.pontos_positivos}
                  editable={editable}
                  multiline
                  onChange={(v) => setData({ alertas: { ...d.alertas, pontos_positivos: v } })}
                  className="text-[9px] leading-[1.35]"
                />
              }
            />
            <div className="flex h-[45px] flex-col overflow-hidden rounded-md border border-border bg-card p-2">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-dark">Observações</div>
              <EditableText
                value={d.alertas.observacoes}
                editable={editable}
                multiline
                onChange={(v) => setData({ alertas: { ...d.alertas, observacoes: v } })}
                placeholder="—"
                className="min-h-0 flex-1 overflow-hidden text-[9px] leading-[1.35] text-foreground"
              />
            </div>
            <div className="rounded-md border border-[var(--level-ideal)]/40 bg-[var(--level-ideal-soft)] px-2.5 py-2 text-[9px] leading-[1.35]">
              <span className="font-bold text-brand-dark">Análise:</span>{" "}
              {history.length >= 2
                ? "Tendência de melhora nos indicadores centrais, com melhor recuperação e estabilidade da carga interna."
                : "Aguardando novas avaliações para consolidar a leitura evolutiva dos indicadores."}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle n={8} title="Direcionamento e próximos passos" />
          <div className="grid content-start gap-2">
            <div className="rounded-md border border-border bg-card p-2 text-[9px]">
              <Row icon={Target} label="FOCO PRINCIPAL" value={d.direcionamento.foco_principal} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, foco_principal: v } })} compact />
              <Row icon={BarChart3} label="ESTRATÉGIA" value={d.direcionamento.estrategia} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, estrategia: v } })} compact />
              <Row icon={Sliders} label="AJUSTES" value={d.direcionamento.ajustes} editable={editable} onChange={(v) => setData({ direcionamento: { ...d.direcionamento, ajustes: v } })} compact />
            </div>

            <div className="rounded-md border border-border bg-card p-2 text-[9px]">
              <div className="mb-1 font-bold uppercase tracking-[0.08em] text-brand-dark">Recomendações práticas</div>
              <div className="space-y-1">
                {d.recomendacoes.map((rec, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-[var(--level-ideal)]" />
                    <EditableText
                      value={rec}
                      editable={editable}
                      multiline
                      onChange={(v) => {
                        const next = [...d.recomendacoes];
                        next[i] = v;
                        setData({ recomendacoes: next });
                      }}
                      className="text-[8.8px] leading-[1.28]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-2 text-[9px]">
              <div className="flex items-center gap-1.5 font-bold text-brand-dark">
                <Calendar className="h-3.5 w-3.5 text-brand-orange" />
                Próxima avaliação recomendada
              </div>
              {editable ? (
                <Input
                  type="date"
                  value={d.proximos_passos.proxima_avaliacao}
                  onChange={(e) => setData({ proximos_passos: { ...d.proximos_passos, proxima_avaliacao: e.target.value } })}
                  className="mt-1.5 h-6 border-dashed bg-transparent px-2 text-[10px]"
                />
              ) : (
                <div className="mt-1.5 text-[18px] font-extrabold leading-none text-brand-dark">{fmtDate(d.proximos_passos.proxima_avaliacao)}</div>
              )}
            </div>

            <div className="overflow-hidden rounded-md border border-brand-orange/35 bg-brand-orange-soft px-2 py-1.5 text-center">
              <Star className="mx-auto mb-0.5 h-3.5 w-3.5 text-brand-orange" />
              <EditableText
                value={d.proximos_passos.mensagem}
                editable={editable}
                multiline
                onChange={(v) => setData({ proximos_passos: { ...d.proximos_passos, mensagem: v } })}
                className="line-clamp-2 text-[9px] italic leading-[1.25]"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="grid grid-cols-[1fr_auto] items-end gap-4 border-t-2 border-brand-orange pt-3">
        <div className="flex items-start gap-2 text-[8px] leading-[1.4] text-muted-foreground">
          <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-orange" />
          <div>
            <div className="font-bold uppercase tracking-[0.08em] text-brand-dark">Importante</div>
            <div>
              Este relatório não substitui diagnóstico médico. Em caso de dúvidas ou sintomas,
              procure um profissional de saúde.
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-extrabold tracking-[0.35em] text-brand-dark">JC</div>
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-dark">Julia Costa</div>
          <div className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">Fisiologista do Exercício</div>
        </div>
      </footer>
    </article>
  );
}

function InfoField({
  label,
  children,
  editable,
}: {
  label: string;
  children: ReactNode;
  editable?: boolean;
}) {
  return (
    <div className={cn("space-y-0.5", editable && "min-h-[32px]")}>
      <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-brand-dark">{label}</div>
      <div className="text-[10px] leading-tight">{children}</div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
      <div className="min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-brand-dark">{label}</div>
        <div className="mt-0.5 text-[10px] leading-tight">{children}</div>
      </div>
    </div>
  );
}

function IndicatorRow({
  icon: Icon,
  title,
  subtitle,
  value,
  interpretation,
}: {
  icon: typeof HeartPulse;
  title: string;
  subtitle?: string;
  value: ReactNode;
  interpretation: ReactNode;
}) {
  return (
    <tr>
      <td className="px-2 py-1.5 align-top">
        <div className="flex items-start gap-1.5">
          <Icon className="mt-0.5 h-3.5 w-3.5 text-brand-orange" />
          <div>
            <div className="font-semibold leading-tight">{title}</div>
            {subtitle && <div className="text-[8px] text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
      </td>
      <td className="px-2 py-1.5 align-top font-medium">{value}</td>
      <td className="px-2 py-1.5 align-top text-muted-foreground">{interpretation}</td>
    </tr>
  );
}

function AlertCard({
  icon: Icon,
  title,
  tone,
  content,
}: {
  icon: typeof AlertTriangle;
  title: string;
  tone: "warning" | "success";
  content: ReactNode;
}) {
  const styles =
    tone === "warning"
      ? "border-[var(--level-atencao)]/40 bg-[var(--level-atencao-soft)]"
      : "border-[var(--level-ideal)]/40 bg-[var(--level-ideal-soft)]";
  const iconClass = tone === "warning" ? "text-[var(--level-atencao)]" : "text-[var(--level-ideal)]";

  return (
    <div className={cn("rounded-md border p-2", styles)}>
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4", iconClass)} />
        <div className="flex-1">
          <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-dark">{title}</div>
          {content}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  editable,
  onChange,
  compact = false,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-1.5", compact ? "mb-1.5 grid-cols-[96px_1fr] last:mb-0" : "grid-cols-[110px_1fr]")}>
      <div className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5 text-brand-orange" />
        <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-brand-dark">{label}</span>
      </div>
      <EditableText value={value} editable={editable} multiline onChange={onChange} className="text-[9px] leading-[1.3] text-muted-foreground" />
    </div>
  );
}

function LevelInline({
  level,
  editable,
  onChange,
  showLabel,
}: {
  level: Level;
  editable?: boolean;
  onChange?: (l: Level) => void;
  showLabel?: boolean;
}) {
  const cls = levelClasses(level);

  if (editable) {
    return <LevelPicker value={level} onChange={(l) => onChange?.(l)} />;
  }

  return (
    <div className="flex items-center gap-1">
      <span className={cn("inline-block h-2 w-2 rounded-full", cls.dot)} />
      <span className={cn(showLabel ? "text-[9px] font-semibold" : "text-[9px]", cls.text)}>{LEVEL_LABEL[level]}</span>
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
    <div className="rounded-md border border-border bg-card p-1.5">
      <div className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.04em] text-brand-dark">
        <Icon className="h-3 w-3" style={{ color }} />
        <span className="truncate">{title}</span>
      </div>
      <div className="h-[76px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
            <XAxis dataKey="x" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} />
            <YAxis domain={domain} tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={22} />
            <ReferenceLine y={domain[0]} stroke="transparent" />
            <Line
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={1.8}
              dot={{ r: 2.4, fill: color }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
