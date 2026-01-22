import {type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type Ref, useCallback, useRef} from 'react';
import classNames from 'classnames';
import FocusTrap from './FocusTrap';
import Portal from './Portal';
import styles from './Modal.module.scss';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
  onClose: (
    event: KeyboardEvent | MouseEvent,
    reason: 'escapeKeyDown' | 'backdropClick'
  ) => void;
  open: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
}

export default function Modal(props: ModalProps) {
  const {
    children,
    className,
    onClose,
    open,
    disableEscapeKeyDown = false,
    disableBackdropClick = false,
    ...other
  } = props;

  const backdropClickRef = useRef(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (!disableEscapeKeyDown) {
      event.stopPropagation();
      onClose(event, 'escapeKeyDown');
    }
  }, [disableEscapeKeyDown, onClose]);

  const handleBackdropMouseDown = useCallback((event: MouseEvent) => {
    backdropClickRef.current = event.target === event.currentTarget;
  }, []);

  const handleBackdropClick = useCallback((event: MouseEvent) => {
    if (!backdropClickRef.current) {
      return;
    }
    backdropClickRef.current = false;

    if (event.target !== event.currentTarget) {
      return;
    }

    if (!disableBackdropClick) {
      onClose(event, 'backdropClick');
    }
  }, [disableBackdropClick, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Portal>
      <div className={classNames(styles.modalRoot, className)} onKeyDown={handleKeyDown} {...other}>
        <div className={styles.backdrop} onMouseDown={handleBackdropMouseDown} onClick={handleBackdropClick} />
        <FocusTrap open={open}>
          {children}
        </FocusTrap>
      </div>
    </Portal>
  );
}
