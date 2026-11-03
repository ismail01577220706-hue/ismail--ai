export type AgentId =
  | 'agent-01-study'
  | 'agent-02-language'
  | 'agent-03-business'
  | 'agent-04-content'
  | 'agent-05-islamic'
  | 'agent-06-personal'
  | 'agent-07-research'
  | 'agent-08-communication'
  | 'agent-09-file'
  | 'agent-10-coding'
  | 'agent-11-data'
  | 'agent-12-automation';

export interface AgentPermission {
  requiresApproval: boolean;
  canExecuteExternal: boolean;
  approvalActionTypes: string[];
  maxActionsPerHour: number;
}

export interface AgentDefinition {
  id: AgentId;
  number: number;
  name: string;
  roleTitle: string;
  category: 'Academics' | 'Language' | 'Commerce' | 'Media' | 'Deen' | 'Productivity' | 'Engineering' | 'Intelligence';
  avatarEmoji: string;
  color: string;
  systemInstruction: string;
  capabilities: string[];
  tools: string[];
  permissions: AgentPermission;
  modelName: string;
  isActive: boolean;
}

export interface AgentOrchestrationResult {
  agentId: AgentId;
  agentName: string;
  avatarEmoji: string;
  content: string;
  actionRequired?: {
    type: string;
    title: string;
    description: string;
    payload: Record<string, unknown>;
  };
  toolCalls?: Array<{
    toolName: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }>;
  suggestedQuickReplies?: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
