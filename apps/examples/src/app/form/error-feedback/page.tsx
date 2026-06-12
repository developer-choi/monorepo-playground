import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import CodeBlock from '@/shared/components/CodeBlock';
import ValidationModeDemo from './ValidationModeDemo';
import SubmitButtonDemo from './SubmitButtonDemo';
import ErrorScrollDemo from './ErrorScrollDemo';
import styles from './page.module.scss';

export default function ErrorFeedbackPage() {
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h2 className={clsx(typography.h2, styles.pageTitle)}>에러 피드백</h2>
        <p className={clsx(typography.body1, styles.description)}>
          폼 에러를 사용자에게 <strong>언제, 어디서, 어떻게</strong> 보여줄 것인가에 대한 패턴입니다.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>1. 유효성검증은 언제 해야 하는가?</h3>
        <p className={clsx(typography.body2, styles.descriptionWide)}>에러를 보여주는 시점은 크게 세 가지입니다.</p>
        <div className={styles.subBlock}>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>1. 입력 시점</strong> — 입력 도중에 에러가 바로 나타납니다. 사용자도 이메일을 덜 쓴 걸 알고 있는데,
            이 시점에 에러를 보여주는 건 불필요한 압박입니다.
          </p>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>2. 포커스가 빠진 시점</strong> — 포커스는 의도와 무관하게 빠질 때가 많습니다. 마우스를 잘못
            클릭하거나 다른 곳을 터치해도 에러가 뜹니다.
          </p>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>3. 제출 시점</strong> — 제출 버튼을 누르는 건 사용자 스스로 &quot;다 채웠다&quot;고 판단한
            시점입니다.
          </p>
        </div>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          react-hook-form의 <code>useForm()</code>은 <code>mode</code> 옵션으로 이 시점을 간편하게 설정할 수 있습니다.
        </p>
        <ValidationModeDemo />
        <div className={styles.codeBlock}>
          <CodeBlock code={MODE_CODE} />
        </div>
        <p className={clsx(typography.body2, styles.descriptionSpaced)}>
          <strong>onSubmit의 한계</strong> — 폼이 길면 제출 버튼(하단)과 에러 필드(상단)의 거리가 멀어집니다. 에러
          필드로 자동 포커스하는 것으로 완화할 수 있지만, onBlur/onChange는 필드를 하나하나 채워 넘어가므로 이 문제가
          원천적으로 없습니다. 정답은 없지만, 라이브러리가 기본값을 onSubmit으로 설정한 데는 동의합니다.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>2. 제출 버튼은 항상 활성화</h3>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          제출 버튼을 조건이 안 맞다고 비활성화시켜 버리면 사용자는 뭘 고쳐야 하는지 알 수 없습니다.
        </p>
        <p className={clsx(typography.body2, styles.itemWide)}>
          실제로 부모님 세대에서 &quot;제출 버튼이 왜 안 눌리냐&quot;고 문의를 주시는 경우가 있습니다. 버튼은 항상
          활성화하고, 제출 시 에러 피드백으로 안내하는 게 좋다고 생각합니다.
        </p>
        <SubmitButtonDemo />
        <div className={styles.codeBlock}>
          <CodeBlock code={SUBMIT_CODE} />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>3. 에러 필드로 포커스 이동</h3>
        <p className={clsx(typography.body2, styles.descriptionNarrow)}>
          폼이 위아래로 길어 스크롤이 발생할 정도면, 제출 시 에러 필드가 화면 밖에 있어 사용자가 뭘 고쳐야 할지 바로
          찾기 어렵습니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionNarrow)}>
          따라서, 해당 필드로 포커스를 옮기고 필요하면 스크롤까지 해주면, 사용자가 에러 위치를 바로 확인할 수 있습니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          추가로, react-hook-form은 이 동작을 기본으로 제공하므로 별도 구현이 필요 없습니다.
        </p>
        <ErrorScrollDemo />
        <div className={styles.codeBlock}>
          <CodeBlock code={SCROLL_CODE} />
        </div>
      </div>
    </div>
  );
}

const MODE_CODE = `// react-hook-form
const { register, handleSubmit } = useForm({
  mode: 'onSubmit', // 'onSubmit' | 'onBlur' | 'onChange'
});`;

const SUBMIT_CODE = `// ❌ isValid로 버튼 비활성화
<Button disabled={!formState.isValid}>제출</Button>

// ✅ 항상 활성화 — 제출 시 에러 피드백으로 안내
<Button type="submit">제출</Button>`;

const SCROLL_CODE = `// react-hook-form은 기본적으로 첫 번째 에러 필드에 focus + scroll
const form = useForm({
  shouldFocusError: true, // 기본값 — 별도 설정 불필요
});`;
