import type {Meta, StoryObj} from '@storybook/react-vite';
import Radio from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    disabled: {control: 'boolean'},
  },
  args: {
    children: '옵션',
    name: 'radio-story',
    value: 'option',
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: {children: undefined},
};

export const Disabled: Story = {
  args: {disabled: true},
};
