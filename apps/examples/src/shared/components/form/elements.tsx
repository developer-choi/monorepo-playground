'use client';

import {Text} from '@radix-ui/themes';
import {PropsWithChildren} from 'react';
import styles from './elements.module.scss';

interface CaptionProps extends PropsWithChildren {
  type?: 'error' | 'info';
}

export function Label({children}: PropsWithChildren) {
  return (
    <Text as="span" size="2" weight="medium" className={styles.label}>
      {children}
    </Text>
  );
}

export function Caption({type = 'info', children}: CaptionProps) {
  if (!children) {
    return null;
  }

  return (
    <Text size="1" color={type === 'error' ? 'red' : 'gray'} className={styles.caption}>
      {children}
    </Text>
  );
}
