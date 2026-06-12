import {type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Code.module.scss';

type CodeProps = Pick<ComponentProps<'code'>, 'className' | 'children'>;

export default function Code({className, children}: CodeProps) {
  return <code className={clsx(styles.code, className)}>{children}</code>;
}
