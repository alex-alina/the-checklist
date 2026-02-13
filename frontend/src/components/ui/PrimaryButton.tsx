import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface PrimaryButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton = ({ children, className, ...props }: PrimaryButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        'flex justify-center items-center bg-blue-800 h-10 px-3 py-2 text-white rounded-md',
        className
      )}
    >
      {children}
    </button>
  );
};
