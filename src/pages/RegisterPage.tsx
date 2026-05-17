import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/services/authService";
import { AuthShell } from "@/components/AuthShell";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await register({ email: email.trim(), password, firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined });
      navigate("/", { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      const firstFieldErr = apiErr?.errors
        ? Object.values(apiErr.errors)[0]?.[0]
        : undefined;
      setError(firstFieldErr || apiErr?.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Créer un compte" subtitle="Rejoignez la plateforme analytique en moins d'une minute.">
      <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="FirstName">Prénom</Label>
            <Input
              id="FirstName"
              type="text"
              autoComplete="name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={100}
              placeholder="Marie"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="LastName">Nom</Label>
            <Input
              id="LastName"
              type="text"
              autoComplete="name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={100}
              placeholder="Dupont"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              placeholder="vous@entreprise.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Au moins 6 caractères"
              className="h-11"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 animate-fade-in">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-95" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Créer mon compte
          </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
      </p>
    </AuthShell>
  );
}