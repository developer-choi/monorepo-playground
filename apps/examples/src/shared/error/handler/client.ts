import {useCallback} from 'react';
import {getErrorInfo} from '@/shared/error/handler/info';

export function useHandleClientSideError() {
  return useCallback((error: unknown) => {
    // TODO: alert을 모달로 대체 예정
    const {title, content} = getErrorInfo(error);
    alert(`${title}\n${content}`);
  }, []);
}
