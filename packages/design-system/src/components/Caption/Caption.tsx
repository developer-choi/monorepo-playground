import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Caption.module.scss';

export interface CaptionProps extends ComponentProps<'p'> {
  isInvalid?: boolean;
}

export default function Caption({isInvalid, className, children, ...rest}: CaptionProps) {
  return (
    <p
      className={clsx(styles.caption, styles.styled, isInvalid && styles.invalid, className)}
      role={isInvalid ? 'alert' : undefined}
      {...rest}
    >
      {children}
    </p>
  );
}
