import {z} from 'zod';
import clsx from 'clsx';
import {Badge, Callout, Table} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import Code from '@/shared/components/Code';
import CodeBlock from '@/shared/components/CodeBlock';
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
      <div className={styles.intro}>
        <h2 className={clsx(typography.h2, styles.pageTitle)}>Zod partial() 비교</h2>
        <p className={clsx(typography.body1, styles.description)}>
          같은 입력을 <strong>strict 스키마</strong>, <Code>.partial()</Code> 스키마, <Code>safeParsePartial()</Code>{' '}
          유틸 세 가지로 검증했을 때 결과가 어떻게 달라지는지 비교합니다.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>비교 대상</h3>
        <CodeBlock code={SCHEMA_CODE} lang="ts" />
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>케이스별 결과</h3>
        <Table.Root size="small">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>케이스</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>입력</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>strict</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>.partial()</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>safeParsePartial()</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.label}>
                <Table.Cell>
                  <strong>{row.label}</strong>
                </Table.Cell>
                <Table.Cell>
                  <Code className={styles.resultCode}>{JSON.stringify(row.data)}</Code>
                </Table.Cell>
                <Table.Cell>
                  <div className={styles.resultCell}>
                    <Badge color={row.withoutPartial.ok ? 'success' : 'danger'} size="small">
                      {row.withoutPartial.ok ? 'OK' : 'FAIL'}
                    </Badge>
                    <Code className={styles.resultCode}>{row.withoutPartial.value}</Code>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className={styles.resultCell}>
                    <Badge color={row.withPartial.ok ? 'success' : 'danger'} size="small">
                      {row.withPartial.ok ? 'OK' : 'FAIL'}
                    </Badge>
                    <Code className={styles.resultCode}>{row.withPartial.value}</Code>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className={styles.resultCell}>
                    <Badge color="info" size="small">
                      ALWAYS
                    </Badge>
                    <Code className={styles.resultCode}>{row.withSafeParsePartial}</Code>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      <Callout color="info">
        <p className={typography.body2}>
          <Code>.partial()</Code>은 키 <strong>누락</strong>만 허용할 뿐, 존재하는 키에 비허용값이 들어오면 여전히
          실패합니다. <Code>safeParsePartial()</Code>은 필드 단위로 검증해 실패한 필드만 버리므로 항상 성공합니다.
        </p>
      </Callout>
    </div>
  );
}

const SCHEMA_CODE = `const schemaStrict = z.object({
  type: z.enum(['admin', 'user', 'manager']),
  age: z.number().int().positive(),
});

const schemaPartial = schemaStrict.partial(); // 모든 키가 optional로

// 필드 단위로 검증해 실패한 필드만 버린다 — 항상 성공
safeParsePartial(schemaPartial, {type: 'invalid', age: 25});
// → { age: 25 }`;
