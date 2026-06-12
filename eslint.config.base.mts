/**
 * TP(test-playground)에서 검증한 공통 ESLint 규칙.
 * 각 워크스페이스의 eslint config에서 import해서 사용.
 */
import type {Rule} from 'eslint';
import type * as ESTree from 'estree';

export const baseRules = {
  '@typescript-eslint/no-explicit-any': 'error',
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
  ],
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
function isComponentOrHookName(name: string): boolean {
  return /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);
}

/**
 * 모듈 최상위 export 중 컴포넌트·훅에 해당하는 export 이름을 모은다.
 * default/named, 함수·클래스·변수 선언, `export {X}` 스페시파이어를 모두 본다. 타입 전용 export는 무시.
 */
function collectComponentAndHookExportNames(body: ESTree.Program['body']): string[] {
  const names: string[] = [];
  const add = (name: unknown): void => {
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
 *
 * @returns 룰 모듈
 */
export function createFilenameExportConventionRule(): Rule.RuleModule {
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
    create(context: Rule.RuleContext): Rule.RuleListener {
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
        Program(node: ESTree.Program): void {
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
