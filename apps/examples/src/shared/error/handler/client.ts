import {useCallback} from 'react';

export function useHandleClientSideError() {
  return useCallback((error: unknown) => {
    // TODO: 에러 타입별 공통 처리 (HTTPError 상태코드별 모달/토스트 등)
    throw error;
  }, []);
}
