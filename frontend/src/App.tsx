import { FormEvent, useEffect, useState } from 'react';
import { Checklist as ChecklistProps } from './types';
import { createChecklist, fetchChecklists } from './api/checklists';
import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import './App.css';

export const App = () => {
  const [checklists, setChecklists] = useState<ChecklistProps[]>([]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItemName, setNewChecklistItemName] = useState('');

  const loadChecklists = async () => {
    const data = await fetchChecklists();
    setChecklists(data);
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const handleCreateChecklist = async (event: FormEvent) => {
    event.preventDefault();
    if (!newChecklistName.trim()) {
      return;
    }
    const checklist = await createChecklist({
      name: newChecklistName.trim(),
      items: newChecklistItemName ? [{ name: newChecklistItemName.trim() }] : []
    });
    setChecklists((current) => [...current, checklist]);
    setNewChecklistName('');
    setNewChecklistItemName('');
  };

  return (
    <div className="mx-auto text-gray-800">
      <div className="flex flex-col lg:flex-col-reverse">
        <div className="border rounded-xl border-blue-800 p-10 sm:max-w-xl flex flex-col text-lg m-5">
          <h1 className="text-3xl mb-4">My Checklists</h1>
          <ul className="text-xl">
            {checklists.map((checklist) => (
              <li key={checklist.id} className="mb-4 flex justify-between">
                <Link
                  to={`/checklist/${checklist.id}`}
                  className="text-ellipsis max-w-48 sm:max-w-xl"
                  data-testid={`list-${checklist.id}`}
                >
                  {checklist.name}
                </Link>
                <button className="w-8 h-8 hover:border-red-800 hover:bg-red-800  text-red-800 hover:text-white rounded-full flex items-center justify-center border border-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded-xl border-blue-800 sm:max-w-xl p-10 m-5 flex flex-col text-lg">
          <p className="text-3xl">Create new checklist</p>
          <form onSubmit={handleCreateChecklist} className="flex flex-col gap-0.5 mt-4">
            <label className="flex flex-col">
              Checklist Name
              <input
                value={newChecklistName}
                onChange={(event) => setNewChecklistName(event.target.value)}
                placeholder="New checklist name"
                className="p-2 border border-b-blue-900 rounded-md my-2"
              />
            </label>
            <label className="flex flex-col mt-2">
              First item
              <input
                value={newChecklistItemName}
                onChange={(event) => setNewChecklistItemName(event.target.value)}
                placeholder="Optional item"
                className="p-2 border border-b-blue-90 rounded-md my-2"
              />
            </label>
            <button type="submit" className="bg-blue-800 p-3 mt-4 text-white rounded-md">
              Add checklist
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
