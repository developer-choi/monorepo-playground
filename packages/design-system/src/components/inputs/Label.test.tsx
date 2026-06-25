import {render, screen} from '@testing-library/react';
import {describe} from 'vitest';
import Label from './Label';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Label', () => {
  describe('General cases', () => {
    // role 없는 <label> — isRequired 없이 렌더해 children 텍스트로 잡는다(getByText)
    itMergesClassNameToRoot((className) => {
      render(<Label className={className}>이름</Label>);
      return screen.getByText('이름');
    });
  });
});
