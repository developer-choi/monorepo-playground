import classNames from 'classnames';
import cardStyles from './BoardCard.module.scss';
import styles from './BoardCardSkeleton.module.scss';

export default function BoardCardSkeleton() {
  return (
    <div className={cardStyles.card}>
      <div className={classNames(cardStyles.imageWrapper, styles.bone)} />
      <div className={cardStyles.info}>
        <div
          className={classNames(
            cardStyles.title,
            styles.bone,
            styles.textBone,
            styles.titleBone,
          )}
        />
        <div
          className={classNames(
            cardStyles.meta,
            styles.bone,
            styles.textBone,
            styles.metaBone,
          )}
        />
      </div>
    </div>
  );
}
