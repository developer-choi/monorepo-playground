import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Label.module.scss';

export interface LabelProps extends ComponentProps<'label'> {
  isRequired?: boolean;
  isInvalid?: boolean;
}

export default function Label({isRequired, isInvalid, className, children, ...rest}: LabelProps) {
  return (
    <label className={clsx(styles.label, styles.styled, isInvalid && styles.invalid, className)} {...rest}>
      {children}
      {isRequired && (
        <span aria-hidden="true" className={clsx(styles.required, styles.styled)}>
          *
        </span>
      )}
    </label>
  );
}
