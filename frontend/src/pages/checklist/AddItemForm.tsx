import { FormEvent } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PrimaryButtonRound } from '../../components/ui/PrimaryButtonRound';

interface AddItemFormProps {
  onSubmit: (event: FormEvent) => Promise<void>;
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemUrl: string;
  setNewItemUrl: (url: string) => void;
  newItemQuantity: string;
  setNewItemQuantity: (quantity: string) => void;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
}

export const AddItemForm = ({
  onSubmit,
  newItemName,
  setNewItemName,
  newItemUrl,
  setNewItemUrl,
  newItemQuantity,
  setNewItemQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity
}: AddItemFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col justify-center items-center w-full">
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
        <PrimaryButtonRound type="button" className="h-10 w-10 mr-4" onClick={onDecreaseQuantity}>
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
        <PrimaryButtonRound type="button" className="h-10 w-10 ml-4" onClick={onIncreaseQuantity}>
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </PrimaryButtonRound>
      </div>
      <PrimaryButton data-testid="add-item-submit" type="submit" className="mt-6 w-full">
        <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Add item
      </PrimaryButton>
    </form>
  );
};
