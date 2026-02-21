import {useCallback} from 'react';
import {getErrorMessage} from '@/shared/error/handler/message';

export function useHandleClientSideError() {
  return useCallback((error: unknown) => {
    // TODO: alert을 모달로 대체 예정
    alert(getErrorMessage(error));
  }, []);
}
