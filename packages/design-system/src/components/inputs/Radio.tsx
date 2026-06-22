'use client';

import {type ComponentProps, type ReactNode, useContext} from 'react';
import clsx from 'clsx';
import {radioGroupContext} from '@/components/inputs/RadioGroupContext';
import styles from './Radio.module.scss';

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  children?: ReactNode;
}

export default function Radio({children, className, name, checked, value, disabled, onChange, ...rest}: RadioProps) {
  const group = useContext(radioGroupContext);

  return (
    <label className={clsx(styles.option, styles.styled, disabled && styles.disabled, className)}>
      <input
        checked={checked ?? (group.value !== undefined ? group.value === value : undefined)}
        className={clsx(styles.radio, styles.styled)}
        disabled={disabled}
        name={name ?? group.name}
        type="radio"
        value={value}
        onChange={(event) => {
          onChange?.(event);
          group.onChange?.(event);
        }}
        {...rest}
      />
      {children && <span className={clsx(styles.label, styles.styled)}>{children}</span>}
    </label>
  );
}
