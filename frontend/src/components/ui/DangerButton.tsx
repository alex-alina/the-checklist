import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface DangerButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const DangerButton = ({ children, className, ...props }: DangerButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        'flex justify-center items-center bg-white hover:border-red-800 hover:bg-red-800 h-10 px-3 py-2 text-red-800 hover:text-white text-bold border  border-red-800 rounded-md',
        className
      )}
    >
      {children}
    </button>
  );
};
