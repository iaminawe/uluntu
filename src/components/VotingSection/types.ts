// Types for VotingSection component

export interface Topic {
  id: number;
  title: string;
  description: string;
  votes: number;
}

export interface VotingSectionProps {
  title?: string;
  description?: string;
  initialTopics?: Topic[];
}
