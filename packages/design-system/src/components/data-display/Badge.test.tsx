import {render, screen} from '@testing-library/react';
import {describe} from 'vitest';
import Badge from './Badge';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Badge', () => {
  describe('General cases', () => {
    // role 없는 <span> — children 텍스트가 곧 루트라 getByText로 잡는다
    itMergesClassNameToRoot((className) => {
      render(<Badge className={className}>신규</Badge>);
      return screen.getByText('신규');
    });
  });
});
