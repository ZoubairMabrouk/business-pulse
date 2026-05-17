import React from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  Receipt,
} from "lucide-react";

const suggestions = [
  {
    icon: TrendingUp,
    label: "Évolution du CA par mois en 2024",
  },
  {
    icon: Users,
    label: "Top 10 clients par chiffre d'affaires",
  },
  {
    icon: Receipt,
    label: "Répartition de la TVA par trimestre",
  },
];

type Props = {
  onSelectSuggestion: (value: string) => void;
};

export const EmptyState: React.FC<Props> = ({
  onSelectSuggestion,
}) => {
  return (
    <div className="flex flex-col items-center text-center pt-12 animate-fade-in">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>

      <h3 className="text-2xl font-bold tracking-tight">
        Comment puis-je vous aider ?
      </h3>

      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Posez une question analytique en langage naturel.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelectSuggestion(s.label)}
            className="group flex items-start gap-3 p-4 rounded-xl glass-card text-left hover-lift"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <s.icon className="w-4 h-4" />
            </div>

            <div>
              <p className="text-sm font-medium">
                {s.label}
              </p>

              <p className="text-[11px] text-muted-foreground mt-0.5">
                Cliquez pour exécuter
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};