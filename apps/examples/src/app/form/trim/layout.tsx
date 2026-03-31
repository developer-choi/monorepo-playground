import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function TrimLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/form/trim" readmePath="src/form/README.md" />
      {children}
    </>
  );
}
