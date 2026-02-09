import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Checklist,
  Item as ChecklistItem
} from './types';
import {
  createChecklist,
  createItem,
  fetchChecklists,
  toggleItem
} from './api/checklists';
import './App.css';

export const App = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItemName, setNewChecklistItemName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

  const selectedChecklist = useMemo(() => {
    if (selectedChecklistId) {
      return checklists.find((checklist) => checklist.id === selectedChecklistId) ?? null;
    }
    return checklists[0] ?? null;
  }, [checklists, selectedChecklistId]);

  const shareLink = useMemo(() => {
    if (!selectedChecklist) {
      return '';
    }
    return `${window.location.origin}?id=${selectedChecklist.id}`;
  }, [selectedChecklist]);

  const loadChecklists = async (preferredId?: string | null) => {
    const data = await fetchChecklists();
    setChecklists(data);
    if (!data.length) {
      setSelectedChecklistId(null);
      return;
    }
    if (preferredId && data.some((checklist) => checklist.id === preferredId)) {
      setSelectedChecklistId(preferredId);
      return;
    }
    setSelectedChecklistId((current) => {
      if (current && data.some((checklist) => checklist.id === current)) {
        return current;
      }
      return data[0].id;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');
    loadChecklists(sharedId);
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
    setSelectedChecklistId(checklist.id);
  };

  const handleAddItem = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedChecklist || !newItemName.trim()) {
      return;
    }
    const item = await createItem(selectedChecklist.id, newItemName.trim());
    setChecklists((current) =>
      current.map((checklist) =>
        checklist.id === selectedChecklist.id
          ? { ...checklist, items: [...checklist.items, item] }
          : checklist
      )
    );
    setNewItemName('');
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const updated = await toggleItem(item.id, !item.isChecked);
    setChecklists((current) =>
      current.map((checklist) =>
        checklist.id === updated.checklist.id
          ? {
              ...checklist,
              items: checklist.items.map((currentItem) =>
                currentItem.id === updated.id ? updated : currentItem
              )
            }
          : checklist
      )
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Checklists</h1>
        <ul>
          {checklists.map((checklist) => (
            <li
              key={checklist.id}
              className={checklist.id === selectedChecklist?.id ? 'selected' : ''}
            >
              <button type="button" onClick={() => setSelectedChecklistId(checklist.id)}>
                {checklist.name}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateChecklist} className="form">
          <label>
            Name
            <input
              value={newChecklistName}
              onChange={(event) => setNewChecklistName(event.target.value)}
              placeholder="New checklist"
            />
          </label>
          <label>
            First item
            <input
              value={newChecklistItemName}
              onChange={(event) => setNewChecklistItemName(event.target.value)}
              placeholder="Optional item"
            />
          </label>
          <button type="submit">Create checklist</button>
        </form>
      </aside>

      <main className="panel">
        {selectedChecklist ? (
          <>
            <header>
              <h2>{selectedChecklist.name}</h2>
              <p>Share: <code>{shareLink}</code></p>
            </header>
            <section className="items">
              {selectedChecklist.items.map((item) => (
                <label key={item.id} className="item">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleToggleItem(item)}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
              {!selectedChecklist.items.length && <p>No items yet.</p>}
            </section>
            <form onSubmit={handleAddItem} className="form">
              <input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="Add new item"
              />
              <button type="submit">Add item</button>
            </form>
          </>
        ) : (
          <p>Select or create a checklist to get started.</p>
        )}
      </main>
    </div>
  );
};
