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
  const ignoreNextEnforceFocus = useRef(false);
  const sentinelStart = useRef<HTMLDivElement>(null);
  const sentinelEnd = useRef<HTMLDivElement>(null);
  const nodeToRestore = useRef<EventTarget | null>(null);

  const rootRef = useRef<HTMLElement>(null);
  const lastKeydown = useRef<KeyboardEvent | null>(null);

  useEffect(() => {
    const rootElement = rootRef.current;

    if (!open || !rootElement) {
      return;
    }

    nodeToRestore.current = document.activeElement;

    if (!rootElement.contains(document.activeElement)) {
      if (!rootElement.hasAttribute('tabIndex')) {
        rootElement.setAttribute('tabIndex', '-1');
      }

      rootElement.focus();
    }

    return () => {
      if (nodeToRestore.current) {
        ignoreNextEnforceFocus.current = true;

        (nodeToRestore.current as HTMLElement).focus();
        nodeToRestore.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) {
      return;
    }

    const loopFocus = (nativeEvent: KeyboardEvent) => {
      lastKeydown.current = nativeEvent;
    };

    const contain = () => {
      const rootElement = rootRef.current;

      if (rootElement === null) {
        return;
      }

      const activeElement = document.activeElement;

      if (!document.hasFocus() || ignoreNextEnforceFocus.current) {
        ignoreNextEnforceFocus.current = false;
        return;
      }

      if (rootElement.contains(activeElement)) {
        return;
      }

      const isFocusOutside = activeElement !== sentinelStart.current && activeElement !== sentinelEnd.current;

      if (isFocusOutside) {
        rootElement.focus();
        return;
      }

      const tabbable = defaultGetTabbable(rootRef.current!);

      if (tabbable.length === 0) {
        rootElement.focus();
        return;
      }

      const isShiftTab = lastKeydown.current?.shiftKey && lastKeydown.current.key === 'Tab';

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
        ref={sentinelStart}
        className={styles.sentinel}
      />
      {cloneElement(children, {ref: rootRef})}
      <div
        tabIndex={open ? 0 : -1}
        ref={sentinelEnd}
        className={styles.sentinel}
      />
    </>
  );
}
