import {type ComponentProps, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.scss';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  children?: ReactNode;
}

export default function Checkbox({children, className, disabled, ...rest}: CheckboxProps) {
  return (
    <label className={clsx(styles.option, styles.styled, disabled && styles.disabled, className)}>
      <input className={clsx(styles.checkbox, styles.styled)} disabled={disabled} type="checkbox" {...rest} />
      {children && <span className={clsx(styles.label, styles.styled)}>{children}</span>}
    </label>
  );
}
