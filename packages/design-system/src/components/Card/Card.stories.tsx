import type {Meta, StoryObj} from '@storybook/react-vite';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 320}}>{story()}</div>],
  args: {
    children: '카드 내용입니다.',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
