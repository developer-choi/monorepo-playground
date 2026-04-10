import Modal, {type ModalProps} from './Modal';
import styles from './Dialog.module.scss';

export type DialogProps = ModalProps;

export default function Dialog(props: DialogProps) {
  const {
    children,
    className,
    disableEscapeKeyDown = false,
    disableBackdropClick = false,
    onClose,
    open,
    ...other
  } = props;

  return (
    <Modal
      className={className}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      open={open}
      onClose={onClose}
      {...other}
    >
      <div className={styles.container} tabIndex={-1}>
        <div className={styles.paper}>{children}</div>
      </div>
    </Modal>
  );
}
