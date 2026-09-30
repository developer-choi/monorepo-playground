import type {Meta, StoryObj} from '@storybook/react-vite';
import {useEffect, useRef} from 'react';
import Toaster from './Toaster';
import {clearToasts, toast, type ToastOptions} from './toast';

const meta: Meta<ToastOptions> = {
  title: 'Components/feedback/Toaster',
  parameters: {
    layout: 'centered',
  },
  beforeEach: () => {
    clearToasts();
  },
  argTypes: {
    title: {control: 'text'},
    description: {control: 'text', description: '비우면 제목 한 줄만 보입니다.'},
    duration: {control: 'number', description: '떠 있는 시간(ms). 비우거나 0이면 1800ms입니다.'},
  },
};

export default meta;
type Story = StoryObj<ToastOptions>;

export const Default: Story = {
  args: {
    title: '오늘과 지난 날짜만 기록할 수 있어요',
    duration: 1800,
  },
  render: (args) => <ToastStory {...args} />,
};

export const WithDescription: Story = {
  ...Default,
  args: {
    title: '저장했어요',
    description: '달력에 바로 반영됐어요',
    duration: 3000,
  },
};

export const Stacking: Story = {
  args: {
    duration: 5000,
  },
  argTypes: {
    title: {table: {disable: true}},
    description: {table: {disable: true}},
  },
  render: (args) => <StackingStory {...args} />,
};

function ToastStory({title, description, duration}: ToastOptions) {
  useEffect(() => {
    toast({title, description, duration});
  }, [title, description, duration]);

  return (
    <div className="storyLayout">
      <button onClick={() => toast({title, description, duration})}>토스트 띄우기</button>
      <Toaster />
    </div>
  );
}

function StackingStory({duration}: ToastOptions) {
  const countCache = useRef(0);

  return (
    <div className="storyLayout">
      <button
        onClick={() => {
          countCache.current += 1;
          toast({title: `토스트 ${countCache.current}`, duration});
        }}
      >
        하나 더 띄우기
      </button>
      <Toaster />
    </div>
  );
}
