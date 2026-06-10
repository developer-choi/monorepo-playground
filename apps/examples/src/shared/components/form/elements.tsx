'use client';

import {PropsWithChildren} from 'react';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './elements.module.scss';

interface CaptionProps extends PropsWithChildren {
  type?: 'error' | 'info';
}

export function Label({children}: PropsWithChildren) {
  return <span className={clsx(typography.body2, styles.label)}>{children}</span>;
}

export function Caption({type = 'info', children}: CaptionProps) {
  if (!children) {
    return null;
  }

  return (
    <span className={clsx(typography.body3, styles.caption, type === 'error' ? styles.error : styles.info)}>
      {children}
    </span>
  );
}
