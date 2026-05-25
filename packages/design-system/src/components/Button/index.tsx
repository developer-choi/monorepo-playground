'use client';

import {type ComponentProps, type MouseEvent, useCallback} from 'react';
import clsx from 'clsx';
import {Spinner} from '@/components/Spinner';
import styles from './index.module.scss';

type UsedProps = 'style' | 'className' | 'onClick' | 'disabled' | 'children' | 'type' | 'ref';

export interface ButtonProps extends Pick<ComponentProps<'button'>, UsedProps> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
}

const SPINNER_SIZE_BY_BUTTON_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
  large: 24,
  medium: 20,
  small: 16,
};

export function Button({
  children,
  className,
  type = 'button',
  loading = false,
  size = 'medium',
  variant = 'contained',
  color = 'primary',
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        return;
      }
      onClick?.(event);
    },
    [loading, onClick],
  );

  return (
    // eslint-disable-next-line no-restricted-syntax -- Button 컴포넌트 자체가 <button>을 추상화하는 공통 컴포넌트이므로 예외
    <button
      className={clsx(
        styles.button,
        styles.styled,
        styles[size],
        styles[variant],
        styles[color],
        loading && styles.loading,
        className,
      )}
      type={type}
      onClick={handleClick}
      {...rest}
    >
      <span className={clsx(styles.children, loading && styles.loading)}>{children}</span>
      {loading ? <Spinner className={styles.spinner} size={SPINNER_SIZE_BY_BUTTON_SIZE[size]} /> : null}
    </button>
  );
}
