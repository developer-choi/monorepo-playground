import type {Meta, StoryObj} from '@storybook/react-vite';
import {Cross2Icon, MagnifyingGlassIcon} from '@radix-ui/react-icons';
import IconButton from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/inputs/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {control: 'inline-radio', options: ['small', 'medium', 'large']},
    disabled: {control: 'boolean'},
    icon: {control: false},
  },
  args: {
    label: '검색',
    icon: <MagnifyingGlassIcon />,
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Small: Story = {
  args: {size: 'small'},
};

export const Large: Story = {
  args: {size: 'large'},
};

export const Disabled: Story = {
  args: {disabled: true},
};

export const Close: Story = {
  args: {label: '닫기', icon: <Cross2Icon />},
};
