import React from 'react';
import "./App.css";
import spotifyLogo from "./assets/Spotify_Full_Logo_RGB_White.png";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Auth from './components/auth/Auth';
import Callback from './components/auth/Callback';
import Dashboard from './components/Dashboard';
import PlaylistDetail from './components/PlayListDetail';

function MainApp() {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center rounded-xl min-h-screen">
      <div 
        onClick={() => navigate('/auth')}
        className="relative flex z-10 flex-col items-center text-white p-8 rounded-xl bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300"
      >
        {/* Logo */}
        <img src={spotifyLogo} alt="Spotify Logo" className="w-32 mb-8 pt-1.5" />

        {/* Content */}
        <h1 className="text-4xl mb-1.5 font-bold text-center">Spotify Organizer</h1>
        <p className="pb-0.5 text-lg text-center">Your music, beautifully organized</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
      </Routes>
    </Router>
  );
}

export default App;