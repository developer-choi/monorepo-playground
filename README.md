# Monorepo Playground

React/Next.js best practice를 모노레포 예제 패키지 형태로 정리하는 프로젝트입니다.

## 목표

이 프로젝트는 다음 자료들을 모노레포의 예제 패키지로 재구성할 예정입니다:

- 이 레포지토리의 과거 커밋에 작성된 예제 코드들
- 구글 문서에 정리해둔 best practice 문서들

## Project History

핵심 변경 이력입니다.

프레임워크 버전 업그레이드마다 기존 코드를 삭제하고 새로 시작했습니다.

- **2026.01.09 (최신)** - [Next.js 14.1.4](https://github.com/developer-choi/monorepo-playground/commit/0d3878ff)
- **2024.04.03** - [Next.js 14.1.4](https://github.com/developer-choi/monorepo-playground/commit/8155f804)
- **2022.11.03** - [Next.js 12.3.1](https://github.com/developer-choi/monorepo-playground/commit/6c63faa5)
- **2021.04.19** - [Next.js 10.3.1](https://github.com/developer-choi/monorepo-playground/commit/773639be)
- **2020.01.15** - [React 16.12.0](https://github.com/developer-choi/monorepo-playground/commit/fe7400c2)

## 프로젝트 구조

```
├── apps/
│   └── examples/          # Next.js 예제 앱
├── packages/
│   ├── design-system/     # 공통 UI 컴포넌트
└── package.json
```

## 시작하기

```bash
npm install
npm run dev
```
