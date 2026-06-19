import type {Meta, StoryObj} from '@storybook/react-vite';
import {Cross2Icon, MagnifyingGlassIcon} from '@radix-ui/react-icons';
import IconButton from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
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
  args: {icon: <Cross2Icon />},
};
