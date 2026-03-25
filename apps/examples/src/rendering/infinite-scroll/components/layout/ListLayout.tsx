import { PropsWithChildren } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './ListLayout.module.scss';

export default function ListLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
