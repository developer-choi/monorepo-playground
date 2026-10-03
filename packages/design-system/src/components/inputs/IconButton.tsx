import {type ComponentProps, type ElementType, type ReactElement, type ReactNode} from 'react';
import clsx from 'clsx';
import {Slot} from 'radix-ui';
import styles from './IconButton.module.scss';

interface IconButtonBaseProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export type IconButtonProps = IconButtonBaseProps &
  ({asChild: true; children: ReactElement} | {asChild?: false; children?: never});

export default function IconButton({
  icon,
  size = 'medium',
  type = 'button',
  className,
  asChild = false,
  children,
  ...rest
}: IconButtonProps) {
  const Comp: ElementType = asChild ? Slot.Root : 'button';

  return (
    <Comp
      className={clsx(styles.iconButton, styles.styled, styles[size], className)}
      // type은 <button> 전용 속성이므로 asChild일 때는 전달하지 않는다.
      {...(asChild ? {} : {type})}
      {...rest}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <span className={styles.icon}>{icon}</span>
    </Comp>
  );
}
