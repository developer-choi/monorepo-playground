'use client';

import {TextField} from '@radix-ui/themes';
import {ComponentProps, ReactNode} from 'react';
import {Caption, Label} from './elements';

interface InputProps extends ComponentProps<typeof TextField.Root> {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
}

export default function Input({label, caption, error, color, ...props}: InputProps) {
  return (
    <label>
      {label && <Label>{label}</Label>}
      <TextField.Root color={error ? 'red' : color} {...props} />
      {error && <Caption type="error">{error}</Caption>}
      {!error && <Caption>{caption}</Caption>}
    </label>
  );
}
