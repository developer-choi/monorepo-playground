import {render, screen} from '@testing-library/react';
import {describe} from 'vitest';
import Callout from './Callout';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Callout', () => {
  describe('General cases', () => {
    // role="note"라 getByRole('note')로 루트를 잡는다 (role 노출도 부수 검증)
    itMergesClassNameToRoot((className) => {
      render(<Callout className={className}>알림</Callout>);
      return screen.getByRole('note');
    });
  });
});
