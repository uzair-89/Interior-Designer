
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import Spinner from './Spinner';
import ApiKeySelector from './ApiKeySelector';

const VideoGenerator: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageType, setSourceImageType] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('An epic cinematic shot of this image coming to life');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceImageType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage((reader.result as string).split(',')[1]);
        setVideoUrl(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeySelected = () => {
    setIsKeySelected(true);
  };
  
  const resetKeySelection = () => {
      setIsKeySelected(false);
  }

  const handleSubmit = async () => {
    if (!sourceImage || !prompt || !sourceImageType) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateVideo(sourceImage, sourceImageType, prompt, aspectRatio, setLoadingMessage);
      setVideoUrl(url);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        console.error(e);
        if (errorMessage.includes("Requested entity was not found")) {
            setError("API Key error. Please re-select your API key.");
            resetKeySelection();
        }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-sky-400">Video Generator (Veo)</h2>
         {!isKeySelected ? (
             <ApiKeySelector onKeySelected={handleKeySelected} />
         ) : (
            <>
                <p className="mb-6 text-slate-400">Upload a starting image, write a prompt, and let Veo create a short video.</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">Upload Starting Image</label>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A cinematic zoom out revealing a futuristic city"
                      className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-4">
                        <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-md ${aspectRatio === '16:9' ? 'bg-sky-600' : 'bg-slate-600'}`}>16:9 (Landscape)</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-md ${aspectRatio === '9:16' ? 'bg-sky-600' : 'bg-slate-600'}`}>9:16 (Portrait)</button>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !sourceImage || !prompt}
                    className="w-full flex justify-center items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    {isLoading ? <><Spinner /> Generating...</> : 'Generate Video'}
                  </button>
                </div>
                {error && <p className="mt-4 text-red-400">{error}</p>}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Generated Video</h3>
                  <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
                    {isLoading ? (
                      <div className="text-center">
                        <Spinner size="h-12 w-12" />
                        <p className="mt-4 text-slate-300">{loadingMessage}</p>
                      </div>
                    ) : videoUrl ? (
                      <video src={videoUrl} controls autoPlay loop className="w-full h-full rounded-lg" />
                    ) : (
                      <p className="text-slate-500">Video will appear here</p>
                    )}
                  </div>
                </div>
            </>
         )}
      </div>
    </div>
  );
};

export default VideoGenerator;
