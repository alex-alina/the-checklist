import { Trash2 } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

export interface DangerButtonProps extends ComponentPropsWithoutRef<'button'> {
  handleClick: () => Promise<void>;
}

export const DangerButtonRound = ({ handleClick }: DangerButtonProps) => {
  return (
    <button
      onClick={handleClick}
      className="w-7 h-7 hover:border-red-800 hover:bg-red-800  text-red-800 hover:text-white rounded-full flex items-center justify-center border border-red-800"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};
