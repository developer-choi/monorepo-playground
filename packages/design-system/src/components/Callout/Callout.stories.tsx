import type {Meta, StoryObj} from '@storybook/react-vite';
import Callout, {type CalloutProps} from './Callout';

const COLORS: NonNullable<CalloutProps['color']>[] = ['neutral', 'info', 'success', 'warning', 'danger'];

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  parameters: {
    layout: 'padded',
  },
  args: {
    color: 'info',
    children: '안내문 본문입니다.',
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {};

export const Colors: Story = {
  render: (args) => (
    // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {COLORS.map((color) => (
        <Callout {...args} key={color} color={color}>
          {color} 안내문입니다.
        </Callout>
      ))}
    </div>
  ),
};
