import type {ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Spinner.module.scss';

const DEFAULT_SIZE = 20;
const DEFAULT_STROKE_WIDTH = 3;

export interface SpinnerProps extends Omit<ComponentProps<'svg'>, 'children'> {
  size?: number;
  strokeWidth?: number;
}

export function Spinner({size = DEFAULT_SIZE, strokeWidth = DEFAULT_STROKE_WIDTH, className, ...rest}: SpinnerProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- Spinner 컴포넌트 자체가 SVG로 회전 효과를 그리는 게 본질
    <svg
      className={clsx(styles.spinner, className)}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      {...rest}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={size / 2 - strokeWidth / 2}
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
