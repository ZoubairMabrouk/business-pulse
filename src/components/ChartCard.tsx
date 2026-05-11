import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, children, isLoading, className, action }: ChartCardProps) {
  return (
    <Card className={cn("glass-card hover-lift animate-slide-up overflow-hidden", className)}>
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="relative h-[260px] w-full overflow-hidden rounded-lg bg-muted/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
            <Skeleton className="h-full w-full bg-transparent" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
