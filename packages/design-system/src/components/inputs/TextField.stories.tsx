import type {Meta, StoryObj} from '@storybook/react-vite';
import TextField from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/inputs/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {control: 'text'},
    caption: {control: 'text'},
    error: {control: 'text'},
    placeholder: {control: 'text'},
    suffix: {control: 'text'},
    isRequired: {control: 'boolean'},
    disabled: {control: 'boolean'},
    readOnly: {control: 'boolean'},
    type: {control: 'text'},
    leading: {control: false},
    trailing: {control: false},
  },
  args: {
    label: '이메일',
    placeholder: '입력하세요',
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 320}}>{story()}</div>],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {};

export const WithCaption: Story = {
  args: {caption: '회사 이메일을 입력하세요'},
};

export const Invalid: Story = {
  args: {error: '올바른 이메일 형식이 아닙니다'},
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Disabled: Story = {
  args: {disabled: true, value: '비활성 값'},
};

export const ReadOnly: Story = {
  args: {readOnly: true, value: '읽기 전용 값'},
};

export const WithSuffix: Story = {
  args: {label: '금액', suffix: '원', placeholder: '0'},
};

export const Email: Story = {
  args: {label: '이메일', type: 'email', placeholder: 'name@example.com'},
};
