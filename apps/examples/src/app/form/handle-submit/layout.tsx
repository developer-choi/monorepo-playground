import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function HandleSubmitLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/app/form/handle-submit" />
      {children}
    </>
  );
}
