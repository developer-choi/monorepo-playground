import {ReactNode} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';

export default function Layout({children}: {children: ReactNode}) {
  return (
    <>
      <ExampleHeader sourcePath="rendering/search-result" />
      {children}
    </>
  );
}
