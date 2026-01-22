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
      disableEscapeKeyDown={disableEscapeKeyDown}
      disableBackdropClick={disableBackdropClick}
      onClose={onClose}
      open={open}
      {...other}
    >
      <div tabIndex={-1} className={styles.container}>
        <div className={styles.paper}>
          {children}
        </div>
      </div>
    </Modal>
  );
}
