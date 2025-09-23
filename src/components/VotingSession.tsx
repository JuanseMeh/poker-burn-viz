import { useState, useEffect } from "react";
import { PlanningPokerCard } from "./PlanningPokerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Users, Vote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const POKER_VALUES = [0, 1, 2, 3, 5, 8, 13, 21, 34];

interface Vote {
  userId: string;
  userName: string;
  value: number;
}

interface Story {
  id: string;
  title: string;
  description: string;
  sprint_id: string;
  status: string;
}

interface Session {
  id: string;
  story_id: string;
  is_active: boolean;
}

interface VotingSessionProps {
  story: Story;
  session: Session | null;
  onVoteComplete: (averageVote: number) => void;
}

export const VotingSession = ({ 
  story,
  session,
  onVoteComplete 
}: VotingSessionProps) => {
  const { user } = useAuth();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (session) {
      // Subscribe to real-time votes
      const subscription = supabase
        .channel(`votes:${session.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `session_id=eq.${session.id}`
          },
          () => {
            fetchVotes();
          }
        )
        .subscribe();

      fetchVotes();
      fetchUserVote();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session, user]);

  const fetchVotes = async () => {
    if (!session) return;
    
    const { data, error } = await (supabase as any)
      .from('votes')
      .select(`
        story_points,
        profiles:user_id (username, full_name)
      `)
      .eq('session_id', session.id);

    if (!error && data) {
      const formattedVotes = data.map((vote: any) => ({
        userId: vote.profiles?.username || 'Unknown',
        userName: vote.profiles?.full_name || vote.profiles?.username || 'Anonymous',
        value: vote.story_points
      }));
      setVotes(formattedVotes);
    }
  };

  const fetchUserVote = async () => {
    if (!session || !user) return;
    
    const { data } = await (supabase as any)
      .from('votes')
      .select('story_points')
      .eq('session_id', session.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setUserVote(data?.story_points || null);
  };

  const handleCardClick = (value: number) => {
    setSelectedValue(value);
  };

  const handleSubmitVote = async () => {
    if (selectedValue === null || !session || !user) return;

    const { error } = await (supabase as any).rpc('submit_vote', {
      session_uuid: session.id,
      points: selectedValue
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } else {
      setUserVote(selectedValue);
      toast({
        title: "Vote submitted",
        description: `You voted ${selectedValue} points`,
      });
    }
  };

  const handleRevealVotes = () => {
    setIsRevealed(true);
  };

  const handleFinalizeVoting = async () => {
    if (!session) return;

    const { error } = await (supabase as any).rpc('finalize_voting', {
      session_uuid: session.id
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to finalize voting",
        variant: "destructive",
      });
    } else {
      const numericVotes = votes.map(vote => vote.value);
      if (numericVotes.length > 0) {
        const average = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
        onVoteComplete(Math.round(average));
      }
      toast({
        title: "Voting finalized",
        description: "Story points have been assigned",
      });
    }
  };

  const handleReset = () => {
    setSelectedValue(null);
    setUserVote(null);
    setIsRevealed(false);
  };

  const getVoteStats = () => {
    const numericVotes = votes.map(vote => vote.value);
    
    if (numericVotes.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    const avg = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
    
    return { min, max, avg: Math.round(avg * 10) / 10 };
  };

  const stats = getVoteStats();

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No active voting session</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="gradient-primary bg-clip-text text-transparent">
            {story.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{story.description}</p>
        </CardContent>
      </Card>

      {/* Voting Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Vote className="w-5 h-5 text-primary" />
            Choose Your Estimate
          </h3>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {votes.length} {votes.length === 1 ? 'vote' : 'votes'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {POKER_VALUES.map((value, index) => (
            <div
              key={value}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <PlanningPokerCard
                value={value}
                isSelected={selectedValue === value}
                onClick={() => handleCardClick(value)}
                disabled={userVote !== null}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {userVote === null && selectedValue !== null && (
            <Button 
              onClick={handleSubmitVote}
              className="gradient-primary shadow-purple"
              size="lg"
            >
              Submit Vote
            </Button>
          )}
          
          {userVote !== null && !isRevealed && votes.length > 0 && (
            <Button 
              onClick={handleRevealVotes}
              variant="gradient"
              size="lg"
            >
              Reveal Votes
            </Button>
          )}
          
          {isRevealed && (
            <Button 
              onClick={handleFinalizeVoting}
              className="gradient-secondary"
              size="lg"
            >
              Finalize ({votes.reduce((acc, vote) => acc + vote.value, 0)} points)
            </Button>
          )}
          
          <Button 
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {isRevealed && (
        <Card className="shadow-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-accent">Voting Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Individual Votes:</h4>
                <div className="space-y-2">
                  {votes.map((vote, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span className="font-medium">{vote.userName}</span>
                      <Badge variant="default">
                        {vote.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Statistics:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.min}</div>
                    <div className="text-xs text-muted-foreground">Min</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                    <div className="text-2xl font-bold text-accent">{stats.avg}</div>
                    <div className="text-xs text-muted-foreground">Average</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-subtle rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.max}</div>
                    <div className="text-xs text-muted-foreground">Max</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};