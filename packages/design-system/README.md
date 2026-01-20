# @monorepo-playground/design-system

모노레포 전체에서 사용하는 공통 UI 컴포넌트 라이브러리입니다.

https://design-system-eta-six.vercel.app/

## 실행방법

```bash
# Storybook 실행
npm run storybook

# 빌드
npm run build
```

## 디자인 시스템을 빠르게 잘 만드는 방법
1. 잘 만든 라이브러리의 원본 소스코드를 분석해서 전체 스펙을 알아냅니다. [(링크)](https://github.com/developer-choi/simplified-material-ui)
2. 그 스펙의 근거를 W3C 공식문서로 이해합니다. [(링크)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
3. 그 다음, 우리 회사에 필요한 만큼만 불필요한 기능을 삭제해서 옮깁니다.

### 장점
1. 시행착오를 겪지 않을 수 있습니다.
2. 퀄리티를 라이브러리 원본코드만큼 낼 수 있습니다.
3. 빠르게 개발할 수 있습니다.
4. 추후 기능 수정 시 확장성, 유지보수성을 대응할 수 있습니다.

모든 장점을 누릴 수 있는 이유는, 사내 디자인 시스템과 MUI 프로젝트의 입장이 흡사하기 때문입니다.

> 수십개의 컴포넌트를 중복코드없이 잘 개발해야한다.