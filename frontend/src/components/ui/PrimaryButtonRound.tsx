import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface PrimaryButtonRoundProps extends ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButtonRound = ({ children, className, ...props }: PrimaryButtonRoundProps) => {
  return (
    <button
      {...props}
      className={clsx(
        'w-10 h-10 flex justify-center items-center bg-blue-800  hover:bg-blue-500 rounded-full text-white',
        className
      )}
    >
      {children}
    </button>
  );
};
