import {Flex, Link} from '@radix-ui/themes';
import {CodeIcon, FileTextIcon, GitHubLogoIcon} from '@radix-ui/react-icons';

interface ExampleHeaderProps {
  sourcePath: `src/${string}`;
  readmePath: `src/${string}`;
}

export default function ExampleHeader({sourcePath, readmePath}: ExampleHeaderProps) {
  return (
    <Flex
      gap="4"
      py="2"
      px="4"
      align="center"
      position="sticky"
      top="0"
      // eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조와 zIndex 조합이라 정적 CSS Module로 분리 어려움. 전용 CSS Module 파일 생성 검토 필요
      style={{zIndex: 10, backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--gray-a5)'}}
    >
      <Link href={`${PROJECT_BASE}/${readmePath}`} target="_blank" size="2">
        <Flex align="center" gap="1">
          <FileTextIcon /> README
        </Flex>
      </Link>
      <Link href={`${PROJECT_BASE}/${sourcePath}`} target="_blank" size="2">
        <Flex align="center" gap="1">
          <CodeIcon /> 소스코드
        </Flex>
      </Link>
      <Link href="https://github.com/developer-choi" target="_blank" size="2">
        <Flex align="center" gap="1">
          <GitHubLogoIcon /> GitHub
        </Flex>
      </Link>
    </Flex>
  );
}

const GITHUB_BASE = 'https://github.com/developer-choi/monorepo-playground';
const PROJECT_BASE = `${GITHUB_BASE}/tree/master/apps/examples`;
