import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import * as Table from './Table';
import {itMergesClassNameToRoot} from '@/test-utils/test-class-name';

describe('Table', () => {
  describe('Root', () => {
    // 루트는 바깥 <div>(role·텍스트 없음)라 getByRole/getByText로 못 잡는다.
    // 불가피하게 container.firstChild로 잡는다 (role 없는 래퍼 루트 전용 escape-hatch).
    itMergesClassNameToRoot((className) => {
      const {container} = render(
        <Table.Root className={className}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>셀</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>,
      );
      return container.firstChild as HTMLElement;
    });
  });

  // ColumnHeaderCell·Cell·Header·Body·Row는 <table> 컨텍스트 안에서 각자의 암묵 role로 잡는다
  // (th/td/thead/tbody/tr의 role은 table 조상이 있어야 계산된다).
  describe('ColumnHeaderCell', () => {
    itMergesClassNameToRoot((className) => {
      render(
        <table>
          <thead>
            <tr>
              <Table.ColumnHeaderCell className={className}>제목</Table.ColumnHeaderCell>
            </tr>
          </thead>
        </table>,
      );
      return screen.getByRole('columnheader');
    });

    it('width에 숫자를 주면 px 단위로 적용된다', () => {
      const width = 120;
      render(
        <table>
          <thead>
            <tr>
              <Table.ColumnHeaderCell width={width}>제목</Table.ColumnHeaderCell>
            </tr>
          </thead>
        </table>,
      );
      expect(screen.getByRole('columnheader')).toHaveStyle({width: `${width}px`});
    });

    it('width에 문자열을 주면 그대로 적용된다', () => {
      const width = '50%';
      render(
        <table>
          <thead>
            <tr>
              <Table.ColumnHeaderCell width={width}>제목</Table.ColumnHeaderCell>
            </tr>
          </thead>
        </table>,
      );
      expect(screen.getByRole('columnheader')).toHaveStyle({width});
    });

    it('width를 주지 않으면 너비 스타일이 없다', () => {
      render(
        <table>
          <thead>
            <tr>
              <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
            </tr>
          </thead>
        </table>,
      );
      expect(screen.getByRole('columnheader').style.width).toBe('');
    });
  });

  describe('Cell', () => {
    itMergesClassNameToRoot((className) => {
      render(
        <table>
          <tbody>
            <tr>
              <Table.Cell className={className}>값</Table.Cell>
            </tr>
          </tbody>
        </table>,
      );
      return screen.getByRole('cell');
    });
  });

  describe('Header', () => {
    itMergesClassNameToRoot((className) => {
      render(
        <table>
          <Table.Header className={className}>
            <tr>
              <td>값</td>
            </tr>
          </Table.Header>
        </table>,
      );
      return screen.getByRole('rowgroup');
    });
  });

  describe('Body', () => {
    itMergesClassNameToRoot((className) => {
      render(
        <table>
          <Table.Body className={className}>
            <tr>
              <td>값</td>
            </tr>
          </Table.Body>
        </table>,
      );
      return screen.getByRole('rowgroup');
    });
  });

  describe('Row', () => {
    itMergesClassNameToRoot((className) => {
      render(
        <table>
          <tbody>
            <Table.Row className={className}>
              <td>값</td>
            </Table.Row>
          </tbody>
        </table>,
      );
      return screen.getByRole('row');
    });
  });
});
