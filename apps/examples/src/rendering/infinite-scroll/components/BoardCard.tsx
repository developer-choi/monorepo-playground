import type { Board } from '@/shared/board/types';
import styles from './BoardCard.module.scss';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const { postTitle, author, thumbnailUrl, createdAt } = board;

  return (
    <article>
      <div className={styles.imageWrapper}>
        <img src={thumbnailUrl} alt={postTitle} className={styles.image} />
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{postTitle}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{author}</span>
          <span className={styles.date}>{createdAt}</span>
        </div>
      </div>
    </article>
  );
}
