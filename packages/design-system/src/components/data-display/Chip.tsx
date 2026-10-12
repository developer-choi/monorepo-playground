import {type PropsWithChildren} from 'react';
import clsx from 'clsx';
import {Cross2Icon} from '@radix-ui/react-icons';
import Badge, {type BadgeProps} from './Badge';
import styles from './Chip.module.scss';

export interface ChipProps extends Omit<BadgeProps, 'children' | 'size'> {
  // xsmall은 받지 않는다 — 지우기 버튼의 누르는 영역(사방 4px)이 xsmall 여백(2px)을 넘어 뱃지 밖으로 나간다
  size?: Exclude<BadgeProps['size'], 'xsmall'>;
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

const REMOVE_ICON_SIZE_BY_CHIP_SIZE: Record<NonNullable<ChipProps['size']>, number> = {
  small: 12,
  medium: 14,
};
