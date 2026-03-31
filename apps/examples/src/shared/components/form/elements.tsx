'use client';

import {Text} from '@radix-ui/themes';
import {PropsWithChildren} from 'react';
import styles from './elements.module.scss';

interface CaptionProps extends PropsWithChildren {
  type?: 'error' | 'info';
}

export function Label({children}: PropsWithChildren) {
  return (
    <Text as="span" className={styles.label} size="2" weight="medium">
      {children}
    </Text>
  );
}

export function Caption({type = 'info', children}: CaptionProps) {
  if (!children) {
    return null;
  }

  return (
    <Text className={styles.caption} color={type === 'error' ? 'red' : 'gray'} size="1">
      {children}
    </Text>
  );
}
