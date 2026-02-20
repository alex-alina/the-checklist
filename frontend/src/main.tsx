import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { App } from './App';
import { Checklist } from './pages/Checklist';
import './index.css';
import Game from './pages/tic-tac-toe/Game';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checklist/:id" element={<Checklist />} />
        <Route path="/tic-tac-toe" element={<Game />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
