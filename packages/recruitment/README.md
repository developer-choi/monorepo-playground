# Recruitment Components

채용 과제 진행 시 공통으로 활용할 수 있는 코드 스니펫 저장소입니다.

## 주요 컴포넌트

### 1. LoadingPage
- 중앙 정렬 로딩 스피너

### 2. EmptyContent
- 중앙 정렬 아이콘 및 안내 메시지

### 3. ErrorPageTemplate & HandledErrorBoundary
- 회사로고, 제목, 설명을 포함한 공통 에러 페이지 및 핸들러
  ```tsx
  <HandledErrorBoundary>
    <TargetComponent />
    <TargetComponent />
  </HandledErrorBoundary>
  ```
- **에러 핸들링 원칙**: [상세 보기](https://github.com/developer-choi/developer-choi/blob/main/docs/error-handling/step1.md)

### 4. Alert & Confirm
- Radix Themes 로 구현되어있고, Overlay Kit로 쓰는걸 의도하고 만들었습니다.