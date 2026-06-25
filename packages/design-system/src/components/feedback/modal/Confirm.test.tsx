import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Confirm from './Confirm';

function renderConfirm(overrides: {onConfirm?: () => void; onCancel?: () => void} = {}) {
  const onConfirm = overrides.onConfirm ?? vi.fn();
  const onCancel = overrides.onCancel ?? vi.fn();
  render(
    <Confirm content="계속하시겠습니까?" open={true} title="확인 모달" onCancel={onCancel} onConfirm={onConfirm} />,
  );
  return {onConfirm, onCancel};
}

describe('Confirm', () => {
  describe('General cases', () => {
    it('확인 버튼을 누르면 onConfirm이 호출된다', async () => {
      const onConfirm = vi.fn();
      renderConfirm({onConfirm});
      await userEvent.click(screen.getByRole('button', {name: '확인'}));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼을 누르면 onCancel이 호출된다', async () => {
      const onCancel = vi.fn();
      renderConfirm({onCancel});
      await userEvent.click(screen.getByRole('button', {name: '취소'}));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('Esc를 누르면 onCancel이 호출된다', async () => {
      const {onConfirm, onCancel} = renderConfirm();
      await userEvent.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
