import { FormEvent, useEffect, useState } from 'react';
import { Checklist as ChecklistProps, Item as ChecklistItem } from '../types';
import { createItem, fetchChecklist, toggleItem } from '../api/checklists';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Share2, PlusCircle, Trash2 } from 'lucide-react';

export const Checklist = () => {
  const initialChecklistState = {
    id: '',
    name: '',
    items: []
  };
  const [newItemName, setNewItemName] = useState('');
  const [checklist, setChecklist] = useState<ChecklistProps>(initialChecklistState);

  //TODO: add share list url button
  const params = useParams();
  // console.log('Share List URL', window.location.href);

  const loadChecklist = async (checklistId: string) => {
    const data = await fetchChecklist(checklistId);
    setChecklist(data);
  };
  //Check with Adi, what to do in case of no checklist / error

  useEffect(() => {
    params.id && loadChecklist(params.id);
  }, [params.id]);

  const handleAddItem = async (event: FormEvent) => {
    event.preventDefault();
    const name = newItemName.trim();
    const item = await createItem(checklist.id, name);

    setChecklist((checklist) => {
      return { ...checklist, items: [...checklist.items, item] };
    });

    setNewItemName('');
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const updated = await toggleItem(item.id, !item.isChecked);

    setChecklist((checklist) => {
      return {
        ...checklist,
        items: checklist.items.map((currentItem) =>
          currentItem.id === updated.id ? updated : currentItem
        )
      };
    });
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between">
        <Link to="/">
          <button className="flex justify-between bg-blue-800 py-2 px-3 text-md text-white rounded-md w-40">
            <ArrowLeft className="w-5 h-5" />
            Go back to lists
          </button>
        </Link>
        <button className="flex justify-between bg-blue-800 py-2 px-3 text-md text-white rounded-md w-40">
          <Share2 className="w-5 h-5" />
          Share checklist
        </button>
      </div>
      {checklist && checklist.id ? (
        <div className="flex flex-col justify-center items-center w-fit max-w-xl mx-auto">
          <header className="flex flex-col justify-center items-center">
            <div className="flex items-center">
              <h2 className="text-3xl my-6 mr-4">{checklist && checklist.name}</h2>
              <button className="w-7 h-7 hover:border-red-800 hover:bg-red-800  text-red-800 hover:text-white rounded-full flex items-center justify-center border border-red-800">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-row justify-center items-center">
              <input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="Add new item"
                className="block p-2 border border-b-blue-90 rounded-md my-2 sm:w-80 w-50"
              />
              <button
                type="submit"
                className="flex justify-between items-center bg-blue-800 px-3 h-10 w-28 sm:w-30 ml-4 text-white rounded-md "
              >
                <PlusCircle className="w-5 h-5" />
                Add item
              </button>
            </form>
          </header>
          <div className="flex flex-col w-full mt-6">
            {checklist &&
              checklist.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => handleToggleItem(item)}
                    />
                    <span className="ml-2 text-xl">{item.name}</span>
                  </label>
                  <button className="w-6 h-6 hover:border-red-800 hover:bg-red-800  text-red-800 hover:text-white rounded-full flex items-center justify-center border border-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            {checklist && !checklist.items.length && <p>No items yet.</p>}
          </div>
        </div>
      ) : (
        <p>No checklist with this name exists</p>
      )}
    </div>
  );
};
