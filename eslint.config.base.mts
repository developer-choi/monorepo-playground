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

/**
 * default export의 이름을 구한다. 익명(`export default function () {}`, 화살표, 객체, 호출식 등)이면 null.
 */
function getDefaultExportName(declaration: ESTree.ExportDefaultDeclaration['declaration']): string | null {
  if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
    return declaration.id.name;
  }
  if (declaration.type === 'Identifier') {
    return declaration.name;
  }
  return null;
}

/**
 * 파일명과 default export 이름의 일치를 강제하는 커스텀 룰.
 *
 * named default export(`export default function Foo`/`class Foo`/`Foo`/`export {Foo as default}`)가 있으면
 * 파일명(첫 `.` 이전)이 그 이름과 같아야 한다. default export가 없거나(named export 묶음) 익명이면 검사하지 않는다.
 * AC coding-standards naming.md의 "파일명 ↔ export 형태" 규칙 중 객관적으로 판정 가능한 부분을 강제한다.
 *
 * @returns 룰 모듈
 */
export function createFilenameExportConventionRule(): Rule.RuleModule {
  return {
    meta: {
      type: 'layout',
      schema: [],
      messages: {
        mismatch:
          '파일명이 default export 이름과 다릅니다: 파일 "{{ file }}" ↔ export "{{ name }}".\n' +
          '- 단일 컴포넌트/클래스/함수를 default export하면 파일명을 그 이름과 일치시키세요 (예: AlertModal → AlertModal.tsx).\n' +
          '- 여러 멤버를 내보내는 모듈이면 default 대신 named export로 바꾸고 파일명을 kebab-case로 두세요 (예: auth-cookie.ts).',
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

      const report = (node: ESTree.Node, name: string | null): void => {
        if (name !== null && name !== 'default' && name !== baseName) {
          context.report({node, messageId: 'mismatch', data: {file: baseName, name}});
        }
      };

      return {
        ExportDefaultDeclaration(node: ESTree.ExportDefaultDeclaration): void {
          report(node, getDefaultExportName(node.declaration));
        },
        ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration): void {
          if (node.source) {
            return;
          }
          for (const specifier of node.specifiers) {
            const exported = specifier.exported;
            const exportedName = exported.type === 'Identifier' ? exported.name : exported.value;
            if (exportedName === 'default' && specifier.local.type === 'Identifier') {
              report(specifier, specifier.local.name);
            }
          }
        },
      };
    },
  };
}
