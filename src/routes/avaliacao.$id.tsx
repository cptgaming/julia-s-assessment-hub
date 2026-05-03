import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download, Loader2 } from "lucide-react";
import { isAuthed } from "@/lib/auth";
import { AssessmentReport } from "@/components/AssessmentReport";
import type { Assessment, AssessmentData } from "@/lib/assessment-types";
import { toast } from "sonner";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export const Route = createFileRoute("/avaliacao/$id")({
  component: AvaliacaoPage,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAuthed()) {
      throw redirect({ to: "/login" });
    }
  },
});

function AvaliacaoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase.from("assessments").select("*").eq("id", id).maybeSingle();
    if (error || !data) {
      toast.error("Avaliação não encontrada");
      navigate({ to: "/" });
      return;
    }
    const a = data as unknown as Assessment;
    setAssessment(a);
    // Load up to 3 most recent for this athlete
    const { data: hist } = await supabase
      .from("assessments")
      .select("*")
      .ilike("athlete_name", a.athlete_name)
      .order("assessment_date", { ascending: false })
      .limit(3);
    setHistory((hist ?? []) as unknown as Assessment[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (patch: Partial<Assessment>) => {
    if (!assessment) return;
    setAssessment({ ...assessment, ...patch });
  };

  const handleDataChange = (patch: Partial<AssessmentData>) => {
    if (!assessment) return;
    setAssessment({ ...assessment, data: { ...assessment.data, ...patch } });
  };

  const handleSave = async () => {
    if (!assessment) return;
    setSaving(true);
    const { error } = await supabase
      .from("assessments")
      .update({
        athlete_name: assessment.athlete_name,
        modality: assessment.modality,
        age: assessment.age,
        assessment_date: assessment.assessment_date,
        assessment_type: assessment.assessment_type,
        data: assessment.data as unknown as never,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }
    toast.success("Salvo!");
    load();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      // Auto-save first
      await handleSave();
      // Wait next paint to ensure the read-only mirror is rendered
      await new Promise((r) => setTimeout(r, 300));
      const node = reportRef.current;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const imgData = await toJpeg(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        width,
        height,
      });
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (height * pageW) / width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`Avaliacao-${assessment?.athlete_name?.replace(/\s+/g, "-") ?? "atleta"}-${assessment?.assessment_date}.pdf`);
      toast.success("PDF gerado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
          <div className="text-sm font-semibold text-brand-dark">
            Editando avaliação · <span className="text-muted-foreground">{assessment.athlete_name}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
            <Button onClick={handleDownloadPdf} disabled={pdfLoading} className="bg-brand-orange text-white hover:bg-brand-orange/90">
              {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Salvar PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div ref={reportRef} className="mx-auto w-fit shadow-xl">
          <AssessmentReport
            assessment={assessment}
            history={history}
            editable
            onChange={handleChange}
            onDataChange={handleDataChange}
          />
        </div>
      </main>
    </div>
  );
}
