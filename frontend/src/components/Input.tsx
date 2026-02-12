import { ComponentPropsWithoutRef } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {}

export const Input = (props: InputProps) => {
  return <input {...props} className="p-2 border border-b-blue-90 rounded-md my-2" />;
};
