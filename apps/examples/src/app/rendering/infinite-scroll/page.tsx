import ListLayout from '@/rendering/infinite-scroll/components/layout/ListLayout';
import BoardListPage from '@/rendering/infinite-scroll/components/BoardListPage';

export default function Home() {
  return (
    <ListLayout>
      <BoardListPage />
    </ListLayout>
  );
}
