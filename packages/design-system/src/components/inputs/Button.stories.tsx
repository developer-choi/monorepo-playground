import type {Meta, StoryObj} from '@storybook/react-vite';
import Button from './Button';

const VARIANTS = ['contained', 'outlined'] as const;
const COLORS = ['primary', 'secondary', 'destructive'] as const;
const SIZES = ['small', 'medium', 'large', 'xLarge'] as const;

const meta: Meta<typeof Button> = {
  title: 'Components/inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    size: {control: 'select', options: ['small', 'medium', 'large', 'xLarge']},
    variant: {control: 'select', options: ['contained', 'outlined']},
    color: {control: 'select', options: ['primary', 'secondary', 'destructive']},
    loading: {control: 'boolean'},
    disabled: {control: 'boolean'},
    onClick: {action: 'clicked'},
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: '버튼',
    color: 'primary',
    variant: 'contained',
    size: 'medium',
  },
};

export const Loading: Story = {
  args: {
    children: '저장 중...',
    color: 'primary',
    variant: 'contained',
    size: 'medium',
    loading: true,
  },
  argTypes: {
    loading: {table: {disable: true}},
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성',
    color: 'primary',
    variant: 'contained',
    size: 'medium',
    disabled: true,
  },
  argTypes: {
    disabled: {table: {disable: true}},
  },
};

export const Matrix: Story = {
  argTypes: {
    variant: {table: {disable: true}},
    color: {table: {disable: true}},
    size: {table: {disable: true}},
  },
  render: () => (
    // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {VARIANTS.flatMap((variant) =>
        COLORS.map((color) => (
          // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 나열용 컨테이너. 동적 값 아님
          <div key={`${variant}-${color}`} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            {SIZES.map((size) => (
              <Button key={size} color={color} size={size} variant={variant}>
                {variant}/{color}/{size}
              </Button>
            ))}
          </div>
        )),
      )}
    </div>
  ),
};
