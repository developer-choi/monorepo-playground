import type {Meta, StoryObj} from '@storybook/react-vite';
import PasswordField from './PasswordField';

const meta: Meta<typeof PasswordField> = {
  title: 'Components/inputs/PasswordField',
  component: PasswordField,
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
    readOnly: {control: 'boolean'},
    leading: {control: false},
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호를 입력하세요',
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 320}}>{story()}</div>],
};

export default meta;
type Story = StoryObj<typeof PasswordField>;

export const Default: Story = {};

export const WithCaption: Story = {
  args: {caption: '8자 이상 입력하세요'},
};

export const Invalid: Story = {
  args: {error: '비밀번호가 일치하지 않습니다'},
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Disabled: Story = {
  args: {disabled: true, value: 'password'},
};
