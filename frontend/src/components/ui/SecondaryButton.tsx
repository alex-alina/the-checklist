import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface SecondaryButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const SecondaryButton = ({ children, className, ...props }: SecondaryButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        'flex justify-center items-center bg-white/95 border-2 text-blue-800 border-blue-800 h-10 px-3 py-2 rounded-md',
        className
      )}
    >
      {children}
    </button>
  );
};
