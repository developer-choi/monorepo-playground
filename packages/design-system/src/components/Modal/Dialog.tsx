import {type PropsWithChildren} from 'react';
import {Dialog as Rd} from 'radix-ui';
import clsx from 'clsx';
import styles from './Dialog.module.scss';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
}

export default function Dialog({
  open,
  onClose,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  children,
}: PropsWithChildren<DialogProps>) {
  return (
    <Rd.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Rd.Portal>
        <Rd.Overlay className={styles.overlay} />
        <Rd.Content
          className={clsx(styles.paper, styles.styled)}
          onEscapeKeyDown={(event) => {
            if (disableEscapeKeyDown) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (disableBackdropClick) {
              event.preventDefault();
            }
          }}
        >
          {children}
        </Rd.Content>
      </Rd.Portal>
    </Rd.Root>
  );
}
