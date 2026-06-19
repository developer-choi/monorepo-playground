import {describe, it} from 'vitest';

describe('Card', () => {
  describe('General cases', () => {
    // role 없는 <div>이라 getByText(children).toHaveClass('custom') (getByRole 불가 — 보고 대상)
    it.todo('className을 넘기면 병합된다');
  });
});
