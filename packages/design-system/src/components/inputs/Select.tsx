'use client';

import {type ComponentProps, type ReactNode, useId} from 'react';
import clsx from 'clsx';
import {ChevronDownIcon} from '@radix-ui/react-icons';
import Caption from '@/components/data-display/Caption';
import InputBase from '@/components/inputs/InputBase';
import Label from '@/components/inputs/Label';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends ComponentProps<'select'> {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  isRequired?: boolean;
  placeholder?: string;
  options: SelectOption[];
}

export default function Select({label, caption, error, isRequired, placeholder, options, id, ...rest}: SelectProps) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const isInvalid = !!error;

  return (
    <div className={clsx(styles.field, styles.styled)}>
      {label && (
        <Label htmlFor={selectId} isInvalid={isInvalid} isRequired={isRequired}>
          {label}
        </Label>
      )}
      <InputBase isInvalid={isInvalid} trailing={<ChevronDownIcon aria-hidden />}>
        <select className={clsx(styles.select, styles.styled)} id={selectId} {...rest}>
          {placeholder && (
            <option disabled hidden value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </InputBase>
      {error ? <Caption isInvalid>{error}</Caption> : caption ? <Caption>{caption}</Caption> : null}
    </div>
  );
}
