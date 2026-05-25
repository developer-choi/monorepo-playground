# T23. Button HTML 구조 기술적 의사결정 과정 기록

## 개요

MP Button의 markup 구조와 SCSS 패턴을 왜 그렇게 잡았는지 기술적 의사결정 과정 기록. 면접/코드리뷰 대비.

## 배경

- MP Button markup:
  ```tsx
  <button>
    <span className={clsx(styles.children, loading && styles.loading)}>
      {children}
    </span>
    {loading ? <Spinner /> : null}
  </button>
  ```
- SCSS 패턴 (`.button` 마크업 + `.button.styled` 시각 분리)
- loading 시 spinner absolute centering + children visibility hidden

## 기록할 의사결정 포인트

1. **`<span.children>` wrapper 이유**
   - 텍스트만이 아니라 아이콘+텍스트 케이스 대비 (flex layout으로 정렬)
   - loading 시 `visibility: hidden`으로 자리 유지 (버튼 크기 변화 X)

2. **Spinner를 children 안 X, 별도 element + absolute centering**
   - children `visibility: hidden` + 그 위에 spinner 겹치기 → 크기 변화 X
   - 만약 children 제거 + spinner만 → 버튼 크기가 spinner 크기로 줄어듬

3. **`position: relative` on `.button` + `position: absolute` on `.spinner`**
   - spinner positioning을 button 기준으로

4. **`.button` + `.button.styled` 마크업/시각 분리 (convention.md)**
   - `.button`: position, display, alignment (마크업, 동작에 필수)
   - `.button.styled`: border, cursor, padding, font, color (시각, 없어도 동작 OK)

5. **size/variant/color modifier cascade**
   - 단일 className이 아닌 다중 className 합성: `.button.styled.large.primary.contained`
   - 각 modifier가 독립적으로 변경 가능

6. **`loading` prop 시 `onClick` 무시**
   - `useCallback`으로 wrap, `loading=true`이면 early return
   - 사용자 더블 클릭/연속 클릭 방지

## LDS Button과 비교

- LDS는 `LoadingSpinner` 별도 컴포넌트 (별도 폴더, `classNames` 사용)
- LDS는 `ButtonLink` (anchor) + `ImageButton` 등 별도 export
- LDS color: `primary` | `secondary` | `edit` | `delete` | `string` (확장 가능)
- MP는 Spinner 단일 + Button만 (단순화)
- MP color: `primary` | `secondary` | `destructive` (closed type)
- MP는 `isSubmit` 제거 (`type='submit'` 직접 지정)

## 작업 단계

1. `packages/design-system/docs/patterns/ButtonStructure.md` 신설
2. `docs/best-practices-map.md` "디자인 시스템" 섹션에 새 항목 추가:
   ```md
   ### Button markup·SCSS 구조

   - 기술스택: CSS Modules + clsx
   - 상황: loading 상태 시 버튼 크기 변화 없이 spinner 표시. 텍스트만/아이콘+텍스트/이미지 등 다양한 children 대응
   - 코드: packages/design-system/docs/patterns/ButtonStructure.md
   ```
3. LDS Button과의 차이 명시 (단순화 의도)

## 관련 파일

- `packages/design-system/src/components/Button.tsx`
- `packages/design-system/src/components/Button.module.scss`
- `packages/design-system/src/components/Spinner.tsx`
- `packages/design-system/src/components/Spinner.module.scss`
- `docs/best-practices-map.md`
- 신설: `packages/design-system/docs/patterns/ButtonStructure.md`

## 미정 항목

- LDS 비교 깊이 (단순 언급 vs 상세 표 비교)
- 다른 컴포넌트(Dialog 등)의 markup 구조 의사결정도 같은 패턴으로 기록할지
- 면접용 정리 vs PR 코드리뷰 가이드용 정리 — 톤 결정
