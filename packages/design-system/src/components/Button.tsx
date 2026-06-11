'use client';

import {type ComponentProps, type ElementType, type MouseEvent, useCallback} from 'react';
import clsx from 'clsx';
import {Slot} from 'radix-ui';
import {Spinner} from '@/components/Spinner';
import styles from './Button.module.scss';

type UsedProps = 'style' | 'className' | 'onClick' | 'disabled' | 'children' | 'type' | 'ref';

export interface ButtonProps extends Pick<ComponentProps<'button'>, UsedProps> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
  /**
   * true이면 <button> 대신 자식 엘리먼트에 버튼 스타일·동작을 병합한다.
   * 버튼 형태의 링크(<Link>)를 만들 때 사용한다. 자식은 단일 엘리먼트여야 한다.
   */
  asChild?: boolean;
}

const SPINNER_SIZE_BY_BUTTON_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
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

  // asChild이면 Slot.Root가 자식 엘리먼트에 아래 props(className·onClick·ref 등)를 병합한다.
  // eslint-disable-next-line @typescript-eslint/naming-convention -- JSX에서 컴포넌트로 렌더하려면 대문자 식별자가 필요
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
        <span className={clsx(styles.children, loading && styles.loading)}>{children}</span>
      )}
      {loading ? <Spinner className={styles.spinner} size={SPINNER_SIZE_BY_BUTTON_SIZE[size]} /> : null}
    </Comp>
  );
}
