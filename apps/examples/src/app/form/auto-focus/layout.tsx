import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function AutoFocusLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader readmePath="src/form/README.md" sourcePath="src/form/auto-focus" />
      {children}
    </>
  );
}
