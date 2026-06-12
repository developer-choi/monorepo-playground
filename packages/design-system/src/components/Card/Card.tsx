import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Card.module.scss';

type UsedProps = 'className' | 'children';

export type CardProps = Pick<ComponentProps<'div'>, UsedProps>;

export default function Card({children, className}: CardProps) {
  return <div className={clsx(styles.card, styles.styled, className)}>{children}</div>;
}
