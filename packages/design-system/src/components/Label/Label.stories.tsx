import type {Meta, StoryObj} from '@storybook/react-vite';
import Label from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    isRequired: {control: 'boolean'},
    isInvalid: {control: 'boolean'},
  },
  args: {
    children: '이메일',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const Required: Story = {
  args: {isRequired: true},
};

export const Invalid: Story = {
  args: {isInvalid: true},
};
