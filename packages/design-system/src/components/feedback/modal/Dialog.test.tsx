import {type ComponentProps} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Dialog from './Dialog';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

function renderDialog(props: Omit<ComponentProps<typeof Dialog.Root>, 'open' | 'children'>) {
  render(
    <Dialog.Root open={true} {...props}>
      <Dialog.Title>테스트 다이얼로그</Dialog.Title>
    </Dialog.Root>,
  );
}

function getOverlay() {
  return screen.getByRole('dialog').previousElementSibling as Element;
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
      await userEvent.click(getOverlay());
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
      await userEvent.click(getOverlay());
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

[
  {name: 'Dialog.Header', wrapper: Dialog.Header},
  {name: 'Dialog.Content', wrapper: Dialog.Content},
  {name: 'Dialog.Footer', wrapper: Dialog.Footer},
].forEach((testCase) => {
  describe(testCase.name, () => {
    itMergesClassNameToRoot((className) => {
      render(<testCase.wrapper className={className}>본문</testCase.wrapper>);
      return screen.getByText('본문');
    });
  });
});
