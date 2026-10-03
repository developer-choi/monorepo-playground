'use client';

import {type ComponentProps, type ElementType, type MouseEvent, useCallback} from 'react';
import clsx from 'clsx';
import {Slot} from 'radix-ui';
import Spinner from '@/components/feedback/Spinner';
import styles from './Button.module.scss';

type UsedProps = 'style' | 'className' | 'onClick' | 'disabled' | 'children' | 'type' | 'ref';

export interface ButtonProps extends Pick<ComponentProps<'button'>, UsedProps> {
  size?: 'small' | 'medium' | 'large' | 'xLarge';
  variant?: 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'destructive' | 'surface';
  loading?: boolean;
  asChild?: boolean;
}

const SPINNER_SIZE_BY_BUTTON_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
  xLarge: 28,
  large: 24,
  medium: 20,
  small: 16,
};

export default function Button({
  children,
  className,
  type = 'button',
  loading = false,
  size = 'medium',
  variant = 'contained',
  color = 'primary',
  asChild = false,
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

  const Comp: ElementType = asChild ? Slot.Root : 'button';

  return (
    <Comp
      className={clsx(
        styles.button,
        styles.styled,
        styles[size],
        styles[variant],
        styles[color],
        loading && styles.loading,
        className,
      )}
      // type은 <button> 전용 속성이므로 asChild일 때는 전달하지 않는다.
      {...(asChild ? {} : {type})}
      onClick={handleClick}
      {...rest}
    >
      {asChild ? (
        // Slottable로 감싼 자식이 slot 대상이 되어, loading 시 Spinner를 자식 내부로 합쳐준다.
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : (
        <span className={clsx(styles.children, styles.styled, loading && styles.loading)}>{children}</span>
      )}
      {loading ? <Spinner className={styles.spinner} size={SPINNER_SIZE_BY_BUTTON_SIZE[size]} /> : null}
    </Comp>
  );
}
