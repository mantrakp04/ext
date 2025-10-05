import { useState, useEffect } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { OAuthAuth } from './OAuthAuth';
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
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'oauth' | null>(null);
  
  // Load API key on mount
  useEffect(() => {
    browser.storage.local.get(['openrouter_api_key']).then((result) => {
      if (result.openrouter_api_key) {
        setApiKey(result.openrouter_api_key);
        setHasApiKey(true);
      } else {
        setAuthMode('oauth');
      }
    });
  }, []);

  const handleOAuthComplete = (oauthApiKey: string) => {
    setApiKey(oauthApiKey);
    setHasApiKey(true);
    setAuthMode(null);
  };

  const handleOAuthError = (error: string) => {
    console.error('OAuth error:', error);
  };

  const clearChat = () => {
    browser.storage.local.remove('chat_messages');
  };

  const handleChangeApiKey = () => {
    setHasApiKey(false);
    setApiKey('');
    setAuthMode('oauth');
    browser.storage.local.remove(['openrouter_api_key']);
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
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: {
        model: 'openai/gpt-4o-mini',
        stream: true,
      },
    }),
  });

  return (
    <>
      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask me anything..."
              icon={<Sparkles className="w-10 h-10 mx-auto opacity-50" />}
            />
          ) : (
            messages.map((message: UIMessage) => (
              <Message key={message.id} from={message.role}>
                <MessageAvatar
                  src={message.role === 'user' ? '/user-avatar.png' : '/ai-avatar.png'}
                  name={message.role === 'user' ? 'You' : 'AI'}
                />
                <MessageContent>
                  {message.parts
                    .filter(part => part.type === 'text')
                    .map(part => (part as any).text)
                    .join('')}
                </MessageContent>
              </Message>
            ))
          )}
          {(status === 'submitted' || status === 'streaming') && (
            <Message from="assistant">
              <MessageAvatar
                src="/ai-avatar.png"
                name="AI"
              />
              <MessageContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const text = formData.get('message') as string;
          if (text?.trim()) {
            sendMessage({ text: text.trim() });
          }
        }}>
          <div className="flex gap-2">
            <input
              name="message"
              type="text"
              placeholder="Ask me anything..."
              disabled={status === 'submitted' || status === 'streaming'}
              className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'submitted' || status === 'streaming'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitted' || status === 'streaming' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
