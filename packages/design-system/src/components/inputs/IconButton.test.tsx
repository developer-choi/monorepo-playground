import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import IconButton from './IconButton';

function renderIconButtonAsLink() {
  render(
    <IconButton asChild icon={<span data-testid="icon" />}>
      <a href="/next" />
    </IconButton>,
  );
}

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

  describe('Boundary cases', () => {
    it('asChild면 button이 아니라 자식 엘리먼트로 렌더되고 아이콘이 그 안에 들어간다', () => {
      renderIconButtonAsLink();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/next');
      expect(link).toContainElement(screen.getByTestId('icon'));
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('asChild면 button 전용 속성인 type이 자식에 전달되지 않는다', () => {
      renderIconButtonAsLink();
      expect(screen.getByRole('link')).not.toHaveAttribute('type');
    });
  });
});
