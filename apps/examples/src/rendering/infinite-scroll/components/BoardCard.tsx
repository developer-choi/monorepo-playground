import {memo} from 'react';
import Link from 'next/link';
import {OptimizedImage} from './Image';
import type {Board} from '@/shared/board/types';
import styles from './BoardCard.module.scss';

interface BoardCardProps {
  board: Board;
}

export default memo(function BoardCard({board}: BoardCardProps) {
  const {postTitle, author, thumbnailUrl, createdAt} = board;

  return (
    <Link href={`/rendering/infinite-scroll/${board.id}`} className={styles.link}>
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
    </Link>
  );
});

const SIZES = '25vw';
