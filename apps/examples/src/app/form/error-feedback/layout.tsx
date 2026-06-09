import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function ErrorFeedbackLayout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/app/form/error-feedback" />
      {children}
    </>
  );
}
