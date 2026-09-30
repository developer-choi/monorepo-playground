import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import Chip from './Chip';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Chip', () => {
  describe('General cases', () => {
    it('지우기 버튼을 누르면 onRemove가 호출된다', async () => {
      const onRemove = vi.fn();
      render(
        <Chip removeLabel="야근 지우기" onRemove={onRemove}>
          야근
        </Chip>,
      );
      await userEvent.click(screen.getByRole('button', {name: '야근 지우기'}));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    itMergesClassNameToRoot((className) => {
      render(
        <Chip className={className} removeLabel="야근 지우기" onRemove={vi.fn()}>
          야근
        </Chip>,
      );
      return screen.getByText('야근');
    });
  });
});
