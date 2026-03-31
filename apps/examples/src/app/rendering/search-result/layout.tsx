import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function Layout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader sourcePath="src/rendering/search-result" readmePath="src/rendering/search-result/README.md" />
      {children}
    </>
  );
}
