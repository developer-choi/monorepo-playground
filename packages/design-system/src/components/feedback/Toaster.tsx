'use client';

import {useSyncExternalStore} from 'react';
import {Toast as RadixToast} from 'radix-ui';
import clsx from 'clsx';
import {closeToast, EMPTY_TOASTS, getToasts, subscribeToasts} from './toast';
import styles from './Toaster.module.scss';

export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, () => EMPTY_TOASTS);

  return (
    <RadixToast.Provider duration={DEFAULT_DURATION} label="알림" swipeDirection="down">
      {toasts.map(({id, title, description, duration, open}) => (
        <RadixToast.Root
          key={id}
          className={clsx(styles.toast, styles.styled)}
          duration={duration}
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeToast(id);
            }
          }}
        >
          <RadixToast.Title className={clsx(styles.title, styles.styled)}>{title}</RadixToast.Title>
          {description && (
            <RadixToast.Description asChild className={clsx(styles.description, styles.styled)}>
              <p>{description}</p>
            </RadixToast.Description>
          )}
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport className={clsx(styles.viewport, styles.styled)} label="알림 ({hotkey})" />
    </RadixToast.Provider>
  );
}

const DEFAULT_DURATION = 1800;
