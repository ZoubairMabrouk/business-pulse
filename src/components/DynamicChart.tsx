import { getBestDimension, groupChartData } from "@/services/chart.utils";
import React, { useMemo } from "react";

import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";


type Props = {
  data: Record<string, any>[];
};

export const DynamicChart: React.FC<Props> = ({
  data,
}) => {
  const chartConfig = useMemo(() => {
    if (!data?.length) return null;

    const keys = Object.keys(data[0]);

    const measures = keys.filter(
      (k) => typeof data[0][k] === "number"
    );

    const dimensions = keys.filter(
      (k) => typeof data[0][k] !== "number"
    );

    const bestDimension = getBestDimension(
      data,
      dimensions
    );

    if (!bestDimension || !measures.length) {
      return null;
    }

    const groupedData = groupChartData(
      data,
      bestDimension,
      measures
    );

    return {
      groupedData,
      measures,
      bestDimension,
      chartType:
        measures.length === 1 ? "bar" : "line",
    };
  }, [data]);

  if (!chartConfig) return null;

  const {
    groupedData,
    measures,
    bestDimension,
    chartType,
  } = chartConfig;

  return (
    <div className="w-full h-[280px] rounded-xl p-3 glass-card">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        {chartType === "bar" ? (
          <BarChart data={groupedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />

            <XAxis
              dataKey={bestDimension}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />

            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />

            <Tooltip
              contentStyle={{
                background:
                  "hsl(var(--popover))",
                border:
                  "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />

            <Bar
              dataKey={measures[0]}
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={groupedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />

            <XAxis
              dataKey={bestDimension}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />

            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />

            <Tooltip
              contentStyle={{
                background:
                  "hsl(var(--popover))",
                border:
                  "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />

            {measures.map((measure, index) => (
              <Line
                key={measure}
                type="monotone"
                dataKey={measure}
                stroke={`hsl(var(--chart-${(index % 6) + 1}))`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};