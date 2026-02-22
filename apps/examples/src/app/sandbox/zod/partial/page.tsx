import {z} from 'zod';
import {Container, Heading, Table, Code, Badge} from '@radix-ui/themes';
import {safeParsePartial} from '@/shared/utils/zod';

const ALLOWED_TYPES = ['admin', 'user', 'manager'] as const;

const SchemaStrict = z.object({
  type: z.enum(ALLOWED_TYPES),
  age: z.number().int().positive(),
});

const SchemaPartial = SchemaStrict.partial();

const testCases = [
  {label: 'type 없음', data: {age: 25}},
  {label: 'type 비허용값', data: {type: 'invalid', age: 25}},
];

function formatResult(result: ReturnType<typeof z.safeParse>) {
  if (result.success) return {ok: true, value: JSON.stringify(result.data)};
  const msgs = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
  return {ok: false, value: msgs.join(', ')};
}

export default function Page() {
  const rows = testCases.map(({label, data}) => {
    const withoutPartial = formatResult(z.safeParse(SchemaStrict, data));
    const withPartial = formatResult(z.safeParse(SchemaPartial, data));
    const withSafeParsePartial = safeParsePartial(SchemaPartial, data);

    return {label, data, withoutPartial, withPartial, withSafeParsePartial: JSON.stringify(withSafeParsePartial)};
  });

  return (
    <Container size="4" p="6">
      <Heading size="6" mb="4">Zod partial() 비교 테스트</Heading>

      <Table.Root variant="surface" size="1">
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
          {rows.map(row => (
            <Table.Row key={row.label}>
              <Table.Cell><strong>{row.label}</strong></Table.Cell>
              <Table.Cell><Code size="1">{JSON.stringify(row.data)}</Code></Table.Cell>
              <Table.Cell>
                <Badge color={row.withoutPartial.ok ? 'green' : 'red'} size="1" mr="1">
                  {row.withoutPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code size="1">{row.withoutPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge color={row.withPartial.ok ? 'green' : 'red'} size="1" mr="1">
                  {row.withPartial.ok ? 'OK' : 'FAIL'}
                </Badge>
                <Code size="1">{row.withPartial.value}</Code>
              </Table.Cell>
              <Table.Cell>
                <Badge color="blue" size="1" mr="1">ALWAYS</Badge>
                <Code size="1">{row.withSafeParsePartial}</Code>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Container>
  );
}
