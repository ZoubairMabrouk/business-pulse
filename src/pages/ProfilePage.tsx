import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground">Informations du compte connecté.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold">
            {(user?.fullName || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {user?.fullName || "Utilisateur"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <dt className="text-muted-foreground w-24">ID</dt>
            <dd className="text-foreground font-mono text-xs">{user?.id}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <dt className="text-muted-foreground w-24">Email</dt>
            <dd className="text-foreground">{user?.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <dt className="text-muted-foreground w-24">Rôle</dt>
            <dd>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-primary/15 text-primary border border-primary/30">
                {role || "User"}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}