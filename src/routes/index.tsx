import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, FileText, LogOut, Search, Trash2, Calendar, User } from "lucide-react";
import { isAuthed, logout } from "@/lib/auth";
import { DEFAULT_DATA, type Assessment } from "@/lib/assessment-types";
import bpsLogo from "@/assets/bps-logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAuthed()) {
      throw redirect({ to: "/login" });
    }
  },
});

function Dashboard() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("assessment_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar");
    setItems((data ?? []) as unknown as Assessment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleNew = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        athlete_name: "Novo Atleta",
        modality: "Corrida",
        age: null,
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

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const filtered = items.filter(
    (a) =>
      !q ||
      a.athlete_name.toLowerCase().includes(q.toLowerCase()) ||
      a.modality.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-orange-soft/20 to-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={bpsLogo} alt="BPS" className="h-12 w-auto" width={512} height={512} />
            <div>
              <h1 className="text-lg font-extrabold text-brand-dark">BPS — Avaliações</h1>
              <p className="text-xs text-muted-foreground">Julia Costa · Fisiologista do Exercício</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por atleta ou modalidade..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleNew} className="bg-brand-orange text-white hover:bg-brand-orange/90">
            <Plus className="mr-2 h-4 w-4" /> Nova avaliação
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {items.length === 0 ? "Nenhuma avaliação criada ainda." : "Nenhum resultado."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((a) => (
              <Card key={a.id} className="flex items-center justify-between p-4 transition hover:border-brand-orange">
                <Link to="/avaliacao/$id" params={{ id: a.id }} className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange-soft">
                      <User className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-dark">{a.athlete_name}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{a.modality || "—"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(a.assessment_date)}
                        </span>
                        <span>•</span>
                        <span>{a.assessment_type}</span>
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
