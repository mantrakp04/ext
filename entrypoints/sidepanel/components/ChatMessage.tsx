import { User, Bot } from 'lucide-react';
import type { UIMessage } from 'ai';
import { Markdown } from './Markdown';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return isUser ? (
                <p key={index} className="text-sm whitespace-pre-wrap">{part.text}</p>
              ) : (
                <Markdown key={index} content={part.text} />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

