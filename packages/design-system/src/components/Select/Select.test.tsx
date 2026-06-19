import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import Select from './Select';

describe('Select', () => {
  describe('General cases', () => {
    it('placeholder를 주면 비활성 안내 옵션이 첫 옵션으로 들어간다', () => {
      render(<Select options={[{value: 'a', label: '항목 A'}]} placeholder="선택하세요" />);
      const options = screen.getAllByRole('option', {hidden: true});
      expect(options[0]).toHaveTextContent('선택하세요');
      expect(options[0]).toBeDisabled();
    });
  });
});
