import {describe, it} from 'vitest';

describe('Table', () => {
  // ColumnHeaderCell·Cell은 <table> 컨텍스트로 감싸 렌더해야 getByRole('columnheader'/'cell')가 resolve된다
  // (th/td 암묵 role은 table 조상 필요). Root는 자체가 table이라 무관.
  describe('General cases', () => {
    // Root: <table>에 clsx 병합 → getByRole('table').toHaveClass('custom')
    it.todo('Root에 className을 넘기면 table에 병합된다');
    // ColumnHeaderCell width 숫자 → `${n}px`. getByRole('columnheader')의 인라인 style.width
    it.todo('ColumnHeaderCell의 width에 숫자를 주면 px 단위로 적용된다');
    // ColumnHeaderCell className clsx 병합
    it.todo('ColumnHeaderCell에 className을 넘기면 병합된다');
    // Cell className clsx 병합 → getByRole('cell')
    it.todo('Cell에 className을 넘기면 병합된다');
  });

  describe('Boundary cases', () => {
    // width 문자열 → 단위 변환 없이 그대로
    it.todo('ColumnHeaderCell의 width에 문자열을 주면 그대로 적용된다');
  });

  describe('Edge cases', () => {
    // width undefined → 인라인 width 스타일 없음
    it.todo('ColumnHeaderCell에 width를 주지 않으면 너비 스타일이 없다');
  });
});
