export type NavigationTab =
  | 'dashboard'
  | 'chat'
  | 'agents'
  | 'tasks'
  | 'memory'
  | 'business'
  | 'files'
  | 'reports'
  | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  agentId?: string;
  agentName?: string;
  avatarEmoji?: string;
  text: string;
  timestamp: string;
  actionRequired?: {
    type: string;
    title: string;
    description: string;
    payload: Record<string, unknown>;
  };
  suggestedQuickReplies?: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
