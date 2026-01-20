import {type ReactNode} from 'react';
import classNames from 'classnames';
import Modal, {type ModalProps} from './Modal';
import styles from './Drawer.module.scss';

export interface DrawerProps extends Omit<ModalProps, 'children'> {
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  children: ReactNode;
}

export default function Drawer(props: DrawerProps) {
  const {anchor = 'left', children, className, ...modalProps} = props;

  return (
    <Modal
      className={className}
      {...modalProps}
    >
      <div className={classNames(styles.drawer, styles[anchor])} tabIndex={-1}>
        {children}
      </div>
    </Modal>
  );
}
