# 폼 핸들링 — use[...]Form 커스텀 훅

## 개요

폼이 있는 페이지에서 useForm, useMutation, submit 핸들러, 에러 처리를
하나의 커스텀 훅(`use[...]Form`)으로 캡슐화한다.

## 반환 구조

영향 범위 기준으로 그룹화한다.

- `form` — 폼 레벨: onSubmit(폼 전체 제출), loading(폼 전체 비활성)
- `inputProps` — 필드 레벨: 각 필드별 InputProps를 키로 구분

## 규칙

### mutateAsync + try-catch

mutate(콜백) 대신 mutateAsync + try-catch를 사용한다.
비동기 흐름 제어가 명확하고 에러 핸들링이 직관적이다.

### loading 상태

- **기본**: `isPending` — API 호출 후 같은 화면에 머무는 경우
- **성공 후 언마운트**: `isPending || isSuccess` — 페이지 이동, 모달 닫힘 등
  컴포넌트가 언마운트되는 경우 한정.
  API 성공 → 실제 언마운트 사이 간격에 버튼이 재활성화되는 것을 방지한다.

### watch 대신 useFormWatch()

react-hook-form의 watch()를 직접 사용하지 않고 useFormWatch()를 사용한다.
