import {type ComponentProps, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.scss';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export default function IconButton({icon, size = 'medium', type = 'button', className, ...rest}: IconButtonProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- IconButton이 공통 아이콘 버튼 컴포넌트. raw <button>은 여기 한 곳에서만 사용(소비자는 IconButton 사용)
    <button className={clsx(styles.iconButton, styles.styled, styles[size], className)} type={type} {...rest}>
      <span className={styles.icon}>{icon}</span>
    </button>
  );
}
