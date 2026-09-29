# 디자인 시스템을 master 머지로 자동 배포하는 방식

## 목표

`packages/design-system`의 새 버전을 사람이 터미널에서 `npm publish`하지 않고, PR을 master에 머지하면 GitHub Actions가 npm에 배포하게 합니다. 워크플로는 [`.github/workflows/publish-design-system.yml`](../../.github/workflows/publish-design-system.yml)입니다(PR #15).

## 언제 배포할지

master에 머지될 때마다 배포하면, 버전을 안 올린 머지에서는 "이미 있는 버전"이라 실패합니다.

| 방법 | 동작 | 비용 |
|---|---|---|
| **1. 버전이 바뀐 머지만 배포** | `package.json`의 `version`이 npm에 없을 때만 배포하고, 있으면 건너뜀 | 버전은 사람이 PR에서 올림 |
| 2. changesets | PR마다 변경 설명 파일을 남기면 봇이 버전 올림 PR을 만들고, 그걸 머지하면 배포 | 도구와 절차가 하나 늘어남 |
| 3. 머지마다 patch를 자동으로 올려 배포 | 봇이 버전을 올려 커밋 | 의미 없는 버전이 쌓임 |

**1을 골랐습니다.** [패키지 README 「버전」](../../packages/design-system/README.md#버전)의 규칙(버그 수정은 patch, 깨는 변경은 minor)은 사람이 판단하는 구조입니다. 버전을 올렸다는 것 자체가 배포를 고려했다는 뜻이라, 머지 뒤 한 번 더 확인하는 단계를 두지 않습니다.

`paths: ['packages/design-system/**']` 필터가 있어, 디자인 시스템 밖만 바뀐 머지에서는 워크플로가 돌지 않습니다.

## 인증: trusted publishing

npm 토큰을 GitHub에 저장하지 않고, npm에 "이 레포의 이 워크플로가 배포해도 된다"고 등록해 OIDC로 인증합니다. provenance(출처 증명)도 자동으로 붙습니다.

- 2FA를 우회하는 토큰은 직접 배포 권한을 잃을 예정입니다. 자동 배포라면 이 방식이 남는 길입니다.
  > "2FA-bypass tokens will also lose the ability to publish directly." ([GitHub changelog 2026-07-08](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/))
- 요구 조건은 npm 11.5.1 이상, Node 22.14.0 이상, 워크플로 권한 `id-token: write`입니다. Node는 24로 정했습니다. MP에 Node 버전 고정 파일이 없어, 조건을 넘는 현재 LTS를 골랐습니다.
- npm 쪽 등록 값은 Publisher `GitHub Actions`, `developer-choi` / `monorepo-playground`, 워크플로 파일 `publish-design-system.yml`, Environment 비움입니다. **워크플로 파일 이름을 바꾸면 npm 등록도 바꿔야 합니다.**
- trusted publisher는 패키지가 npm에 있어야 등록할 수 있어, 첫 `0.1.0`은 사람이 수동으로 배포했습니다.

## 승인 대기 없이 바로 배포

npm은 trusted publisher 등록 화면에서 "Allow npm publish"를 체크하지 말라고 권합니다.

> "Not recommended. For stronger security, leave this unchecked to require staged publishing for new versions."

체크하지 않으면 워크플로는 `npm stage publish`로 승인 대기까지만 올리고, 사람이 npm에서 Approve와 2FA를 해야 공개됩니다.

**체크해서 바로 배포하는 쪽을 골랐습니다.** 혼자 머지하는 레포라 머지가 곧 사람의 승인이고, 지금 쓰는 곳이 하나라 잘못 배포돼도 피해 범위가 작습니다.

다만 머지는 **코드**를 승인할 뿐, 워크플로가 받아 쓰는 외부 코드가 오염되는 경우는 막지 못합니다. 그 틈을 싸게 줄이려고 **npm 버전을 `11.9.0`으로 고정**했습니다. 처음에는 `npm@latest`를 매번 받았는데, 그러면 npm 새 버전의 오염이나 동작 변경이 배포에 그대로 끼어듭니다. actions(`actions/checkout`, `actions/setup-node`)는 공식 actions라 커밋 SHA로까지 고정하지는 않았습니다.

## 배포 없이 점검하는 dry-run

수동 실행(`workflow_dispatch`)에 `dry-run` 옵션이 있습니다. 버전을 올려 실제로 배포하지 않고도, 배포 경로의 인증·빌드·배포 파일을 GitHub Actions에서 확인합니다. npm 버전 고정을 바꾸거나 워크플로를 고칠 때 씁니다.

- `npm publish --dry-run`도 OIDC 토큰 교환까지는 실제로 합니다. npm 11.9 `lib/commands/publish.js`에서 `oidc()` 호출이 dry-run 분기보다 먼저 실행됩니다. 교환에 성공하면 `Successfully retrieved and set token` 로그가 남고, 업로드만 건너뜁니다. 워크플로는 이 로그가 없으면 실패로 끝나, 로그를 읽지 않아도 초록불·빨간불로 판정됩니다.
- **이미 배포된 버전이면 dry-run도 `You cannot publish over the previously published versions`로 거부됩니다.** 그래서 러너 안에서만 버전을 `<현재 버전>-dry-run.<실행 번호>`로 바꿉니다. 커밋되지 않습니다.
- prerelease 버전은 태그가 필수라 `--tag dry-run`을 붙입니다.
- `npm version`은 오류를 내면서도 파일을 고치는 경우가 있어, 버전은 `npm pkg set`으로 바꿉니다.

## 확인한 것

- PR #15 머지로 워크플로가 돌아 `0.1.0은 이미 배포됐다. 건너뛴다.`로 끝나고, 배포 단계가 모두 skipped였습니다([run 36534628195](https://github.com/developer-choi/monorepo-playground/actions/runs/36534628195)).
- dry-run 실행에서 OIDC 교환 `POST 201`, `Successfully retrieved and set token`, `Enabling provenance`, 배포 파일 70개가 나왔습니다([run 36534911805](https://github.com/developer-choi/monorepo-playground/actions/runs/36534911805)).
- 실제 업로드는 다음에 버전을 올려 머지할 때 처음 돕니다.

## 함께 고친 것

`repository.url`을 npm이 쓰는 정규형 `git+https://github.com/developer-choi/monorepo-playground.git`으로 적었습니다. 그전에는 배포할 때마다 `"repository.url" was normalized` 경고가 났습니다.
