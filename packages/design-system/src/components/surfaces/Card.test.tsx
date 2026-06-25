import {render, screen} from '@testing-library/react';
import {describe} from 'vitest';
import Card from './Card';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Card', () => {
  describe('General cases', () => {
    // role 없는 <div> — children 텍스트가 곧 루트라 getByText로 잡는다
    itMergesClassNameToRoot((className) => {
      render(<Card className={className}>본문</Card>);
      return screen.getByText('본문');
    });
  });
});
