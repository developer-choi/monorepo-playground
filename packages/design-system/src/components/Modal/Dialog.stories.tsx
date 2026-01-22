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

const BasicUsageStory = (args: DialogProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="story-layout">
      <div className="btn-group">
        <button onClick={handleOpen}>
          Dialog 열기
        </button>
        <button onClick={handleOpen}>
          Dialog 열기2
        </button>
      </div>

      <Dialog
        {...args}
        open={open}
        onClose={(event, reason) => {
          handleClose();
          args.onClose?.(event, reason);
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <h2>Dialog 제목</h2>
          </div>
          
          <div className={styles.dialogBody}>
            <p>닫기 버튼이나 ESC 키를 눌러보세요. 포커스가 원래 열었던 버튼으로 돌아갑니다.</p>
          </div>

          <div className={styles.dialogFooter}>
            <button onClick={handleClose}>
              닫기
            </button>
            <button className="primary" onClick={handleClose}>
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

const FormDialogStory = (args: DialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="story-layout">
      <div className="btn-group">
        <button className="primary" onClick={() => setOpen(true)}>
          프로필 수정하기
        </button>
      </div>

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
            <h2>Focus Trap 테스트</h2>
          </div>

          <div className={styles.dialogBody}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Tab 키를 계속 눌러보세요.</label>
              <input id="name" type="text" placeholder="포커스가 입력창 사이에서만 순환합니다." autoFocus />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">"Shift" Tab 키를 계속 눌러보세요.</label>
              <input id="email" type="email" placeholder="포커스가 입력창 사이에서만 역방향으로 순환합니다." />
            </div>
          </div>

          <div className={styles.dialogFooter}>
            <button onClick={() => setOpen(false)}>
              취소
            </button>
            <button className="primary" onClick={() => setOpen(false)}>
              변경사항 저장
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const FormDialog: Story = {
  args: {
    disableEscapeKeyDown: true,
    disableBackdropClick: true,
  },
  render: (args) => <FormDialogStory {...args} />,
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
