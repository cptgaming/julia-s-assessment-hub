// Domain types for the BPS assessment report
export type Level = "critico" | "atencao" | "estavel" | "ideal";

export const LEVELS: { value: Level; label: string }[] = [
  { value: "critico", label: "Crítico" },
  { value: "atencao", label: "Atenção" },
  { value: "estavel", label: "Estável" },
  { value: "ideal", label: "Ideal" },
];

export const LEVEL_LABEL: Record<Level, string> = {
  critico: "Crítico",
  atencao: "Atenção",
  estavel: "Estável",
  ideal: "Ideal",
};

// Diagnóstico geral cards (4 cards no topo)
export type DiagnosticoGeral = {
  estado_atual: { level: Level; descricao: string };
  fadiga: { level: Level; descricao: string };
  risco_lesao: { level: Level; descricao: string };
  evolucao: { level: Level; descricao: string };
  resumo: string;
};

// Indicadores-chave (tabela com gráficos de evolução)
export type Indicadores = {
  fc_repouso: { valor: number; delta: number; interpretacao: string };
  qualidade_sono: { horas: string; level: Level; interpretacao: string };
  energia: { valor: number; level: Level; interpretacao: string };
  fadiga_nivel: { valor: number; level: Level; interpretacao: string };
  hidratacao: { level: Level; interpretacao: string };
};

// Zona principal recomendada
export type Zona =
  | "Z1 — RECUPERAÇÃO"
  | "Z2 — BASE AERÓBICA"
  | "Z3 — MODERADO"
  | "Z4 — LIMIAR"
  | "Z5 — VO2 MAX";

export type ZonaRecomendada = {
  zona: Zona;
  descricao: string;
  frequencia: string;
  duracao: string;
};

// Estilo de vida
export type EstiloVida = {
  sono: { level: Level; descricao: string };
  estresse: { level: Level; descricao: string };
  alimentacao: { level: Level; descricao: string };
  hidratacao: { level: Level; descricao: string };
  recuperacao: { level: Level; descricao: string };
};

export type AlertasObs = {
  atencao: string;
  pontos_positivos: string;
  observacoes: string;
};

export type DirecionamentoEstrategico = {
  foco_principal: string;
  estrategia: string;
  ajustes: string;
};

export type RecomendacoesPraticas = string[]; // até 5 itens

export type ProximosPassos = {
  proxima_avaliacao: string; // ISO date
  mensagem: string;
};

// Conteúdo completo armazenado no campo data (jsonb)
export type AssessmentData = {
  diagnostico: DiagnosticoGeral;
  indicadores: Indicadores;
  zona_recomendada: ZonaRecomendada;
  estilo_vida: EstiloVida;
  alertas: AlertasObs;
  direcionamento: DirecionamentoEstrategico;
  recomendacoes: RecomendacoesPraticas;
  proximos_passos: ProximosPassos;
};

// Linha completa
export type Assessment = {
  id: string;
  athlete_name: string;
  modality: string;
  age: number | null;
  assessment_date: string;
  assessment_type: string;
  evaluator_name: string;
  evaluator_role: string;
  evaluator_cref: string;
  data: AssessmentData;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_DATA: AssessmentData = {
  diagnostico: {
    estado_atual: { level: "ideal", descricao: "Boa adaptação ao treinamento" },
    fadiga: { level: "atencao", descricao: "Controlável" },
    risco_lesao: { level: "ideal", descricao: "Sem sinais de risco no momento" },
    evolucao: { level: "ideal", descricao: "Indicadores mostram tendência de melhora" },
    resumo:
      "Seu corpo está respondendo bem aos estímulos, com boa recuperação e evolução consistente. Mantenha a consistência e siga o plano.",
  },
  indicadores: {
    fc_repouso: {
      valor: 52,
      delta: -3,
      interpretacao:
        "Redução da FC basal indica melhora de condicionamento e boa adaptação ao treino.",
    },
    qualidade_sono: {
      horas: "7h 15min",
      level: "ideal",
      interpretacao: "Sono adequado, favorecendo a recuperação e o desempenho.",
    },
    energia: {
      valor: 7,
      level: "atencao",
      interpretacao: "Energia em nível adequado para o volume e intensidade atuais.",
    },
    fadiga_nivel: {
      valor: 3,
      level: "ideal",
      interpretacao: "Fadiga baixa, indicando boa recuperação e equilíbrio.",
    },
    hidratacao: {
      level: "ideal",
      interpretacao: "Ingestão de líquidos em níveis adequados.",
    },
  },
  zona_recomendada: {
    zona: "Z2 — BASE AERÓBICA",
    descricao:
      "Priorize treinos nesta zona para evolução consistente e melhora da resistência.",
    frequencia: "70% dos treinos",
    duracao: "30 – 60 minutos",
  },
  estilo_vida: {
    sono: { level: "ideal", descricao: "Sono em quantidade e qualidade apropriadas, favorecendo a recuperação." },
    estresse: { level: "atencao", descricao: "Níveis moderados de estresse. Atenção à rotina para evitar acúmulo." },
    alimentacao: { level: "ideal", descricao: "Alimentação adequada, contribuindo para o desempenho e recuperação." },
    hidratacao: { level: "ideal", descricao: "Ingestão de líquidos em níveis adequados ao volume de treino." },
    recuperacao: { level: "ideal", descricao: "Estratégias de recuperação estão sendo eficazes." },
  },
  alertas: {
    atencao: "Leve tendência de aumento da carga de treino. Monitore sinais de fadiga nas próximas semanas.",
    pontos_positivos: "Excelente adaptação ao treino e boa consistência. Manter foco na base aeróbica.",
    observacoes: "",
  },
  direcionamento: {
    foco_principal: "Desenvolver base aeróbica e manter consistência.",
    estrategia: "Priorizar treinos em Z2, com estímulos moderados e progressivos.",
    ajustes: "Evitar excesso de intensidade esta semana. Dar atenção à qualidade do sono.",
  },
  recomendacoes: [
    "Realizar 3–4 treinos aeróbicos em Z2 por semana.",
    "Incluir 1 treino moderado (Z3) de forma controlada.",
    "Manter rotina de sono e alimentação equilibrada.",
    "Incluir 2 sessões semanais de força.",
    "Alongamentos e mobilidade diariamente.",
  ],
  proximos_passos: {
    proxima_avaliacao: "",
    mensagem: "A consistência de hoje é o resultado de amanhã. Continue evoluindo!",
  },
};

export const ZONAS = [
  { id: "Z1", nome: "RECUPERAÇÃO", pct: "50 – 60%", faixa: "100 – 120", percep: "Muito fácil", foco: "Recuperação ativa" },
  { id: "Z2", nome: "BASE AERÓBICA", pct: "60 – 70%", faixa: "120 – 140", percep: "Fácil", foco: "Desenvolver base aeróbica" },
  { id: "Z3", nome: "MODERADO", pct: "70 – 80%", faixa: "140 – 160", percep: "Moderado", foco: "Melhorar capacidade aeróbica" },
  { id: "Z4", nome: "LIMIAR", pct: "80 – 90%", faixa: "160 – 180", percep: "Difícil", foco: "Aumentar limiar de lactato" },
  { id: "Z5", nome: "VO2 MAX", pct: "90 – 100%", faixa: "180 – 200", percep: "Muito difícil", foco: "Melhorar consumo máximo de oxigênio" },
];
