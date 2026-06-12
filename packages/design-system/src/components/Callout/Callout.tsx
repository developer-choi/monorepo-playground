import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Callout.module.scss';

type UsedProps = 'className' | 'children';

export interface CalloutProps extends Pick<ComponentProps<'div'>, UsedProps> {
  color?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export default function Callout({children, className, color = 'info'}: CalloutProps) {
  return (
    <div className={clsx(styles.callout, styles.styled, styles[color], className)} role="note">
      {children}
    </div>
  );
}
