import {type ComponentProps, type ReactElement, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './InputBase.module.scss';

export interface InputBaseProps extends Omit<ComponentProps<'label'>, 'children'> {
  leading?: ReactNode;
  trailing?: ReactNode;
  suffix?: string;
  isInvalid?: boolean;
  children: ReactElement;
}

export default function InputBase({
  leading,
  trailing,
  suffix,
  isInvalid,
  className,
  children,
  ...rest
}: InputBaseProps) {
  return (
    <label className={clsx(styles.inputBase, styles.styled, isInvalid && styles.invalid, className)} {...rest}>
      {leading && <span className={clsx(styles.slot, styles.styled)}>{leading}</span>}
      <span className={clsx(styles.content, styles.styled)}>
        {children}
        {suffix && <span className={clsx(styles.suffix, styles.styled)}>{suffix}</span>}
      </span>
      {trailing && <span className={clsx(styles.slot, styles.styled)}>{trailing}</span>}
    </label>
  );
}
