# 디자인 시스템 구축기

- [Storybook 바로가기](https://design-system-eta-six.vercel.app/?path=/story/components-modal-dialog--basic-usage)
- [상세 구현 과정 PR](https://github.com/developer-choi/monorepo-playground/pull/2)

---

## Step 1. 미래 수정사항을 대비하는 컴포넌트 제작

### 문제

페이지마다 컴포넌트를 따로 작성하여 파편화된 상태. 공통점을 잘 모아 명세해야 했습니다.

### 해결

**Material Design을 표준으로 삼았습니다.**

- 시행착오를 줄이기 위해 MUI 공식 문서 스펙을 참고
- 디자이너와 소통하며 "우리도 이 스펙 필요할까요?" 논의 후 확정
- 예: "variants 스펙 필요할까요?" → 필요하다면 미리 반영

### 왜 MUI인가?

- 디자이너에게: Material Design은 Apple과 투톱 표준
- 개발자에게: npm 다운로드 2위 라이브러리

### 대안 검토

Headless UI 같은 라이브러리 도입도 가능했으나, 당시엔 개념을 몰라 직접 개발을 선택했습니다.

현재 시점에서는 Headless UI 도입도 고려할 만한 대안이라고 생각합니다.

### 결과

공통 컴포넌트 16개 제작, 6개월간 변경 횟수 0회

## Step 2. 확장성을 대비하는 컴포넌트 제작

### 문제

비슷한 UI 추가 시 기존 컴포넌트와 겹치는 부분을 재사용하기 어려웠습니다.
- Dialog와 Bottom Sheet: 둘 다 Backdrop, 딤 클릭 시 닫힘 등 공통점 多

### 원인

API 문서만 보고 결과물을 따라했지, **내부 설계**까지 분석하지 않았기 때문입니다.

### 해결: 원본 코드 분석

MUI 원본 코드를 분석하여 컴포넌트 계층 구조를 파악했습니다.
시간이 오래 걸린다는 단점은 AI로 상쇄했습니다.

### 과정: 미래 예측 → 디자이너와 개념 정의 → 설계

#### 예시 1. Dialog

1. AI로 MUI 분석: Dialog = Backdrop + Modal + FocusTrap + Portal
2. 디자이너에게 질문: "Modal의 정의는 무엇인가요? Dialog, Bottom Sheet도 Modal로 볼 수 있나요?"
3. 답변: "네" → Modal, Backdrop 추상화 진행

#### 예시 2. Button

1. AI로 MUI 분석: Button = ButtonBase + 스타일
2. 디자이너에게 질문: "모든 클릭 요소에 공통 애니메이션이 생길 수 있나요?"
3. 답변: "아니요" → ButtonBase 추상화 안 함

### 결과

Modal류 (Dialog, Bottom Sheet, Drawer) 원본 분석 및 중복 코드 제거

## Step 3. 프로젝트 간 컴포넌트 재사용

### 문제

프로젝트가 2개, 3개로 늘어나면서 컴포넌트를 재사용할 방법이 필요해졌습니다.

### 선택지

| 방식 | 설명 |
|------|------|
| 멀티레포 | 디자인 시스템을 별도 레포로 분리 → npm 배포 → 각 프로젝트에서 install |
| 모노레포 | 디자인 시스템 + 서비스 프로젝트를 하나의 레포에 |

### 선택: 모노레포

사내 프로젝트들이 동일한 디자인 시스템을 사용하므로, 모노레포가 적합하다고 판단했습니다.

### 현재 상태

Turborepo 기반 모노레포 구조를 학습하고 있습니다.  
