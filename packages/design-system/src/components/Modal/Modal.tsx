import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useRef
} from 'react';
import classNames from 'classnames';
import FocusTrap from './FocusTrap';
import Portal from './Portal';
import styles from './Modal.module.scss';

interface ModalRootProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function ModalRoot(props: ModalRootProps) {
  const {className, children, ...other} = props;

  return (
    <div
      className={classNames(styles.modalRoot, className)}
      {...other}
    >
      {children}
    </div>
  );
}

function ModalBackdrop(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={styles.backdrop}
      {...props}
    />
  );
}

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
  onClose?: (
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

    if (!disableEscapeKeyDown && onClose) {
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

    if (!disableBackdropClick && onClose) {
      onClose(event, 'backdropClick');
    }
  }, [disableBackdropClick, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Portal>
      <ModalRoot
        onKeyDown={handleKeyDown}
        className={className}
        {...other}
      >
        <ModalBackdrop
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
        />

        <FocusTrap open={open}>
          {children}
        </FocusTrap>
      </ModalRoot>
    </Portal>
  );
}
