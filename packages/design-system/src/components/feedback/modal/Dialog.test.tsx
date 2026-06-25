import {type ComponentProps} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Dialog from './Dialog';

function renderDialog(props: Partial<ComponentProps<typeof Dialog.Root>> = {}) {
  const onClose = props.onClose ?? vi.fn();
  render(
    <Dialog.Root open={true} onClose={onClose} {...props}>
      <Dialog.Title>테스트 다이얼로그</Dialog.Title>
    </Dialog.Root>,
  );
  return {onClose: props.onClose ?? onClose};
}

describe('Dialog', () => {
  describe('General cases', () => {
    it('Esc를 누르면 onClose가 호출된다', async () => {
      const onClose = vi.fn();
      renderDialog({onClose});
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('바깥(backdrop)을 클릭하면 onClose가 호출된다', async () => {
      const onClose = vi.fn();
      renderDialog({onClose});
      await userEvent.setup({pointerEventsCheck: 0}).click(document.body);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Boundary cases', () => {
    it('disableEscapeKeyDown이면 Esc로 닫히지 않는다', async () => {
      const onClose = vi.fn();
      renderDialog({onClose, disableEscapeKeyDown: true});
      await userEvent.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('disableBackdropClick이면 바깥 클릭으로 닫히지 않는다', async () => {
      const onClose = vi.fn();
      renderDialog({onClose, disableBackdropClick: true});
      await userEvent.setup({pointerEventsCheck: 0}).click(document.body);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
