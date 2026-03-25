import styles from './BoardCard.module.scss';

interface BoardCardProps {
  thumbnailUrl: string;
  title: string;
  author: string;
  date: string;
}

export default function BoardCard({
  thumbnailUrl,
  title,
  author,
  date,
}: BoardCardProps) {
  return (
    <article>
      <div className={styles.imageWrapper}>
        <img src={thumbnailUrl} alt={title} className={styles.image} />
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{author}</span>
          <span className={styles.date}>{date}</span>
        </div>
      </div>
    </article>
  );
}
