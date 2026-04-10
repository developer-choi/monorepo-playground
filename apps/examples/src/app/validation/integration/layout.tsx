import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function Layout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader readmePath="src/validation/integration/README.md" sourcePath="src/validation/integration" />
      {children}
    </>
  );
}
