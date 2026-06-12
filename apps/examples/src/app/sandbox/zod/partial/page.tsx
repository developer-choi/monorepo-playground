import {z} from 'zod';
import clsx from 'clsx';
import {Badge, Table} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import Code from '@/shared/components/Code';
import {safeParsePartial} from '@/shared/utils/zod';
import styles from './page.module.scss';

const ALLOWED_TYPES = ['admin', 'user', 'manager'] as const;

const schemaStrict = z.object({
  type: z.enum(ALLOWED_TYPES),
  age: z.number().int().positive(),
});

const schemaPartial = schemaStrict.partial();

const testCases = [
  {label: 'type 없음', data: {age: 25}},
  {label: 'type 비허용값', data: {type: 'invalid', age: 25}},
];

function formatResult(result: ReturnType<typeof z.safeParse>) {
  if (result.success) {
    return {ok: true, value: JSON.stringify(result.data)};
  }
  const msgs = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  return {ok: false, value: msgs.join(', ')};
}

export default function Page() {
  const rows = testCases.map(({label, data}) => {
    const withoutPartial = formatResult(z.safeParse(schemaStrict, data));
    const withPartial = formatResult(z.safeParse(schemaPartial, data));
    const withSafeParsePartial = safeParsePartial(schemaPartial, data);

    return {label, data, withoutPartial, withPartial, withSafeParsePartial: JSON.stringify(withSafeParsePartial)};
  });

  return (
    <div className={styles.page}>
      <h2 className={clsx(typography.h2, styles.heading)}>Zod partial() 비교 테스트</h2>

      <Table.Root size="small">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>케이스</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>input</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>safeParse(Schema, data)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>safeParse(Schema.partial(), data)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>safeParsePartial(Schema.partial(), data)</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.label}>
              <Table.Cell>
                <strong>{row.label}</strong>
              </Table.Cell>
              <Table.Cell>
                <Code>{JSON.stringify(row.data)}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge className={styles.statusBadge} color={row.withoutPartial.ok ? 'success' : 'danger'} size="small">
                  {row.withoutPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code>{row.withoutPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge className={styles.statusBadge} color={row.withPartial.ok ? 'success' : 'danger'} size="small">
                  {row.withPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code>{row.withPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge className={styles.statusBadge} color="info" size="small">
                  ALWAYS
                </Badge>
                <Code>{row.withSafeParsePartial}</Code>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
