CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  modality TEXT NOT NULL DEFAULT '',
  age INTEGER,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_type TEXT NOT NULL DEFAULT 'Avaliação Avulsa',
  evaluator_name TEXT NOT NULL DEFAULT 'Julia Costa',
  evaluator_role TEXT NOT NULL DEFAULT 'Fisiologista do Exercício',
  evaluator_cref TEXT NOT NULL DEFAULT 'CREF 123456-G/SP',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_athlete ON public.assessments (lower(athlete_name), assessment_date DESC);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Public access policies (single shared password protects on the frontend; no auth table)
CREATE POLICY "Anyone can read assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert assessments" ON public.assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update assessments" ON public.assessments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete assessments" ON public.assessments FOR DELETE USING (true);