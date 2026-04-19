import {Container, Flex, Heading, Text} from '@radix-ui/themes';
import LinkCardGrid, {type LinkCardItem} from '@/shared/components/LinkCardGrid';

export default function FormPage() {
  return (
    <Container px="4" py="9" size="3">
      <Flex direction="column" gap="3" mb="8">
        <Heading size="8">폼 베스트 프랙티스</Heading>
        <Text color="gray" size="4">
          실무에서 반복되는 폼 핸들링 패턴을 주제별로 정리한 예제 모음입니다.
        </Text>
      </Flex>

      <LinkCardGrid items={ITEMS} />
    </Container>
  );
}

const ITEMS: LinkCardItem[] = [
  {
    title: '자동 포커스',
    href: '/form/auto-focus',
    description:
      '폼 중심 페이지에서 첫 폼 요소에 autoFocus를 걸어 입력 단계를 생략하는 패턴과, 탭 복귀 시 재포커스 실험 사례를 다룹니다.',
    keywords: ['autoFocus', 'UX'],
  },
  {
    title: 'Trim 유효성검증',
    href: '/form/trim',
    description: '공백만 입력된 경우 처리, 원본값 보존과 제출 시점 일괄 trim 분리, 재귀 순회 유틸리티 활용을 다룹니다.',
    keywords: ['Validation', 'Trim'],
  },
  {
    title: '에러 피드백',
    href: '/form/error-feedback',
    description:
      '유효성검증 시점, 제출 버튼 활성화, 에러 필드로의 포커스 이동 등 에러를 언제·어디서·어떻게 보여줄지 다룹니다.',
    keywords: ['Validation', 'Error Handling', 'UX'],
  },
];
