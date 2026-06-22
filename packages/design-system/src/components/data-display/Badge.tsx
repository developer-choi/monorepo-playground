import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Badge.module.scss';

type UsedProps = 'className' | 'children';

export interface BadgeProps extends Pick<ComponentProps<'span'>, UsedProps> {
  color?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  variant?: 'soft' | 'outline' | 'surface';
  size?: 'small' | 'medium';
}

export default function Badge({children, className, color = 'neutral', variant = 'soft', size = 'medium'}: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles.styled, styles[color], styles[variant], styles[size], className)}>
      {children}
    </span>
  );
}
