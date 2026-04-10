import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function Layout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader readmePath="src/rendering/search-result/README.md" sourcePath="src/rendering/search-result" />
      {children}
    </>
  );
}
