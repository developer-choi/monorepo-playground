import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import IconButton from './IconButton';

describe('IconButton', () => {
  describe('General cases', () => {
    it('type을 지정하지 않으면 button 타입이다', () => {
      render(<IconButton icon={<span />} />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('전달한 className을 버튼에 병합한다', () => {
      render(<IconButton className="custom" icon={<span />} />);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });
  });
});
