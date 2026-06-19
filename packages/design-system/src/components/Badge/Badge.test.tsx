import {describe, it} from 'vitest';

describe('Badge', () => {
  describe('General cases', () => {
    // role 없는 <span>이라 getByText(children).toHaveClass('custom')로 검증 (getByRole 불가 — 보고 대상)
    it.todo('className을 넘기면 병합된다');
  });
});
