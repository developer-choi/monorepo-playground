import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function AutoFocusLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/form/auto-focus" readmePath="src/form/README.md" />
      {children}
    </>
  );
}
