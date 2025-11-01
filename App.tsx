
import React, { useState } from 'react';
import Header from './components/Header';
import InteriorDesigner from './components/InteriorDesigner';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ChatBot from './components/ChatBot';
import { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('designer');

  const renderPage = () => {
    switch (activePage) {
      case 'designer':
        return <InteriorDesigner />;
      case 'editor':
        return <ImageEditor />;
      case 'video':
        return <VideoGenerator />;
      case 'chat':
        return <ChatBot />;
      default:
        return <InteriorDesigner />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
