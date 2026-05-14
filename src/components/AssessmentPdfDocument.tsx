import { Document, Page, Text, View, Image, StyleSheet, Svg, Polyline, Line as SvgLine, Circle, Font } from "@react-pdf/renderer";
import bpsLogo from "@/assets/logo-bps.jpeg";
import juliaLogo from "@/assets/logo-julia.jpeg";
import runnerLogo from "@/assets/logo-runner.jpeg";
import type { Assessment, Level } from "@/lib/assessment-types";
import { LEVEL_LABEL, ZONAS } from "@/lib/assessment-types";

// Emoji support via Twemoji (renders emoji as inline images in the PDF).
Font.registerEmojiSource({
  format: "png",
  url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/",
});

// === Colors ===
const C = {
  orange: "#E8772E",
  orangeSoft: "#FCE9D9",
  dark: "#1F2A37",
  text: "#1F2A37",
  muted: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  bg: "#FAFAF7",
  critico: "#D9534F",
  criticoSoft: "#FBE6E5",
  atencao: "#E8A53A",
  atencaoSoft: "#FBEDD2",
  estavel: "#4A90E2",
  estavelSoft: "#DCEAF7",
  ideal: "#3FA776",
  idealSoft: "#DCEFE3",
};

const levelColor = (l: Level) => ({
  critico: { fg: C.critico, bg: C.criticoSoft },
  atencao: { fg: C.atencao, bg: C.atencaoSoft },
  estavel: { fg: C.estavel, bg: C.estavelSoft },
  ideal: { fg: C.ideal, bg: C.idealSoft },
}[l]);

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

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 18,
    paddingBottom: 10,
    fontSize: 8,
    color: C.text,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },
  // Header
  header: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: C.orange,
    paddingBottom: 4,
    marginLeft: -18,
    marginRight: -18,
    paddingRight: 18,
    marginBottom: 5,
    alignItems: "flex-start",
  },
  headerCol: { flexDirection: "column" },
  logoBox: { width: 130, justifyContent: "flex-start", alignItems: "flex-start" },
  logo: { width: 130, height: 78, objectFit: "contain" },
  titleBox: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 4 },
  titleSmall: { fontSize: 12, fontWeight: 700, color: C.dark, letterSpacing: 0.4 },
  titleBig: { fontSize: 16, fontWeight: 700, color: C.orange, letterSpacing: 0.4, marginTop: 0 },
  titleRule: { width: 50, height: 2, backgroundColor: C.orange, marginTop: 2, opacity: 0.7 },
  athleteCard: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    width: 270,
  },
  athleteField: { width: "50%", paddingHorizontal: 3, paddingVertical: 1 },
  fieldLabel: { fontSize: 5.5, fontWeight: 700, color: C.dark, letterSpacing: 0.4 },
  fieldValue: { fontSize: 7.5, fontWeight: 700, marginTop: 1 },
  metaBox: {
    width: 130,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 4,
  },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.orange, marginTop: 2, marginRight: 3 },
  // Section titles
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 2,
  },
  sectionN: {
    width: 11, height: 11, backgroundColor: C.dark, color: "#fff",
    fontSize: 7, fontWeight: 700, textAlign: "center", borderRadius: 1.5, paddingTop: 1.5,
  },
  sectionTitleText: {
    marginLeft: 5, fontSize: 8.5, fontWeight: 700, color: C.dark, letterSpacing: 0.6,
  },
  sectionRule: { flex: 1, height: 0.5, backgroundColor: C.orange, opacity: 0.4, marginLeft: 5 },
  // Diagnostic cards
  diagRow: { flexDirection: "row", gap: 4 },
  diagCard: {
    flex: 1,
    borderWidth: 1, borderColor: C.border, borderRadius: 4,
    padding: 5,
    alignItems: "center",
  },
  diagLabel: { fontSize: 6, fontWeight: 700, color: C.muted, letterSpacing: 0.4, marginTop: 2 },
  diagValue: { fontSize: 9, fontWeight: 700, marginTop: 2, letterSpacing: 0.3 },
  diagDesc: { fontSize: 6.5, color: C.muted, textAlign: "center", marginTop: 2, lineHeight: 1.25 },
  diagResume: {
    width: 150,
    borderWidth: 1, borderColor: C.ideal, borderRadius: 4,
    padding: 5, backgroundColor: C.idealSoft,
  },
  // Tables
  table: {
    borderWidth: 1, borderColor: C.border, borderRadius: 4, overflow: "hidden",
  },
  thead: { flexDirection: "row", backgroundColor: "#F3F4F6" },
  th: { fontSize: 6.5, fontWeight: 700, color: C.dark, padding: 4, letterSpacing: 0.3 },
  tr: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: C.border },
  td: { fontSize: 7, padding: 4, color: C.text },
  // Chips
  chip: {
    fontSize: 6.5, fontWeight: 700, paddingHorizontal: 5, paddingVertical: 1.5,
    borderRadius: 8, alignSelf: "flex-start",
  },
  // Cards
  card: {
    borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 6, backgroundColor: C.card,
  },
  // Zone main
  zoneCard: {
    borderWidth: 1, borderColor: C.orange, borderRadius: 4, padding: 8, backgroundColor: C.orangeSoft,
  },
  zoneTitle: { fontSize: 14, fontWeight: 700, color: C.orange },
  // Footer
  footer: {
    flexDirection: "row",
    borderTopWidth: 1.5, borderTopColor: C.orange,
    paddingTop: 3, marginTop: "auto",
    alignItems: "center",
  },
});

function SectionTitle({ n, title, emoji }: { n: number; title: string; emoji?: string }) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.sectionN}>{n}</Text>
      <Text style={s.sectionTitleText}>
        {emoji ? `${emoji}  ` : ""}{title.toUpperCase()}
      </Text>
      <View style={s.sectionRule} />
    </View>
  );
}

function LevelChip({ level }: { level: Level }) {
  const c = levelColor(level);
  return (
    <Text style={[s.chip, { backgroundColor: c.bg, color: c.fg }]}>
      {LEVEL_LABEL[level].toUpperCase()}
    </Text>
  );
}

function MiniChart({ title, data, domain, color }: { title: string; data: { x: string; y: number }[]; domain: [number, number]; color: string }) {
  const W = 150, H = 50, padX = 14, padY = 6;
  const xs = data.length;
  const xStep = xs > 1 ? (W - padX * 2) / (xs - 1) : 0;
  const yScale = (v: number) => padY + (H - padY * 2) * (1 - (v - domain[0]) / (domain[1] - domain[0]));
  const points = data.map((d, i) => `${padX + i * xStep},${yScale(d.y)}`).join(" ");
  return (
    <View style={[s.card, { padding: 4, height: 72 }]}>
      <Text style={{ fontSize: 6.5, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{title}</Text>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <SvgLine x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke={C.border} strokeWidth={0.5} />
        {data.length > 1 && <Polyline points={points} stroke={color} strokeWidth={1.4} fill="none" />}
        {data.map((d, i) => (
          <Circle key={i} cx={padX + i * xStep} cy={yScale(d.y)} r={1.6} fill={color} />
        ))}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 1 }}>
        {data.map((d, i) => <Text key={i} style={{ fontSize: 5.5, color: C.muted }}>{d.x}</Text>)}
      </View>
    </View>
  );
}

export function AssessmentPdfDocument({ assessment, history = [] }: { assessment: Assessment; history?: Assessment[] }) {
  const d = assessment.data;
  const series = (history.length > 0 ? history.slice(0, 3).reverse() : [assessment]);

  const fcSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fc_repouso.valor }));
  const sonoSeries = series.map((a) => {
    const m = a.data.indicadores.qualidade_sono.horas.match(/(\d+)h\s*(\d+)?/);
    let y = 6;
    if (m) {
      const h = parseInt(m[1] || "0"); const min = parseInt(m[2] || "0");
      y = Math.min(10, Math.round((h + min / 60) * 1.1));
    }
    return { x: shortDate(a.assessment_date), y };
  });
  const energiaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.energia.valor }));
  const fadigaSeries = series.map((a) => ({ x: shortDate(a.assessment_date), y: a.data.indicadores.fadiga_nivel.valor }));

  const diagItems = [
    { key: "estado_atual", label: "ESTADO ATUAL", emoji: "💪", value: d.diagnostico.estado_atual },
    { key: "fadiga", label: "NÍVEL DE FADIGA", emoji: "🥱", value: d.diagnostico.fadiga },
    { key: "risco_lesao", label: "RISCO DE LESÃO", emoji: "🩹", value: d.diagnostico.risco_lesao },
    { key: "evolucao", label: "EVOLUÇÃO", emoji: "📈", value: d.diagnostico.evolucao },
  ];

  const estiloRows = [
    { key: "sono", label: "SONO", emoji: "😴" },
    { key: "estresse", label: "ESTRESSE", emoji: "🧠" },
    { key: "alimentacao", label: "ALIMENTAÇÃO", emoji: "🍎" },
    { key: "hidratacao", label: "HIDRATAÇÃO", emoji: "💧" },
    { key: "recuperacao", label: "RECUPERAÇÃO", emoji: "🛌" },
  ] as const;

  const zoneColors: Record<string, string> = {
    Z1: C.estavel, Z2: C.ideal, Z3: C.atencao, Z4: C.orange, Z5: C.critico,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Image src={bpsLogo} style={s.logo} />
          </View>
          <View style={s.titleBox}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: C.dark, letterSpacing: 0.4 }}>
              RELATÓRIO DE <Text style={{ color: C.orange }}>AVALIAÇÃO</Text>
            </Text>
            <View style={s.titleRule} />
            <View style={s.athleteCard}>
              <View style={s.athleteField}>
                <Text style={s.fieldLabel}>NOME DO ATLETA</Text>
                <Text style={s.fieldValue}>{assessment.athlete_name || "—"}</Text>
              </View>
              <View style={s.athleteField}>
                <Text style={s.fieldLabel}>IDADE</Text>
                <Text style={s.fieldValue}>{assessment.age ?? "—"} anos</Text>
              </View>
              <View style={s.athleteField}>
                <Text style={s.fieldLabel}>MODALIDADE</Text>
                <Text style={s.fieldValue}>{assessment.modality || "—"}</Text>
              </View>
              <View style={s.athleteField}>
                <Text style={s.fieldLabel}>DATA</Text>
                <Text style={s.fieldValue}>{fmtDateSlash(assessment.assessment_date)}</Text>
              </View>
            </View>
          </View>
          <View style={s.metaBox}>
            <View style={s.metaRow}>
              <View style={s.metaDot} />
              <View>
                <Text style={s.fieldLabel}>TIPO DE AVALIAÇÃO</Text>
                <Text style={s.fieldValue}>{assessment.assessment_type}</Text>
              </View>
            </View>
            <View style={s.metaRow}>
              <View style={s.metaDot} />
              <View>
                <Text style={s.fieldLabel}>DATA DA AVALIAÇÃO</Text>
                <Text style={s.fieldValue}>{fmtDateSlash(assessment.assessment_date)}</Text>
              </View>
            </View>
            <View style={s.metaRow}>
              <View style={s.metaDot} />
              <View>
                <Text style={s.fieldLabel}>AVALIADO POR</Text>
                <Text style={s.fieldValue}>{assessment.evaluator_name}</Text>
                <Text style={{ fontSize: 7, color: C.muted }}>{assessment.evaluator_role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1. Diagnostico */}
        <SectionTitle n={1} title="Diagnóstico Geral" />
        <View style={s.diagRow}>
          {diagItems.map((c) => {
            const col = levelColor(c.value.level);
            return (
              <View key={c.key} style={s.diagCard}>
                <Text style={{ fontSize: 11, marginBottom: 1 }}>{c.emoji}</Text>
                <Text style={s.diagLabel}>{c.label}</Text>
                <Text style={[s.diagValue, { color: col.fg }]}>{LEVEL_LABEL[c.value.level].toUpperCase()}</Text>
                <Text style={s.diagDesc}>{c.value.descricao}</Text>
              </View>
            );
          })}
          <View style={s.diagResume}>
            <Text style={s.fieldLabel}>💡 RESUMO EM UMA FRASE</Text>
            <Text style={{ fontSize: 7.5, fontStyle: "italic", marginTop: 3, lineHeight: 1.35 }}>{d.diagnostico.resumo}</Text>
          </View>
        </View>

        {/* 2. Indicadores + 3. Evolução */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 4 }}>
          <View style={{ flex: 1.06 }}>
            <SectionTitle n={2} title="Indicadores-chave" />
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.th, { width: 80 }]}>INDICADOR</Text>
                <Text style={[s.th, { width: 60 }]}>VALOR</Text>
                <Text style={[s.th, { flex: 1 }]}>COMENTÁRIO</Text>
              </View>
              {[
                { title: "FC DE REPOUSO", emoji: "❤️", value: `${d.indicadores.fc_repouso.valor} bpm`, sub: `${d.indicadores.fc_repouso.delta > 0 ? "+" : ""}${d.indicadores.fc_repouso.delta} vs última`, interp: d.indicadores.fc_repouso.interpretacao },
                { title: "QUALIDADE DO SONO", emoji: "😴", value: d.indicadores.qualidade_sono.horas, level: d.indicadores.qualidade_sono.level, interp: d.indicadores.qualidade_sono.interpretacao },
                { title: "NÍVEL DE ENERGIA", emoji: "⚡", value: `${d.indicadores.energia.valor} / 10`, level: d.indicadores.energia.level, interp: d.indicadores.energia.interpretacao },
                { title: "NÍVEL DE FADIGA", emoji: "🥱", value: `${d.indicadores.fadiga_nivel.valor} / 10`, level: d.indicadores.fadiga_nivel.level, interp: d.indicadores.fadiga_nivel.interpretacao },
                { title: "HIDRATAÇÃO", emoji: "💧", level: d.indicadores.hidratacao.level, interp: d.indicadores.hidratacao.interpretacao },
              ].map((row, i) => (
                <View key={i} style={s.tr}>
                  <View style={[s.td, { width: 80, flexDirection: "row", alignItems: "center" }]}>
                    <Text style={{ fontSize: 9, marginRight: 3 }}>{row.emoji}</Text>
                    <Text style={{ fontSize: 7, fontWeight: 700, flex: 1 }}>{row.title}</Text>
                  </View>
                  <View style={[s.td, { width: 60 }]}>
                    {row.value && <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{row.value}</Text>}
                    {row.sub && <Text style={{ fontSize: 6, color: C.muted, marginTop: 1 }}>{row.sub}</Text>}
                    {row.level && <View style={{ marginTop: 2 }}><LevelChip level={row.level} /></View>}
                  </View>
                  <Text style={[s.td, { flex: 1, fontSize: 6.8, lineHeight: 1.3 }]}>{row.interp}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 0.94 }}>
            <SectionTitle n={3} title="Evolução dos indicadores" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              <View style={{ width: "48.5%" }}><MiniChart title="FC DE REPOUSO" data={fcSeries} domain={[40, 70]} color={C.orange} /></View>
              <View style={{ width: "48.5%" }}><MiniChart title="QUALIDADE DO SONO" data={sonoSeries} domain={[0, 10]} color={C.estavel} /></View>
              <View style={{ width: "48.5%" }}><MiniChart title="NÍVEL DE ENERGIA" data={energiaSeries} domain={[0, 10]} color={C.ideal} /></View>
              <View style={{ width: "48.5%" }}><MiniChart title="NÍVEL DE FADIGA" data={fadigaSeries} domain={[0, 10]} color={C.critico} /></View>
            </View>
            {history.length >= 2 && (
              <View style={{ marginTop: 4, borderWidth: 1, borderColor: C.ideal, backgroundColor: C.idealSoft, borderRadius: 4, padding: 5 }}>
                <Text style={{ fontSize: 7, lineHeight: 1.35 }}>
                  <Text style={{ fontWeight: 700 }}>Análise: </Text>
                  Tendência de melhora nos indicadores centrais, com melhor recuperação e estabilidade da carga interna.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 4 + 5: Zonas */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 4 }}>
          <View style={{ flex: 1.14 }}>
            <SectionTitle n={4} title="Zonas de Treinamento" />
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.th, { width: 70 }]}>ZONA</Text>
                <Text style={[s.th, { width: 50 }]}>% FC MÁX</Text>
                <Text style={[s.th, { width: 50 }]}>FAIXA</Text>
                <Text style={[s.th, { width: 55 }]}>PERCEPÇÃO</Text>
                <Text style={[s.th, { flex: 1 }]}>FOCO</Text>
              </View>
              {ZONAS.map((z) => (
                <View key={z.id} style={s.tr}>
                  <View style={[s.td, { width: 70, flexDirection: "row", alignItems: "center" }]}>
                    <Text style={{ backgroundColor: zoneColors[z.id], color: "#fff", fontSize: 6, fontWeight: 700, paddingHorizontal: 3, paddingVertical: 1.5, borderRadius: 2, marginRight: 3 }}>{z.id}</Text>
                    <Text style={{ fontSize: 6.5, fontWeight: 700 }}>{z.nome}</Text>
                  </View>
                  <Text style={[s.td, { width: 50, fontSize: 6.5 }]}>{z.pct}</Text>
                  <Text style={[s.td, { width: 50, fontSize: 6.5 }]}>{z.faixa} bpm</Text>
                  <Text style={[s.td, { width: 55, fontSize: 6.5 }]}>{z.percep}</Text>
                  <Text style={[s.td, { flex: 1, fontSize: 6.5, color: C.muted }]}>{z.foco}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 0.86 }}>
            <SectionTitle n={5} title="Zona principal recomendada" />
            <View style={s.zoneCard}>
              <Text style={s.zoneTitle}>{d.zona_recomendada.zona}</Text>
              <Text style={{ fontSize: 7.5, marginTop: 4, lineHeight: 1.35 }}>{d.zona_recomendada.descricao}</Text>
              <View style={{ flexDirection: "row", gap: 4, marginTop: 5 }}>
                <View style={{ flex: 1, backgroundColor: "#fff", borderWidth: 0.5, borderColor: C.border, borderRadius: 3, padding: 4 }}>
                  <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark }}>FREQUÊNCIA</Text>
                  <Text style={{ fontSize: 7.5, fontWeight: 700, marginTop: 1 }}>{d.zona_recomendada.frequencia}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#fff", borderWidth: 0.5, borderColor: C.border, borderRadius: 3, padding: 4 }}>
                  <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark }}>DURAÇÃO</Text>
                  <Text style={{ fontSize: 7.5, fontWeight: 700, marginTop: 1 }}>{d.zona_recomendada.duracao}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6 + 7 + 8 */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 4 }}>
          {/* 6 Estilo de vida */}
          <View style={{ flex: 0.96 }}>
            <SectionTitle n={6} title="Estilo de Vida" />
            <View style={[s.card, { padding: 5 }]}>
              {estiloRows.map((row) => {
                const v = (d.estilo_vida as Record<string, { level: Level; descricao: string }>)[row.key];
                return (
                  <View key={row.key} style={{ flexDirection: "row", marginBottom: 4, alignItems: "flex-start" }}>
                    <Text style={{ fontSize: 9, marginRight: 3, width: 12 }}>{row.emoji}</Text>
                    <Text style={{ width: 56, fontSize: 6.5, fontWeight: 700 }}>{row.label}</Text>
                    <View style={{ width: 52 }}><LevelChip level={v.level} /></View>
                    <Text style={{ flex: 1, fontSize: 6.5, color: C.muted, lineHeight: 1.3 }}>{v.descricao}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 7 Alertas */}
          <View style={{ flex: 1.04 }}>
            <SectionTitle n={7} title="Alertas e Observações" />
            <View style={{ borderWidth: 1, borderColor: C.atencao, backgroundColor: C.atencaoSoft, borderRadius: 4, padding: 5, marginBottom: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: C.atencao, marginBottom: 2 }}>⚠️ ATENÇÃO</Text>
              <Text style={{ fontSize: 7, lineHeight: 1.35 }}>{d.alertas.atencao}</Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: C.ideal, backgroundColor: C.idealSoft, borderRadius: 4, padding: 5, marginBottom: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: C.ideal, marginBottom: 2 }}>✅ PONTOS POSITIVOS</Text>
              <Text style={{ fontSize: 7, lineHeight: 1.35 }}>{d.alertas.pontos_positivos}</Text>
            </View>
            {d.alertas.observacoes ? (
              <View style={s.card}>
                <Text style={{ fontSize: 6.5, fontWeight: 700, color: C.dark, marginBottom: 2 }}>OBSERVAÇÕES</Text>
                <Text style={{ fontSize: 7, lineHeight: 1.35 }}>{d.alertas.observacoes}</Text>
              </View>
            ) : null}
          </View>

          {/* 8 Direcionamento */}
          <View style={{ flex: 0.92 }}>
            <SectionTitle n={8} title="Direcionamento e próximos passos" />
            <View style={[s.card, { marginBottom: 4 }]}>
              <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark }}>FOCO PRINCIPAL</Text>
              <Text style={{ fontSize: 7, marginBottom: 3 }}>{d.direcionamento.foco_principal}</Text>
              <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark }}>ESTRATÉGIA</Text>
              <Text style={{ fontSize: 7, marginBottom: 3 }}>{d.direcionamento.estrategia}</Text>
              <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark }}>AJUSTES</Text>
              <Text style={{ fontSize: 7 }}>{d.direcionamento.ajustes}</Text>
            </View>
            <View style={[s.card, { marginBottom: 4 }]}>
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: C.dark, marginBottom: 2 }}>RECOMENDAÇÕES PRÁTICAS</Text>
              {d.recomendacoes.map((r, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 2, alignItems: "flex-start" }}>
                  <View style={{ width: 8, height: 8, borderWidth: 0.8, borderColor: C.ideal, borderRadius: 1.5, marginRight: 4, marginTop: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: C.ideal, fontSize: 4.5, fontWeight: 700 }}>v</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 6.8, lineHeight: 1.2 }}>{r}</Text>
                </View>
              ))}
            </View>
            <View style={[s.card, { marginBottom: 4 }]}>
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: C.dark }}>PRÓXIMA AVALIAÇÃO</Text>
              <Text style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginTop: 2 }}>{fmtDate(d.proximos_passos.proxima_avaliacao)}</Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: C.orange, backgroundColor: C.orangeSoft, borderRadius: 4, padding: 5 }}>
              <Text style={{ fontSize: 7, fontStyle: "italic", textAlign: "center", lineHeight: 1.35 }}>💪 {d.proximos_passos.mensagem}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={{ width: 150, justifyContent: "center" }}>
            <Text style={{ fontSize: 6, fontWeight: 700, color: C.dark, letterSpacing: 0.4 }}>⭐ IMPORTANTE</Text>
            <Text style={{ fontSize: 6, color: C.muted, lineHeight: 1.3, marginTop: 1 }}>
              Este relatório não substitui diagnóstico médico. Em caso de dúvidas ou sintomas, procure um profissional de saúde.
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Image src={juliaLogo} style={{ width: 80, height: 36, objectFit: "contain" }} />
          </View>
          <View style={{ width: 150, alignItems: "flex-end", justifyContent: "center" }}>
            <Image src={runnerLogo} style={{ width: 70, height: 32, objectFit: "contain" }} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
