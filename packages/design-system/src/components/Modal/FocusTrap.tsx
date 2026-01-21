import {cloneElement, type JSX, type ReactElement, type Ref, useEffect, useRef} from 'react';
import styles from './FocusTrap.module.scss';

export interface FocusTrapProps {
  children: ReactElement<{
    ref?: Ref<HTMLElement>;
  }>;
  open: boolean;
}

const candidatesSelector = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll(candidatesSelector)) as HTMLElement[];
}

export default function FocusTrap(props: FocusTrapProps): JSX.Element {
  const {children, open} = props;

  const ignoreNextEnforceFocusRef = useRef(false);
  const lastKeydownRef = useRef<KeyboardEvent | null>(null);
  const nodeToRestoreRef = useRef<EventTarget | null>(null);

  const rootRef = useRef<HTMLElement>(null);
  const sentinelStartRef = useRef<HTMLDivElement>(null);
  const sentinelEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootElement = rootRef.current;

    if (!open || !rootElement) {
      return;
    }

    nodeToRestoreRef.current = document.activeElement;

    if (!rootElement.contains(document.activeElement)) {
      if (!rootElement.hasAttribute('tabIndex')) {
        rootElement.setAttribute('tabIndex', '-1');
      }

      rootElement.focus();
    }

    return () => {
      if (nodeToRestoreRef.current) {
        ignoreNextEnforceFocusRef.current = true;

        (nodeToRestoreRef.current as HTMLElement).focus();
        nodeToRestoreRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) {
      return;
    }

    const loopFocus = (nativeEvent: KeyboardEvent) => {
      lastKeydownRef.current = nativeEvent;
    };

    const contain = () => {
      const rootElement = rootRef.current;

      if (rootElement === null) {
        return;
      }

      const activeElement = document.activeElement;

      if (!document.hasFocus() || ignoreNextEnforceFocusRef.current) {
        ignoreNextEnforceFocusRef.current = false;
        return;
      }

      if (rootElement.contains(activeElement)) {
        return;
      }

      const isFocusOutside = activeElement !== sentinelStartRef.current && activeElement !== sentinelEndRef.current;

      if (isFocusOutside) {
        rootElement.focus();
        return;
      }

      const tabbable = defaultGetTabbable(rootRef.current!);

      if (tabbable.length === 0) {
        rootElement.focus();
        return;
      }

      const isShiftTab = lastKeydownRef.current?.shiftKey && lastKeydownRef.current.key === 'Tab';

      if (isShiftTab) {
        const focusPrevious = tabbable[tabbable.length - 1];
        focusPrevious.focus();
      } else {
        const focusNext = tabbable[0];
        focusNext.focus();
      }
    };

    document.addEventListener('focusin', contain);
    document.addEventListener('keydown', loopFocus, true);

    return () => {
      document.removeEventListener('focusin', contain);
      document.removeEventListener('keydown', loopFocus, true);
    };
  }, [open]);

  return (
    <>
      <div
        tabIndex={open ? 0 : -1}
        ref={sentinelStartRef}
        className={styles.sentinel}
      />
      {cloneElement(children, {ref: rootRef})}
      <div
        tabIndex={open ? 0 : -1}
        ref={sentinelEndRef}
        className={styles.sentinel}
      />
    </>
  );
}
