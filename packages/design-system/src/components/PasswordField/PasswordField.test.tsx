import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordField from './PasswordField';

describe('PasswordField', () => {
  describe('General cases', () => {
    it('토글 버튼을 누르면 입력 type이 토글된다', async () => {
      const label = '비밀번호';
      render(<PasswordField label={label} />);
      expect(screen.getByLabelText(label)).toHaveAttribute('type', 'password');
      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByLabelText(label)).toHaveAttribute('type', 'text');
      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByLabelText(label)).toHaveAttribute('type', 'password');
    });
  });
});
