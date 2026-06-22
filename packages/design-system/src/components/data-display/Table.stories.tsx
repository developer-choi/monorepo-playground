import type {Meta, StoryObj} from '@storybook/react-vite';
import * as Table from './Table';
import type {RootProps} from './Table';

const meta: Meta<typeof Table.Root> = {
  title: 'Components/data-display/Table',
  component: Table.Root,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {control: 'inline-radio', options: ['small', 'medium']},
  },
  args: {
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof Table.Root>;

const ROWS = [
  {id: 1, title: '첫 번째 글', type: '일반'},
  {id: 2, title: '두 번째 글', type: '공지'},
  {id: 3, title: '세 번째 글', type: '일반'},
];

const renderTable = (args: RootProps) => (
  <Table.Root {...args}>
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeaderCell width={60}>ID</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width={80}>타입</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {ROWS.map((row) => (
        <Table.Row key={row.id}>
          <Table.Cell>{row.id}</Table.Cell>
          <Table.Cell>{row.title}</Table.Cell>
          <Table.Cell>{row.type}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
);

export const Default: Story = {render: renderTable};

export const Small: Story = {
  args: {size: 'small'},
  render: renderTable,
};

export const Empty: Story = {
  render: (args) => (
    <Table.Root {...args}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>타입</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell colSpan={2}>게시글이 없습니다.</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  ),
};
