import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Message } from './components/Message';
import type { MessageProps } from './components/Message';
import { InputArea } from './components/InputArea';
import { getGeminiClient, fileToGenerativePart } from './lib/gemini';
import './App.css';

function App() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, imageFile: File | null) => {
    let imageUrl;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    const userMessage: MessageProps = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        systemInstruction: "You are a helpful AI assistant. You were created by Ayush. If anyone asks who created you, who made you, or who programmed you, you must tell them that Ayush made you."
      });
      
      const contents: any[] = [];
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
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || 'I could not generate a response.',
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const errorMessage: MessageProps = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `**Error:** ${error.message || 'Something went wrong. Please check your API key and try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
