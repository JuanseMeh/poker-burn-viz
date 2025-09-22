import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BurndownData {
  day: string;
  ideal: number;
  actual: number;
}

interface BurndownChartProps {
  data: BurndownData[];
  className?: string;
}

export const BurndownChart = ({ data, className }: BurndownChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-card">
          <p className="text-card-foreground font-medium">{`Day ${label}`}</p>
          <p className="text-chart-line">
            {`Ideal: ${payload[0]?.value || 0} points`}
          </p>
          <p className="text-accent">
            {`Actual: ${payload[1]?.value || 0} points`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--chart-grid))" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="hsl(var(--chart-line))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'hsl(var(--chart-line))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--chart-line))', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="hsl(var(--accent))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};