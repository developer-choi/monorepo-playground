import clsx from 'clsx';
import cardStyles from './BoardCard.module.scss';
import styles from './BoardCardSkeleton.module.scss';

export default function BoardCardSkeleton() {
  return (
    <div className={cardStyles.card}>
      <div className={clsx(cardStyles.imageWrapper, styles.bone)} />
      <div className={cardStyles.info}>
        <div className={clsx(cardStyles.title, styles.bone, styles.textBone, styles.titleBone)} />
        <div className={clsx(cardStyles.meta, styles.bone, styles.textBone, styles.metaBone)} />
      </div>
    </div>
  );
}
