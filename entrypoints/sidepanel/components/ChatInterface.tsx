import { useState, useEffect } from 'react';
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
  PromptInputAttachments,
  PromptInputAttachment
} from '@/components/ai-elements/prompt-input';

export function ChatInterface() {

  return (
    <ChatInterfaceContent />
  );
}

function ChatInterfaceContent() {
  return (
    <>
      {/* Messages */}

      {/* Input */}
    </>
  );
}
