import clsx from 'clsx';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './ErrorNotice.module.scss';

interface ErrorNoticeProps {
  title: string;
  content: string;
  onAction?: () => void;
}

export default function ErrorNotice({title, content, onAction}: ErrorNoticeProps) {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <h2 className={clsx(typography.h2, styles.title)}>{title}</h2>
        <p className={clsx(typography.body1, styles.content)}>{content}</p>
        {onAction && <Button onClick={onAction}>다시 시도</Button>}
      </div>
    </div>
  );
}
