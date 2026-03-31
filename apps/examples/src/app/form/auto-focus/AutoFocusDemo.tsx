'use client';

import {useEffect} from 'react';
import {Box} from '@radix-ui/themes';
import Input from '@/shared/components/form/Input';
import styles from './AutoFocusDemo.module.scss';

export default function AutoFocusDemo() {
  useAutoFocusOnWindowFocus();

  return (
    <Box className={styles.searchInput} mb="8">
      <Input placeholder="검색어를 입력하세요" autoFocus />
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
