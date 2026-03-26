import styles from './page.module.scss';
import Link from 'next/link';

interface BoardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardDetailPage({
  params,
}: BoardDetailPageProps) {
  const { id } = await params;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>게시글 상세</h1>
      <p className={styles.code}>게시글 ID: {id}</p>

      <section className={styles.card}>
        <p className={styles.cardTitle}>1. 스크롤 복원 테스트</p>
        <p>
          목록에서 스크롤을 내린 뒤 이 페이지로 진입한 경우, 브라우저{' '}
          <span className={styles.highlight}>뒤로가기</span>를 눌러 보세요.
          스크롤 위치가 복원됩니다.
        </p>
      </section>

      <section className={styles.card}>
        <p className={styles.cardTitle}>2. 리페칭 테스트</p>
        <p>
          목록에서 <span className={styles.highlight}>5페이지</span> 이상
          데이터를 쌓고, Network 탭을 연 뒤{' '}
          <Link href="/rendering/infinite-scroll" className={styles.link}>
            목록으로 돌아가기
          </Link>
          를 클릭해 보세요. 리페칭 없이 1페이지부터 새로 로드됩니다.
        </p>
      </section>
    </main>
  );
}
