import clsx from 'clsx';
import cardStyles from './BoardCard.module.scss';
import styles from './BoardCardSkeleton.module.scss';

export default function BoardCardSkeleton() {
  return (
    <article>
      <div className={clsx(cardStyles.imageWrapper, styles.bone)} />
      <div className={cardStyles.info}>
        {/* eslint-disable-next-line no-restricted-syntax -- 스켈레톤 bone 너비 인라인 스타일 (SkeletonReuse.md 패턴) */}
        <div className={clsx(cardStyles.title, styles.bone)} style={{width: '90%'}}>
          &nbsp;
        </div>
        {/* eslint-disable-next-line no-restricted-syntax -- 스켈레톤 bone 너비 인라인 스타일 (SkeletonReuse.md 패턴) */}
        <div className={clsx(cardStyles.meta, styles.bone)} style={{width: '40%'}}>
          &nbsp;
        </div>
      </div>
    </article>
  );
}
