import {Flex, Link} from '@radix-ui/themes';
import {CodeIcon, FileTextIcon, GitHubLogoIcon} from '@radix-ui/react-icons';

interface ExampleHeaderProps {
  sourcePath: string;
}

export default function ExampleHeader({sourcePath}: ExampleHeaderProps) {
  return (
    <Flex
      gap="4"
      py="2"
      px="4"
      align="center"
      position="sticky"
      top="0"
      style={{zIndex: 10, backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--gray-a5)'}}
    >
      <Link href={`${SRC_BASE}/${sourcePath}/README.md`} target="_blank" size="2">
        <Flex align="center" gap="1"><FileTextIcon /> README</Flex>
      </Link>
      <Link href={`${SRC_BASE}/${sourcePath}`} target="_blank" size="2">
        <Flex align="center" gap="1"><CodeIcon /> 소스코드</Flex>
      </Link>
      <Link href="https://github.com/developer-choi" target="_blank" size="2">
        <Flex align="center" gap="1"><GitHubLogoIcon /> GitHub</Flex>
      </Link>
    </Flex>
  );
}

const GITHUB_BASE = 'https://github.com/developer-choi/monorepo-playground';
const SRC_BASE = `${GITHUB_BASE}/tree/master/apps/examples/src`;