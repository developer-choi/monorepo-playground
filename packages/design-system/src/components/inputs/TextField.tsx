'use client';

import {type ComponentProps, type ReactNode, useId} from 'react';
import clsx from 'clsx';
import Caption from '@/components/data-display/Caption';
import InputBase from '@/components/inputs/InputBase';
import Label from '@/components/inputs/Label';
import styles from './TextField.module.scss';

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'size'> {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  isRequired?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  suffix?: string;
}

export default function TextField({
  label,
  caption,
  error,
  isRequired,
  leading,
  trailing,
  suffix,
  id,
  ...rest
}: TextFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const isInvalid = !!error;

  return (
    <div className={clsx(styles.field, styles.styled)}>
      {label && (
        <Label htmlFor={inputId} isInvalid={isInvalid} isRequired={isRequired}>
          {label}
        </Label>
      )}
      <InputBase isInvalid={isInvalid} leading={leading} suffix={suffix} trailing={trailing}>
        <input id={inputId} {...rest} />
      </InputBase>
      {error ? <Caption isInvalid>{error}</Caption> : caption ? <Caption>{caption}</Caption> : null}
    </div>
  );
}
