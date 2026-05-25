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
