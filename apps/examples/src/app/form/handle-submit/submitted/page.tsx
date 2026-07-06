import Link from 'next/link';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './page.module.scss';

export default function SubmittedPage() {
  return (
    <div className={styles.page}>
      <h2 className={clsx(typography.h2, styles.title)}>제출 완료</h2>
      <p className={clsx(typography.body1, styles.description)}>
        제출이 성공해 이 도착 페이지로 이동했습니다. 성공 시 화면을 벗어나는 흐름을 실제 페이지 이동으로 보여줍니다.
      </p>
      <Link className={clsx(typography.body2, styles.backLink)} href="/form/handle-submit">
        ← 폼으로 돌아가기
      </Link>
    </div>
  );
}
