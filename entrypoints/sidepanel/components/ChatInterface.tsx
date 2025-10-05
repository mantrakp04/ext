import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage.jsx';
import { OAuthAuth } from './OAuthAuth';
import { nanoid } from 'nanoid';
import type { UIMessage } from 'ai';

export function ChatInterface() {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'oauth' | 'manual' | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Load API key and messages on mount
  useEffect(() => {
    browser.storage.local.get(['openrouter_api_key', 'openai_api_key', 'chat_messages']).then((result) => {
      // Check for OpenRouter API key first, then fallback to OpenAI
      const storedApiKey = result.openrouter_api_key || result.openai_api_key;
      if (storedApiKey) {
        setApiKey(storedApiKey);
        setHasApiKey(true);
      } else {
        setAuthMode('oauth');
      }
      if (result.chat_messages && Array.isArray(result.chat_messages)) {
        setMessages(result.chat_messages);
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleApiKeySubmit = (submittedApiKey: string) => {
    if (submittedApiKey.trim()) {
      browser.storage.local.set({ openrouter_api_key: submittedApiKey });
      setApiKey(submittedApiKey);
      setHasApiKey(true);
      setAuthMode(null);
    }
  };

  const handleOAuthComplete = (oauthApiKey: string) => {
    setApiKey(oauthApiKey);
    setHasApiKey(true);
    setAuthMode(null);
  };

  const handleOAuthError = (error: string) => {
    if (error === 'manual_fallback') {
      setAuthMode('manual');
    } else {
      setError(error);
    }
  };

  const handleBackToOAuth = () => {
    setAuthMode('oauth');
    setError(null);
  };

  const saveMessages = (newMessages: UIMessage[]) => {
    browser.storage.local.set({ chat_messages: newMessages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: UIMessage = {
      id: nanoid(),
      role: 'user',
      parts: [{ type: 'text' as const, text: input.trim() }],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    const assistantMessage: UIMessage = {
      id: nanoid(),
      role: 'assistant',
      parts: [{ type: 'text' as const, text: '' }],
    };

    setMessages([...newMessages, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      
      // Use OpenRouter API endpoint
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', // OpenRouter model format
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.parts
              .filter(part => part.type === 'text')
              .map(part => (part as any).text)
              .join(''),
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                assistantContent += content;
                setMessages([...newMessages, { 
                  ...assistantMessage, 
                  parts: [{ type: 'text' as const, text: assistantContent }] 
                }]);
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }

      const finalMessages: UIMessage[] = [...newMessages, { 
        ...assistantMessage, 
        parts: [{ type: 'text' as const, text: assistantContent }] 
      }];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while processing your request');
        setMessages(newMessages); // Remove assistant message on error
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearChat = () => {
    setMessages([]);
    browser.storage.local.remove('chat_messages');
  };

  const handleChangeApiKey = () => {
    setHasApiKey(false);
    setApiKey('');
    setAuthMode('oauth');
    browser.storage.local.remove(['openrouter_api_key', 'openai_api_key']);
  };

  // Show authentication components if not authenticated
  if (!hasApiKey) {
    if (authMode === 'manual') {
      return <ManualApiKey onApiKeySubmit={handleApiKeySubmit} onBack={handleBackToOAuth} />;
    }
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
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleChangeApiKey}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Change API Key
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div className="space-y-2">
              <Sparkles className="w-10 h-10 mx-auto opacity-50" />
              <p>Start a conversation with your AI assistant</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
