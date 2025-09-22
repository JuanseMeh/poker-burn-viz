import { useState, useEffect } from "react";
import { BurndownChart } from "./BurndownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Calendar, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
  is_active: boolean;
  total_story_points: number;
}

interface Story {
  id: string;
  title: string;
  description: string;
  story_points: number;
  status: string;
  position: number;
}

interface ProgressData {
  date: string;
  remaining_story_points: number;
  completed_story_points: number;
}

interface SprintDashboardProps {
  sprintId: string;
}

export const SprintDashboard = ({ sprintId }: SprintDashboardProps) => {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sprintId) {
      fetchSprintData();
      fetchProgressData();
      
      // Real-time subscription
      const storiesSubscription = supabase
        .channel(`sprint-${sprintId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stories',
            filter: `sprint_id=eq.${sprintId}`
          },
          () => {
            fetchSprintData();
            updateBurnDownData();
          }
        )
        .subscribe();

      return () => {
        storiesSubscription.unsubscribe();
      };
    }
  }, [sprintId]);

  const fetchSprintData = async () => {
    try {
      const [{ data: sprintData }, { data: storiesData }] = await Promise.all([
        supabase.from('sprints').select('*').eq('id', sprintId).single(),
        supabase.from('stories').select('*').eq('sprint_id', sprintId).order('position')
      ]);

      setSprint(sprintData);
      setStories(storiesData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sprint data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const { data } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('date');

      setProgressData(data || []);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const updateBurnDownData = async () => {
    try {
      await supabase.rpc('update_burn_down_data', { sprint_uuid: sprintId });
      fetchProgressData();
    } catch (error) {
      console.error('Failed to update burn down data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Sprint not found</p>
      </div>
    );
  }

  const totalPoints = stories.reduce((sum, story) => sum + (story.story_points || 0), 0);
  const completedPoints = stories
    .filter(s => s.status === 'completed')
    .reduce((sum, story) => sum + (story.story_points || 0), 0);
  const remainingPoints = totalPoints - completedPoints;
  const completionPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  
  const today = new Date();
  const endDate = new Date(sprint.end_date);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const isOnTrack = remainingPoints <= (daysRemaining * 5); // Assuming 5 points per day velocity

  return (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 gradient-primary rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 gradient-secondary rounded-full">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-accent">{completedPoints}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-secondary rounded-full">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{daysRemaining}</div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-muted rounded-full">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Total Stories</div>
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
                <div className="text-xl font-bold text-accent">{remainingPoints}</div>
                <div className="text-xs text-muted-foreground">Points Remaining</div>
              </div>
              <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {daysRemaining > 0 ? Math.round((remainingPoints / daysRemaining) * 10) / 10 : 0}
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
              {sprint.goal || 'No goal set'}
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
          <BurndownChart 
            progressData={progressData}
            sprint={sprint}
            stories={stories}
            className="h-80" 
          />
        </CardContent>
        
        {stories.length > 0 && (
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle className="gradient-primary bg-clip-text text-transparent">
                Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stories.map(story => (
                  <StoryItem key={story.id} story={story} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Card>
    </div>
  );
};

function StoryItem({ story }: { story: Story }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'voting': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(story.status)}`} />
        <div>
          <span className="font-medium">{story.title}</span>
          <p className="text-xs text-muted-foreground">{story.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={story.story_points ? "default" : "secondary"}>
          {story.story_points || '?'} points
        </Badge>
        <Badge variant="outline" className="capitalize">
          {story.status}
        </Badge>
      </div>
    </div>
  );
}