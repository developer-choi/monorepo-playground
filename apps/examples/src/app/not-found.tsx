import ErrorNotice from '@/shared/components/ErrorNotice';

export default function NotFound() {
  return <ErrorNotice content="삭제되었거나 주소가 변경되었을 수 있어요." title="정보를 찾을 수 없어요" />;
}
