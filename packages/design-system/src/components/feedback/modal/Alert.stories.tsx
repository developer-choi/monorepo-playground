import type {Meta, StoryObj} from '@storybook/react-vite';
import {type ComponentProps, useState} from 'react';
import Alert from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/feedback/modal/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {control: 'text'},
    content: {control: 'text'},
    confirmText: {control: 'text'},
    onClose: {action: 'closed'},
    open: {control: false},
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

function AlertStory(args: ComponentProps<typeof Alert>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="storyLayout">
      {/* eslint-disable-next-line no-restricted-syntax -- Storybook 데모용 트리거. Alert 자체는 DS Button을 내부에서 사용 */}
      <button onClick={() => setOpen(true)}>Alert 열기</button>
      <Alert
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    title: '저장 완료',
    content: '변경사항이 저장되었습니다.',
    confirmText: '확인',
  },
  render: (args) => <AlertStory {...args} />,
};
