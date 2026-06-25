import {render, screen} from '@testing-library/react';
import {describe} from 'vitest';
import Caption from './Caption';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Caption', () => {
  describe('General cases', () => {
    // role 없는 <p>(기본 상태) — children 텍스트가 곧 루트라 getByText로 잡는다.
    // isInvalid→alert 역할 전환은 FormField integration에서 검증(여기는 className만).
    itMergesClassNameToRoot((className) => {
      render(<Caption className={className}>설명</Caption>);
      return screen.getByText('설명');
    });
  });
});
