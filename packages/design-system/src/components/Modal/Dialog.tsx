import {type PropsWithChildren, type ComponentProps} from 'react';
import {Dialog as RadixDialog} from 'radix-ui';
import clsx from 'clsx';
import styles from './Dialog.module.scss';

export interface RootProps {
  open: boolean;
  onClose: () => void;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
}

export function Root({
  open,
  onClose,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  children,
}: PropsWithChildren<RootProps>) {
  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={clsx(styles.overlay, styles.styled)} />
        <RadixDialog.Content
          aria-describedby={undefined}
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
          <div className={clsx(styles.content, styles.styled)}>{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

type WrapperProps = PropsWithChildren<{className?: string}>;

export function Header({children, className}: WrapperProps) {
  return <div className={clsx(styles.header, styles.styled, className)}>{children}</div>;
}

export function Content({children, className}: WrapperProps) {
  return <div className={clsx(styles.body, styles.styled, className)}>{children}</div>;
}

export function Footer({children, className}: WrapperProps) {
  return <div className={clsx(styles.footer, styles.styled, className)}>{children}</div>;
}

export function Title(props: ComponentProps<typeof RadixDialog.Title>) {
  return <RadixDialog.Title {...props} />;
}
