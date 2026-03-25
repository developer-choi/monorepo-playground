import BoardCard from './BoardCard';
import styles from './BoardListPage.module.scss';

export default function BoardListPage() {
  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {DUMMY_BOARDS.map((board) => (
          <BoardCard
            key={board.id}
            thumbnailUrl={board.thumbnailUrl}
            title={board.title}
            author={board.author}
            date={board.date}
          />
        ))}
      </div>
    </section>
  );
}

const DUMMY_BOARDS = [
  {
    id: 1,
    title: '주말 등산 후기 — 설악산 공룡능선',
    author: '산타',
    date: '2026.03.20',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/lighthouse_reflection',
  },
  {
    id: 2,
    title: '요즘 읽고 있는 책 추천합니다',
    author: '독서왕',
    date: '2026.03.19',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/leather_bag_gray',
  },
  {
    id: 3,
    title: '재택근무 데스크 셋업 공유',
    author: '홈워커',
    date: '2026.03.18',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/livingroom-yellow-chair',
  },
  {
    id: 4,
    title: '제주도 3박 4일 여행 코스 정리',
    author: '여행자',
    date: '2026.03.17',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/water-park-aerial-view',
  },
  {
    id: 5,
    title: '홈 카페 레시피 모음',
    author: '바리스타',
    date: '2026.03.16',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/kitchen-island',
  },
  {
    id: 6,
    title: '봄맞이 옷장 정리 팁',
    author: '미니멀',
    date: '2026.03.15',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/docs/blue_sweater_model',
  },
  {
    id: 7,
    title: '강아지와 함께하는 일상',
    author: '댕댕이',
    date: '2026.03.14',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/phone_tree',
  },
  {
    id: 8,
    title: '주말 요리 도전기 — 파스타 편',
    author: '요리사',
    date: '2026.03.13',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/sample',
  },
];
