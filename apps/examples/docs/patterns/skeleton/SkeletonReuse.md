# 스켈레톤 — 실제 클래스 재사용

## 핵심 원칙

스켈레톤은 실제 컴포넌트의 스타일을 "복사"하지 않고 "재사용"한다. 스켈레톤 전용 scss 클래스를 만들지 않는다.

- **컨테이너 클래스 재사용**: 실제 컴포넌트의 scss 클래스(flex, grid, gap, margin, padding)를 그대로 사용한다.
- **타이포그래피 클래스 + bone 합치기**: 텍스트 요소는 실제 타이포그래피 클래스와 bone 클래스를 같은 요소에 합치고, `&nbsp;`로 line-height 높이를 잡는다.
- **비텍스트 bone은 인라인 스타일**: 이미지, 배지, 버튼 등은 bone 클래스 + 인라인 `style={{ width, height }}`로 크기를 직접 지정한다.

이 원칙을 지키면:

- 스켈레톤 전용 scss 클래스가 불필요 → **중복 코드 제거**
- 실제 컴포넌트의 레이아웃이 바뀌면 스켈레톤도 자동 동기화 → **CLS 방지**
- 반응형 처리도 실제 클래스가 담당 → **별도 미디어 쿼리 불필요**

## `.bone` 클래스

유일한 스켈레톤 전용 클래스. 색상과 애니메이션만 담당한다.

```scss
.bone {
  background: variables.$gray100;
  border-radius: variables.spacing(0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

## 텍스트 bone

실제 타이포그래피 클래스와 bone 클래스를 하나의 요소에 합친다. `&nbsp;`가 line box를 만들어서 `line-height`만큼 높이가 자동으로 잡힌다.

실제 컴포넌트:

```tsx
<h2 className={cardStyles.title}>{contest.title}</h2>
<p className={cardStyles.description}>{contest.description}</p>
<span className={cardStyles.prize}>{prize}</span>
```

스켈레톤:

```tsx
<div className={classnames(cardStyles.title, styles.bone)} style={{ width: '70%' }}>&nbsp;</div>
<div className={classnames(cardStyles.description, styles.bone)} style={{ width: '90%' }}>&nbsp;</div>
<div className={classnames(cardStyles.prize, styles.bone)} style={{ width: 80 }}>&nbsp;</div>
```

타이포그래피 클래스가 제공하는 것:

- `font-size`, `line-height` → `&nbsp;`가 line box를 만들어 **정확한 텍스트 줄 높이**
- `margin` → 실제 컴포넌트와 **동일한 간격**

bone이 제공하는 것:

- `background`, `animation` → 스켈레톤 시각 효과
- `style={{ width }}` → bone 너비

### 왜 `&nbsp;`인가

빈 `div`는 `line-height`가 있어도 높이가 0이다. `line-height`는 inline content(텍스트)가 있을 때만 line box를 생성한다. `&nbsp;`가 그 역할을 한다.

## 비텍스트 bone

이미지, 배지, 아이콘 등 타이포그래피 클래스가 없는 요소는 인라인 스타일로 크기를 직접 지정한다.

```tsx
{
  /* 배지 (pill 형태) */
}
<div className={styles.bone} style={{width: 60, height: 18, borderRadius: 80}} />;

{
  /* 아바타 (원형) */
}
<div className={styles.bone} style={{width: 50, height: 50, borderRadius: '50%'}} />;

{
  /* 버튼 */
}
<div className={styles.bone} style={{width: 200, height: 50}} />;
```

## 컨테이너 클래스 재사용

### 같은 파일

실제 컴포넌트와 스켈레톤이 같은 파일에 있으면, 같은 `styles` import를 공유한다.

```tsx
import styles from './ContestApplyForm.module.scss';

function ContestApplyFormContent() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>콘테스트 참여를 위해...</h1>
        <form className={styles.form}>
          <Input {...inputProps.email} />
          <div className={styles.submitWrapper}>
            <Button type="submit">참여 신청</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplyFormSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={classnames(styles.heading, styles.bone)} style={{width: '70%'}}>
          &nbsp;
        </div>
        <div className={styles.form}>
          <div className={styles.bone} style={{width: '100%', height: 44}} />
          <div className={styles.submitWrapper}>
            <div className={styles.bone} style={{width: 200, height: 50}} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 다른 파일 (cross-import)

스켈레톤이 다른 파일에 있으면, 실제 컴포넌트의 `.module.scss`를 cross-import한다.

```tsx
import classnames from 'classnames';
import cardStyles from '@/components/main/ContestCard.module.scss';
import listStyles from '@/components/main/ContestList.module.scss';
import styles from './MainPage.module.scss'; // .bone은 여기에

function ContestListSkeleton() {
  return (
    <div className={listStyles.list}>
      {Array.from({length: 4}, (_, i) => (
        <div key={i} className={cardStyles.card}>
          <div className={cardStyles.meta}>
            <div className={styles.bone} style={{width: 60, height: 18, borderRadius: 80}} />
            <div className={classnames(cardStyles.categoryIndustry, styles.bone)} style={{width: 100}}>
              &nbsp;
            </div>
          </div>
          <div className={classnames(cardStyles.title, styles.bone)} style={{width: '70%'}}>
            &nbsp;
          </div>
          <div className={classnames(cardStyles.description, styles.bone)} style={{width: '90%'}}>
            &nbsp;
          </div>
          <div className={classnames(cardStyles.prize, styles.bone)} style={{width: 80}}>
            &nbsp;
          </div>
        </div>
      ))}
    </div>
  );
}
```

`listStyles.list`의 grid 레이아웃, `cardStyles.card`의 padding·gap, `cardStyles.title`의 margin·font-size — 모두 실제 컴포넌트에서 가져온다. `styles.bone`만 스켈레톤 자체의 scss.

## 구조 컴포넌트 재사용

Section, List, Row 같은 구조 컴포넌트가 **이미 다른 이유로 export되어 있으면** 스켈레톤에서 import하여 레이아웃을 공유한다. 스켈레톤을 위해 구조 컴포넌트를 새로 만들지 않는다.

```tsx
import Skeleton from 'react-loading-skeleton';
import {Section, SearchWrapper, List, Row, Info} from '@/class/components/EnrollmentsPanel';

export function StudentListSectionSkeleton() {
  return (
    <Section>
      <SearchWrapper as="div">
        <Skeleton height={36} />
      </SearchWrapper>
      <List>
        {Array.from({length: 3}, (_, i) => (
          <Row key={i}>
            <Info>
              <Skeleton width={60} />
              <Skeleton width={100} />
            </Info>
            <Skeleton width={52} height={32} />
          </Row>
        ))}
      </List>
    </Section>
  );
}
```

구조 컴포넌트의 props가 바뀌면 타입 에러로 스켈레톤 동기화 누락을 방지한다.
