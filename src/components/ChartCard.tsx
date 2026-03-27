import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({ title, description, children, isLoading, className }: ChartCardProps) {
  return (
    <Card className={`glass-card animate-fade-in ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full bg-muted" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
