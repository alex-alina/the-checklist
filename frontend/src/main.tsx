import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { App } from './App';
import { Checklist } from './pages/checklist/Checklist';
import './index.css';
import Game from './pages/tic-tac-toe/Game';
import { Hangman } from './pages/hangman/Hangman';
import { VirusSpread } from './pages/virus-spread/VirusSpread';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checklist/:id" element={<Checklist />} />
        <Route path="/tic-tac-toe" element={<Game />} />
        <Route path="/hangman" element={<Hangman />} />
        <Route path="/virus-spread" element={<VirusSpread />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
