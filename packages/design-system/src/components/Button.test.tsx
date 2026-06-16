import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  describe('General cases', () => {
    it('type을 지정하지 않으면 button 타입이다', () => {
      render(<Button>확인</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('className을 넘기면 버튼에 병합된다', () => {
      render(<Button className="custom">확인</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });

    it('로딩 중에는 클릭해도 반응하지 않는다', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          확인
        </Button>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
