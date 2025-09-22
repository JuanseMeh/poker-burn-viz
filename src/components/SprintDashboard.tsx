import { BurndownChart } from "./BurndownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Calendar, Target, Users } from "lucide-react";

// Mock data for the burndown chart
const burndownData = [
  { day: "1", ideal: 100, actual: 100 },
  { day: "2", ideal: 90, actual: 95 },
  { day: "3", ideal: 80, actual: 85 },
  { day: "4", ideal: 70, actual: 75 },
  { day: "5", ideal: 60, actual: 60 },
  { day: "6", ideal: 50, actual: 45 },
  { day: "7", ideal: 40, actual: 35 },
  { day: "8", ideal: 30, actual: 30 },
  { day: "9", ideal: 20, actual: 25 },
  { day: "10", ideal: 10, actual: 15 },
  { day: "11", ideal: 0, actual: 5 },
];

interface SprintStats {
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  daysRemaining: number;
  teamVelocity: number;
  sprintGoal: string;
}

interface SprintDashboardProps {
  sprintStats: SprintStats;
}

export const SprintDashboard = ({ sprintStats }: SprintDashboardProps) => {
  const completionPercentage = (sprintStats.completedPoints / sprintStats.totalPoints) * 100;
  const isOnTrack = sprintStats.remainingPoints <= (sprintStats.teamVelocity * sprintStats.daysRemaining);

  return (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 gradient-primary rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{sprintStats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 gradient-secondary rounded-full">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-accent">{sprintStats.completedPoints}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-secondary rounded-full">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{sprintStats.daysRemaining}</div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-muted rounded-full">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{sprintStats.teamVelocity}</div>
            <div className="text-sm text-muted-foreground">Team Velocity</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="gradient-primary bg-clip-text text-transparent">Sprint Progress</span>
              <Badge variant={isOnTrack ? "default" : "destructive"}>
                {isOnTrack ? "On Track" : "Behind Schedule"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress 
                value={completionPercentage} 
                className="h-3 bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                <div className="text-xl font-bold text-accent">{sprintStats.remainingPoints}</div>
                <div className="text-xs text-muted-foreground">Points Remaining</div>
              </div>
              <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {Math.round((sprintStats.remainingPoints / sprintStats.daysRemaining) * 10) / 10}
                </div>
                <div className="text-xs text-muted-foreground">Points/Day Needed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-accent">Sprint Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {sprintStats.sprintGoal}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress toward goal:</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="gradient-primary bg-clip-text text-transparent">
            Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BurndownChart data={burndownData} className="h-80" />
        </CardContent>
      </Card>
    </div>
  );
};