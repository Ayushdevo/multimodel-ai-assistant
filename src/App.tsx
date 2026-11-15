import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Message } from './components/Message';
import type { MessageProps } from './components/Message';
import { InputArea } from './components/InputArea';
import { getGeminiClient, fileToGenerativePart } from './lib/gemini';
import type { Part } from '@google/generative-ai';
import { validateImage } from './lib/attachments';
import './App.css';

function App() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestActive = useRef(false);
  const mounted = useRef(true);
  const imageUrls = useRef(new Set<string>());
  useEffect(() => {
    mounted.current = true;
    const urls = imageUrls.current;
    return () => {
      mounted.current = false;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, imageFile: File | null) => {
    if (requestActive.current || (!text.trim() && !imageFile) || !mounted.current) return;
    requestActive.current = true;
    setIsLoading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        validateImage(imageFile);
        imageUrl = URL.createObjectURL(imageFile);
        imageUrls.current.add(imageUrl);
      }
      const userMessage: MessageProps = {
        id: crypto.randomUUID(), role: 'user', content: text, imageUrl,
      };
      setMessages((prev) => [...prev, userMessage]);
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        systemInstruction: "You are a helpful AI assistant. You were created by Ayush. If anyone asks who created you, who made you, or who programmed you, you must tell them that Ayush made you."
      });
      
      const contents: (string | Part)[] = [];
      if (text.trim()) {
        contents.push(text);
      }
      
      if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents.push(imagePart);
      }

      // If only image is uploaded, add a default prompt
      if (contents.length === 1 && imageFile) {
        contents.unshift("Please describe this image.");
      }

      const result = await model.generateContent(contents);
      const responseText = result.response.text();

      const modelMessage: MessageProps = {
        id: crypto.randomUUID(),
        role: 'model',
        content: responseText || 'I could not generate a response.',
      };

      if (mounted.current) setMessages((prev) => [...prev, modelMessage]);
    } catch {
      const errorMessage: MessageProps = {
        id: crypto.randomUUID(), role: 'model',
        content: '**Error:** Request failed. Check your API key, connection and image, then try again.',
      };
      if (mounted.current) setMessages((prev) => [...prev, errorMessage]);
    } finally {
      requestActive.current = false;
      if (mounted.current) setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><Sparkles className="logo-icon" size={24} /> Multimodal AI Assistant</h1>
      </header>

      <main className="main-content">
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={48} />
              <h2>How can I help you today?</h2>
              <p>Ask a coding question or upload an image to get started.</p>
            </div>
          ) : (
            messages.map((msg) => <Message key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="message-wrapper model">
              <div className="message-avatar"><Sparkles size={20} /></div>
              <div className="message-content glass" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container-wrapper">
          <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default App;
