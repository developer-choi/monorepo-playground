import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

function renderButtonAsLink() {
  render(
    <Button asChild>
      <a href="/next">이동</a>
    </Button>,
  );
}

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

  // asChild를 지원하는 컴포넌트가 Button뿐이라 여기 둔다. 늘어나면 className 병합
  // (test-utils/test-class-name.ts)처럼 공용 검증으로 뺀다 — 그때는 Slot을 만든
  // radix-ui가 이 검증을 어떻게 하고 있는지부터 확인한다.
  describe('Boundary cases', () => {
    it('asChild면 button이 아니라 자식 엘리먼트로 렌더된다', () => {
      renderButtonAsLink();
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('asChild면 button 전용 속성인 type이 자식에 전달되지 않는다', () => {
      renderButtonAsLink();
      expect(screen.getByRole('link')).not.toHaveAttribute('type');
    });
  });
});
