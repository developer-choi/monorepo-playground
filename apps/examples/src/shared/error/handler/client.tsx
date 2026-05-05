import {useCallback} from 'react';
import {captureException} from '@sentry/nextjs';
import {overlay} from 'overlay-kit';
import Alert from '@/shared/components/Alert';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import {getErrorInfo} from '@/shared/error/handler/info';

export function useHandleClientSideError() {
  return useCallback((error: unknown) => {
    const {title, content} = getErrorInfo(error);
    overlay.open(({unmount}) => <Alert content={content} title={title} onClose={unmount} />);

    // 권한 거부(403)는 사용자 안내만으로 충분하므로 Sentry 보고 안 함
    if (error instanceof ApiResponseError && error.status === HTTP_STATUS_FORBIDDEN) {
      return;
    }
    captureException(error);
  }, []);
}

const HTTP_STATUS_FORBIDDEN = 403;
