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
    <Link className={styles.link} href={`/rendering/infinite-scroll/${board.id}`}>
      <article>
        <div className={styles.imageWrapper}>
          <OptimizedImage alt={postTitle} className={styles.image} sizes={SIZES} src={thumbnailUrl} />
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
