import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    size: {control: 'select', options: ['small', 'medium', 'large']},
    variant: {control: 'select', options: ['contained', 'outlined']},
    color: {control: 'select', options: ['primary', 'secondary', 'destructive']},
    loading: {control: 'boolean'},
    disabled: {control: 'boolean'},
    onClick: {action: 'clicked'},
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: '저장',
    color: 'primary',
    variant: 'contained',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: '취소',
    color: 'secondary',
    variant: 'contained',
    size: 'medium',
  },
};

export const Destructive: Story = {
  args: {
    children: '삭제',
    color: 'destructive',
    variant: 'contained',
    size: 'medium',
  },
};

export const Outlined: Story = {
  args: {
    children: '더 보기',
    color: 'primary',
    variant: 'outlined',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    children: '작은 버튼',
    color: 'primary',
    variant: 'contained',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: '큰 버튼',
    color: 'primary',
    variant: 'contained',
    size: 'large',
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
};

export const Disabled: Story = {
  args: {
    children: '비활성',
    color: 'primary',
    variant: 'contained',
    size: 'medium',
    disabled: true,
  },
};
