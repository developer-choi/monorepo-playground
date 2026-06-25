import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from './Alert';

describe('Alert', () => {
  describe('General cases', () => {
    it('확인 버튼을 누르면 onClose가 호출된다', async () => {
      const onClose = vi.fn();
      render(<Alert content="내용" open={true} title="알림" onClose={onClose} />);
      await userEvent.click(screen.getByRole('button', {name: '확인'}));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
