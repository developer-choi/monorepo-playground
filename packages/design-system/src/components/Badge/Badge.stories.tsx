import type {Meta, StoryObj} from '@storybook/react-vite';
import Badge, {type BadgeProps} from './Badge';

const COLORS: NonNullable<BadgeProps['color']>[] = ['neutral', 'info', 'success', 'warning', 'danger'];
const VARIANTS: NonNullable<BadgeProps['variant']>[] = ['soft', 'outline', 'surface'];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Badge',
    color: 'neutral',
    variant: 'soft',
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Colors: Story = {
  render: (args) => (
    // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
    <div style={{display: 'flex', gap: 8}}>
      {COLORS.map((color) => (
        <Badge {...args} key={color} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {VARIANTS.map((variant) => (
        // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
        <div key={variant} style={{display: 'flex', gap: 8}}>
          {COLORS.map((color) => (
            <Badge {...args} key={color} color={color} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Badge {...args} size="small">
        small
      </Badge>
      <Badge {...args} size="medium">
        medium
      </Badge>
    </div>
  ),
};
