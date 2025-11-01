
import React, { useState, useRef } from 'react';
import { editImage, createProChat } from '../services/geminiService';
import Spinner from './Spinner';
import ImageComparisonSlider from './ImageComparisonSlider';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';

const DESIGN_STYLES = [
  "Mid-Century Modern", "Scandinavian", "Traditional", "Bohemian", "Industrial", "Minimalist"
];

const InteriorDesigner: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageType, setOriginalImageType] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setOriginalImage(base64);
        setGeneratedImage(base64); // Start with original image in the 'after' view
        setError(null);
        setCurrentStyle('Original');
        setChatMessages([]);
        chatRef.current = createProChat("You are an interior design assistant. Your responses should be short, friendly, and helpful. You are helping a user refine a design you've created.");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const generateStyledImage = async (style: string) => {
    if (!originalImage || !originalImageType) return;
    
    setIsLoading(true);
    setLoadingText(`Reimagining in ${style} style...`);
    setError(null);
    
    try {
      const prompt = `Redesign this room in a ${style} style. Be creative but keep the original room layout.`;
      const result = await editImage(originalImage, originalImageType, prompt);
      setGeneratedImage(result);
      setCurrentStyle(style);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !generatedImage || !originalImageType || !chatRef.current) return;
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setIsChatLoading(true);
    setLoadingText(`Applying change: "${chatInput}"`);
    const currentInput = chatInput;
    setChatInput('');

    try {
      // Image refinement
      const imagePrompt = `Given this image of a room designed in a ${currentStyle} style, apply the following change: "${currentInput}". Only show the final image.`;
      const refinedImage = await editImage(generatedImage, 'image/png', imagePrompt);
      setGeneratedImage(refinedImage);
      
      // Chat response
      const chatResponse = await chatRef.current.sendMessage({ message: `The user wants to: "${currentInput}". Acknowledge the change has been made.` });
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: chatResponse.text }] };
      setChatMessages(prev => [...prev, modelMessage]);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refine design.');
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I couldn't apply that change." }] };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsChatLoading(false);
    }
  };


  return (
    <div className="container mx-auto">
      {!originalImage && (
        <div className="max-w-md mx-auto text-center bg-slate-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-sky-400">Interior Design Consultant</h2>
          <p className="mb-6 text-slate-400">Upload a photo of your room to get started.</p>
          <input 
            id="room-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
          />
        </div>
      )}

      {originalImage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-2 text-slate-300">Compare Designs: <span className="text-sky-400">{currentStyle}</span></h3>
              <div className="aspect-video relative bg-slate-900 rounded-md overflow-hidden">
                {isLoading && !isChatLoading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <Spinner size="h-12 w-12"/>
                    <p className="mt-4 text-lg">{loadingText}</p>
                  </div>
                )}
                {generatedImage && originalImageType && (
                  <ImageComparisonSlider 
                    beforeImage={originalImage} 
                    beforeImageType={originalImageType}
                    afterImage={generatedImage}
                    afterImageType={'image/png'}
                  />
                )}
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-slate-300">Reimagine Your Space</h3>
              <div className="flex flex-wrap gap-2">
                {DESIGN_STYLES.map(style => (
                  <button key={style} onClick={() => generateStyledImage(style)} disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md transition text-sm font-medium">
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 bg-slate-800 rounded-lg shadow-xl flex flex-col h-[75vh]">
            <h3 className="text-lg font-bold text-slate-300 p-4 border-b border-slate-700">Refine Design</h3>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-sky-600' : 'bg-slate-700'}`}>
                    {msg.parts[0].text}
                  </p>
                </div>
              ))}
              {isLoading && isChatLoading && <div className="flex justify-start"><Spinner /></div>}
            </div>
            <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && !isLoading && handleChatSend()}
                        placeholder="e.g., Make the rug blue"
                        disabled={isLoading}
                        className="flex-grow p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"/>
                    <button onClick={handleChatSend} disabled={isLoading || !chatInput.trim()}
                        className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white font-bold p-2 rounded-md transition">
                        Send
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
    </div>
  );
};

export default InteriorDesigner;
