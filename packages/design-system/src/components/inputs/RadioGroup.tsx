'use client';

import {type ChangeEventHandler, type ComponentProps, useMemo} from 'react';
import clsx from 'clsx';
import {radioGroupContext} from './RadioGroupContext';
import styles from './RadioGroup.module.scss';

export interface RadioGroupProps extends ComponentProps<'div'> {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  direction?: 'row' | 'column';
}

export default function RadioGroup({
  name,
  value,
  onChange,
  direction = 'row',
  className,
  children,
  ...rest
}: RadioGroupProps) {
  const contextValue = useMemo(() => ({name, value, onChange}), [name, value, onChange]);

  return (
    <radioGroupContext.Provider value={contextValue}>
      <div className={clsx(styles.group, styles.styled, styles[direction], className)} role="radiogroup" {...rest}>
        {children}
      </div>
    </radioGroupContext.Provider>
  );
}
