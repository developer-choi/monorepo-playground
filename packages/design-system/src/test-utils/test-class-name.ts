import {expect, it} from 'vitest';

/**
 * 소비자 className이 컴포넌트 루트 element에 병합되는지 검증하는 공유 테스트.
 * 공개 계약(스타일 커스텀 통로)이고 빠져도 에러 없이 조용히 깨지며, 잡는 그물이
 * Chromatic·타입·typed-scss 어디에도 없어 유닛으로 검증한다.
 *
 * base 클래스 보존(merge 여부)은 단언하지 않는다 — base는 해시된 CSS 모듈 클래스라
 * 이름을 단언하면 리팩토링에 깨진다(`TestsWeAvoid.md` "CSS 모듈 클래스명 단언 금지").
 * MUI testClassName에서 `classes.root` 보존 단언을 뺀 형태.
 *
 * 루트 잡는 방법은 호출부가 `renderRoot`로 주입한다. MUI는 enzyme 트리를 훑는 범용
 * `findOutermostIntrinsic` 하나로 어떤 컴포넌트든 루트를 잡아 콜백이 없지만, RTL은
 * 쿼리 사다리(getByRole 우선)상 컴포넌트마다 다른 쿼리(getByText·getByRole·
 * container.firstChild)를 써야 해 그 차이를 주입으로 받는다.
 *
 * @see MUI describeConformance testClassName — https://github.com/mui/material-ui/blob/e9eb2df4dc87707f47f5383976e9ec7ec6510678/packages/material-ui/src/test-utils/describeConformance.js
 */
export function itMergesClassNameToRoot(renderRoot: (className: string) => HTMLElement): void {
  it('className을 넘기면 루트에 병합된다', () => {
    const customClassName = 'custom-test-class';
    expect(renderRoot(customClassName)).toHaveClass(customClassName);
  });
}
