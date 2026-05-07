import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, FileText, Plus, Trash2 } from "lucide-react";
import { isAuthed } from "@/lib/auth";
import { DEFAULT_DATA, type Assessment } from "@/lib/assessment-types";
import { toast } from "sonner";

export const Route = createFileRoute("/atleta/$name")({
  component: AtletaPage,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAuthed()) {
      throw redirect({ to: "/login" });
    }
  },
});

function AtletaPage() {
  const { name } = Route.useParams();
  const decoded = decodeURIComponent(name);
  const navigate = useNavigate();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .ilike("athlete_name", decoded)
      .order("assessment_date", { ascending: false });
    if (error) toast.error("Erro ao carregar");
    setItems((data ?? []) as unknown as Assessment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decoded]);

  const handleNew = async () => {
    const today = new Date().toISOString().split("T")[0];
    const ref = items[0];
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        athlete_name: ref?.athlete_name ?? decoded,
        modality: ref?.modality ?? "Corrida",
        age: ref?.age ?? null,
        assessment_date: today,
        data: DEFAULT_DATA as unknown as never,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Erro ao criar avaliação");
      return;
    }
    navigate({ to: "/avaliacao/$id", params: { id: data.id } });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta avaliação?")) return;
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Excluída");
    load();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Atletas
            </Button>
          </Link>
          <div className="text-base font-extrabold text-brand-dark">{decoded}</div>
          <Button onClick={handleNew} className="bg-brand-orange text-white hover:bg-brand-orange/90">
            <Plus className="mr-2 h-4 w-4" /> Nova avaliação
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-1 text-xl font-extrabold text-brand-dark">Histórico de avaliações</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "avaliação" : "avaliações"} registradas
        </p>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {items.map((a, idx) => (
              <Card key={a.id} className="flex items-center justify-between p-4 transition hover:border-brand-orange">
                <Link to="/avaliacao/$id" params={{ id: a.id }} className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange-soft text-sm font-bold text-brand-orange">
                      #{items.length - idx}
                    </div>
                    <div>
                      <div className="font-bold text-brand-dark">
                        {a.assessment_type}
                        {idx === 0 && (
                          <span className="ml-2 rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                            Mais recente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(a.assessment_date)}
                        </span>
                        <span>•</span>
                        <span>{a.modality}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
