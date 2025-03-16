import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: {
    value: number;
    type: "positive" | "negative";
  };
}

export function MetricsCard({
  title,
  value,
  icon,
  description,
  change,
}: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {change && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs ${
                change.type === "positive"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {change.type === "positive" ? "+" : "-"}
              {change.value}%
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 