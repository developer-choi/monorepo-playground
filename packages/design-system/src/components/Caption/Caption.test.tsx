import {describe, it} from 'vitest';

describe('Caption', () => {
  describe('General cases', () => {
    // isInvalid면 role="alert"로 노출 → getByRole('alert')
    it.todo('유효하지 않으면 alert로 알린다');
    // className은 getByText(children).toHaveClass('custom')
    it.todo('className을 넘기면 병합된다');
  });

  describe('Boundary cases', () => {
    // 유효(기본)일 땐 role 없음 → queryByRole('alert') 부재
    it.todo('유효하면 alert로 노출하지 않는다');
  });
});
