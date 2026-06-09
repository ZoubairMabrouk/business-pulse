import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useResetUserPassword } from "@/hooks/useUsers";
import { resetPasswordSchema, type ResetPasswordInput } from "@/validations/userSchemas";
import type { ApiError } from "@/services/authService";
import type { User } from "@/types/user";

function generateTempPassword() {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  for (let i = 0; i < arr.length; i++) out += chars[arr[i] % chars.length];
  return out;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const mut = useResetUserPassword();
  const [issued, setIssued] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { temporaryPassword: "", forceChange: true, sendEmail: false },
  });

  const forceChange = watch("forceChange");
  const sendEmail = watch("sendEmail");

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    try {
      const temp = values.temporaryPassword || generateTempPassword();
      const res = await mut.mutateAsync({
        id: user.id,
        payload: {
          temporaryPassword: temp,
          forceChange: values.forceChange,
          sendEmail: values.sendEmail,
        },
      });
      setIssued(res?.temporaryPassword || temp);
      toast.success("Mot de passe réinitialisé");
    } catch (e) {
      toast.error((e as ApiError)?.message || "Échec de la réinitialisation");
    }
  });

  function handleClose(o: boolean) {
    if (!o) {
      reset();
      setIssued(null);
    }
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Pour <span className="font-medium text-foreground">{user?.email}</span>
          </DialogDescription>
        </DialogHeader>

        {issued ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <Label className="text-xs text-muted-foreground">Mot de passe temporaire</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="flex-1 font-mono text-sm break-all">{issued}</code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(issued);
                    toast.success("Copié");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Communiquez ce mot de passe de manière sécurisée. Il ne sera plus affiché.
            </p>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Terminer</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="temporaryPassword">Mot de passe (optionnel)</Label>
              <div className="flex gap-2">
                <Input
                  id="temporaryPassword"
                  placeholder="Laisser vide pour générer"
                  {...register("temporaryPassword")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("temporaryPassword", generateTempPassword())}
                >
                  Générer
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Forcer le changement</p>
                <p className="text-xs text-muted-foreground">À la prochaine connexion.</p>
              </div>
              <Switch
                checked={forceChange}
                onCheckedChange={(c) => setValue("forceChange", c)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Envoyer une notification</p>
                <p className="text-xs text-muted-foreground">Email à l'utilisateur.</p>
              </div>
              <Switch
                checked={sendEmail}
                onCheckedChange={(c) => setValue("sendEmail", c)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Réinitialiser
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}