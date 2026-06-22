import {type ComponentProps, type CSSProperties} from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';

export interface RootProps extends Pick<ComponentProps<'table'>, 'className' | 'children'> {
  size?: 'small' | 'medium';
}

export function Root({children, className, size = 'medium'}: RootProps) {
  return (
    <div className={clsx(styles.wrapper, styles.styled)}>
      <table className={clsx(styles.table, styles[size], className)}>{children}</table>
    </div>
  );
}

export type HeaderProps = Pick<ComponentProps<'thead'>, 'className' | 'children'>;

export function Header({children, className}: HeaderProps) {
  return <thead className={className}>{children}</thead>;
}

export type BodyProps = Pick<ComponentProps<'tbody'>, 'className' | 'children'>;

export function Body({children, className}: BodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export type RowProps = Pick<ComponentProps<'tr'>, 'className' | 'children' | 'onClick'>;

export function Row({children, className, onClick}: RowProps) {
  return (
    <tr className={className} onClick={onClick}>
      {children}
    </tr>
  );
}

export interface ColumnHeaderCellProps extends Pick<ComponentProps<'th'>, 'className' | 'children' | 'colSpan'> {
  width?: number | string;
}

export function ColumnHeaderCell({children, className, colSpan, width}: ColumnHeaderCellProps) {
  const widthStyle: CSSProperties | undefined =
    width === undefined ? undefined : {width: typeof width === 'number' ? `${width}px` : width};

  return (
    <th
      className={clsx(styles.cell, styles.styled, styles.columnHeaderCell, className)}
      colSpan={colSpan}
      scope="col"
      style={widthStyle}
    >
      {children}
    </th>
  );
}

export type CellProps = Pick<ComponentProps<'td'>, 'className' | 'children' | 'colSpan'>;

export function Cell({children, className, colSpan}: CellProps) {
  return (
    <td className={clsx(styles.cell, styles.styled, className)} colSpan={colSpan}>
      {children}
    </td>
  );
}
