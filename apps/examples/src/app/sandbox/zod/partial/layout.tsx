import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function ZodPartialLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/app/sandbox/zod/partial" />
      {children}
    </>
  );
}
