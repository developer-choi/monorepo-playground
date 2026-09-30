import {type PropsWithChildren} from 'react';
import clsx from 'clsx';
import {Cross2Icon} from '@radix-ui/react-icons';
import Badge, {type BadgeProps} from './Badge';
import styles from './Chip.module.scss';

export interface ChipProps extends Omit<BadgeProps, 'children'> {
  onRemove: () => void;
  removeLabel: string;
}

export default function Chip({
  children,
  onRemove,
  removeLabel,
  className,
  size = 'medium',
  ...badgeProps
}: PropsWithChildren<ChipProps>) {
  return (
    <Badge className={clsx(styles.chip, styles.styled, className)} size={size} {...badgeProps}>
      {children}
      <button aria-label={removeLabel} className={clsx(styles.remove, styles.styled)} type="button" onClick={onRemove}>
        <Cross2Icon height={REMOVE_ICON_SIZE_BY_CHIP_SIZE[size]} width={REMOVE_ICON_SIZE_BY_CHIP_SIZE[size]} />
      </button>
    </Badge>
  );
}

const REMOVE_ICON_SIZE_BY_CHIP_SIZE: Record<NonNullable<BadgeProps['size']>, number> = {
  small: 12,
  medium: 14,
};
