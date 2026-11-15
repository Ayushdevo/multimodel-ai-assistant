import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';
import './Message.css';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

export interface MessageProps {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
}

export const Message: React.FC<{ message: MessageProps }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const [copyError, setCopyError] = React.useState('');
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAttempt = React.useRef(0);
  React.useEffect(() => () => {
    copyAttempt.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const handleCopy = async (text: string) => {
    const attempt = ++copyAttempt.current;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopiedCode(null);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(text);
      if (copyAttempt.current !== attempt) return;
      setCopiedCode(text);
      copyTimer.current = setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      if (copyAttempt.current === attempt) setCopyError('Copy failed. Select the code and copy it manually.');
    }
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'model'}`}>
      <div className="message-avatar">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="message-content glass">
        {message.imageUrl && (
          <div className="message-image-container">
            <img src={message.imageUrl} alt="Uploaded attachment" className="message-image" />
          </div>
        )}
        <div className="markdown-body">
          {copyError && <p role="alert">{copyError}</p>}
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');
                
                if (language) {
                  return (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-language">{language}</span>
                        <button
                          className="copy-button"
                          onClick={() => handleCopy(codeString)}
                          title="Copy code"
                          aria-label={copiedCode === codeString ? 'Copied' : 'Copy code'}
                        >
                          {copiedCode === codeString ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className={className}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
