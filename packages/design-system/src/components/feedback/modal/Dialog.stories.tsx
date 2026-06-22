import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import * as Dialog from './Dialog';
import Button from '@/components/inputs/Button';

const meta: Meta<typeof Dialog.Root> = {
  title: 'Components/feedback/modal/Dialog',
  component: Dialog.Root,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disableEscapeKeyDown: {
      control: 'boolean',
      description: 'true일 경우, ESC 키를 눌러도 Dialog가 닫히지 않습니다.',
    },
    disableBackdropClick: {
      control: 'boolean',
      description: 'true일 경우, 배경(Backdrop)을 클릭해도 Dialog가 닫히지 않습니다.',
    },
    onClose: {
      action: 'closed',
      description: 'Dialog가 닫혀야 할 때 호출되는 콜백 함수입니다.',
    },
    children: {
      control: false,
      description: 'Dialog 내부에 렌더링될 콘텐츠입니다.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog.Root>;

interface FormDialogContentProps {
  title: string;
  descriptions: string[];
  onClose: () => void;
}

function FormDialogContent({title, descriptions, onClose}: FormDialogContentProps) {
  return (
    <>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        {descriptions.map((description, index) => (
          <p key={index}>{description}</p>
        ))}

        <div className="formGroup">
          <label htmlFor="form-name">이름</label>
          <input id="form-name" placeholder="이름을 입력하세요" type="text" />
        </div>
        <div className="formGroup">
          <label htmlFor="form-email">이메일</label>
          <input id="form-email" placeholder="이메일을 입력하세요" type="email" />
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Button color="secondary" variant="outlined" onClick={onClose}>
          취소
        </Button>
        <Button onClick={onClose}>저장</Button>
      </Dialog.Footer>
    </>
  );
}

function BasicUsageStory(args: Dialog.RootProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="storyLayout">
      <Button color="secondary" variant="outlined" onClick={() => setOpen(true)}>
        Dialog 열기
      </Button>

      <Dialog.Root
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>Dialog 제목</Dialog.Title>
        </Dialog.Header>

        <Dialog.Content>ESC 키 또는 배경을 클릭하여 닫을 수 있습니다.</Dialog.Content>

        <Dialog.Footer>
          <Button color="secondary" variant="outlined" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={() => setOpen(false)}>확인</Button>
        </Dialog.Footer>
      </Dialog.Root>
    </div>
  );
}

export const BasicUsage: Story = {
  args: {
    disableEscapeKeyDown: false,
    disableBackdropClick: false,
  },
  render: (args) => <BasicUsageStory {...args} />,
};

function FocusStory(args: Dialog.RootProps) {
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [trapOpen, setTrapOpen] = useState(false);

  return (
    <div className="storyLayout">
      <div className="buttonGroup">
        <Button color="secondary" variant="outlined" onClick={() => setRestoreOpen(true)}>
          첫 요소 포커스 지정
        </Button>
        <Button color="secondary" variant="outlined" onClick={() => setTrapOpen(true)}>
          포커스 Trap 테스트
        </Button>
      </div>

      <Dialog.Root
        {...args}
        open={restoreOpen}
        onClose={() => {
          setRestoreOpen(false);
          args.onClose();
        }}
      >
        <FormDialogContent
          descriptions={[
            '모달이 열리면 첫 번째 포커스 가능한 요소에 자동으로 포커스됩니다.',
            'Confirm 모달이면 취소버튼, Alert 모달이면 확인버튼, Form 모달이면 첫 폼요소에 포커스가 가는게 Best 입니다.',
          ]}
          title="첫 요소 포커스 지정"
          onClose={() => setRestoreOpen(false)}
        />
      </Dialog.Root>

      <Dialog.Root
        {...args}
        open={trapOpen}
        onClose={() => {
          setTrapOpen(false);
          args.onClose();
        }}
      >
        <FormDialogContent
          descriptions={[
            'Tab 키를 계속 눌러보세요. 포커스가 모달 내부에서만 순환하며, 바깥으로 빠져나가지 않습니다.',
            'Shift+Tab으로 역방향 순환도 테스트해보세요.',
          ]}
          title="포커스 Trap 테스트"
          onClose={() => setTrapOpen(false)}
        />
      </Dialog.Root>
    </div>
  );
}

export const Focus: Story = {
  args: {
    disableEscapeKeyDown: false,
    disableBackdropClick: false,
  },
  render: (args) => <FocusStory {...args} />,
};
