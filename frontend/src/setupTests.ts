import './env.d.ts';
import '@testing-library/jest-dom';

const globalWithApi = globalThis as typeof globalThis & {
  __VITE_API_BASE_URL__?: string;
};

globalWithApi.__VITE_API_BASE_URL__ = process.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
