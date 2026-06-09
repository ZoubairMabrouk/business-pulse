import { cn } from "@/lib/utils";

export function scorePassword(pwd: string): number {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
const colors = [
  "bg-destructive",
  "bg-destructive/80",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-emerald-600",
];

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? colors[score] : "bg-muted"
            )}
          />
        ))}
      </div>
      {value && (
        <p className="text-[11px] text-muted-foreground">Force : {labels[score]}</p>
      )}
    </div>
  );
}