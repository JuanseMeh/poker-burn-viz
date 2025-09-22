import { useState } from "react";
import { PlanningPokerCard } from "./PlanningPokerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Users, Vote } from "lucide-react";

const POKER_VALUES = [1, 2, 3, 5, 8, 13, 21, "?"];

interface Vote {
  userId: string;
  userName: string;
  value: string | number;
}

interface VotingSessionProps {
  storyTitle: string;
  storyDescription: string;
  onVoteComplete: (averageVote: number) => void;
}

export const VotingSession = ({ 
  storyTitle, 
  storyDescription, 
  onVoteComplete 
}: VotingSessionProps) => {
  const [selectedValue, setSelectedValue] = useState<string | number | null>(null);
  const [votes, setVotes] = useState<Vote[]>([
    { userId: "1", userName: "Alice", value: 5 },
    { userId: "2", userName: "Bob", value: 8 },
    { userId: "3", userName: "Charlie", value: 5 },
  ]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleCardClick = (value: string | number) => {
    setSelectedValue(value);
  };

  const handleSubmitVote = () => {
    if (selectedValue !== null) {
      const newVote: Vote = {
        userId: "current",
        userName: "You",
        value: selectedValue,
      };
      setVotes([...votes, newVote]);
      setHasVoted(true);
    }
  };

  const handleRevealVotes = () => {
    setIsRevealed(true);
    const numericVotes = votes
      .filter(vote => typeof vote.value === 'number')
      .map(vote => vote.value as number);
    
    if (numericVotes.length > 0) {
      const average = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
      onVoteComplete(Math.round(average));
    }
  };

  const handleReset = () => {
    setSelectedValue(null);
    setVotes(votes.slice(0, 3)); // Keep initial votes
    setIsRevealed(false);
    setHasVoted(false);
  };

  const getVoteStats = () => {
    const numericVotes = votes
      .filter(vote => typeof vote.value === 'number')
      .map(vote => vote.value as number);
    
    if (numericVotes.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    const avg = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
    
    return { min, max, avg: Math.round(avg * 10) / 10 };
  };

  const stats = getVoteStats();

  return (
    <div className="space-y-6">
      {/* Story Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="gradient-primary bg-clip-text text-transparent">
            {storyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{storyDescription}</p>
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
                disabled={hasVoted}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {!hasVoted && selectedValue !== null && (
            <Button 
              onClick={handleSubmitVote}
              className="gradient-primary shadow-purple"
              size="lg"
            >
              Submit Vote
            </Button>
          )}
          
          {hasVoted && !isRevealed && (
            <Button 
              onClick={handleRevealVotes}
              variant="gradient"
              size="lg"
            >
              Reveal Votes
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
                      <Badge variant={vote.value === "?" ? "secondary" : "default"}>
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