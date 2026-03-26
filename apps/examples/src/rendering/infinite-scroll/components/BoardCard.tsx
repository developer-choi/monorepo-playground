import { memo } from 'react';
import { OptimizedImage } from './Image';
import type { Board } from '@/shared/board/types';
import styles from './BoardCard.module.scss';

interface BoardCardProps {
  board: Board;
}

export default memo(function BoardCard({ board }: BoardCardProps) {
  console.count('BoardCard render');
  const { postTitle, author, thumbnailUrl, createdAt } = board;

  return (
    <article>
      <div className={styles.imageWrapper}>
        <OptimizedImage src={thumbnailUrl} alt={postTitle} sizes={SIZES} className={styles.image} />
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
});

const SIZES = '25vw';
