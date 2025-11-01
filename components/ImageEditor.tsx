
import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './Spinner';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageType, setOriginalImageType] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage((reader.result as string).split(',')[1]);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!originalImage || !prompt || !originalImageType) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const result = await editImage(originalImage, originalImageType, prompt);
      setEditedImage(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-sky-400">Simple Image Editor</h2>
        <p className="mb-6 text-slate-400">Upload an image and tell Gemini how to edit it. For example, "Add a retro filter" or "Make the sky look like a sunset".</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">Upload Image</label>
            <input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Editing Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Add a cat wearing sunglasses"
              className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              rows={2}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !originalImage || !prompt}
            className="w-full flex justify-center items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {isLoading ? <><Spinner /> Generating...</> : 'Generate Edited Image'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Original</h3>
            <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
              {originalImage ? (
                <img src={`data:${originalImageType};base64,${originalImage}`} alt="Original" className="max-h-full max-w-full rounded-lg" />
              ) : (
                <p className="text-slate-500">No image uploaded</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Edited</h3>
            <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
              {isLoading ? (
                <Spinner size="h-12 w-12" />
              ) : editedImage ? (
                <img src={`data:image/png;base64,${editedImage}`} alt="Edited" className="max-h-full max-w-full rounded-lg" />
              ) : (
                <p className="text-slate-500">Edited image will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
