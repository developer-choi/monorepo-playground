import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button from '@/components/Button';

export interface AlertProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  /** 확인 버튼 라벨. 기본값 '확인' */
  confirmText?: string;
}

/**
 * 확인 1버튼 알림 모달. 결과값이 없는 통지용(overlay.open).
 * 표시 제어는 소비자가 open/onClose로 한다(overlay-kit 등).
 */
export default function Alert({open, onClose, title, content, confirmText = '확인'}: AlertProps) {
  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button onClick={onClose}>{confirmText}</Button>
      </Dialog.Footer>
    </Dialog.Root>
  );
}
