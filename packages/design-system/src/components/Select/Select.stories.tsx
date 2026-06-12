import type {Meta, StoryObj} from '@storybook/react-vite';
import Select from './Select';

const OPTIONS = [
  {value: 'free', label: '자유'},
  {value: 'qna', label: '질문'},
  {value: 'notice', label: '공지'},
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {control: 'text'},
    caption: {control: 'text'},
    error: {control: 'text'},
    placeholder: {control: 'text'},
    isRequired: {control: 'boolean'},
    disabled: {control: 'boolean'},
  },
  args: {
    label: '카테고리',
    options: OPTIONS,
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 320}}>{story()}</div>],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {placeholder: '선택하세요', defaultValue: ''},
};

export const WithCaption: Story = {
  args: {caption: '게시판 분류를 선택하세요'},
};

export const Invalid: Story = {
  args: {error: '카테고리를 선택해주세요'},
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Disabled: Story = {
  args: {disabled: true, defaultValue: 'free'},
};
