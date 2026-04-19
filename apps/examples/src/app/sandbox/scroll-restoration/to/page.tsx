import Link from 'next/link';
import styles from './page.module.scss';

export default function ToPage() {
  return (
    <div className={styles.container}>
      <p>뒤로가기로 from 페이지로 돌아가서 스크롤이 복원되는지 확인해 보세요.</p>
      <Link href="/sandbox/scroll-restoration/from">from 페이지로 이동 (뒤로가기 대신)</Link>
    </div>
  );
}
