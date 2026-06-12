import type {Meta, StoryObj} from '@storybook/react-vite';
import Checkbox from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    disabled: {control: 'boolean'},
  },
  args: {
    children: '동의합니다',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: {children: undefined},
};

export const Disabled: Story = {
  args: {disabled: true},
};
