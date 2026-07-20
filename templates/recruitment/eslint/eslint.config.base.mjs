/**
 * 단일레포 채용과제용 공통 ESLint 규칙.
 * MP `eslint.config.base.mts`에서 모노레포 의존(타입 import)을 걷어낸 자립형 `.mjs` 사본.
 * next/vite eslint config가 이 파일을 import해서 사용한다.
 *
 * [원본] monorepo-playground/eslint.config.base.mts — 원본이 바뀌면 이 파일도 함께 최신화.
 */
import importPlugin from 'eslint-plugin-import';

export const baseRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: {attributes: false}}],
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
  '@typescript-eslint/no-unnecessary-condition': 'error',
  'no-console': ['error', {allow: ['warn', 'error']}],
  '@typescript-eslint/restrict-template-expressions': ['error', {allowNullish: false}],
  '@typescript-eslint/parameter-properties': 'error',
  'id-length': ['error', {min: 2}],
  'id-denylist': ['error', 'Props', 'State'],
  'max-params': ['error', 2],
  '@typescript-eslint/naming-convention': [
    'error',
    {selector: 'default', format: ['camelCase']},
    {selector: 'variable', format: ['camelCase', 'UPPER_CASE']},
    {selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow'},
    {selector: 'function', format: ['camelCase', 'PascalCase']},
    {selector: 'typeLike', format: ['PascalCase']},
    {selector: 'property', format: ['camelCase', 'UPPER_CASE']},
    {selector: 'method', format: ['camelCase']},
    {selector: 'import', format: null},
    {selector: 'variable', modifiers: ['destructured'], format: null},
  ],
  'custom/filename-export-convention': 'error',
  'no-magic-numbers': [
    'error',
    {
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      enforceConst: true,
    },
  ],
  'react/function-component-definition': [
    'error',
    {namedComponents: 'function-declaration', unnamedComponents: 'arrow-function'},
  ],
  'react/jsx-sort-props': [
    'error',
    {
      callbacksLast: true,
      shorthandFirst: true,
      reservedFirst: true,
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: 'react',
          importNames: ['forwardRef'],
          message:
            'forwardRef 사용 금지. React 19부터 함수 컴포넌트가 ref를 일반 prop으로 받습니다. 예: function Input({ref, ...props}: ComponentProps<"input">) { return <input ref={ref} {...props} />; }',
        },
        {
          name: 'react',
          importNames: ['ComponentPropsWithoutRef', 'ComponentPropsWithRef'],
          message:
            'ComponentPropsWithoutRef·ComponentPropsWithRef 사용 금지. ComponentProps를 사용하세요. React 19에서는 함수 컴포넌트·forwardRef·HTML 태그에 대해 ComponentProps가 ref를 포함하도록 동작합니다.',
        },
      ],
      patterns: [
        {
          group: ['**/index', '**/index.ts', '**/index.tsx'],
          message:
            '내부 barrel(index) import 금지. 대상 모듈을 직접 import 하세요. 패키지 entry는 alias(@scope/pkg)로 import.',
        },
      ],
    },
  ],
  'no-restricted-syntax': [
    'error',
    {
      selector: "JSXAttribute[name.name='alt'][value.value='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
    {
      selector: "JSXAttribute[name.name='alt'] > JSXExpressionContainer > Literal[value='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
    {
      selector:
        "JSXAttribute[name.name='alt'] > JSXExpressionContainer > TemplateLiteral[quasis.length=1][quasis.0.value.raw='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
    {
      selector: 'TSEnumDeclaration',
      message: 'enum 대신 as const 객체를 사용하세요.',
    },
    {
      selector: "JSXOpeningElement[name.name='button']",
      message: '<button> 직접 사용 금지. 공통 Button 컴포넌트를 사용하세요.',
    },
    {
      selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
      message:
        '인라인 스타일 객체 리터럴 금지. CSS Modules를 사용하세요. 변수 참조는 허용. 예외: 동적 값·CSS 변수 주입·스켈레톤. — eslint-disable + 사유 주석으로 처리.',
    },
    {
      selector: "JSXElement > JSXOpeningElement[name.name='svg']",
      message: 'SVG 직접 작성 금지. 아이콘 컴포넌트나 SVG 파일로 분리하세요.',
    },
    {
      selector: 'TSTypeReference > TSQualifiedName[left.name="React"]',
      message: 'React.X 대신 import { X } from "react"를 사용하세요.',
    },
    {
      selector: 'MemberExpression[object.name="React"]',
      message: 'React.X 대신 import { X } from "react"를 사용하세요.',
    },
    {
      selector: 'JSXMemberExpression[object.name="React"]',
      message: 'React.X 대신 import { X } from "react"를 사용하세요.',
    },
    {
      selector: 'CatchClause > Identifier.param[typeAnnotation]',
      message: 'catch 변수의 타입 어노테이션 금지. TS 4.4+에서 catch 변수는 기본 unknown입니다.',
    },
    {
      selector: "ConditionalExpression > CallExpression[callee.name='clsx']",
      message: 'clsx를 삼항으로 감싸지 마세요. 조건은 clsx(a, cond && b) 인자로 표현합니다.',
    },
    {
      selector: "Property[key.name='mutationFn'] > ArrowFunctionExpression[body.type='CallExpression'][body.callee.type='Identifier']",
      message:
        'mutationFn에 (args) => api(args) 인라인 래핑 금지. API 함수 reference만 박고 인자는 mutateAsync로 전달하세요. 예: mutationFn: postBoardApi',
    },
    {
      selector: "Property[key.name='mutationFn'] > ArrowFunctionExpression[body.type='BlockStatement']",
      message:
        'mutationFn 안에 가드·조립 로직(블록 본문) 금지. 검증은 호출부 try 안에서 throw하고, mutationFn은 API 함수 reference만 유지하세요.',
    },
    {
      selector: "Property[key.name='mutationFn'] > FunctionExpression",
      message:
        'mutationFn에 function 표현식 금지. API 함수 reference만 박고 인자는 mutateAsync로 전달하세요. 예: mutationFn: postBoardApi',
    },
    {
      selector: "MemberExpression[object.name='module'][property.name='exports']",
      message: 'CJS module.exports 금지. ESM export로 바꾸세요. (의도적 CJS는 .cjs 확장자로 분리)',
    },
    {
      selector: "AssignmentExpression[left.object.name='exports']",
      message: 'CJS exports.X 금지. ESM named export로 바꾸세요. (의도적 CJS는 .cjs 확장자로 분리)',
    },
    {
      selector: "CallExpression[callee.object.name='vi'][callee.property.name=/^(mock|doMock)$/][arguments.0.type='Literal']",
      message:
        "vi.mock/doMock의 첫 인자로 문자열 경로 금지. import('./x') 형태로 넘기세요. 그래야 factory 반환값이 실제 모듈 타입과 대조되고(잘못된 모킹 차단), IDE 파일 이동 시 경로가 자동 갱신됩니다.",
    },
    {
      selector:
        "CallExpression[callee.property.name='each']:matches([callee.object.name=/^(describe|it|test)$/], [callee.object.object.name=/^(describe|it|test)$/])",
      message:
        'each 금지 — for를 쓰세요(it.for/test.for/describe.for). each는 배열 인자를 spread하는 Jest 호환용 레거시입니다(it.for/test.for는 Test Context도 제공, Vitest 공식 "Prefer test.for in new code"). Jest 마이그레이션을 안 하므로 신규 코드는 for. 객체 케이스는 .each→.for로 충분합니다.',
    },
    {
      selector:
        "TaggedTemplateExpression[tag.property.name='each']:matches([tag.object.name=/^(describe|it|test)$/], [tag.object.object.name=/^(describe|it|test)$/])",
      message:
        'each 금지 — for를 쓰세요(it.for/test.for/describe.for). each는 배열 인자를 spread하는 Jest 호환용 레거시입니다(it.for/test.for는 Test Context도 제공, Vitest 공식 "Prefer test.for in new code"). Jest 마이그레이션을 안 하므로 신규 코드는 for. 객체 케이스는 .each→.for로 충분합니다.',
    },
    {
      selector: "CallExpression[callee.property.name='resetHandlers'][arguments.length>0]",
      message:
        'Do not pass handlers to resetHandlers() — it wipes initial handlers and harms predictability. Use resetHandlers() then use(...) instead.',
    },
  ],
};

/**
 * `src/shared`는 도메인 무관이라는 불변식을 강제한다(next/vite config 배열에 추가).
 * shared 파일이 src 내부에서 shared 외(도메인·app)를 import하면 에러. `except`가 `from` 기준 상대경로라
 * 도메인이 늘어도 설정은 그대로다.
 *
 * `import/resolver` 설정은 필수다 — 없으면 resolver가 `.tsx`를 못 찾아 alias·상대경로 전부 미해석으로
 * 빠지고 룰이 조용히 0건이 된다(MP 템플릿에서 2026-07-20 실측: settings 제거 시 위반 2건이 exit 0).
 *
 * MP 원본(`eslint.config.base.mts`)에는 없는 템플릿 전용 룰이다 — MP는 모노레포라 `src/shared` 규약이
 * 없고, 이 경계는 단일레포 채용과제에서만 성립한다. 사유는 docs/static-checking/eslint.md 참고.
 */
export const sharedBoundaryConfig = {
  files: ['**/*.{ts,tsx}'],
  plugins: {import: importPlugin},
  settings: {'import/resolver': {typescript: {alwaysTryTypes: true, project: './tsconfig.json'}}},
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/shared',
            from: './src',
            except: ['./shared'],
            message: 'shared는 도메인 무관 — src 내부는 shared끼리만 import 가능',
          },
        ],
      },
    ],
  },
};

/**
 * MSW resolver 스코프 룰(목/핸들러·테스트 파일에만 적용, `mockFilesConfig`·`testFilesConfig`에서 spread).
 * 앱 소스에는 넣지 않는다 — `http.get(url, cb)`는 node:http에서 정당하게 쓰이므로 전역으로 잡으면 오탐.
 *
 * [원본] monorepo-playground/eslint.config.base.mts — 원본이 바뀌면 이 파일도 함께 최신화.
 */
const mswResolverRules = [
  {
    selector:
      "CallExpression[callee.object.name='http'][callee.property.name=/^(get|post|put|delete|patch|all)$/][arguments.0.value=/[?]/]",
    message:
      'MSW predicate(http.get 등 첫 인자)에 쿼리스트링(?) 금지. predicate는 경로만으로 매칭하고 MSW가 쿼리를 조용히 제거하므로(런타임 경고 없음), 쿼리 값은 resolver에서 new URL(request.url).searchParams.get("page")로 읽으세요.',
  },
  {
    selector:
      "CallExpression[callee.object.name='http'][callee.property.name=/^(get|post|put|delete|patch|all)$/] > TemplateLiteral.arguments TemplateElement[value.raw=/[?]/]",
    message:
      'MSW predicate(http.get 등 첫 인자)에 쿼리스트링(?) 금지. predicate는 경로만으로 매칭하고 MSW가 쿼리를 조용히 제거하므로(런타임 경고 없음), 쿼리 값은 resolver에서 new URL(request.url).searchParams.get("page")로 읽으세요.',
  },
];

/**
 * 테스트 파일 전용 override(next/vite config 배열에 추가). 테스트 JSX의 `aria-*` 작성 금지 —
 * a11y가 현재 우선순위가 아니라서. `getByRole`는 허용, base 기존 `no-restricted-syntax` 항목은 보존.
 *
 * [원본] monorepo-playground/eslint.config.base.mts — 원본이 바뀌면 이 파일도 함께 최신화.
 */
export const testFilesConfig = {
  files: ['**/*.test.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      ...baseRules['no-restricted-syntax'].slice(1),
      {
        selector: 'JSXAttribute[name.name=/^aria-/]',
        message:
          '테스트 JSX에 aria-* 속성을 직접 쓰지 않습니다. getByRole로 쿼리하거나, 불가피하면 eslint-disable + 사유 주석.',
      },
      ...mswResolverRules,
    ],
  },
};

/**
 * MSW 목/핸들러 파일 전용 override(next/vite config 배열에 추가). resolver 스코프 룰(predicate 쿼리 금지)을
 * 목·핸들러 파일(`src/mocks/**`, `*.mock.*`)에 적용한다. 테스트 파일은 `testFilesConfig`가 담당하므로
 * `ignores`로 겹침(no-restricted-syntax last-wins)을 막는다.
 *
 * [원본] monorepo-playground/eslint.config.base.mts — 원본이 바뀌면 이 파일도 함께 최신화.
 */
export const mockFilesConfig = {
  files: ['**/mocks/**/*.{ts,tsx}', '**/*.mock.{ts,tsx}'],
  ignores: ['**/*.test.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': ['error', ...baseRules['no-restricted-syntax'], ...mswResolverRules],
  },
};

/**
 * Next.js App Router 규약 파일. 프레임워크가 파일명을 소문자로 고정하지만
 * default export 컴포넌트는 PascalCase(Page, RootLayout 등)라 파일명과 다르므로 검사에서 제외.
 */
const NEXT_APP_ROUTER_SPECIAL_FILES = new Set([
  'page',
  'layout',
  'loading',
  'error',
  'global-error',
  'not-found',
  'template',
  'default',
  'route',
  'middleware',
  'instrumentation',
  'sitemap',
  'robots',
  'manifest',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
]);

/** `Button.test.tsx`, `Button.stories.tsx` 등 도구 규약 파일(중간 확장자)은 검사에서 제외. */
const TOOLING_MIDDLE_EXTENSION = /\.(test|spec|stories|contract\.test)\./;

/** 컴포넌트(PascalCase) 또는 훅(use*) 이름인지 판정. */
function isComponentOrHookName(name) {
  return /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);
}

/**
 * 모듈 최상위 export 중 컴포넌트·훅에 해당하는 export 이름을 모은다.
 * default/named, 함수·클래스·변수 선언, `export {X}` 스페시파이어를 모두 본다. 타입 전용 export는 무시.
 */
function collectComponentAndHookExportNames(body) {
  const names = [];
  const add = (name) => {
    if (typeof name === 'string' && isComponentOrHookName(name)) {
      names.push(name);
    }
  };

  for (const node of body) {
    if (node.type === 'ExportDefaultDeclaration') {
      const declaration = node.declaration;
      if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
        add(declaration.id.name);
      } else if (declaration.type === 'Identifier') {
        add(declaration.name);
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      if (node.source) {
        continue;
      }
      const declaration = node.declaration;
      if (declaration) {
        if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
          add(declaration.id.name);
        } else if (declaration.type === 'VariableDeclaration') {
          for (const declarator of declaration.declarations) {
            if (declarator.id.type === 'Identifier') {
              add(declarator.id.name);
            }
          }
        }
      } else {
        for (const specifier of node.specifiers) {
          const exported = specifier.exported;
          if (exported.type === 'Identifier' && exported.name === 'default') {
            if (specifier.local.type === 'Identifier') {
              add(specifier.local.name);
            }
          } else {
            add(exported.type === 'Identifier' ? exported.name : exported.value);
          }
        }
      }
    }
  }
  return names;
}

/**
 * 단일 컴포넌트/훅 파일의 파일명 casing을 강제하는 커스텀 룰.
 *
 * src/ 하위에서 컴포넌트(PascalCase)·훅(use*) export가 정확히 하나인 파일은 파일명(첫 `.` 이전)에
 * kebab-case(하이픈)·snake_case(언더스코어)를 쓸 수 없다 — PascalCase/camelCase여야 한다.
 * 컴포넌트·훅이 0개거나 2개 이상(컬렉션)이면 검사하지 않는다(예: 여러 컴포넌트를 묶은 buttons.tsx).
 * 파일명과 심볼명의 정확한 일치는 요구하지 않는다(컨텍스트 명명 client.tsx 등 허용).
 */
export function createFilenameExportConventionRule() {
  return {
    meta: {
      type: 'layout',
      schema: [],
      messages: {
        kebabCase:
          '단일 컴포넌트/훅 파일명에 kebab-case·snake_case를 쓸 수 없습니다: "{{ file }}" (export: {{ name }}).\n' +
          '- 컴포넌트는 PascalCase, 훅은 camelCase 파일명을 쓰세요 (예: SomeComponent.tsx, useSomeHook.ts).\n' +
          '- 여러 멤버를 묶는 모듈이면 named export 묶음 + kebab-case 파일명으로 두세요 (예: buttons.tsx, math.ts).',
      },
    },
    create(context) {
      const filePath = context.filename.replace(/\\/g, '/');
      const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
      const baseName = fileName.split('.')[0];

      // src/ 하위 소스 모듈만 검사. 루트 설정 파일(*.config.*), .storybook 등 도구 규약 파일은 제외.
      if (!filePath.includes('/src/')) {
        return {};
      }

      if (
        NEXT_APP_ROUTER_SPECIAL_FILES.has(baseName) ||
        TOOLING_MIDDLE_EXTENSION.test(fileName) ||
        fileName.endsWith('.d.ts')
      ) {
        return {};
      }

      return {
        Program(node) {
          const names = collectComponentAndHookExportNames(node.body);
          if (names.length !== 1) {
            return;
          }
          if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(baseName)) {
            context.report({node, messageId: 'kebabCase', data: {file: baseName, name: names[0]}});
          }
        },
      };
    },
  };
}
