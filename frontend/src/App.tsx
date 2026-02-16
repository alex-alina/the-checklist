import { FormEvent, useEffect, useState } from 'react';
import { Checklist as ChecklistProps } from './types';
import { createChecklist, deleteChecklist, fetchChecklists } from './api/checklists';
import { Link } from 'react-router';
import './App.css';
import { DangerButtonRound } from './components/ui/DangerButtonRound';
import { Input } from './components/ui/Input';
import { PrimaryButton } from './components/ui/PrimaryButton';
import { WordGuess } from './components/WordGuessing';

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

  const handleDeleteList = async (checklistId: string) => {
    const status = await deleteChecklist(checklistId);
    if (status === 204) {
      setChecklists((currentLists) => {
        const updatedChecklists = [];
        for (const checklist of currentLists) {
          if (checklistId !== checklist.id) {
            updatedChecklists.push(checklist);
          }
        }
        return updatedChecklists;
      });
    }
  };

  return (
    <div className="mx-auto text-gray-800 flex flex-col md:flex-row">
      <div className="flex flex-col lg:flex-col-reverse">
        <div className="border rounded-xl border-blue-800 p-10 sm:max-w-xl flex flex-col text-lg m-5">
          <h1 className="text-3xl mb-4">My Checklists</h1>
          <ul className="text-xl">
            {checklists.map((checklist) => (
              <li key={checklist.id} className="mb-4 flex justify-between underline text-blue-800">
                <Link
                  to={`/checklist/${checklist.id}`}
                  className="text-ellipsis max-w-48 sm:max-w-xl"
                  data-testid={`list-${checklist.id}`}
                >
                  {checklist.name}
                </Link>
                <DangerButtonRound onClick={() => handleDeleteList(checklist.id)} />
              </li>
            ))}
          </ul>
          {checklists.length === 0 && <p>Get organised! Create your first checklist.</p>}
        </div>

        <div className="border rounded-xl border-blue-800 sm:max-w-xl p-10 m-5 flex flex-col text-lg">
          <p className="text-3xl">Create new checklist</p>
          <form onSubmit={handleCreateChecklist} className="flex flex-col gap-0.5 mt-4">
            <label className="flex flex-col">
              Checklist Name
              <Input
                value={newChecklistName}
                onChange={(event) => setNewChecklistName(event.target.value)}
                placeholder="New checklist name"
              />
            </label>
            <label className="flex flex-col mt-2">
              First item
              <Input
                value={newChecklistItemName}
                onChange={(event) => setNewChecklistItemName(event.target.value)}
                placeholder="Optional item"
              />
            </label>
            <PrimaryButton type="submit" className="mt-4">
              Add checklist
            </PrimaryButton>
          </form>
        </div>
      </div>
      <div>
        <WordGuess />
      </div>
    </div>
  );
};
