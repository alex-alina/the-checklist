import { TextDecoder, TextEncoder } from 'util';
import './env.d.ts';
import '@testing-library/jest-dom';

const globalWithApi = globalThis as typeof globalThis & {
  __VITE_API_BASE_URL__?: string;
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
};

globalWithApi.TextEncoder = globalWithApi.TextEncoder ?? TextEncoder;
globalWithApi.TextDecoder = globalWithApi.TextDecoder ?? TextDecoder;
globalWithApi.__VITE_API_BASE_URL__ = process.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
