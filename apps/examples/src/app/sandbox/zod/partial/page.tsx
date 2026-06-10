import {z} from 'zod';
import {Container, Table, Code, Badge} from '@radix-ui/themes';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
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
    <Container p="6" size="4">
      <h2 className={clsx(typography.h2, styles.heading)}>Zod partial() 비교 테스트</h2>

      <Table.Root size="1" variant="surface">
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
                <Code size="1">{JSON.stringify(row.data)}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge color={row.withoutPartial.ok ? 'green' : 'red'} mr="1" size="1">
                  {row.withoutPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code size="1">{row.withoutPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge color={row.withPartial.ok ? 'green' : 'red'} mr="1" size="1">
                  {row.withPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code size="1">{row.withPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge color="blue" mr="1" size="1">
                  ALWAYS
                </Badge>
                <Code size="1">{row.withSafeParsePartial}</Code>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Container>
  );
}
