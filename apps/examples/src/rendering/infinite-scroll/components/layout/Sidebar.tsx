import classNames from 'classnames';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>게시판</h1>

      <ul className={styles.categoryList}>
        {CATEGORIES.map((category, index) => (
          <li key={category}>
            <span
              className={classNames(styles.categoryItem, {
                [styles.active]: index === 0,
              })}
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
