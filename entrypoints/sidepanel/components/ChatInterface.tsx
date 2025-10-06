import { useState, useEffect } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { OAuthAuth } from './OAuthAuth';
import { useApiKey } from '../hooks/oauth';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { 
  Conversation, 
  ConversationContent, 
  ConversationEmptyState,
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';
import { 
  Message, 
  MessageContent, 
  MessageAvatar 
} from '@/components/ai-elements/message';
import { 
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment
} from '@/components/ai-elements/prompt-input';

export function ChatInterface() {
  const {
    apiKey,
    hasApiKey,
    handleOAuthComplete,
    handleOAuthError,
    handleChangeApiKey,
  } = useApiKey();

  const clearChat = () => {
    browser.storage.local.remove('chat_messages');
  };

  // Show authentication components if not authenticated
  if (!hasApiKey) {
    return <OAuthAuth onAuthComplete={handleOAuthComplete} onAuthError={handleOAuthError} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleChangeApiKey}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Change API Key
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterfaceContent apiKey={apiKey} />
    </div>
  );
}

function ChatInterfaceContent({ apiKey }: { apiKey: string }) {
  return (
    <>
      {/* Messages */}

      {/* Input */}
    </>
  );
}
