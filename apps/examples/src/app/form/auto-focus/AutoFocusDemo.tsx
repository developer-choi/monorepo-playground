'use client';

import {useEffect} from 'react';
import {Box} from '@radix-ui/themes';
import Input from '@/shared/components/form/Input';
import styles from './AutoFocusDemo.module.scss';

export default function AutoFocusDemo() {
  useAutoFocusOnWindowFocus();

  return (
    <Box className={styles.searchInput} mb="8">
      <Input autoFocus placeholder="페이지 진입 시와 다른 탭에서 돌아왔을 때 여기에 자동으로 포커스됩니다" />
    </Box>
  );
}

function useAutoFocusOnWindowFocus() {
  useEffect(() => {
    function handleFocus() {
      const element = document.querySelector<HTMLElement>('[autofocus]');
      element?.focus();
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
}
