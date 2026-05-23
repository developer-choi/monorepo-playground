'use client';

import {Button as RadixButton} from '@radix-ui/themes';
import {ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';

interface ButtonProps extends Omit<ComponentProps<typeof RadixButton>, 'size'> {
  size?: 'medium' | 'large';
}

export default function Button({size = 'medium', className, ...props}: ButtonProps) {
  return <RadixButton className={clsx(size === 'large' && styles.large, className)} size="2" {...props} />;
}
