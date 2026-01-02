
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, User, Info, MessageCircle, HeartPulse } from 'lucide-react';
import { AppProvider } from './AppContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 flex items-center justify-around px-2 z-50">
      <Link to="/" className={`flex flex-col items-center justify-center w-1/2 transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-400'}`}>
        <Home size={28} />
        <span className="senior-text-base font-bold mt-1">首页</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center justify-center w-1/2 transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-slate-400'}`}>
        <User size={28} />
        <span className="senior-text-base font-bold mt-1">我的</span>
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="pb-24 min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <Navigation />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
