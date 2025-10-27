import { useState } from 'react';
import { ChevronUp, EllipsisVertical, Plus, Sparkles, StopCircle, Trash2, Paperclip, Camera, Mic } from 'lucide-react';
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
import { api } from '@/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ChatInterface() {
  return (
    <ChatInterfaceContent />
  );
}

function ChatInterfaceContent() {
  const baseURL = import.meta.env.VITE_CONVEX_SITE_URL || 'http://localhost:3000';
  const [chatId, setChatId] = useState<string>('new');
  const [input, setInput] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  
  const { data: threads } = useQuery(convexQuery(api.threads.queries.list, {
    paginationOpts: {
      numItems: 5,
      cursor: null,
    },
  }));
  
  const { data: thread } = useQuery(convexQuery(api.threads.queries.get, 
    chatId !== 'new' ? {
      threadId: chatId,
    } : 'skip'
  ));

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${baseURL}/proxy/llm`,
      async fetch(input, init) {
        const { session } = await authClient.getSessionData();
        const response = await fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${session.token}`,
          }
        });
        return response;
      },
    }),
  });

  const getMessageText = (message: UIMessage) => {
    return message.parts
      ?.map(part => (part.type === 'text' ? part.text : ''))
      .join('') || '';
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        {chatId === 'new' ? (
          <div className="text-sm text-muted-foreground p-2">
            New chat
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-2">
            {thread?.title}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setChatId('new')}>
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {
                threads && threads.page.length > 0 ? threads.page.map((thread) => (
                  <DropdownMenuItem key={thread._id}>
                    {thread.title}
                  </DropdownMenuItem>
                )) : (
                  <div className="text-sm text-muted-foreground p-2">
                    No threads found
                  </div>
                )
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                <MessageContent>
                  {getMessageText(message)}
                </MessageContent>
              </Message>
            ))
          )}
          {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role !== 'assistant' && (
            <Message from="assistant">
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

      {/* Input Form - Updated Layout */}
      <div className="p-4">
        <PromptInput
          onSubmit={(message) => {
            if (message.text) {
              sendMessage({ text: message.text });
            }
          }}
          className={`flex ${isMultiline ? 'flex-col' : 'flex-row'}`}
        >
          <div className='w-full'>
            <PromptInputTextarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsMultiline(e.target.value.includes('\n'));
              }}
              placeholder="Ask anything…"
              className={`min-h-8`}
            />
          </div>

          <div className={`${isMultiline ? '' : ''}`}>
            <div className='flex items-center gap-2'>
              <Button
                variant="ghost"
                size="icon"
                type="button"
              >
                <Paperclip />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
              >
                <Camera />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
              >
                <Mic />
              </Button>
            </div>

            {/* Right side - Submit button */}
            <div>
              <PromptInputSubmit
                size="icon"
              >
                <ChevronUp className='w-4 h-4' />
              </PromptInputSubmit>
            </div>
          </div>
        </PromptInput>
      </div>
    </div>
  );
}
