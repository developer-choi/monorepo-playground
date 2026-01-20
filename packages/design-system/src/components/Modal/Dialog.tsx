import {forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode} from 'react';
import Modal from './Modal';
import styles from './Dialog.module.scss';
import classNames from 'classnames';

interface DialogContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const DialogContainer = forwardRef<HTMLDivElement, DialogContainerProps>(function DialogContainer(props, ref) {
  const {children, className, ...other} = props;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={classNames(styles.container, className)}
      {...other}
    >
      {children}
    </div>
  );
});

type DialogPaperProps = HTMLAttributes<HTMLDivElement>;

function DialogPaper(props: DialogPaperProps) {
  const {children, className, ...other} = props;
  return (
    <div
      className={`${styles.paper} ${className || ''}`.trim()}
      {...other}
    >
      {children}
    </div>
  );
}

export interface DialogProps {
  children: ReactNode;
  className?: string;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  onClose?: (
    event: KeyboardEvent | MouseEvent,
    reason: 'escapeKeyDown' | 'backdropClick'
  ) => void;
  open: boolean;
}

export default function Dialog(inProps: DialogProps) {
  const {
    children,
    className,
    disableEscapeKeyDown = false,
    disableBackdropClick = false,
    onClose,
    open,
    ...other
  } = inProps;

  return (
    <Modal
      className={className}
      disableEscapeKeyDown={disableEscapeKeyDown}
      disableBackdropClick={disableBackdropClick}
      onClose={onClose}
      open={open}
      {...other}
    >
      <DialogContainer>
        <DialogPaper>
          {children}
        </DialogPaper>
      </DialogContainer>
    </Modal>
  );
}