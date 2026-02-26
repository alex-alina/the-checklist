import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Checklist as ChecklistProps, Item as ChecklistItem } from '../../types';
import {
  createItem,
  deleteChecklist,
  deleteItems,
  deleteChecklistItem,
  fetchChecklist,
  toggleItem,
  updateItemQuantity
} from '../../api/checklists';
import { useParams, useNavigate } from 'react-router';
import { PlusIcon, MinusIcon, LinkIcon } from 'lucide-react';
import { DangerButton } from '../../components/ui/DangerButton';
import { DangerButtonRound } from '../../components/ui/DangerButtonRound';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PrimaryButtonRound } from '../../components/ui/PrimaryButtonRound';
import clsx from 'clsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../components/ui/Accordion';
import { Header } from './Header';

export const Checklist = () => {
  const initialChecklistState = {
    id: '',
    name: '',
    items: []
  };

  const navigate = useNavigate();
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
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
    const url = newItemUrl.trim() || undefined;
    const parsedQuantity = newItemQuantity.trim() ? Number(newItemQuantity) : undefined;
    const quantity =
      parsedQuantity !== undefined && Number.isFinite(parsedQuantity) ? parsedQuantity : undefined;
    const item = await createItem(checklist.id, name, url, quantity);

    setChecklist((checklist) => {
      return { ...checklist, items: [...checklist.items, item] };
    });

    setNewItemName('');
    setNewItemUrl('');
    setNewItemQuantity('');
  };

  const handleDecreaseQuantity = () => {
    setNewItemQuantity((currentQuantity) => {
      const quantityAsNumber = parseInt(currentQuantity);
      if (quantityAsNumber === 0) {
        return currentQuantity;
      }

      const newQuantity = quantityAsNumber - 1;
      return newQuantity.toString();
    });
  };

  const handleIncreaseQuantity = () => {
    setNewItemQuantity((currentQuantity) => {
      if (currentQuantity === '') {
        return '1';
      }
      const quantityAsNumber = parseInt(currentQuantity);

      const newQuantity = quantityAsNumber + 1;
      return newQuantity.toString();
    });
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

  const handleUpdateItemQuantity = async (item: ChecklistItem, delta: number) => {
    const current = item.quantity ?? 0;
    const nextQuantity = Math.max(0, current + delta);
    const updated = await updateItemQuantity(checklist.id, item.id, nextQuantity);

    setChecklist((checklist) => ({
      ...checklist,
      items: checklist.items.map((currentItem) =>
        currentItem.id === updated.id ? updated : currentItem
      )
    }));
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
    <div className="p-1 sm:p-8">
      <Header shareMessage={shareMessage} shareChecklistUrl={shareChecklistUrl} />

      {checklist && checklist.id ? (
        <div className="flex flex-col justify-center items-center w-full md:w-xl max-w-xl mx-auto">
          <div className="flex flex-col justify-center items-center w-full">
            {showDeleteListError && (
              <div className="text-lg px-3 py-2 text-red-800 border border-red-800 rounded-xl">
                Someting went wrong. Please try again.
              </div>
            )}
            <div className="flex items-center">
              <h2 className="text-3xl my-4 mr-4">{checklist && checklist.name}</h2>
              <DangerButtonRound onClick={() => handleDeleteList(checklist.id)} />
            </div>

            <form
              onSubmit={handleAddItem}
              className="flex flex-col justify-center items-center w-full"
            >
              <input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="Add new item"
                className="p-2 border border-b-blue-90 rounded-md my-2 text-lg w-full"
              />
              <input
                type="url"
                value={newItemUrl}
                onChange={(event) => setNewItemUrl(event.target.value)}
                placeholder="Add item url"
                className="p-2 border border-b-blue-90 rounded-md my-2 text-lg w-full"
              />
              <div className="flex justify-center items-center w-full">
                <PrimaryButtonRound
                  type="button"
                  className="h-10 w-10 mr-4"
                  onClick={() => handleDecreaseQuantity()}
                >
                  <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </PrimaryButtonRound>
                <input
                  type="number"
                  name="quantity"
                  value={newItemQuantity}
                  onChange={(event) => setNewItemQuantity(event.target.value)}
                  placeholder="0"
                  className="block p-2 border border-b-blue-90 rounded-md my-2 text-lg min-w-20"
                />
                <PrimaryButtonRound
                  type="button"
                  className="h-10 w-10 ml-4"
                  onClick={() => handleIncreaseQuantity()}
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </PrimaryButtonRound>
              </div>
              <PrimaryButton data-testid="add-item-submit" type="submit" className="mt-6 w-full">
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add item
              </PrimaryButton>
            </form>
          </div>
          <div className="flex flex-col w-full my-8">
            <Accordion type="single" collapsible defaultValue="item-1">
              {checklist &&
                checklist.items.map((item, index) => (
                  <AccordionItem value={item.name} key={item.id}>
                    <AccordionTrigger className={clsx({ 'bg-blue-50': index % 2 === 0 })}>
                      <div className="flex justify-between items-center sm:w-full text-xl">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            onChange={() => {
                              handleToggleItem(item);
                            }}
                            className="w-4 h-4"
                          />
                          {item.quantity !== null &&
                            item.quantity !== undefined &&
                            item.quantity >= 1 && <p className="ml-2">{item.quantity}</p>}
                          <span className="ml-2">{item.name}</span>
                        </label>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent
                      className={clsx(
                        'flex flex-col gap-2 sm:flex-row sm:justify-end justify-center items-center text-xl',
                        {
                          'bg-blue-50': index % 2 === 0,
                          'sm:justify-between': item.url
                        }
                      )}
                    >
                      {item?.url && (
                        <div className="flex items-center text-lg text-blue-600">
                          <a rel="noreferrer" href={item.url} target="_blank">
                            Click here for details
                          </a>
                          <LinkIcon className="w-4 h-4 ml-2" />
                        </div>
                      )}
                      <div className="flex justify-between">
                        <div className="flex items-center mr-6">
                          <button
                            data-testid={`item-quantity-decrease-${item.id}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleUpdateItemQuantity(item, -1);
                            }}
                          >
                            <MinusIcon className="w-4 h-4 text-blue-600 font-bold" />
                          </button>
                          <p className="mx-2">{item.quantity ?? 0}</p>
                          <button
                            data-testid={`item-quantity-increase-${item.id}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleUpdateItemQuantity(item, 1);
                            }}
                          >
                            <PlusIcon className="w-4 h-4 text-blue-600 font-bold" />
                          </button>
                        </div>
                        <DangerButtonRound
                          data-testid={`item-delete-${item.id}`}
                          onClick={() => handleDeleteItem(item.id)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
            {checklist && !checklist.items.length && (
              <p className="text-center">Add some items to your checklist.</p>
            )}
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
