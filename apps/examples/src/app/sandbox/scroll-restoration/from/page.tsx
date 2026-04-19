import Link from 'next/link';
import styles from './page.module.scss';

export default function FromPage() {
  return (
    <div className={styles.container}>
      {BOX_NUMBERS.map((boxNumber) => (
        <Link key={boxNumber} className={styles.button} href="/sandbox/scroll-restoration/to">
          <span className={styles.number}>{boxNumber}번</span> — 이 링크를 눌러 to 페이지로 이동한 뒤, 뒤로가기로
          돌아왔을 때 이 위치로 스크롤이 복원되는지 확인해 보세요.
        </Link>
      ))}
      <input autoFocus className={styles.input} placeholder="테스트 입력" />
    </div>
  );
}

const BOX_COUNT = 6;
const BOX_NUMBERS = Array.from({length: BOX_COUNT}, (_unused, index) => index + 1);
