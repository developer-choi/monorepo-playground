import type {Meta, StoryObj} from '@storybook/react-vite';
import Caption from './Caption';

const meta: Meta<typeof Caption> = {
  title: 'Components/data-display/Caption',
  component: Caption,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {control: 'text'},
    isInvalid: {control: 'boolean'},
  },
  args: {
    children: '회사 이메일을 입력하세요',
  },
};

export default meta;
type Story = StoryObj<typeof Caption>;

export const Default: Story = {};

export const Invalid: Story = {
  args: {isInvalid: true, children: '올바른 이메일 형식이 아닙니다'},
};
