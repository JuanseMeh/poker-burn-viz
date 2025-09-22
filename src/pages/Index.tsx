import { useState } from "react";
import { VotingSession } from "@/components/VotingSession";
import { SprintDashboard } from "@/components/SprintDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, Users } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("poker");
  const [completedVotes, setCompletedVotes] = useState<number[]>([]);

  // Mock sprint data
  const sprintStats = {
    totalPoints: 120,
    completedPoints: 85,
    remainingPoints: 35,
    daysRemaining: 4,
    teamVelocity: 25,
    sprintGoal: "Implement user authentication and dashboard with responsive design for mobile devices",
  };

  const handleVoteComplete = (averageVote: number) => {
    setCompletedVotes([...completedVotes, averageVote]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary border-b border-border/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 gradient-secondary rounded-xl shadow-magenta">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Planning Poker</h1>
                <p className="text-white/80 text-sm">Agile estimation made simple</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                <Users className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">4 active members</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-400 mx-auto bg-card shadow-card">
            <TabsTrigger 
              value="poker" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-white transition-smooth"
            >
              <Zap className="w-4 h-4 mr-2" />
              Planning Poker
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:gradient-secondary data-[state=active]:text-white transition-smooth"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Sprint Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poker" className="space-y-6 animate-fade-in-up">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="gradient-primary bg-clip-text text-transparent text-3xl">
                    Story Estimation Session
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VotingSession
                  storyTitle="User Authentication System"
                  storyDescription="Implement a secure login system with email/password authentication, password reset functionality, and user session management. Include form validation and error handling."
                  onVoteComplete={handleVoteComplete}
                />
              </CardContent>
            </Card>

            {completedVotes.length > 0 && (
              <Card className="shadow-card animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="text-accent">Session Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-subtle rounded-lg">
                      <div className="text-2xl font-bold text-primary">{completedVotes.length}</div>
                      <div className="text-sm text-muted-foreground">Stories Estimated</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-subtle rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {Math.round(completedVotes.reduce((sum, vote) => sum + vote, 0) / completedVotes.length * 10) / 10}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Points</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-subtle rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {completedVotes.reduce((sum, vote) => sum + vote, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="animate-fade-in-up">
            <SprintDashboard sprintStats={sprintStats} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="gradient-subtle border-t border-border/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;