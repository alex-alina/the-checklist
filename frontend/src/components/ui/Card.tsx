import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={clsx(
        'border rounded-xl border-blue-800 p-10 sm:max-w-xl flex flex-col text-lg',
        className
      )}
    >
      {children}
    </div>
  );
};
