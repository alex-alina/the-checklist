import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  className?: string;
}

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={clsx('p-2 border-2 border-blue-900 rounded-md my-2 bg-white', className)}
    />
  );
};
