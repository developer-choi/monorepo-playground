import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function Layout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/validation/integration" readmePath="src/validation/integration/README.md" />
      {children}
    </>
  );
}
