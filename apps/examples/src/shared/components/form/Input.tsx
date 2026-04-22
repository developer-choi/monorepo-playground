'use client';

import {TextField} from '@radix-ui/themes';
import {ComponentProps, ReactNode} from 'react';
import classNames from 'classnames';
import {Caption, Label} from './elements';
import styles from './Input.module.scss';

export interface InputProps extends ComponentProps<typeof TextField.Root> {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
}

export default function Input({label, caption, error, color, className, ref, ...props}: InputProps) {
  return (
    <label>
      {label && <Label>{label}</Label>}
      <TextField.Root
        ref={ref}
        className={classNames(error ? styles.error : undefined, className)}
        color={error ? 'red' : color}
        {...props}
      />
      {error && <Caption type="error">{error}</Caption>}
      {!error && <Caption>{caption}</Caption>}
    </label>
  );
}
