import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user";

function fmt(d?: string) {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return d;
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-1">
            <Row label="Nom complet" value={user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"} />
            <Row label="Username" value={user.username || "—"} />
            <Row label="Email" value={user.email} />
            <Row label="Rôle" value={<Badge variant="secondary">{user.role}</Badge>} />
            <Row
              label="Statut"
              value={
                <Badge variant={user.status === "Active" ? "default" : "outline"}>
                  {user.status === "Active" ? "Actif" : "Inactif"}
                </Badge>
              }
            />
            <Row label="Créé le" value={fmt(user.createdAt)} />
            <Row label="Mis à jour" value={fmt(user.updatedAt)} />
            <Row label="Dernière connexion" value={fmt(user.lastLoginAt)} />
            <Row label="ID" value={<span className="font-mono text-xs">{user.id}</span>} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}