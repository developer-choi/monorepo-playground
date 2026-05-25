# Handoff — `/workflow` BG 세션의 cross-ref 미사전 follow 문제

## 배경

`/workflow BG 채용` 세션에서 채용 과제(랭디 — 수업 통화 모니터링 어드민)의 배경 분석을 진행했다. 세션 종료 직전 사용자가 "니가 읽었던 `/workflow` 하위 문서에 걸린 문서들 다시 회고해보고, 그 문서에서 걸린 링크가있었지만 니가 안본게있다면 더 들어가보면서, 니가 작업한거랑 1대1로 대조해보고 누락된게있나 찾아봐줘" 라고 지시했다.

회고 결과 다수의 산출물 누락·룰 위반이 발견됐다. 본 문서는 그 문제들과 원인을 자세히 정리한다.

대상 워크플로우: `~/.claude/skills/workflow/` (배포본). 원본은 AC `deploy/skills/workflow/`.

---

## 사용된 자료 트레이스

세션 중 메인 에이전트가 Read한 `/workflow` 하위 문서 (시간 순):

```
SKILL.md
steps/step-1.md
requirement-review/recruitment/guide.md
requirement-review/SKILL.md
requirement-review/design/guide.md
template/output-depth.md
requirement-review/recruitment/service-analysis.md
steps/step-2.md
```

세션 후반(사용자 회고 지시 후) 추가 Read:

```
conventions/plan-folder.md
conventions/negative-mirror-patterns.md
template/design-asset-collection.md
template/context-setup.md
requirement-review/planning/guide.md
requirement-review/retrospect.md
requirement-review/planning/output-template.md
requirement-review/planning/checklist/{overview,features,flow,data,edge-cases,routing,cross-page}.md
requirement-review/page-type/{detail,form}.md
requirement-review/design/checklist/{common,component,page}.md
requirement-review/recruitment/prefer-packages.md
recruitment/SKILL.md
```

이 두 그룹의 차이가 본 보고서가 다루는 문제의 핵심이다. **두 번째 그룹은 첫 번째 그룹의 문서들이 명시적으로 참조하는데도 산출물 작성 시점에 Read되지 않은 문서들**이다.

---

## 문제 1 — cross-ref 미사전 follow

### 발생한 일

`/workflow BG 채용` 진입 직후 메인은 `SKILL.md`만 읽고 step-1로 진행했다. step-1.md를 읽은 뒤에도 step-1이 명시한 cross-ref(`requirement-review/recruitment/guide.md`, `conventions/plan-folder.md`, `template/design-asset-collection.md` 등)를 일괄 Read하지 않고, **그 시점에 즉시 필요한 1~2개만 읽은 후 산출물 작성을 시작**했다.

결과적으로 다음 문서들이 산출물 작성 시점까지 Read되지 않은 상태였다:

- `conventions/plan-folder.md` — 폴더 트리·라이프사이클 규칙·자가 정리 안내문 양식 단일 출처
- `template/design-asset-collection.md` — 시안 자료 수집 가이드 (텍스트는 텍스트로, 레이아웃은 이미지로)
- `requirement-review/planning/guide.md` — planning 플래그 가이드
- `requirement-review/planning/output-template.md` — `global.md` / `layout.md` / `page.md` 양식 정의
- `requirement-review/planning/checklist/*.md` 7종 — 기획 체크리스트 (overview, features, flow, data, edge-cases, routing, cross-page)
- `requirement-review/page-type/*.md` — 페이지 유형별 체크리스트 (detail, form, list, sequential-flow)
- `requirement-review/design/checklist/*.md` 3종 — 디자인 체크리스트 (common, component, page)
- `requirement-review/recruitment/prefer-packages.md` — 채용과제 선호 패키지 목록
- `requirement-review/retrospect.md` — 자유 검토 + 체크리스트 회고 절차
- `conventions/negative-mirror-patterns.md` — 부정 명시 메아리 자가 점검 정규식 패턴

### 원인

#### 원인 1-1. 「필요할 때만 읽는다」가 디폴트가 됨

메인 에이전트는 컨텍스트 관리를 위해 "사용 시점에 필요한 것만 읽는다"는 일반적 패턴을 적용했다. 그러나 `/workflow`는 한 세션 안에서 여러 산출물을 다층 룰 하에 작성하므로, 산출물 작성 시점에 필요한 룰을 시작 시점에 모르면 룰 자체가 적용되지 않는다.

`SKILL.md` 본문에 다음 절이 있다:

> ### 기억 의존 금지
> - 각 단계 시작 전 직전 산출물 다시 읽기
> - 기억 의존 금지, 파일 현재 상태 기준으로 진행

이 조항은 단계 시작 시점의 **직전 산출물 재독**을 강제하지만, **그 단계에 적용될 룰·템플릿·체크리스트 cross-ref를 사전 follow**해야 한다는 조항은 명시되어 있지 않다. 결과적으로 메인 에이전트는 cross-ref follow를 옵션으로 해석하고 사용 시점 lazy load로 가져갔다.

#### 원인 1-2. step-1.md가 가리키는 cross-ref가 옵션처럼 보임

`step-1.md`의 다음 절을 보면 cross-ref가 단순 안내처럼 보인다:

> 아래 스킬 로드 표에서 `planning` 또는 `design` 플래그가 켜지는 작업, 즉 외부에서 시안·기획서·Figma 자료를 받는 케이스라면, 호출 전에 자료 수집 방식이 적절한지 점검한다. 상세는 [design-asset-collection.md](../template/design-asset-collection.md).

"상세는 [design-asset-collection.md] 참조" 같은 표현은 **상세를 알고 싶을 때 가서 보면 된다**로 읽힌다. 그러나 실제로는 본 가이드의 룰(텍스트는 텍스트로, 레이아웃은 이미지로 받기)이 사용자에게 자료 형태를 요청하는 시점에 이미 적용되어야 한다. 본 세션은 사용자가 이미지만 제공했을 때 "텍스트 영역을 텍스트로 다시 받을지" 능동 안내를 하지 않았다 — 가이드가 메인 컨텍스트에 없었기 때문.

#### 원인 1-3. 「가이드 슬롯 → 체크리스트」 진입 경로의 깊이

`requirement-review/SKILL.md`는 다음 표를 가진다:

| 슬롯 | 설명 | 페이지 단위 루프에서의 역할 |
|------|------|---------------------------|
| 체크리스트 | 분석 시 적용할 체크리스트 | 루프 2단계에서 적용 |

그리고 `requirement-review/planning/guide.md`의 "체크리스트" 슬롯은:

> 기획 체크리스트를 적용합니다. `checklist/` 하위 파일을 참조합니다.
> 페이지 유형(폼, 리스트, 상세, 순차 플로우 등)을 식별하고, 해당하는 `../page-type/` 체크리스트를 추가 적용합니다.

체크리스트 적용은 "루프 2단계"에서 일어난다고 적혀 있지만, 메인 에이전트는 단계 진입 시점에 `checklist/` 하위 파일들을 사전 Read하지 않았다. SKILL.md / guide.md / 체크리스트 파일 사이에 **세 단계의 cross-ref 깊이**가 있어 진입 비용이 누적되고, 메인이 "지금 당장은 필요 없다"고 판단하기 쉬운 구조다.

### 영향

cross-ref 미사전 follow의 직접적 결과로 다음 산출물 누락이 발생했다 (각 항목의 상세 원인은 별도 섹션에 정리):

- `background/consumable/global.md` 미생성
- `page-search.md` / `page-detail.md` 양식 비준수
- `background/persistent/requirement-review-retrospect.md` 미작성 (사용자 회고 지시 후 작성)
- `background/retained/tech-constraints.md` 미작성
- consumable 6개 파일 상단 자가 정리 안내문 누락
- planning·design 체크리스트 미적용으로 인한 산출물 점검 항목 다수 누락 (텍스트 줄바꿈, classId 허용값 명세, autoFocus, 더블클릭 방지, race condition 등)
- prefer-packages.md 미참조로 보완 패키지 영역 분석 누락

---

## 문제 2 — consumable 자가 정리 안내문 미박힘

### 발생한 일

본 세션에서 생성한 `background/consumable/` 6개 파일 중 어느 하나에도 `plan-folder.md`가 명시한 「자가 정리 안내문」이 박혀있지 않다.

대상 파일:

```
plan/background/consumable/cross-analysis.md
plan/background/consumable/service-analysis.md
plan/background/consumable/page-search.md
plan/background/consumable/page-detail.md
plan/background/consumable/design-system.md
plan/background/consumable/project.md
```

`plan-folder.md`「consumable/ 산출물 자가 정리 안내문」 절은 다음을 명시한다:

> `consumable/` 하위 산출물은 상단에 다음 양식의 자가 정리 안내문을 박는다. 메인이 본문 룰을 따로 떠올리지 않아도 산출물 자체가 자기 정리 책임을 알린다.
>
> ```markdown
> > 이 파일은 큐 모델로 운영됩니다.
> > 각 절을 **소비**한 step은 그 절을 즉시 삭제합니다.
> > 모든 절이 비면 파일째 삭제합니다.
> >
> > **소비** = 그 절의 내용을 다른 산출물(overview·stub·PR 본문·코드 등)로 이관·녹임
> > **단순 읽기·참조 조회는 소비 아님** — 사용자 질문 응답을 위해 잠시 본 케이스 등은 삭제 금지
> ```

### 원인

#### 원인 2-1. plan-folder.md 미사전 follow

이 룰의 단일 출처는 `conventions/plan-folder.md`다. 문제 1의 cross-ref 미사전 follow로 인해 본 룰이 메인 컨텍스트에 진입한 시점이 산출물 작성을 모두 마친 후(사용자 회고 지시 후)였다.

#### 원인 2-2. 안내문이 룰이라기보다 「표현 양식」으로만 보일 위험

설령 plan-folder.md가 사전 Read 됐더라도, 「자가 정리 안내문」 절이 ```markdown ... ``` 코드 블록 안에 안내문 양식만 보여주고 "consumable 파일 작성 시 반드시 박는다" 같은 강한 명령형 동사가 본문에 부족해 보일 수 있다. 메인이 본문 일독 후 "이건 양식 참조용"으로 분류해 작성 단계에서 떠올리지 못할 가능성이 있다.

#### 원인 2-3. 작성 시점에 룰을 강제할 도구가 부재

산출물 작성은 `Write` 도구로 이뤄지는데, consumable 경로에 Write할 때 안내문 존재를 강제하는 hook·검증이 없다. 메인의 자율 준수에만 의존한다.

### 영향

- consumable의 큐 모델 라이프사이클이 메인에게 시각적으로 안 보이는 상태가 됨. 후속 step에서 절 소비 후 삭제를 누락할 위험이 높아짐.
- 이미 6개 파일을 만든 상태에서 회고 후 일괄 보강이 필요하지만, 본 세션은 보강을 진행하지 않은 채 종료됨 (사용자 결정).

---

## 문제 3 — negative-mirror 자가 점검을 정신만으로 종결

### 발생한 일

산출물 작성 후 메인은 "자가 검토 통과 (메아리 0건)"이라고 사용자에게 보고했다. 그러나 실제로 수행한 것은 **자기 생각의 정신적 점검**이었고, `SKILL.md`가 명시한 정규식 패턴 매치 단계를 수행하지 않았다.

`SKILL.md`「부정 명시 메아리 자가 점검」 절은 다음을 명시한다:

> 절차:
>
> 1. 산출물 텍스트에서 부정 표현이 등장하는 라인을 찾는다. 검사할 정규식 패턴 모음은 [conventions/negative-mirror-patterns.md](conventions/negative-mirror-patterns.md) 참조.
> 2. 매치된 각 라인을 분류:
>    - **사용자 메아리** — 발화의 부정 지시를 산출물에 다시 적은 것. 삭제.
>    - **자체 판단 + 명시 근거 동반** — 같은 문장 또는 인접 라인에 측정값·기존 패턴·BG 결정 등 근거가 명시되어 있음. 정상 정보 전달이므로 유지.
>    - **자체 판단인데 근거 없음** — 자체 판단이라도 근거 없으면 노이즈. 삭제 또는 근거 보강.
> 3. 사용자 메아리·근거 없는 자체 판단이 1건이라도 있으면 삭제·보강 후 1번부터 재실행. 0건이거나 모두 근거 동반일 때 종료.

산출물 본문에는 다음과 같은 부정 표현이 실제로 존재했다:

- `cross-analysis.md`: "Zustand는 이번 과제 범위에선 필요성 낮음", "RHF 도입 정당성 약함"
- `project.md`: "FSD 미채택", "headless 라이브러리 도입 X", "RHF 도입 보류 (PR_N_PLAN 재검토)"
- `design-system.md`: "headless 컴포넌트 라이브러리 도입 X"

이들 중 일부는 인접 라인에 근거가 동반되어 있어 정상이지만, **정규식 매치 → 분류 → 분류 결과 보고**의 흐름이 산출물 자체에 적용되지 않은 채 "통과"로 보고됐다. 분류 결과가 실제로 모두 「근거 동반」이었는지는 별도 검증 없이 선언만 됐다.

### 원인

#### 원인 3-1. 「정신 점검」과 「정규식 점검」의 경계가 SKILL.md에 모호

위 절차의 "1. 산출물 텍스트에서 부정 표현이 등장하는 라인을 찾는다" 문장은 정규식 패턴 모음 cross-ref만 제시하고, **반드시 정규식을 적용하라**고 강제하지 않는다. 메인이 「부정 표현이 등장하는 라인」을 생각으로 찾아도 절차상 위배가 아닌 것처럼 읽힐 여지가 있다.

#### 원인 3-2. 메아리 패턴 파일이 메인 컨텍스트에 없었음

`conventions/negative-mirror-patterns.md`는 문제 1의 cross-ref 미사전 follow로 인해 자가 점검 시점에 메인 컨텍스트에 진입하지 않았다. 정규식을 모르면 정규식 적용을 못 한다.

#### 원인 3-3. 「판정 우선순위」 조항이 정규식 단계 생략의 알리바이로 작용 가능

SKILL.md는 다음을 명시한다:

> **판정 우선순위**: 정규식 매치 결과보다 **본 절의 룰 정신(사용자가 적지 말라고 한 모든 것을 적지 않는 게 디폴트)을 우선**한다. 정규식은 트리거 보조이고, 본 정신을 위반하면 매치되지 않아도 메아리로 처리한다.

본 조항은 「정규식 미매치라도 메아리면 처리」를 강조하지만, 반대 방향(정규식 매치가 발견되면 분류·보고를 반드시 수행)은 명시되어 있지 않다. 메인이 "본 정신만 만족하면 충분"으로 잘못 해석해 정규식 단계를 생략할 알리바이로 쓰일 수 있다.

### 영향

- "자가 검토 통과" 보고가 실제 검증 없이 선언만 된 상태가 됨. 산출물에 메아리·근거 없는 부정 표현이 잠재적으로 잔존.
- 사용자가 회고 지시를 안 했으면 그대로 다음 세션으로 넘어갔을 가능성. 동일 패턴이 PR_N_PLAN·IMPL 산출물에서도 반복될 수 있다.

---

## 문제 4 — planning guide의 핵심 산출물 `global.md` 누락

### 발생한 일

`requirement-review/planning/guide.md`「산출물」 슬롯은 다음을 명시한다:

> - `/plan/background/consumable/global.md` — **생성**. 전체 서비스 맥락, 공통 컴포넌트, TODO 목록
> - `/plan/pr{N}/consumable/page.md` — **생성**. 페이지별 분석 결과
> - `/plan/background/consumable/layout.md` — **필요 시 생성**

본 세션은 `recruitment` + `planning` + `design` 세 플래그가 모두 켜진 상태였지만 `global.md`를 생성하지 않았다. 대신 cross-analysis.md, service-analysis.md, page-search.md, page-detail.md, design-system.md, project.md를 만들었고, 본래 global.md에 들어가야 할 내용(서비스 맥락·공통 컴포넌트·반응형 정책·공통 엣지케이스·질문 목록)이 이 6개 파일에 분산·중복됐다.

### 원인

#### 원인 4-1. planning/guide.md 미사전 follow

문제 1의 결과. `requirement-review/SKILL.md`「플래그 조합」에서 recruitment + planning 조합이 가능함을 명시하고 있지만, planning guide 본문을 따라가지 않아 global.md 산출물 슬롯이 메인 컨텍스트에 없었다.

#### 원인 4-2. recruitment guide의 「산출물」이 별도로 명시되어 분리되어 보임

`requirement-review/recruitment/guide.md`의 「산출물」 슬롯은 cross-analysis.md / service-analysis.md만 명시한다. 메인이 recruitment guide만 보면 산출물 의무가 두 개만 있는 것처럼 읽힌다. planning 플래그가 동시에 켜지면 planning guide의 산출물(global.md 등)이 **추가**되어야 한다는 것을 SKILL.md 본문에서 1차로 파악해야 하는데, "플래그 조합 시 산출물도 합집합"이라는 명시 룰이 SKILL.md에 없다.

`requirement-review/SKILL.md`의 「실행 순서」 절은 플래그 조합 시 실행 순서만 다루고, 산출물의 합집합은 다루지 않는다.

#### 원인 4-3. `conventions/plan-folder.md` 트리에 cross-analysis·service-analysis가 누락되어 있어 동기화 신호가 부족

`plan-folder.md` 폴더 트리에는 다음만 명시되어 있다:

```
consumable/
  project.md
  global.md          ← step-1 requirement-review (planning) 산출물
  layout.md          ← (조건부)
  figma-component-mapping.md ← step-5 Lead 산출물 (실무 한정)
  design-system.md   ← recruitment 4단계 산출물 (채용 한정)
```

cross-analysis.md·service-analysis.md는 이 트리에 없다. 즉 plan-folder.md만 보면 BG 세션의 채용 산출물이 design-system.md 하나뿐인 것처럼 보이고, recruitment guide만 보면 cross-analysis·service-analysis 두 개만 있는 것처럼 보인다. **두 출처가 부분만 보여줘서 어느 한쪽만 본 메인이 합집합을 못 만든다.**

본 세션의 메인은 결과적으로 cross-analysis·service-analysis는 recruitment guide를 통해 만들었지만, plan-folder.md의 global.md·layout.md는 끝까지 만들지 않았다.

### 영향

- 서비스 맥락·공통 컴포넌트·공통 엣지케이스·질문 목록이 분산 기록됨.
- 후속 PR_N_PLAN 세션이 "공통 컴포넌트는 어디서 보면 되는가" 했을 때 단일 진입점이 없다. design-system.md와 page-search/detail.md를 모두 봐야 한다.
- global.md를 보고 cross-page 점검(`planning/checklist/cross-page.md`)을 했어야 할 종합 단계가 누락됨.

---

## 문제 5 — `output-template.md` page.md 양식 비준수

### 발생한 일

`requirement-review/planning/output-template.md`는 page.md 템플릿을 명시한다:

```markdown
# [페이지명]

- URL: [/path/:param]
- [간단한 역할]

## 페이지 렌더링
- 서버 캐싱: [static / revalidate / dynamic]
- 컴포넌트: [Server / Client]

## 페이지 메타데이터
- 타이틀, OG 타이틀, OG 디스크립션, OG 이미지

## API 목록
### [GET/POST/PUT/DELETE] [API 이름]
- parameter, success response, error response, 에러처리, 로딩처리, 성공처리

## 테스트케이스
- 함수 테스트케이스
- 컴포넌트 테스트케이스
- 페이지 테스트케이스

## 재사용 하는 컴포넌트 목록

## 구현 할 컴포넌트 목록

## 기획자/디자이너 질문 목록
```

본 세션의 `page-search.md`, `page-detail.md`는 이 템플릿을 따르지 않고 자유 형식(레이아웃 골격·상태별 디테일·인터랙션·컴포넌트 분해·접근성·미확정)으로 작성됐다.

### 원인

#### 원인 5-1. output-template.md 미사전 follow

문제 1의 결과.

#### 원인 5-2. planning guide의 「자료 받기」 절차 미수행

planning guide는 다음을 명시한다:

> [output-template.md](./output-template.md)의 page.md 템플릿으로 `/plan/pr{N}/consumable/page.md`를 생성합니다. 사용자에게 페이지 자료를 요청합니다.

즉 **빈 템플릿 파일을 먼저 생성** → **사용자에게 자료 요청** → **자료 받고 채움**의 순서다. 본 세션은 이 순서를 따르지 않고, 이미 받은 자료(시안 7장)로 메인이 자유 형식으로 직접 작성했다.

#### 원인 5-3. 출력 깊이와 템플릿의 충돌처럼 보일 위험

`template/output-depth.md`「BG 시안 정독 깊이」 표는 다음을 명시:

| 항목 | BG에서 다루나 |
|---|---|
| validation 정확한 메시지·규칙 | 다루지 않는다 — PLAN 세션 |
| 정확한 props·타입 정의 | 다루지 않는다 — IMPL 세션 |
| 함수 시그니처 | 다루지 않는다 — IMPL 세션 |

output-template.md의 page.md는 "함수 테스트케이스", "API parameter / response", "구현 할 컴포넌트 목록 + props"를 포함한다. BG 깊이 가이드와 표면적으로 충돌해 보일 수 있다. 메인이 "BG에선 이 칸들을 채울 수 없으니 템플릿 자체를 안 따른다"로 잘못 판단했을 가능성이 있다.

실제로 가이드의 의도는 "**그 시점에 채울 수 있는 칸만 채우고 나머지는 PLAN/IMPL이 채운다**"일 것 같지만, 가이드에 그 운용 방식이 명시되어 있지 않다.

### 영향

- 후속 PR_N_PLAN 세션이 page-search/detail.md를 입력으로 받았을 때, 양식이 자유 형식이어서 "어디까지가 결정이고 어디까지가 미정인가"의 경계가 흐림.
- PLAN/IMPL 세션이 같은 정보를 다시 정형화하는 중복 발생 가능.

---

## 문제 6 — `recruitment/prefer-packages.md` 미참조

### 발생한 일

`recruitment/prefer-packages.md`는 사용자가 채용과제에서 선호하는 패키지 목록을 정의한다:

| 관심사 | 패키지 |
|---|---|
| 기본 포함 | react-error-boundary |
| UI | @radix-ui/themes, @radix-ui/react-icons |
| 데이터 페칭 | @tanstack/react-query |
| 오버레이 | overlay-kit |
| 폼 | react-hook-form |
| 날짜 | dayjs |
| 토스트 | sonner |
| 스타일 | sass |

본 세션의 메인은 이 파일을 Read하지 않은 채로 라이브러리 결정을 cross-analysis.md / project.md에 작성했다. 공고에 박힌 스택(Tailwind, TanStack Query, Zustand)만 기준으로 결정하고, 사용자 선호 라인업 중 공고 외 영역(에러 처리, 토스트, 날짜, 오버레이, 폼)에 대한 분석을 누락했다.

### 원인

#### 원인 6-1. prefer-packages.md 미사전 follow

문제 1의 결과.

#### 원인 6-2. 공고 스택과 prefer-packages 우선순위 룰 부재

prefer-packages.md 본문은 다음을 명시한다:

> 사용자가 선호하는 카테고리별 라이브러리. 채용과제에서 패키지 선택 시 기본 선택지로 제안하되, 프로젝트 제약에 따라 오버라이드 가능.

그러나 공고에 박힌 스택이 prefer-packages의 어떤 카테고리를 덮어쓰는지, 양립하는 영역에서 prefer-packages를 추가 적용해야 하는지의 결정 룰이 recruitment guide·SKILL.md 어디에도 명시되어 있지 않다. 메인이 prefer-packages를 봤더라도 "공고 스택만 있으면 충분한가, prefer-packages도 합집합으로 적용하는가" 판단이 모호하다.

#### 원인 6-3. recruitment guide의 「분석 과정 → 프로젝트 결정 사항」이 prefer-packages를 호명하지 않음

recruitment guide「3. 프로젝트 결정 사항」 절은 다음만 명시한다:

> 사용자와 논의하여 확정한다:
> - 기술 스택 (프레임워크, 주요 라이브러리)
> - 디자인 시스템 라이브러리
> - 폴더 구조
> - 사용자 직접 진행 항목

prefer-packages.md를 참조하라는 cross-ref가 없다. 메인이 recruitment guide만 보면 prefer-packages의 존재를 알 수 없다.

### 영향

- 보완 패키지 영역(에러 처리, 토스트, 날짜 포맷, 모달)이 결정에서 누락됨.
- 본 채용과제는 수업 시간 포맷(2026.04.22 09:30) 같은 날짜 처리가 있어 dayjs는 명백한 후보였고, 카드 클릭 hover 같은 인터랙션이 있어 토스트도 후보였으나 BG 단계에서 검토되지 않음.

---

## 문제 7 — `background/persistent/requirement-review-retrospect.md` 미작성 (사용자 회고 지시 후 작성)

### 발생한 일

`requirement-review/retrospect.md`「4. 기록」 절은 다음을 명시한다:

> 위 1~3단계의 결과를 `/plan/background/persistent/requirement-review-retrospect.md`에 기록한다 (파일이 없으면 생성).

본 세션은 requirement-review가 끝났음에도 retrospect 절차를 자발적으로 수행하지 않았다. 사용자가 "회고해봐"라고 명시 지시한 후에야 작성됐다.

### 원인

#### 원인 7-1. retrospect.md 미사전 follow

문제 1의 결과.

#### 원인 7-2. SKILL.md 「회고」 절의 트리거 강제성 부족

`requirement-review/SKILL.md`「회고」 절은 다음을 명시한다:

> 산출물 작성이 끝난 뒤, [retrospect.md](./retrospect.md)의 절차를 수행한다.

"산출물 작성이 끝난 뒤" 자동 진입 트리거가 있지만, BG 세션의 흐름(step-1.2 종료 → step-2 → 세션 회고)에서 retrospect.md가 별도 단계로 박혀있지 않다. 메인이 step-2 종료 시점에 「세션 회고」(SKILL.md의 step-2.md 마지막 절)를 수행하지만, 이것은 requirement-review/retrospect.md와 다른 회고다.

step-2.md「세션 회고」:

> 이 세션의 마지막 step이다. 보고 후:
> - 이 세션에서 사용자가 반복 수정 지시한 패턴이 있었으면 가이드 업데이트를 제안한다.

이건 워크플로우 가이드 자체의 개선 회고이고, requirement-review의 체크리스트 회고와는 다르다. 두 회고가 별도 절차이며 둘 다 수행해야 한다는 명시가 SKILL.md·step-2.md 어디에도 없다.

### 영향

- 회고 산출물이 사용자 명시 지시에 의존. 다음 세션도 같은 패턴이 반복될 수 있음.

---

## 문제 8 — `background/retained/tech-constraints.md` 미작성

### 발생한 일

`conventions/plan-folder.md`「폴더 트리」는 다음을 명시한다:

```
retained/
  folder-structure.md ← FOUNDATION 단계 1 산출 (채용만)
  tech-constraints.md ← BG.step-1 기술 제약 스캔 결과
  figma-url.md ← MARKUP 산출
  figma/ ← MARKUP 캡처 이미지
```

`tech-constraints.md`는 BG.step-1 산출물로 명시되어 있다. 본 세션은 이 파일을 만들지 않았다.

### 원인

#### 원인 8-1. plan-folder.md 미사전 follow

문제 1의 결과.

#### 원인 8-2. step-1.md가 tech-constraints.md를 호명하지 않음

`steps/step-1.md` 본문에서 "tech-constraints" 문자열이 등장하지 않는다. plan-folder.md의 폴더 트리에만 명시되어 있을 뿐, **어느 단계에서 어떤 절차로 만드는지** 가이드가 부재하다.

`requirement-review/recruitment/guide.md`의 「분석 과정 → 1. 공동 탐색 + 서비스 분석」은 다음을 명시한다:

> - **프로젝트 파일 분석** — 제공된 프로젝트의 Dockerfile, packageManager, 빌드 설정, .gitignore, 기존 디렉토리 구조 등을 확인한다. 빌드/실행 환경 제약을 조기에 파악하기 위함

이 활동이 tech-constraints.md를 만드는 단계인지 모호. recruitment guide「산출물」 슬롯에는 tech-constraints.md가 없다. **tech-constraints.md를 누가 언제 어떤 절차로 만드는지** 단일 출처가 없다.

### 영향

- 기술 제약(공고 스택, Next.js Route Handler 사용 의무, mock 데이터 정적 박지 말 것 등)이 cross-analysis.md에 일부 흡수됐지만 별도 영구 산출물로 보존되지 않음.
- 후속 PR에서 기술 제약을 재확인할 단일 인덱스가 없음.

---

## 문제 9 — design 체크리스트 미적용으로 산출물 점검 항목 다수 누락

### 발생한 일

`requirement-review/design/checklist/{common,component,page}.md`의 점검 항목 다수가 본 세션의 디자인 산출물(page-search.md, page-detail.md, design-system.md)에 적용되지 않았다.

#### `common.md`「크기 정책」 미적용
- 카드 폭/높이가 Fixed / Fill / Hug 어느 정책인지 명시 없음
- 그리드 컬럼 수만 적힘 (4열)

#### `common.md`「텍스트 줄바꿈」 미적용
- 기기 모델명이 긴 경우(`Samsung Galaxy S25 Ultra 5G with Pen` 같은 경우) ellipsis인지 wrap인지 명시 없음
- 카드 타이틀·라벨·값 모두 줄바꿈 정책 미명시

#### `component.md`「Best Practice 확인」 미적용
- MUI / Material Design 3 컴포넌트와 비교하라는 절차 미수행
- 본 세션 design-system.md의 11개 컴포넌트 인벤토리는 표준 패턴과의 비교 기준 없이 작성됨

#### `component.md`「Props 구조」 부분 적용
- variant·disabled·loading 등 상태별 시안 점검 미수행

#### `page.md`「로딩 UI」 부분 적용
- 존재 여부 TODO에 박혔지만 스켈레톤 형태 미명시
- BG 깊이 한계로 PLAN에 미루는 것은 정당하지만, 「전체 페이지 로딩 vs 특정 섹션 로딩」 같은 1차 결정도 미수행

#### `page.md`「에러 UI」 부분 적용
- 전체 페이지 vs 섹션, 재시도 버튼 유무 미명시

#### `page.md`「반응형」 미적용
- global.md 미생성으로 인해 프로젝트 레벨 반응형 정책 자체가 없음
- 페이지별 반응형 차이 점검도 미수행

### 원인

#### 원인 9-1. design checklist 미사전 follow

문제 1의 결과.

#### 원인 9-2. design guide의 「체크리스트」 슬롯 적용 시점 모호

`requirement-review/design/guide.md`「체크리스트」 슬롯은 다음을 명시한다:

> `checklist/` 하위의 디자인 체크리스트를 적용합니다.
> 페이지 유형(폼, 리스트, 상세, 순차 플로우 등)을 식별하고, 해당하는 `../page-type/` 체크리스트를 추가 적용합니다.

"적용합니다"의 시점이 모호. 페이지 단위 루프의 어느 단계에서 적용하는지(자료 받기 / 같이 분석 / 논의 / 확정), 적용 결과를 page.md의 어느 칸에 적는지가 명시되어 있지 않다.

### 영향

- design-system.md의 11개 컴포넌트 인벤토리가 props·variant·상태별 시안 검증 없이 작성됨. PR3 구현 단계에서 추가 검증이 필요.
- 텍스트 줄바꿈·크기 정책 미명시로 PR3·PR5·PR6에서 시안과 다른 처리가 들어갈 위험.

---

## 문제 10 — planning 체크리스트 미적용으로 산출물 점검 항목 다수 누락

### 발생한 일

`requirement-review/planning/checklist/{overview,features,flow,data,edge-cases,routing,cross-page}.md`의 점검 항목 다수가 미적용.

#### `overview.md`「비기능 요구사항」 부분 적용
- 성능 ✓ (간접) / 보안 △ / 접근성 △ / **다국어 ✗**

#### `flow.md`「상태 전이」 부분 적용
- 초기·빈·성공·에러 ✓ / **로딩·부분로딩·비활성 ✗** (개념적으로만 언급)
- **동시성 ✗** — read-only라 우선순위 낮음이지만 점검 자체 안 함

#### `data.md`「데이터 갱신·의존성」 부분 적용
- 데이터 식별 ✓ / API 존재 ✓ / **갱신 주기 ✗** / **데이터 의존성 ✗** — read-only지만 점검 자체 안 함

#### `edge-cases.md`「데이터 극단값」 미적용
- **텍스트 매우 길 때 (기기 모델명 ellipsis?) ✗**
- **숫자 매우 클 때 (재시도 1000+) ✗**
- **이미지 없거나 깨짐 ✗**
- **race condition (입력 빠르게 두 번 검색 시 응답 순서 뒤바뀜) ✗**

#### `routing.md`「동적 파라미터 값 명세」 미적용
- **classId 허용 값 범위 (숫자 문자열만? 0/음수/매우 큰 수?) ✗**
- **classId가 pathname인 이유 근거 ✗** (명세에 박혀 있어 자동 따랐지만 SSG/CSR 영향 검토 부재)

#### `cross-page.md`「이탈·복귀 시 상태 복원」 미적용
- 검색 → 상세 → 검색으로 돌아왔을 때 입력값 복원 시나리오만 일부 다룸
- 더 깊은 이탈(탭 닫기 후 재진입) 시 처리 미명시

### 원인

문제 1의 결과 + design 체크리스트와 동일하게 적용 시점·기록 위치 모호.

### 영향

- 산출물(특히 cross-analysis.md, page-search/detail.md)의 점검 깊이가 체크리스트가 잡았어야 할 영역을 못 잡음.
- PR_N_PLAN·IMPL 세션이 같은 점검을 다시 해야 함.

---

## 문제 11 — page-type 체크리스트 미적용

### 발생한 일

`requirement-review/page-type/{detail,form,list,sequential-flow}.md` 중 본 과제에 해당하는 `detail.md`, `form.md`의 항목 다수가 미적용.

#### `detail.md`「메타데이터 / SEO」 부분 적용
- 페이지 타이틀 정의 ✓ (TODO만)
- **동적 `<title>` per 수업 ID ✗** (명세화 부족)

#### `form.md`「포커스」 미적용
- **검색 페이지 진입 시 입력 필드 autoFocus ✗**

#### `form.md`「입력 유효성 검증」 부분 적용
- 필수/선택 구분 ✓ (단일 필드라 자명)
- **필드 타입·포맷 (숫자 문자열만? 길이 제한?) ✗**
- 클라이언트/서버 검증 범위 구분 ✗
- **검증 실패 메시지 ✗**

#### `form.md`「제출」 미적용
- **버튼 더블클릭 방지 (요청 진행 중 비활성화) ✗**
- 제출 실패 시 입력값 유지 — 본 과제에선 입력값을 유지하는 게 자명하지만 명시 없음

### 원인

#### 원인 11-1. page-type 체크리스트 미사전 follow

문제 1의 결과.

#### 원인 11-2. 페이지 유형 식별 절차 미수행

design guide·planning guide 모두 다음을 명시한다:

> 페이지 유형(폼, 리스트, 상세, 순차 플로우 등)을 식별하고, 해당하는 `../page-type/` 체크리스트를 추가 적용합니다.

본 세션은 페이지 유형 식별 자체를 명시적으로 안 했다 — page-search.md에 "페이지 유형: 폼 + 결과 영역 페이지", page-detail.md에 "페이지 유형: 상세 페이지"를 적었지만, 그 식별을 바탕으로 page-type 체크리스트를 적용하는 후속 절차가 없었다.

### 영향

- 폼·상세 페이지의 표준 점검 항목(autoFocus, 더블클릭 방지, 동적 메타데이터 등)이 누락됨.

---

## 부수적 발견 — 가이드 자체의 모호성

본 회고에서 가이드 자체의 다음 모호성이 드러났다. 이들은 메인이 룰을 안 따른 원인이 가이드 표현 자체에 있음을 가리킨다.

### 부수 1. plan-folder.md 폴더 트리에 cross-analysis·service-analysis 누락

문제 4의 원인 4-3 참조. 단일 출처 표가 부분만 보여줘 합집합 인지 어려움.

### 부수 2. recruitment guide와 planning guide의 산출물 합집합 룰 부재

문제 4의 원인 4-2 참조. 플래그 조합 시 산출물도 합집합으로 처리해야 한다는 명시가 SKILL.md에 없음.

### 부수 3. page.md 위치 선택지가 가이드에 없음

본 세션은 `pr{N}/consumable/page.md`가 본래 위치인데 사용자가 "PR 분할 전이라 임시로 `background/consumable/page-search.md, page-detail.md`에 둡시다"를 결정. 가이드에 "PR 분할 전 작성 시 임시 위치" 선택지가 없어 메인이 사용자 결정에만 의존.

### 부수 4. 「자가 검토」 절차의 정신 점검과 정규식 점검 경계 모호

문제 3의 원인 3-1 참조.

### 부수 5. 「세션 회고」와 「requirement-review/retrospect.md」가 다른 회고임의 명시 부재

문제 7의 원인 7-2 참조.

### 부수 6. 공고 스택 ↔ prefer-packages 우선순위 룰 부재

문제 6의 원인 6-2 참조.

### 부수 7. tech-constraints.md 생성 단계·절차 단일 출처 부재

문제 8의 원인 8-2 참조.

### 부수 8. 체크리스트 적용 시점·기록 위치 명시 부재

문제 9·10·11의 공통 원인.

---

## 영향 종합

본 세션 산출물(`plan/background/`)의 다음 영역이 영향을 받았다:

| 영역 | 영향 |
|---|---|
| cross-analysis.md | edge-cases·routing·prefer-packages 영역 누락. 부정 표현 라인 정규식 분류 미수행 |
| service-analysis.md | 가이드 6개 슬롯은 모두 채움. 누락 없음 |
| page-search.md | output-template 양식 비준수. autoFocus·더블클릭 방지·입력 유효성·텍스트 줄바꿈·classId 명세 누락 |
| page-detail.md | output-template 양식 비준수. 동적 메타데이터·텍스트 줄바꿈·크기 정책·로딩/에러 UI 형태 누락 |
| design-system.md | component checklist의 Best Practice 비교·variant 점검 미적용 |
| project.md | prefer-packages 영역 미반영. PR 분할 자체는 완수 |
| (누락) global.md | 미생성 |
| (누락) tech-constraints.md | 미생성 |
| (누락) requirement-review-retrospect.md | 사용자 회고 지시 후 작성됨 |
| consumable 6개 파일 | 자가 정리 안내문 미박힘 |

---

## 메인 에이전트가 생각하는 수정 방향 (의견)

> 이 절은 메인 에이전트의 의견이며, 실제 수정 결정은 본 핸드오프를 받는 후속 작업자가 판단한다.

### 의견 1. cross-ref 사전 follow 룰을 SKILL.md「[CRITICAL] 지킬 원칙」에 추가

- 워크플로우 세션 진입 직후, SKILL.md 본문 + 그 세션이 사용하는 step·sub-skill·모드별 가이드의 1차 cross-ref를 일괄 Read하는 것을 디폴트로 박는다.
- "필요할 때 본다"는 적용 안 함.

### 의견 2. consumable 자가 정리 안내문을 도구로 강제

- Stop hook 또는 PreToolUse Write hook으로 `plan/**/consumable/**.md` 경로에 Write할 때 첫 N줄에 안내문 패턴 존재 여부를 검증.
- 누락 시 차단 + 사용자에게 안내문 추가 안내.

### 의견 3. negative-mirror 자가 점검에 「정규식 단계 필수」를 명시

- SKILL.md「부정 명시 메아리 자가 점검」 절차 1번에 "정규식 패턴 파일을 사전 Read하고, 산출물 본문에 정규식을 실제로 적용한다"를 추가.
- "정신 점검만으로 통과 선언 금지" 명시.

### 의견 4. plan-folder.md 폴더 트리에 채용 산출물 합집합 추가

- cross-analysis.md, service-analysis.md, tech-constraints.md를 polder 트리에 명시.
- 플래그 조합 시 산출물도 합집합 룰을 SKILL.md에 명시.

### 의견 5. recruitment guide에 prefer-packages.md cross-ref 추가

- 「분석 과정 → 3. 프로젝트 결정 사항」 절에 prefer-packages 참조를 추가.
- 공고 스택 ↔ prefer-packages 우선순위 룰 명시.

### 의견 6. page-type / 체크리스트 적용 시점을 가이드에 명시

- design guide·planning guide의 「체크리스트」 슬롯에 "적용 시점", "기록 위치(page.md의 어느 칸)"를 명시.
- 페이지 유형 식별 후 체크리스트 적용을 page-type 표로 매핑.

### 의견 7. requirement-review/retrospect.md를 step-2.md「세션 회고」와 분리 명시

- step-2.md「세션 회고」 절에 "requirement-review가 실행된 경우 retrospect.md 절차도 별도 수행"을 추가.

---

## 후속 작업자에게

본 핸드오프는 메인 에이전트의 자가 회고 결과다. 위 문제들은 모두 본 세션 산출물(`plan/background/`)에서 실제로 발생했다.

후속 작업자가 결정할 것:

- 위 11개 문제 중 어느 것을 가이드 수정으로 가져갈지
- 어느 것을 도구(hook, lint)로 강제할지
- 어느 것을 본 세션 산출물 보강으로만 처리하고 가이드는 안 건드릴지
- 의견 1~7 중 어느 것을 채택할지

가이드 원본 위치: AC `deploy/skills/workflow/`. 배포본은 `~/.claude/skills/workflow/` (직접 수정 금지).

본 세션 산출물 보강 작업: `~/WebstormProjects/recruitment/assignment-playground/plan/background/`에서 진행. 미반영된 누락 항목은 `requirement-review-retrospect.md`「3. 누락 산출물」·「2. 체크리스트 회고」에 정리되어 있음.
