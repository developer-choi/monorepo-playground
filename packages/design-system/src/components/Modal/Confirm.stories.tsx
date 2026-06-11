import type {Meta, StoryObj} from '@storybook/react-vite';
import {type ComponentProps, useState} from 'react';
import Confirm from './Confirm';

const meta: Meta<typeof Confirm> = {
  title: 'Components/Modal/Confirm',
  component: Confirm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {control: 'text'},
    content: {control: 'text'},
    confirmText: {control: 'text'},
    cancelText: {control: 'text'},
    destructive: {control: 'boolean'},
    onConfirm: {action: 'confirmed'},
    onCancel: {action: 'cancelled'},
    open: {control: false},
  },
};

export default meta;
type Story = StoryObj<typeof Confirm>;

function ConfirmStory(args: ComponentProps<typeof Confirm>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="storyLayout">
      {/* eslint-disable-next-line no-restricted-syntax -- Storybook 데모용 트리거. Confirm 자체는 DS Button을 내부에서 사용 */}
      <button onClick={() => setOpen(true)}>Confirm 열기</button>
      <Confirm
        {...args}
        open={open}
        onCancel={() => {
          setOpen(false);
          args.onCancel();
        }}
        onConfirm={() => {
          setOpen(false);
          args.onConfirm();
        }}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    title: '변경사항 저장',
    content: '변경사항을 저장하시겠습니까?',
  },
  render: (args) => <ConfirmStory {...args} />,
};

export const Destructive: Story = {
  args: {
    title: '게시글 삭제',
    content: '정말 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.',
    confirmText: '삭제',
    destructive: true,
  },
  render: (args) => <ConfirmStory {...args} />,
};
