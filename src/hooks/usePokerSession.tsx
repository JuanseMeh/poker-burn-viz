import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vote {
  id: string;
  user_id: string;
  story_points: number;
  session_id: string;
}

export const usePokerSession = () => {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Start a planning poker session
  const startSession = async (storyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('start_poker_session', {
        story_uuid: storyId
      });
      
      if (error) throw error;
      
      setCurrentSession(data);
      setVotes([]);
      
      toast({
        title: "Session Started",
        description: "Planning poker session is now active",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Submit a vote
  const submitVote = async (sessionId: string, points: number) => {
    try {
      const { error } = await (supabase as any).rpc('submit_vote', {
        session_uuid: sessionId,
        points: points
      });
      
      if (error) throw error;
      
      toast({
        title: "Vote Submitted",
        description: `You voted ${points} points`,
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Finalize voting session
  const finalizeVoting = async (sessionId: string) => {
    try {
      const { error } = await (supabase as any).rpc('finalize_voting', {
        session_uuid: sessionId
      });
      
      if (error) throw error;
      
      toast({
        title: "Voting Complete",
        description: "Story points have been assigned",
      });
      
      setCurrentSession(null);
      setVotes([]);
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Subscribe to real-time votes
  const subscribeToVotes = (sessionId: string) => {
    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVotes(prev => [...prev, payload.new as Vote]);
          } else if (payload.eventType === 'UPDATE') {
            setVotes(prev => prev.map(vote => 
              vote.id === payload.new.id ? payload.new as Vote : vote
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    currentSession,
    votes,
    loading,
    startSession,
    submitVote,
    finalizeVoting,
    subscribeToVotes,
  };
};