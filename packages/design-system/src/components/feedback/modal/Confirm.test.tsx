import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Confirm, {type ConfirmProps} from './Confirm';

function renderConfirm(
  overrides: Partial<Pick<ConfirmProps, 'onConfirm' | 'onCancel' | 'confirmProps' | 'cancelProps'>> = {},
) {
  const onConfirm = overrides.onConfirm ?? vi.fn();
  const onCancel = overrides.onCancel ?? vi.fn();
  render(
    <Confirm
      cancelProps={overrides.cancelProps}
      confirmProps={overrides.confirmProps}
      content="계속하시겠습니까?"
      open={true}
      title="확인 모달"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
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

    it('confirmProps·cancelProps의 children이 버튼 문구가 된다', () => {
      renderConfirm({confirmProps: {children: '삭제'}, cancelProps: {children: '닫기'}});
      expect(screen.getByRole('button', {name: '삭제'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '닫기'})).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('Esc를 누르면 onCancel이 호출된다', async () => {
      const {onConfirm, onCancel} = renderConfirm();
      await userEvent.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('confirmProps.loading이 켜진 동안 Esc로 onCancel이 호출되지 않는다', async () => {
      const {onCancel} = renderConfirm({confirmProps: {loading: true}});
      await userEvent.keyboard('{Escape}');
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('confirmProps.loading이 켜진 동안 바깥 클릭으로 onCancel이 호출되지 않는다', async () => {
      const {onCancel} = renderConfirm({confirmProps: {loading: true}});
      await userEvent.click(screen.getByRole('dialog').previousElementSibling as Element);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('confirmProps.loading이 켜진 동안 취소 버튼이 비활성이다', () => {
      renderConfirm({confirmProps: {loading: true}});
      expect(screen.getByRole('button', {name: '취소'})).toBeDisabled();
    });
  });
});
