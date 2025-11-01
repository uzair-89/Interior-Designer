import React, { useState, useEffect } from 'react';

// Fix: Define a named interface for aistudio and make it optional on window to resolve declaration conflicts.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [keyNeeded, setKeyNeeded] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          onKeySelected();
        } else {
          setKeyNeeded(true);
        }
      } else {
        // Fallback for environments where aistudio is not available
        console.warn('aistudio API not found. Assuming API key is set via environment variables.');
        onKeySelected();
      }
    };
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and let the parent component proceed.
      // The parent will handle API errors if the key is invalid.
      setKeyNeeded(false);
      onKeySelected();
    }
  };
  
  if (!keyNeeded) {
    return null;
  }

  return (
    <div className="bg-slate-800 border border-sky-500/50 p-6 rounded-lg text-center">
      <h3 className="text-xl font-semibold text-sky-400 mb-2">API Key Required for Veo</h3>
      <p className="text-slate-300 mb-4">
        Video generation with Veo requires you to select your own API key.
        Please ensure your project is properly configured for billing.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleSelectKey}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Select Your API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 text-sm"
        >
          Learn more about billing
        </a>
      </div>
    </div>
  );
};

export default ApiKeySelector;
