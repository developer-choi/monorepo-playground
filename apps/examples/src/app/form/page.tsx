import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import ExampleHeader from '@/shared/components/ExampleHeader';
import LinkCardGrid, {type LinkCardItem} from '@/shared/components/LinkCardGrid';
import styles from './page.module.scss';

export default function FormPage() {
  return (
    <>
      <ExampleHeader sourcePath="src/form" />
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1 className={typography.h1}>폼 베스트 프랙티스</h1>
          <p className={clsx(typography.h4, styles.description)}>
            실무에서 반복되는 폼 핸들링 패턴을 주제별로 정리한 예제 모음입니다.
          </p>
        </div>

        <LinkCardGrid items={ITEMS} />
      </div>
    </>
  );
}

const ITEMS: LinkCardItem[] = [
  {
    title: '제출 핸들링',
    href: '/form/handle-submit',
    description:
      '에러를 언제·어디서·어떻게 보여줄지부터, 제출 후 로딩·성공·실패 생명주기 처리까지 폼 제출 전반을 다룹니다.',
    keywords: ['Validation', 'Error Handling', 'Mutation', 'UX'],
  },
  {
    title: 'Trim 유효성검증',
    href: '/form/trim',
    description: '공백만 입력된 경우 처리, 원본값 보존과 제출 시점 일괄 trim 분리, 재귀 순회 유틸리티 활용을 다룹니다.',
    keywords: ['Validation', 'Trim'],
  },
  {
    title: '자동 포커스',
    href: '/form/auto-focus',
    description:
      '폼 중심 페이지에서 첫 폼 요소에 autoFocus를 걸어 입력 단계를 생략하는 패턴과, 탭 복귀 시 재포커스 실험 사례를 다룹니다.',
    keywords: ['autoFocus', 'UX'],
  },
];
