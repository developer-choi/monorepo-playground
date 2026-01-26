import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import Dialog, { type DialogProps } from './Dialog';
import Drawer from './Drawer';
import styles from './DialogStories.module.scss';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Modal/Dialog',
  component: Dialog,
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
type Story = StoryObj<typeof Dialog>;

interface FormDialogContentProps {
  title: string;
  descriptions: string[];
  onClose: () => void;
}

const FormDialogContent = ({title, descriptions, onClose}: FormDialogContentProps) => (
  <div className={styles.dialogContent}>
    <div className={styles.dialogHeader}>
      <h2>{title}</h2>
    </div>

    {descriptions.map((description, index) => (
      <p key={index} className={styles.dialogDescription}>{description}</p>
    ))}

    <div className={styles.dialogBody}>
      <div className={styles.formGroup}>
        <label htmlFor="form-name">이름</label>
        <input id="form-name" type="text" placeholder="이름을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="form-email">이메일</label>
        <input id="form-email" type="email" placeholder="이메일을 입력하세요" />
      </div>
    </div>

    <div className={styles.dialogFooter}>
      <button onClick={onClose}>
        취소
      </button>
      <button className="primary" onClick={onClose}>
        저장
      </button>
    </div>
  </div>
);

const BasicUsageStory = (args: DialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="story-layout">
      <button onClick={() => setOpen(true)}>
        Dialog 열기
      </button>

      <Dialog
        {...args}
        open={open}
        onClose={(event, reason) => {
          setOpen(false);
          args.onClose?.(event, reason);
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <h2>Dialog 제목</h2>
          </div>

          <div className={styles.dialogBody}>
            <p>ESC 키 또는 배경을 클릭하여 닫을 수 있습니다.</p>
          </div>

          <div className={styles.dialogFooter}>
            <button onClick={() => setOpen(false)}>
              취소
            </button>
            <button className="primary" onClick={() => setOpen(false)}>
              확인
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const BasicUsage: Story = {
  args: {
    disableEscapeKeyDown: false,
    disableBackdropClick: false,
  },
  render: (args) => <BasicUsageStory {...args} />,
};

const FocusStory = (args: DialogProps) => {
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [trapOpen, setTrapOpen] = useState(false);

  return (
    <div className="story-layout">
      <div className="btn-group">
        <button onClick={() => setRestoreOpen(true)}>
          포커스 복원 & 첫 요소 지정
        </button>
        <button onClick={() => setTrapOpen(true)}>
          포커스 Trap 테스트
        </button>
      </div>

      <Dialog
        {...args}
        open={restoreOpen}
        onClose={(event, reason) => {
          setRestoreOpen(false);
          args.onClose?.(event, reason);
        }}
      >
        <FormDialogContent
          title="포커스 복원 & 첫 요소 지정"
          descriptions={[
            "모달이 열리면 첫 번째 포커스 가능한 요소에 자동으로 포커스됩니다.",
            "Confirm 모달이면 취소버튼, Alert 모달이면 확인버튼, Form 모달이면 첫 폼요소에 포커스가 가는게 Best 입니다.",
            "모달을 닫으면 원래 열었던 버튼으로 포커스가 복원됩니다."
          ]}
          onClose={() => setRestoreOpen(false)}
        />
      </Dialog>

      <Dialog
        {...args}
        open={trapOpen}
        onClose={(event, reason) => {
          setTrapOpen(false);
          args.onClose?.(event, reason);
        }}
      >
        <FormDialogContent
          title="포커스 Trap 테스트"
          descriptions={[
            "Tab 키를 계속 눌러보세요. 포커스가 모달 내부에서만 순환하며, 바깥으로 빠져나가지 않습니다.",
            "Shift+Tab으로 역방향 순환도 테스트해보세요."
          ]}
          onClose={() => setTrapOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export const Focus: Story = {
  args: {
    disableEscapeKeyDown: false,
    disableBackdropClick: false,
  },
  render: (args) => <FocusStory {...args} />,
};

const CriticalAlertStory = (args: DialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="story-layout">
      <button className="danger" onClick={() => setOpen(true)}>
        계정 영구 삭제
      </button>

      <Dialog
        {...args}
        open={open}
        onClose={(event, reason) => {
          setOpen(false);
          args.onClose?.(event, reason);
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <h2 style={{ color: '#d32f2f' }}>정말 삭제하시겠습니까?</h2>
          </div>
          
          <div className={styles.dialogBody}>
            <p>
              중요한 작업이므로 실수로 닫는 것을 방지하기 위해 
              <strong> ESC 키와 배경 클릭 닫기가 비활성화</strong> 되었습니다.
            </p>
          </div>

          <div className={styles.dialogFooter}>
            <button onClick={() => setOpen(false)}>
              취소
            </button>
            <button className="danger" onClick={() => setOpen(false)}>
              삭제 확인
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const CriticalAlert: Story = {
  args: {
    disableEscapeKeyDown: true,
    disableBackdropClick: true,
  },
  render: (args) => <CriticalAlertStory {...args} />,
};

const DrawerExampleStory = (args: DialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="story-layout">
      <button onClick={() => setOpen(true)}>
        전체 메뉴 열기1
      </button>
      <button onClick={() => setOpen(true)}>
        전체 메뉴 열기2
      </button>

      <Drawer
        {...args}
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
      >
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <h2>Dialog에 있던 기능 모두 테스트</h2>
          </div>
          <div className={styles.drawerMenu}>
            <button className={styles.menuItem}>닫으면 포커스 돌아가기</button>
            <button className={styles.menuItem}>배경 / ESC로 닫기</button>
            <button className={styles.menuItem}>Tab 계속 누르기</button>
            <button className={styles.menuItem}>Shift Tab 계속 누르기</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export const DrawerExample: Story = {
  args: {
    disableEscapeKeyDown: false,
    disableBackdropClick: false,
  },
  render: (args) => <DrawerExampleStory {...args} />,
};
