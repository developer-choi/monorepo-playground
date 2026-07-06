# 제출 생명주기 — 로딩·성공·실패 핸들링

폼 제출을 제출 → 로딩 → 성공/실패의 한 흐름으로 다룬다. 구간별로 챙길 것:

- **로딩**: 중복 제출 차단 + 버튼 로딩 표시
- **성공**: 페이지를 벗어나는(이동) 케이스와 머무르는 케이스는 로딩 해제 시점이 다르다
- **실패**: 에러를 인라인으로 표시하고, 재제출 시 초기화

## [CRITICAL] 구현 실체

- [SubmitLifecycleDemo.tsx](../../../src/form/handle-submit/components/SubmitLifecycleDemo.tsx) — 데모 본체 (`variant: 'navigate' | 'stay'`)
- [mutation.ts](../../../src/shared/query/mutation.ts) — `isMutationSettling`

라이브 페이지: `/form/handle-submit` 섹션 4.

주의: 실제 구현에서는 `isMutationSettling`을 쓰지만, **데모 페이지 코드(데모 본체·화면의 코드 샘플)는 보는 사람이 프로젝트 내부 공통함수를 몰라도 되도록 `mutation.isPending || mutation.isSuccess`로 인라인**되어 있다. 데모를 헬퍼 호출로 되돌리지 말 것.

## 핵심 규칙

### 중복 제출 차단은 두 겹

`Button loading`은 클릭만 막는다. 네이티브 Enter 제출은 핸들러 가드로 따로 차단한다:

```tsx
const onSubmit = handleSubmit(async (data) => {
  // Button loading은 onClick만 막으므로, 네이티브 Enter 중복 제출은 이 가드로 차단한다
  if (isPending) {
    return;
  }
  ...
});
```

### 성공 "이동"은 이동 완료까지 로딩 유지

`router.push` 직후에도 화면 전환까지 틈이 있다. `isMutationSettling`(`isPending || isSuccess`)으로 이동이 끝날 때까지 로딩을 유지해 그 틈의 재클릭을 막는다.

### 성공 "머무름"은 즉시 로딩 해제 + 별도 성공 피드백

같은 화면에 남는 케이스는 `reset({빈 값}, {keepFieldsRef: true})`로 폼을 비우고 `mutation.reset()`으로 `isSuccess`를 풀어 로딩을 해제한다 — `isMutationSettling`을 쓰는 이상 `mutation.reset()` 없이는 로딩이 안 풀린다.

- `keepFieldsRef: true`가 필수 — RHF `reset(값)`은 네이티브 폼 리셋(무인자 `reset()` 전용)을 건너뛰어 uncontrolled 입력의 **화면 값을 안 비운다** (RHF 7.71 `_reset` 소스에서 확인, Playwright 실측). `keepFieldsRef`는 필드별 `setValue` 경로를 타서 DOM까지 쓴다.
- 화면 전환이라는 성공 신호가 없으므로 토스트(sonner `toast.success`) 등 별도 피드백을 준다.

### 실패는 인라인 표시 + 재제출 시 초기화

서버 거절은 `mutateAsync` try/catch로 받아 인라인(`Callout danger`)으로 표시한다. 재제출 진입 시 이전 에러 메시지를 비운다.
