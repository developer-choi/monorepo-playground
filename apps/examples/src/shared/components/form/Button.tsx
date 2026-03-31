'use client';

import {Button as RadixButton} from '@radix-ui/themes';
import {ComponentProps} from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

interface ButtonProps extends Omit<ComponentProps<typeof RadixButton>, 'size'> {
  size?: 'medium' | 'large';
}

export default function Button({size = 'medium', className, ...props}: ButtonProps) {
  return <RadixButton size="2" className={classNames(size === 'large' && styles.large, className)} {...props} />;
}
