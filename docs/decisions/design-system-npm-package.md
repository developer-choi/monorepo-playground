# 디자인 시스템을 npm 공개 패키지로 만들며 정한 것

## 목표

`packages/design-system`을 다른 레포가 `npm install`로 받아 쓰는 공개 패키지로 만듭니다. 첫 공개는 `@developer-choi/design-system@0.1.0`입니다(PR #14).

## 이름과 첫 버전

- **scope는 npm org `developer-choi`를 만들어 썼습니다.** 레포 주인 이름과 같은 scope가 가장 알아보기 쉽습니다. 개인 계정 이름은 달라서 org를 새로 만들었습니다(Free 플랜, 공개 패키지 전용).
- **첫 버전은 `0.1.0`입니다.** 1.0 전까지의 올림 규칙은 [패키지 README 「버전」](../../packages/design-system/README.md#버전)에 있습니다.
- **라이선스는 적지 않았습니다.** 다른 사람에게 사용을 허락할 생각이 없어서입니다. npm에는 라이선스 없음으로 표시됩니다.

## 지원하는 React 버전: 19만

처음에는 `peerDependencies`를 `^18.0.0 || ^19.0.0`으로 적었다가 `^19.0.0`으로 좁혔습니다.

컴포넌트가 `forwardRef` 없이 `ref`를 일반 prop으로 받습니다(`src/`에 `forwardRef` 0건). 함수 컴포넌트가 `ref`를 prop으로 받는 건 React 19부터라, React 18에서는 react-hook-form의 `register`처럼 ref로 입력 요소를 잡는 사용법이 조용히 깨집니다.

> "Starting in React 19, you can now access `ref` as a prop for function components" ([React 19 블로그](https://react.dev/blog/2024/12/05/react-19))

React 18을 지원하려면 컴포넌트마다 `forwardRef`로 감싸야 합니다. 레포 안 사용처와 첫 소비자가 모두 React 19라, 좁혀도 잃는 것이 없습니다.

## 의존성을 어느 칸에 둘지

| 칸 | 든 것 | 쓰는 쪽이 설치할 때 |
|---|---|---|
| `peerDependencies` | `react`, `react-dom` | 쓰는 쪽이 가진 것을 씁니다 |
| `dependencies` | `radix-ui`, `@radix-ui/react-icons`, `clsx` | 자동으로 같이 설치됩니다 |
| `devDependencies` | vite, storybook, vitest 등 | 설치되지 않습니다 |

**peer에는 "쓰는 쪽과 반드시 같은 한 벌을 써야 하는 것"만 둡니다.** 두 벌이 되면 동작이 깨지는 경우입니다.

| 패키지 | 두 벌이 되면 | 자리 |
|---|---|---|
| `react`, `react-dom` | 훅과 context가 깨짐 | peer |
| `radix-ui` | 번들이 커짐. 쓰는 쪽의 radix Provider를 우리 컴포넌트가 못 보는 경우가 드물게 있음 | dependencies |
| `clsx`, `@radix-ui/react-icons` | 상태 없는 함수·컴포넌트라 크기 말고는 영향 없음 | dependencies |

- **중복 설치는 버전 범위가 겹치면 일어나지 않습니다.** 빈 소비자 프로젝트에 `radix-ui`와 `clsx`를 직접 설치한 뒤 `npm ls`를 보면, 디자인 시스템 밑의 둘이 `deduped`로 표시돼 한 벌을 같이 씁니다.
- **비슷한 라이브러리도 같은 기준입니다** (레지스트리 최신 버전 기준): `@radix-ui/themes@3.3.0`은 `radix-ui`를 dependencies에, `@mantine/core@9.6.3`은 `clsx`·`@floating-ui/react`를 dependencies에, `@chakra-ui/react@3.37.0`은 `@ark-ui/react`를 dependencies에 둡니다. 셋 다 peer는 `react`·`react-dom`과 자기 생태계의 필수 패키지뿐입니다.
- **radix를 peer로 옮기면 비용이 생깁니다.** yarn 4는 peer를 자동 설치하지 않아, 쓰는 쪽이 `radix-ui`·`clsx`·아이콘을 직접 추가해야 합니다. 빠뜨리면 모듈을 못 찾는 오류가 오히려 생깁니다. 디자인 시스템 내부 구성도 쓰는 쪽의 관리 대상이 됩니다.
- 쓰는 쪽과 radix Provider를 공유해야 하는 경우가 생기면, 그때 `radix-ui`를 peer로 옮길지 다시 봅니다.

## 공개 전에 잡은 버그: 아이콘 패키지 누락

`PasswordField`와 `Select`가 쓰는 `@radix-ui/react-icons`가 `package.json`에 없었습니다. 빌드는 examples가 설치한 것을 빌려 통과했고, 아이콘 코드가 `dist/node_modules/` 아래로 복사되고 있었습니다. 패키지로 묶을 때 `node_modules` 폴더는 빠지므로, 그대로 배포했다면 쓰는 쪽에서 두 컴포넌트가 없는 파일을 import해 깨졌을 것입니다.

- `vite.config.ts`의 `external`에 `/^@radix-ui\/react-icons($|\/)/`를 더해 번들에 넣지 않고, `dependencies`에 올렸습니다.
- dist가 import하는 외부 패키지 전부(`@radix-ui/react-icons`, `clsx`, `radix-ui`, `react`)가 `dependencies`나 `peerDependencies`에 있는 것을 대조했습니다.
- 워크스페이스 밖 빈 npm 프로젝트에 tarball을 설치해 `Button`, `PasswordField`, `Select`를 서버 렌더하고 아이콘 SVG가 나오는 것을 확인했습니다.

## 배포 파일

- `files: ["dist"]`, `prepack: "yarn build"`, `publishConfig.access: "public"`. 배포할 때마다 빌드가 돌아, 빌드 안 된 dist가 올라가지 않습니다.
- Vite 템플릿에서 남은 `index.html`과 `public/vite.svg`를 지웠습니다. `public/`이 dist로 복사돼 `vite.svg`가 배포본에 들어가고 있었습니다.
- README의 상대 링크는 npm 페이지에서 `github.com/…/blob/HEAD/packages/design-system/…`로 바뀌어 열리는 것을 배포 뒤 확인했습니다. 그래서 절대 URL로 바꾸지 않았습니다.

## CSS는 컴포넌트별로 나누지 않았습니다

빌드는 토큰·reset·global과 모든 컴포넌트 CSS를 한 파일로 묶습니다. 쓰는 쪽은 그 파일을 `@developer-choi/design-system/style.css`로 import합니다. 그래서 Button 하나만 써도 CSS가 통째로 들어갑니다. JS는 컴포넌트별 파일이라 쓰는 컴포넌트만 들어갑니다.

> "If you specify `build.lib`, `build.cssCodeSplit` will be `false` as default." ([Vite build options](https://vite.dev/config/build-options))

`cssCodeSplit: true`와 `vite-plugin-lib-inject-css`로 나눌 수 있지만 얻는 것이 작습니다(2026-09-29 측정).

- 전체 27.6 kB(gzip 4.7 kB) 중 약 8.3 kB는 토큰·reset·global이라 나눠도 항상 들어갑니다. 줄일 수 있는 건 컴포넌트 CSS 약 19 kB(gzip 약 3 kB)뿐입니다.
- 나누면 CSS 순서가 쓰는 쪽 빌드에 맡겨집니다. 컴포넌트 JS가 CSS를 import하게 돼, 번들러 없이 import하는 환경(Node, CSS 설정이 없는 테스트 러너)에서 깨집니다. `style.css`를 없애야 해서 쓰는 법도 바뀝니다.

컴포넌트가 늘어 CSS가 크게 늘면 그때의 gzip 크기와 대표 페이지가 쓰는 컴포넌트 비율로 다시 판단합니다.
