import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function AutoFocusLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/app/form/auto-focus" />
      {children}
    </>
  );
}
