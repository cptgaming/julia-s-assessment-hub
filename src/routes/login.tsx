import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { isAuthed, login } from "@/lib/auth";
import bpsLogo from "@/assets/bps-logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthed()) {
      throw redirect({ to: "/" });
    }
  },
});

function LoginPage() {
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pwd)) {
      navigate({ to: "/" });
    } else {
      toast.error("Senha incorreta");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-brand-orange-soft/40 to-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <img src={bpsLogo} alt="BPS" className="mx-auto h-24 w-auto" width={512} height={512} />
          <h1 className="mt-2 text-2xl font-extrabold text-brand-dark">BPS — Acesso restrito</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sistema de relatórios de avaliação</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Digite a senha"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-brand-orange text-white hover:bg-brand-orange/90">
            Entrar
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Apenas a profissional Julia Costa tem acesso.</p>
      </Card>
    </div>
  );
}
