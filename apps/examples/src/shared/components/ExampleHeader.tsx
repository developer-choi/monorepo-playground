import {Flex} from '@radix-ui/themes';
import {CodeIcon, FileTextIcon, GitHubLogoIcon} from '@radix-ui/react-icons';
import Link from 'next/link';
import styles from './ExampleHeader.module.scss';

type DocLink = {type: 'internal'; path: `src/${string}`} | {type: 'external'; url: string};

interface ExampleHeaderProps {
  doc?: DocLink;
  sourcePath?: `src/${string}`;
}

export default function ExampleHeader({doc, sourcePath}: ExampleHeaderProps) {
  return (
    <Flex
      align="center"
      gap="4"
      position="sticky"
      px="4"
      py="3"
      // eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조와 zIndex 조합이라 정적 CSS Module로 분리 어려움. 전용 CSS Module 파일 생성 검토 필요
      style={{zIndex: 10, backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--gray-a5)'}}
      top="0"
    >
      <Link className={styles.logo} href="/">
        Examples
      </Link>

      <Flex align="center" gap="4" ml="auto">
        {doc && (
          <Link
            className={styles.docLink}
            href={doc.type === 'external' ? doc.url : `${PROJECT_BASE}/${doc.path}`}
            target="_blank"
          >
            <Flex align="center" gap="1">
              <FileTextIcon /> 설명서
            </Flex>
          </Link>
        )}
        {sourcePath && (
          <Link className={styles.docLink} href={`${PROJECT_BASE}/${sourcePath}`} target="_blank">
            <Flex align="center" gap="1">
              <CodeIcon /> 소스코드
            </Flex>
          </Link>
        )}
        <Link className={styles.docLink} href="https://github.com/developer-choi" target="_blank">
          <Flex align="center" gap="1">
            <GitHubLogoIcon /> GitHub
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
}

const GITHUB_BASE = 'https://github.com/developer-choi/monorepo-playground';
const PROJECT_BASE = `${GITHUB_BASE}/tree/master/apps/examples`;
