interface MutationState {
  isPending: boolean;
  isSuccess: boolean;
}

/**
 * 성공 후 페이지 이동이 완료되기 전까지 로딩 상태를 유지합니다.
 * isSuccess 시점에 로딩을 풀면 사용자가 재클릭할 수 있고, 이동 전 UI가 순간 복구되어 어색합니다.
 */
export function isMutationSettling(...mutations: MutationState[]) {
  return mutations.some(m => m.isPending || m.isSuccess);
}
