
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  children: React.ReactNode;
}> = ({ page, activePage, setActivePage, children }) => {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => setActivePage(page)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-sky-500 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-sky-400">Gemini Creative Suite</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <NavItem page="designer" activePage={activePage} setActivePage={setActivePage}>
              Designer
            </NavItem>
            <NavItem page="editor" activePage={activePage} setActivePage={setActivePage}>
              Image Editor
            </NavItem>
            <NavItem page="video" activePage={activePage} setActivePage={setActivePage}>
              Video Gen
            </NavItem>
            <NavItem page="chat" activePage={activePage} setActivePage={setActivePage}>
              ChatBot
            </NavItem>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
