import type {Meta, StoryObj} from '@storybook/react-vite';
import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/inputs/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {control: 'text'},
    caption: {control: 'text'},
    error: {control: 'text'},
    placeholder: {control: 'text'},
    rows: {control: 'number'},
    isRequired: {control: 'boolean'},
    disabled: {control: 'boolean'},
    readOnly: {control: 'boolean'},
  },
  args: {
    label: '내용',
    placeholder: '내용을 입력하세요',
    rows: 5,
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 360}}>{story()}</div>],
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {};

export const WithCaption: Story = {
  args: {caption: '최대 1000자까지 입력할 수 있습니다'},
};

export const Invalid: Story = {
  args: {error: '내용을 입력해주세요'},
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
