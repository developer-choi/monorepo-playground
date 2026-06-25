import {type ChangeEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioGroup from './RadioGroup';
import Radio from './Radio';

describe('RadioGroup', () => {
  describe('General cases', () => {
    it('라디오를 선택하면 그룹 onChange에 해당 값이 전달된다', async () => {
      const user = userEvent.setup();
      const groupOnChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();

      render(
        <RadioGroup name="fruit" onChange={groupOnChange}>
          <Radio value="apple">사과</Radio>
          <Radio value="banana">바나나</Radio>
        </RadioGroup>,
      );

      await user.click(screen.getByRole('radio', {name: '사과'}));

      expect(groupOnChange).toHaveBeenCalledWith(
        expect.objectContaining({target: expect.objectContaining({value: 'apple'})}),
      );
    });

    it('그룹 value와 일치하는 라디오가 checked로 표시된다', () => {
      render(
        <RadioGroup name="fruit" value="banana">
          <Radio value="apple">사과</Radio>
          <Radio value="banana">바나나</Radio>
        </RadioGroup>,
      );

      expect(screen.getByRole('radio', {name: '바나나'})).toBeChecked();
      expect(screen.getByRole('radio', {name: '사과'})).not.toBeChecked();
    });

    it('그룹 name prop이 하위 라디오들에 적용된다', () => {
      const groupName = 'fruit';

      render(
        <RadioGroup name={groupName}>
          <Radio value="apple">사과</Radio>
          <Radio value="banana">바나나</Radio>
        </RadioGroup>,
      );

      const radios = ['사과', '바나나'];
      radios.forEach((label) => {
        expect(screen.getByRole('radio', {name: label})).toHaveAttribute('name', groupName);
      });
    });

    it('라디오를 선택하면 자체 onChange와 그룹 onChange가 모두 실행된다', async () => {
      const user = userEvent.setup();
      const radioOnChange = vi.fn();
      const groupOnChange = vi.fn();

      render(
        <RadioGroup name="fruit" onChange={groupOnChange}>
          <Radio value="apple" onChange={radioOnChange}>
            사과
          </Radio>
        </RadioGroup>,
      );

      await user.click(screen.getByRole('radio', {name: '사과'}));

      expect(radioOnChange).toHaveBeenCalledTimes(1);
      expect(groupOnChange).toHaveBeenCalledTimes(1);
    });
  });
});
