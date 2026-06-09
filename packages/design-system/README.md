# 디자인 시스템

컴포넌트의 핵심 기능과 웹 접근성 준수에 집중하기 위해 **스타일링은 최소화했습니다.**

다만, 프로젝트를 확인하시는 분들의 가시성과 사용자 경험을 고려하여, **스토리북에서는 별도의 스타일을 적용**했습니다.

https://design-system-eta-six.vercel.app/

## 기술적 의사결정과정

### 전역

**InputBase 아키텍처**

- **children 주입 방식**: `<input>`을 직접 렌더링하지 않고 children으로 받음. 내부 폼 요소 타입(input/textarea/button)이 달라도 하나의 베이스로 확장 가능
- **포커스 위임**: `<label>` 네이티브 방식 채택. `<div>` + handleClick 대비 JS 0줄, 파생 필드마다 보일러플레이트 없음. 복합 케이스(leading/trailing에 별도 폼 요소 추가)에서도 `htmlFor` + `id` 한 쌍으로 해결

### 컴포넌트

**InputBase / TextField**

`<label>` → `<div>` 전환으로 생긴 ref 병합: InputBase가 내부 input DOM을 잡기 위해 `inputRef` prop 도입. 외부 ref(RHF `register().ref` 등)와 내부 ref를 같은 input에 동시에 꽂기 위해 `useMergeRefs` 도입

**FullScreenBottomSheet**

- Content 스크롤 중 시트 닫힘 방지: `onDragEnd`가 아닌 `pointerMove stopPropagation`으로 차단. framer-motion pan 제스처 자체를 막아 시각적 왜곡 없음
- dip-up 현상 제거: `dragConstraints.bottom` 제거 후 `onDragEnd`에서 직접 애니메이션 제어

---

## 실행

```bash
# 모노레포 루트에서
npm run design-system
```
