# 인수인계 — workflow 스킬의 MARKUP/PR_{N} 워크트리 흐름 디버깅

> 본 문서는 `~/WebstormProjects/recruitment/assignment-playground` (채용 과제 레포, 곧 삭제 예정) 세션에서 발견된 워크플로우 흐름 문제를 다음 세션에서 디버깅하기 위한 인수인계 자료다. 발견 시점: 2026-05-25, MARKUP 세션 진행 중.

## TL;DR

`/workflow MARKUP 채용` 진입 시 작업해야 할 워크트리(=cwd)가 명확히 안내되지 않아, 사용자와 LLM의 멘탈모델이 어긋났다.

- **spec 의도(LLM 해석)**: MARKUP 세션은 `assignment-playground-markup` 워크트리(port 3000)에서 figma 자료 누적 + 페이지 마크업 코드 작성. 이후 `PR_{N}_IMPL`이 markup 워크트리의 페이지 코드를 `pr{N}` 워크트리로 가져감.
- **사용자 멘탈모델**: "MARKUP 세션도 pr1 워크트리에서 작업 시작"으로 인식. 결과적으로 "엥 pr1 워크트리에서 작업시작하는거 아니었어?" 라고 되물음.

근본 원인은 spec이 markup 워크트리를 만들어두는 시점·기준 브랜치·작업 cwd를 한 곳에 일관되게 박아두지 않아서다. 아래에 상세 기록.

## 발견 경위 (시간순)

1. 사용자가 `/workflow MARKUP 채용` 호출.
2. LLM은 `~/.claude/skills/workflow/conventions/session/markup.md` 본문을 로드. 첫 메시지로 "페이지·섹션·위젯·컴포넌트 어느 단위든 figma 자료를 누적하라"는 안내 출력.
3. 사용자는 "자료는 니가 보고 가서 만들어. png가 저게 전부야" — 이미 `plan/background/retained/figma/`에 누적된 캡처 7장이 자료의 전부이므로 LLM이 직접 보고 만들라고 지시.
4. LLM이 markup 워크트리(`assignment-playground-markup`, 브랜치 `markup` @ `2d633b3`)에서 작업을 시작하려 함. 이때 markup 브랜치는 FSD 폴더 구조(`pages/widgets/shared` + barrel `index.ts`) 상태로, FOUNDATION이 한 DDD 마이그레이션이 반영되어 있지 않았음.
5. LLM이 폴더 구조 컨벤션 충돌 등을 거론하며 진행 방향을 사용자에게 질문.
6. 사용자: "엥 pr1 워크트리에서 작업시작하는거 아니었어? 이건 나중에 디버깅하기로 하자 흐름이 매끄럽지가않네. tasks에 추가하고. pr1 브랜치 있어"
7. 사용자의 최종 지시: pr1 브랜치 기준으로 새 워크트리·브랜치(이름 `markup`, 경로 `assignment-playground-markup`)를 다시 만들어 작업하라. LLM이 기존 markup 워크트리 제거 후 `git worktree add ../assignment-playground-markup -b markup pr1`로 재생성.

## 문제의 본질

spec 측면에서 충돌·결손 지점이 최소 3곳 있다.

### 문제 1 — markup 워크트리 베이스 브랜치 미명시

`conventions/session/markup.md`는 "마크업 세션 = 포트 3000 점유. /workflow 시작 시 사용자에게 안내" 외에는 markup 워크트리의 **베이스 브랜치(어디서 따왔는가)**에 대한 언급이 없다. 채용 흐름에서 FOUNDATION이 PR1 워크트리에 두 커밋(폴더 마이그레이션 + 코딩스탠다드 마이그레이션)을 쌓는데, markup 워크트리가 **마이그레이션 전 master**에서 따져 있으면 markup의 코드는 옛 폴더 구조를 따른다. 그러면 IMPL 단계에서 markup의 페이지 코드를 pr{N} 워크트리(DDD 구조)로 옮길 때 경로·import가 전부 어긋난다.

SKILL.md 「세션」 표의 FOUNDATION 행에는 "markup 워크트리 최소 셋팅"이라는 문구가 있는데, 이 "최소 셋팅"의 정의가 본문 어디에도 없다. `foundation.md`를 직접 봐야 정확한 내용이 있을 수 있음 (이번 인수인계에서는 마저 확인 못함 — 다음 세션 첫 단계로 확인).

→ **수정 후보**: FOUNDATION 종료 시 markup 워크트리를 **PR1의 최신 커밋**(폴더+컨벤션 마이그레이션 완료 상태)에서 다시 따도록 명시. 또는 spec에 "markup 브랜치는 FOUNDATION 단계 N에서 PR1 기준으로 재생성한다"는 절차를 박는다.

### 문제 2 — MARKUP 세션의 작업 산출물 범위 불명확

`conventions/session/markup.md`의 「산출물 형태」절은 다음 두 가지만 명시:

- `background/retained/figma-url.md` — `[이름] - [URL]` 쌍 누적
- `background/retained/figma/[meaningful-name].[이미지확장자]` — 캡처 이미지

즉 spec 문언상 MARKUP 세션은 **figma 자료 누적만** 한다고 읽힌다. 그런데 SKILL.md 「세션」 표의 MARKUP 행 (4) 컬럼은 "없음 (PR_{N}_IMPL이 페이지 단위 코드 가져감)"이라고 적혀 있어, **MARKUP 세션이 코드를 만드는지 안 만드는지 자체가 모호**하다. 표 (3) 컬럼에는 산출물에 코드 언급이 없으므로 "코드는 안 만든다"로 읽을 수도 있고, (4)의 "PR_{N}_IMPL이 페이지 단위 코드 가져감" 문장은 "MARKUP에 페이지 단위 코드가 이미 있다"는 전제로 읽힌다.

이번 세션에서 LLM은 "MARKUP에서 markup 워크트리에 마크업 코드를 만들어 두고 IMPL이 그걸 복사한다"로 해석했으나, 사용자는 다른 해석(아마 "MARKUP은 figma 정리만, 코드는 PR_{N}_IMPL이 처음부터 만든다" 또는 "MARKUP/PR_{N}_IMPL이 같은 워크트리에서 동시에 진행")을 했을 가능성.

→ **수정 후보**: MARKUP 세션 본문에 "마크업 코드 산출물도 만든다 / figma만 정리한다" 중 하나로 명시. 산출물에 페이지 단위 마크업 파일 경로 패턴 추가.

### 문제 3 — 세션 spawn 안내 시 cwd 미표기

SKILL.md의 「세션 spawn 안내 메커니즘」은 후속 세션의 진입 조건과 인자(`/workflow <세션> <모드>`)만 출력하라고 한다. **"어떤 워크트리에서 진입하라"는 cwd 안내가 없다.** 이는 세션 표 (5) 컬럼 "컨텍스트 처리"에 묻혀 있어 spawn 안내 텍스트에는 자연스럽게 빠진다.

특히 한 세션 안에서 여러 워크트리를 오갈 수 있는 FOUNDATION(메인/PR1/markup)을 경험한 직후 MARKUP 세션 spawn 시, 사용자가 "어디서 작업하지?"를 자연스레 묻게 된다.

→ **수정 후보**: 세션 spawn 안내 출력 양식에 cwd(=워크트리 경로)를 한 줄 박는다. 예시:
> 후속: `PR_1_PLAN` (`/workflow PR_1_PLAN 채용`) — 진입 시 cwd: `../assignment-playground-pr1` 워크트리.

## 다음 세션 디버깅 절차 권장 순서

본 인수인계를 받은 다음 세션은 다음 순서로 진행하면 효율적이다.

1. **1차 소스 정독**
   - `~/.claude/skills/workflow/SKILL.md` — 「세션」 표, 「의존성 그래프」, 「세션 spawn 안내 메커니즘」
   - `~/.claude/skills/workflow/conventions/session/markup.md` — MARKUP 세션 정의 단일 출처
   - `~/.claude/skills/workflow/conventions/session/foundation.md` — FOUNDATION 4단계의 "markup 워크트리 최소 셋팅" 정의 확인 필요 (이번 세션 미확인)
   - `~/.claude/skills/workflow/steps/step-4.md`, `step-5.md` — PR_{N}_PLAN/IMPL에서 markup 코드를 어떻게 가져오는지 명시되어 있는지 확인

2. **사용자 인터뷰**
   - "MARKUP 세션이 코드 산출물을 만든다고 보는가, figma 자료만 정리한다고 보는가?"
   - "markup 워크트리의 베이스 브랜치는 master여야 하는가, PR1이어야 하는가? PR1이라면 FOUNDATION 종료 시 markup 워크트리를 재생성하는 절차를 명시화하는 게 맞는가?"
   - "세션 spawn 안내에 cwd를 같이 박을지?"

3. **수정안 작성**
   - 1차 소스(AC `deploy/skills/workflow/`)에서 수정. **`~/.claude/skills/workflow/`는 배포 산출물이므로 직접 수정 금지** — 이 룰은 `~/.claude/CLAUDE.md` 「AI 설정 산출물 직접 수정 금지」에 명시.
   - AC 수정 위치 후보:
     - `deploy/skills/workflow/conventions/session/markup.md`
     - `deploy/skills/workflow/conventions/session/foundation.md`
     - `deploy/skills/workflow/SKILL.md`
   - 수정 후 AC에서 `npm run sync:system`으로 `~/.claude/skills/`에 반영.

4. **검증**
   - 새 채용 과제 또는 dummy 흐름으로 `/workflow BG 채용` → FOUNDATION → MARKUP → PR_1_PLAN까지 진행해보며 cwd·산출물 형태가 명확히 안내되는지 확인.

## 컨텍스트 자료 — 이번 세션에서 만든 산출물 (참고용, 곧 사라짐)

> 채용 레포(`~/WebstormProjects/recruitment/assignment-playground`)는 곧 삭제 예정이므로, 디버깅 참고용으로 산출물 구조만 기록.

### markup 워크트리 (recruitment 레포의 `markup` 브랜치, pr1 기준)

- `src/shared/components/` — `StatusIcon.tsx`, `ExternalLinkIcon.tsx`, `ChevronLeftIcon.tsx`, `Tooltip.tsx`, `NoResultEmptyState.tsx`
- `src/call/components/` — `ClassStatusCard.tsx`, `ClassDetailHeader.tsx`, `ClassDetailPage.tsx`, `ClassDetailVariationsPage.tsx`
- `src/app/classes/[id]/page.tsx`, `src/app/classes/variations/page.tsx`, `src/app/search-no-result/page.tsx`
- 폴더 구조는 FOUNDATION이 PR1에 적용한 DDD (src/app, src/call/components, src/shared/components)
- barrel `index.ts` 미사용, 컴포넌트별 default export, 직접 경로 import (`@/call/components/...`)
- 빌드(`npm run build`) 성공 — 4 라우트(`/`, `/classes/[id]`, `/classes/variations`, `/search-no-result`)
- 미커밋 상태 (사용자가 별도 commit 지시하지 않음)

### 처음에 만들어졌던 markup 워크트리 (재생성 전 상태)

- 브랜치 `markup` @ `2d633b3 수업 검색 페이지 마크업 추가` (FOUNDATION 진행 전)
- FSD 구조 (`src/pages/class-search/`, `src/widgets/class-search-form/`, `src/widgets/empty-state/`, `src/shared/ui/button/`, `src/shared/ui/icons/`, `src/shared/ui/text-field/`) + barrel `index.ts`
- 사용자 지시로 폐기. `git worktree remove` + `git branch -D markup` 후 pr1 기준으로 재생성.

### figma 자료 (`plan/background/retained/figma/`)

- `page-search-initial.png` — 검색 페이지 초기 상태
- `page-class-detail.png` — 수업 상세 정보 페이지 (정상 케이스)
- `cards-variations-grid.png` — 카드 6종의 success/error/warning/idle 변형 모음
- `card-status-skeleton.png` — 카드 상태 아이콘 4종 skeleton
- `component-empty-message.png` — "데이터를 조회해 주세요" 텍스트 컴포넌트
- `component-search-button.png` — "조회하기" 버튼
- `state-search-empty-result.png` — "앗! 해당하는 결과가 없어요" + 필터 초기화

`plan/background/retained/figma-url.md`는 미생성 (이 과제에는 figma URL 없이 png만 제공됨).

## 참고

- 워크트리 감지 룰: `~/.claude/CLAUDE.md` 「worktree 감지」
- AI 산출물 수정 룰: `~/.claude/CLAUDE.md` 「AI 설정 산출물 직접 수정 금지」
- 워크플로우 스킬 진입점: `~/.claude/skills/workflow/SKILL.md`
- 본 인수인계 작성자(LLM) 모델: claude-opus-4-7[1m]
- 작성 시점 git revision (MP): origin/master = `6abab3f9 refactor(design-system): Spinner를 barrel에서 export 제거 (Button 내부 전용)`
