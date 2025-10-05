import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const components = useMemo(
    () => ({
      code(props: any) {
        const { children, className, node, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        const inline = !match;
        
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-md text-sm my-2"
            {...rest}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...rest}>
            {children}
          </code>
        );
      },
      p(props: any) {
        const { children } = props;
        return <p className="text-sm mb-2 last:mb-0">{children}</p>;
      },
      ul(props: any) {
        const { children } = props;
        return <ul className="list-disc list-inside text-sm mb-2 space-y-1">{children}</ul>;
      },
      ol(props: any) {
        const { children } = props;
        return <ol className="list-decimal list-inside text-sm mb-2 space-y-1">{children}</ol>;
      },
      li(props: any) {
        const { children } = props;
        return <li className="text-sm">{children}</li>;
      },
      h1(props: any) {
        const { children } = props;
        return <h1 className="text-lg font-bold mb-2">{children}</h1>;
      },
      h2(props: any) {
        const { children } = props;
        return <h2 className="text-base font-bold mb-2">{children}</h2>;
      },
      h3(props: any) {
        const { children } = props;
        return <h3 className="text-sm font-bold mb-1">{children}</h3>;
      },
      blockquote(props: any) {
        const { children } = props;
        return (
          <blockquote className="border-l-4 border-border pl-3 italic text-sm my-2">
            {children}
          </blockquote>
        );
      },
      a(props: any) {
        const { href, children } = props;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        );
      },
    }),
    []
  );

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
