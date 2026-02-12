import { Checklist, Item } from '../types';

const resolveApiUrl = () => {
  if (typeof globalThis !== 'undefined') {
    const globalWithApi = globalThis as typeof globalThis & {
      __VITE_API_BASE_URL__?: string;
    };
    if (globalWithApi.__VITE_API_BASE_URL__) {
      return globalWithApi.__VITE_API_BASE_URL__;
    }
  }

  return undefined;
};

const baseUrl = resolveApiUrl() ?? 'http://localhost:4000';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response.json();
};

export const fetchChecklists = (): Promise<Checklist[]> =>
  fetch(`${baseUrl}/checklists`).then((response) => handleResponse<Checklist[]>(response));

export const fetchChecklist = (checklistId: string): Promise<Checklist> =>
  fetch(`${baseUrl}/checklists/${checklistId}`).then((response) =>
    handleResponse<Checklist>(response)
  );

export const createChecklist = (checklist: {
  name: string;
  items?: { name: string }[];
}): Promise<Checklist> =>
  fetch(`${baseUrl}/checklists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checklist)
  }).then((response) => handleResponse<Checklist>(response));

export const deleteChecklist = (checklistId: string): Promise<number> =>
  fetch(`${baseUrl}/checklists/${checklistId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }).then((response) => response.status);

export const createItem = (checklistId: string, name: string): Promise<Item> =>
  fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checklistId, name })
  }).then((response) => handleResponse<Item>(response));

export const toggleItem = (itemId: string, isChecked: boolean): Promise<Item> =>
  fetch(`${baseUrl}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isChecked })
  }).then((response) => handleResponse<Item>(response));
