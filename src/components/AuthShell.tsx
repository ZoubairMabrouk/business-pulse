import { ReactNode } from "react";
import { BarChart3, Sparkles, ShieldCheck, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left: brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-mesh">
        <div className="absolute inset-0 bg-hero pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <img src="assets/EDI.jpg" alt="Logo" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight gradient-text">EDI-Solutions</h1>
            <p className="text-xs text-muted-foreground">Analytics<span className="gradient-text">.BI</span></p>
          </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full gradient-primary" />
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      
        </div>

        <div className="relative space-y-6 max-w-md">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            La <span className="gradient-text">décision</span> guidée par la donnée.
          </h2>
          <p className="text-muted-foreground">
            Cubes OLAP, dashboards en temps réel, IA conversationnelle. Une plateforme analytique de niveau entreprise.
          </p>
          <div className="grid grid-cols-1 gap-3 pt-4">
            {[
              { icon: Sparkles, label: "Assistant IA conversationnel" },
              { icon: Zap, label: "Visualisations dynamiques temps-réel" },
              { icon: BarChart3, label: "Cubes OLAP haute performance" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl glass-card">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Analytics.BI — Enterprise edition</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background relative">
        <div className="absolute inset-0 lg:hidden bg-mesh pointer-events-none" />
        <div className="w-full max-w-md relative animate-scale-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-base font-bold">Analytics<span className="gradient-text">.BI</span></h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
