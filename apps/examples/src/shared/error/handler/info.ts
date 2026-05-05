import ApiRequestError from '@/shared/error/class/ApiRequestError';
import ApiResponseError from '@/shared/error/class/ApiResponseError';

export interface ErrorInfo {
  title: string;
  content: string;
}

export function getErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof ApiResponseError) {
    if (error.status === HTTP_STATUS_FORBIDDEN) {
      return {
        title: '접근할 수 없어요',
        content: '권한이 필요해요. 관리자에게 권한을 요청해 주세요.',
      };
    }

    if (error.status === HTTP_STATUS_NOT_FOUND) {
      return {
        title: '정보를 찾을 수 없어요',
        content: '삭제되었거나 주소가 변경되었을 수 있어요.',
      };
    }

    return {
      title: '일시적인 오류가 발생했어요',
      content: '잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.',
    };
  }

  if (error instanceof ApiRequestError) {
    return {
      title: '연결이 불안정해요',
      content: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
    };
  }

  return {
    title: '일시적인 오류가 발생했어요',
    content: '잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.',
  };
}

const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_NOT_FOUND = 404;
