import {HTTPError} from 'ky';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HTTPError && error.response.status === 404) {
    return '삭제되었거나 존재하지 않습니다.';
  }

  // TODO: 에러 종류별 메시지 세분화 예정 (403 권한 안내, 400 입력값 안내 등)

  return '서버에 문제가 발생했습니다. 문제가 지속되면 고객센터에 문의해 주세요.';
}
