import {describe, it} from 'vitest';

describe('Label', () => {
  describe('General cases', () => {
    // role 없는 <label> — isRequired 없이 렌더해 getByText(children).toHaveClass('custom')
    it.todo('className을 넘기면 병합된다');
  });
});
