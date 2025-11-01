
import { Chat } from '@google/genai';
import React, { useState, useEffect, useRef } from 'react';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import Spinner from './Spinner';

interface ChatBotProps {
    systemInstruction?: string;
    className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ systemInstruction, className }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChat(systemInstruction));
  }, [systemInstruction]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: input });
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error." }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col bg-slate-800 rounded-lg shadow-xl ${className || 'h-[80vh] max-w-2xl mx-auto'}`}>
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-sky-400">Gemini Chat</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200">
                    <Spinner />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Gemini anything..."
            className="flex-grow p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white font-bold p-2 rounded-md transition duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
