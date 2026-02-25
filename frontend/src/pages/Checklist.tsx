import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Checklist as ChecklistProps, Item as ChecklistItem } from '../types';
import {
  createItem,
  deleteChecklist,
  deleteItems,
  deleteChecklistItem,
  fetchChecklist,
  toggleItem
} from '../api/checklists';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Share2, CheckCircle2, PlusIcon } from 'lucide-react';
import { DangerButton } from '../components/ui/DangerButton';
import { DangerButtonRound } from '../components/ui/DangerButtonRound';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PrimaryButtonRound } from '../components/ui/PrimaryButtonRound';

export const Checklist = () => {
  const initialChecklistState = {
    id: '',
    name: '',
    items: []
  };

  const navigate = useNavigate();
  const [newItemName, setNewItemName] = useState('');
  const [checklist, setChecklist] = useState<ChecklistProps>(initialChecklistState);
  const [showDeleteListError, setShowDeleteListError] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const params = useParams();

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.href;
  }, []);

  const loadChecklist = async (checklistId: string) => {
    const data = await fetchChecklist(checklistId);
    setChecklist(data);
  };

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
    const updated = await toggleItem(checklist.id, item.id, !item.isChecked);

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
    const status = await deleteChecklistItem(checklist.id, itemId);
    if (status !== 204) {
      return;
    }

    setChecklist((checklist) => ({
      ...checklist,
      items: checklist.items.filter((item) => item.id !== itemId)
    }));
  };

  const handleDeletItems = async () => {
    const status = await deleteItems(checklist.id);
    if (status !== 204) {
      return;
    }

    setChecklist((checklist) => ({
      ...checklist,
      items: []
    }));
  };

  const handleDeleteList = async (checklistId: string) => {
    const status = await deleteChecklist(checklistId);
    if (status !== 204) {
      setShowDeleteListError(true);
    } else {
      navigate('/');
    }
  };

  const shareChecklistUrl = async () => {
    const url = shareUrl;
    if (!url) {
      setShareMessage('The share URL is not accessible.');
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: checklist.name,
          text: `Take a look at this checklist named ${checklist.name}.`,
          url
        });
        setShareMessage('Share dialog opened.');
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage('Checklist URL copied to clipboard.');
        return;
      }

      setShareMessage('Clipboard support is unavailable.');
    } catch (error) {
      setShareMessage('Unable to share the checklist right now.');
    }
  };

  useEffect(() => {
    if (!shareMessage) {
      return;
    }

    const timer = setTimeout(() => setShareMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [shareMessage]);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col  items-center h-28">
        <div className="flex justify-between w-full">
          <Link to="/">
            <PrimaryButton type="submit" className="w-40">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go back to lists
            </PrimaryButton>
          </Link>
          <PrimaryButton type="button" className="w-40" onClick={shareChecklistUrl}>
            <Share2 className="w-5 h-5 mr-2" />
            Share checklist
          </PrimaryButton>
        </div>
        {shareMessage && (
          <div
            className="flex text-md text-green-700 border border-green-600 rounded w-fit mt-2 px-3 py-2"
            aria-live="polite"
          >
            <CheckCircle2 className="w-5 h-5 mr-3" />
            {shareMessage}
          </div>
        )}
      </div>
      {checklist && checklist.id ? (
        <div className="flex flex-col justify-center items-center w-fit max-w-xl mx-auto">
          <header className="flex flex-col justify-center items-center">
            {showDeleteListError && (
              <div className="text-lg px-3 py-2 text-red-800 border border-red-800 rounded-xl">
                Someting went wrong. Please try again.
              </div>
            )}
            <div className="flex items-center">
              <h2 className="text-3xl my-4 mr-4">{checklist && checklist.name}</h2>
              <DangerButtonRound onClick={() => handleDeleteList(checklist.id)} />
            </div>

            <form onSubmit={handleAddItem} className="flex flex-row justify-center items-center">
              <input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="Add new item"
                className="block p-2 border border-b-blue-90 rounded-md my-2 sm:w-80 w-50 text-lg"
              />
              <PrimaryButtonRound type="submit" className="h-10 w-10 ml-4">
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </PrimaryButtonRound>
            </form>
          </header>
          <div className="flex flex-col w-full my-8">
            {checklist &&
              checklist.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center w-80 sm:w-full mb-3"
                >
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
            {checklist && !checklist.items.length && <p>Add some items to your checklist.</p>}
          </div>
          {checklist.items.length > 1 && (
            <DangerButton
              type="button"
              className="mx-auto w-full text-lg"
              onClick={() => handleDeletItems()}
            >
              Delete all Items
            </DangerButton>
          )}
        </div>
      ) : (
        <div className="text-xl italic w-fit mx-auto">Ups! This checklist does not exist.</div>
      )}
    </div>
  );
};
