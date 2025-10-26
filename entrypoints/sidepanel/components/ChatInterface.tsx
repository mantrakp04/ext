import { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
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
} from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function ChatInterface() {
  return (
    <ChatInterfaceContent />
  );
}

function ChatInterfaceContent() {
  const baseURL = import.meta.env.VITE_CONVEX_SITE_URL || 'http://localhost:3000';
  const [input, setInput] = useState('');
  

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${baseURL}/proxy/llm`,
      async fetch(input, init) {
        // const { data } = await authClient.
        // console.log(data)
        // const token = await authClient.convex['.wellKnown'].openidConfiguration.
        // console.log(token)
        const response = await fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            // Authorization: `Bearer ${token.token}`
          }
        });
        return response;
      },
    }),
  });

  const handleClearChat = () => {
    window.location.reload();
  };

  // Helper function to extract text from message parts
  const getMessageText = (message: UIMessage) => {
    return message.parts
      ?.map(part => (part.type === 'text' ? part.text : ''))
      .join('') || '';
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-semibold">AI Assistant</h1>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages Container */}
      <Conversation className="flex-1">
        <ConversationContent className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask me anything or share what's on your mind"
              icon={<Sparkles className="w-6 h-6" />}
            />
          ) : (
            messages.map((message: UIMessage) => (
              <Message key={message.id} from={message.role}>
                <MessageAvatar
                  src={message.role === 'user' 
                    ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
                    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=assistant'
                  }
                  name={message.role === 'user' ? 'You' : 'AI'}
                />
                <MessageContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {getMessageText(message)}
                  </div>
                </MessageContent>
              </Message>
            ))
          )}
          {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role !== 'assistant' && (
            <Message from="assistant">
              <MessageAvatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=assistant"
                name="AI"
              />
              <MessageContent>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Form */}
      <PromptInput
        onSubmit={(message) => {
          if (message.text) {
            sendMessage({ text: message.text });
          }
        }}
        className="border-t rounded-none"
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={status !== 'ready'}
          />
        </PromptInputBody>
        <PromptInputToolbar>
          <div />
          <div className="flex items-center gap-1">
            {(status === 'submitted' || status === 'streaming') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={stop}
                className="text-muted-foreground hover:text-foreground"
              >
                Stop
              </Button>
            )}
            <PromptInputSubmit
              status={status === 'ready' ? undefined : status}
              disabled={status !== 'ready' || !input.trim()}
            />
          </div>
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
