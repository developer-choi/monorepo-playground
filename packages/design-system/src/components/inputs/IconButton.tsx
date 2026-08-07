import {type ComponentProps, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.scss';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export default function IconButton({icon, size = 'medium', type = 'button', className, ...rest}: IconButtonProps) {
  return (
    <button className={clsx(styles.iconButton, styles.styled, styles[size], className)} type={type} {...rest}>
      <span className={styles.icon}>{icon}</span>
    </button>
  );
}
