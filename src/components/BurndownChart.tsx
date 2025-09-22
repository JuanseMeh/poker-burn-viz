import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BurndownData {
  day: string;
  ideal: number;
  actual: number;
}

interface ProgressData {
  date: string;
  remaining_story_points: number;
  completed_story_points: number;
}

interface Sprint {
  start_date: string;
  end_date: string;
}

interface Story {
  story_points: number;
}

interface BurndownChartProps {
  progressData: ProgressData[];
  sprint: Sprint;
  stories: Story[];
  className?: string;
}

export const BurndownChart = ({ progressData, sprint, stories, className }: BurndownChartProps) => {
  const totalPoints = stories.reduce((sum, story) => sum + (story.story_points || 0), 0);
  
  // Generate ideal burn-down line
  const generateIdealLine = () => {
    const days = getDaysBetween(sprint.start_date, sprint.end_date);
    return days.map((day, index) => ({
      day: day.toLocaleDateString(),
      ideal: totalPoints - (totalPoints / (days.length - 1)) * index
    }));
  };

  const idealData = generateIdealLine();
  
  // Combine ideal and actual data
  const chartData = idealData.map(ideal => {
    const actual = progressData.find(p => 
      new Date(p.date).toLocaleDateString() === ideal.day
    );
    return {
      day: ideal.day,
      ideal: ideal.ideal,
      actual: actual ? actual.remaining_story_points : null
    };
  });
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
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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

function getDaysBetween(startDate: string, endDate: string): Date[] {
  const days: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}