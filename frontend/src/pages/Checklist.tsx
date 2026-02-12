import { FormEvent, useEffect, useState } from 'react';
import { Checklist as ChecklistProps, Item as ChecklistItem } from '../types';
import {
  createItem,
  deleteChecklist,
  deleteChecklistItem,
  fetchChecklist,
  toggleItem
} from '../api/checklists';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Share2, PlusCircle } from 'lucide-react';
import { DangerButtonRound } from '../components/DangerButtonRound';
import { PrimaryButton } from '../components/PrimaryButton';

export const Checklist = () => {
  const initialChecklistState = {
    id: '',
    name: '',
    items: []
  };

  const navigate = useNavigate();
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

  const handleDeleteItem = async (itemId: string) => {
    const status = await deleteChecklistItem(itemId);
    if (status !== 204) {
      return;
    }

    setChecklist((checklist) => ({
      ...checklist,
      items: checklist.items.filter((item) => item.id !== itemId)
    }));
  };

  const handleDeleteList = async (checklistId: string) => {
    const status = await deleteChecklist(checklistId);
    if (status === 204) {
      navigate('/');
    }
    //TODO show success / error message?
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between">
        <Link to="/">
          <PrimaryButton type="submit" className="w-40">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go back to lists
          </PrimaryButton>
        </Link>
        <PrimaryButton className="w-40">
          <Share2 className="w-5 h-5 mr-2" />
          Share checklist
        </PrimaryButton>
      </div>
      {checklist && checklist.id ? (
        <div className="flex flex-col justify-center items-center w-fit max-w-xl mx-auto">
          <header className="flex flex-col justify-center items-center">
            <div className="flex items-center">
              <h2 className="text-3xl my-6 mr-4">{checklist && checklist.name}</h2>
              <DangerButtonRound onClick={() => handleDeleteList(checklist.id)} />
            </div>

            <form onSubmit={handleAddItem} className="flex flex-row justify-center items-center">
              <input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="Add new item"
                className="block p-2 border border-b-blue-90 rounded-md my-2 sm:w-80 w-50"
              />
              <PrimaryButton type="submit" className="h-10 w-28 sm:w-30 ml-4">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add item
              </PrimaryButton>
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
                  <DangerButtonRound onClick={() => handleDeleteItem(item.id)} />
                </div>
              ))}
            {checklist && !checklist.items.length && <p>No items yet.</p>}
          </div>
        </div>
      ) : (
        <div className="text-xl italic w-fit mx-auto">Ups! This checklist does not exist.</div>
      )}
    </div>
  );
};
