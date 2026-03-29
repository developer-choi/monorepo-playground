import { PropsWithChildren } from 'react';
import styles from './layout.module.scss';
import classNames from 'classnames';

export default function Layout({ children }: PropsWithChildren) {
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

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>BOARD</span>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>게시판</h1>

      <ul className={styles.categoryList}>
        {CATEGORIES.map((category, index) => (
          <li key={category}>
            <span
              className={classNames(styles.categoryItem, index === 0 && styles.active)}
            >
              {category}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const CATEGORIES = ['전체', '공지사항', '자유게시판', '질문답변', '정보공유'];
