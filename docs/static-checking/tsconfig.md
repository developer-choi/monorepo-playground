## 설정 중앙화

`tsconfig.base.json`을 루트에 생성하고, 각 워크스페이스의 tsconfig이 `extends`로 상속합니다.

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    // ...
  },
}
```

```jsonc
// apps/examples/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  // 워크스페이스별 추가 옵션만 작성
}
```

## tsconfig 옵션

`tsconfig.base.json`의 전체 옵션:

| 옵션                         | 값        | 설명                                                |
| ---------------------------- | --------- | --------------------------------------------------- |
| `strict`                     | true      | 엄격 모드 (strictNullChecks, noImplicitAny 등 포함) |
| `skipLibCheck`               | true      | node_modules 내 .d.ts 타입 체크 생략 (빌드 속도)    |
| `noEmit`                     | true      | JS 출력 안 함 (번들러가 담당)                       |
| `jsx`                        | react-jsx | React 17+ JSX 변환                                  |
| `moduleResolution`           | bundler   | 번들러 기반 모듈 해석                               |
| `resolveJsonModule`          | true      | JSON import 허용                                    |
| `isolatedModules`            | true      | 파일 단위 트랜스파일 호환 (SWC, esbuild)            |
| `noFallthroughCasesInSwitch` | true      | 아래 참고                                           |
| `noUncheckedIndexedAccess`   | true      | 아래 참고                                           |

아래는 버그 방지 목적으로 추가한 옵션입니다.

### 20. `noUncheckedIndexedAccess`

배열이나 객체의 인덱스 접근 시 반환 타입에 `| undefined`를 자동으로 추가합니다.

```typescript
// ❌ (옵션 OFF 시)
const users = ['Alice', 'Bob'];
const first: string = users[5]; // undefined인데 string으로 통과

// ✅ (옵션 ON 시)
const first = users[5]; // string | undefined
if (first) {
  console.error(first.toUpperCase());
}
```

### 21. `noFallthroughCasesInSwitch`

switch 문에서 break/return 없이 다음 케이스로 떨어지는 것을 방지합니다.

```typescript
// ❌
switch (status) {
  case 'a':
    doA();
  // break 없이 case "b"로 떨어짐
  case 'b':
    doB();
    break;
}

// ✅
switch (status) {
  case 'a':
    doA();
    break;
  case 'b':
    doB();
    break;
}
```
