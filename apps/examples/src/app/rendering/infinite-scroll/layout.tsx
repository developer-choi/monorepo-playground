import {PropsWithChildren} from 'react';
import ExampleHeader from '@/shared/components/ExampleHeader';
import styles from './layout.module.scss';

export default function Layout({children}: PropsWithChildren) {
  return (
    <>
      <ExampleHeader
        doc={{
          type: 'external',
          url: 'https://github.com/developer-choi/developer-choi/blob/main/docs/infinite-scroll/step1.md',
        }}
        sourcePath="src/rendering/infinite-scroll"
      />
      <div className={styles.body}>
        <main>{children}</main>
      </div>
    </>
  );
}
