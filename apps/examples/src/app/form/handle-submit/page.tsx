import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import CodeBlock from '@/shared/components/CodeBlock';
import ValidationModeDemo from '@/form/handle-submit/components/ValidationModeDemo';
import SubmitButtonDemo from '@/form/handle-submit/components/SubmitButtonDemo';
import ErrorScrollDemo from '@/form/handle-submit/components/ErrorScrollDemo';
import SubmitLifecycleDemo from '@/form/handle-submit/components/SubmitLifecycleDemo';
import styles from './page.module.scss';

export default function HandleSubmitPage() {
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h2 className={clsx(typography.h2, styles.pageTitle)}>제출 핸들링</h2>
        <p className={clsx(typography.body1, styles.description)}>
          에러를 <strong>언제·어디서·어떻게</strong> 보여줄지부터, 제출 후 <strong>로딩·성공·실패</strong>의 생명주기를
          어떻게 처리할지까지 다룹니다.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>1. 유효성검증은 언제 해야 하는가?</h3>
        <p className={clsx(typography.body2, styles.descriptionWide)}>에러를 보여주는 시점은 크게 세 가지입니다.</p>
        <div className={styles.subBlock}>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>1. 입력 시점</strong>: 입력 도중에 에러가 바로 나타납니다. 사용자도 이메일을 덜 쓴 걸 알고 있는데,
            이 시점에 에러를 보여주는 건 불필요한 압박입니다.
          </p>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>2. 포커스가 빠진 시점</strong>: 포커스는 의도와 무관하게 빠질 때가 많습니다. 마우스를 잘못
            클릭하거나 다른 곳을 터치해도 에러가 뜹니다.
          </p>
          <p className={clsx(typography.body2, styles.item)}>
            <strong>3. 제출 시점</strong>: 제출 버튼을 누르는 건 사용자 스스로 &quot;다 채웠다&quot;고 판단한
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
          <strong>onSubmit의 한계</strong>: 폼이 길면 제출 버튼(하단)과 에러 필드(상단)의 거리가 멀어집니다. 에러 필드로
          자동 포커스하는 것으로 완화할 수 있지만, onBlur/onChange는 필드를 하나하나 채워 넘어가므로 이 문제가
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

      <div className={styles.section}>
        <h3 className={clsx(typography.h3, styles.sectionTitle)}>4. 제출 생명주기: 로딩·성공·실패</h3>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          제출 버튼을 누른 뒤 벌어지는 일입니다. 응답을 기다리는 <strong>로딩</strong> 동안 중복 제출을 막고,{' '}
          <strong>실패</strong>하면 인라인으로 에러를 보여주며, <strong>성공</strong>하면 보통 도착 페이지로 이동합니다.
        </p>
        <h4 className={clsx(typography.h4, styles.subSectionTitle)}>4.1 성공 후 페이지 이동</h4>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          아래 데모는 기본 이메일이 이미 가입된 값이라, 처음부터 실패 상태가 보입니다. 이메일을 바꿔 제출하면 성공해
          이동합니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          로딩은 <strong>성공 후 화면 전환이 끝날 때까지 유지</strong>해야 합니다. 성공 시점에 바로 풀면 이동 직전
          재클릭이 가능해지기 때문입니다.
        </p>
        <SubmitLifecycleDemo variant="navigate" />
        <div className={styles.codeBlock}>
          <CodeBlock code={LIFECYCLE_CODE} />
        </div>

        <h4 className={clsx(typography.h4, styles.subSectionTitle)}>4.2 성공 후 페이지 머무르기</h4>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          실무에서는 제출이 끝난 뒤 페이지를 이동하는 경우만 있는 게 아니라, 현재 페이지에 그대로 머무르는 경우도
          있습니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          이때는 제출에 성공하면 폼을 비워 다음 입력을 바로 받게 합니다. 화면 이동이 없어 작업 흐름이 끊기지 않습니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          화면 전환이라는 성공 신호가 없으므로, <strong>토스트 같은 별도 피드백으로 성공을 알립니다</strong>. 아무
          반응이 없으면 사용자는 제출이 됐는지 알 수 없습니다.
        </p>
        <p className={clsx(typography.body2, styles.descriptionWide)}>
          화면을 떠나지 않으므로, 이동과 달리 <strong>성공하면 바로 로딩을 풀어야</strong> 합니다. 로딩을 유지할 이유가
          없고, 오히려 다음 입력을 막기 때문입니다.
        </p>
        <SubmitLifecycleDemo variant="stay" />
        <div className={styles.codeBlock}>
          <CodeBlock code={STAY_CODE} />
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

// ✅ 항상 활성화: 제출 시 에러 피드백으로 안내
<Button type="submit">제출</Button>`;

const SCROLL_CODE = `// react-hook-form은 기본적으로 첫 번째 에러 필드에 focus + scroll
const form = useForm({
  shouldFocusError: true, // 기본값: 별도 설정 불필요
});`;

const LIFECYCLE_CODE = `const mutation = useMutation({ mutationFn: dummySignUpApi });
// 성공 후 이동 전까지 로딩 유지 → 이동 직전 재클릭 방지
const isPending = mutation.isPending || mutation.isSuccess;

const onSubmit = handleSubmit(async (data) => {
  if (isPending) return; // 네이티브 Enter 중복 제출 가드
  try {
    await mutation.mutateAsync(data);
    router.push('/form/handle-submit/submitted'); // 성공 = 이동
  } catch {
    setErrorMessage(...); // 실패 = 인라인 Callout
  }
});`;

const STAY_CODE = `// 머무름은 언마운트가 없어 isSuccess가 계속 true면 로딩에 갇힌다.
// 성공 후 mutation.reset()으로 idle 복귀시켜 로딩을 풀고, 폼도 비운다.
await mutation.mutateAsync(data);
// reset(값)은 화면의 uncontrolled 입력까지는 안 비운다 → keepFieldsRef로 DOM까지 반영
reset({ name: '', email: '' }, { keepFieldsRef: true });
mutation.reset();
toast.success('회원가입이 완료되었습니다.'); // 화면 전환이 없으니 성공 피드백을 따로 준다`;
