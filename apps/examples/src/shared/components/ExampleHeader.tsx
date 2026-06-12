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
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        Examples
      </Link>

      <nav className={styles.actions}>
        {doc && (
          <Link
            className={styles.docLink}
            href={doc.type === 'external' ? doc.url : `${PROJECT_BASE}/${doc.path}`}
            target="_blank"
          >
            <span className={styles.linkInner}>
              <FileTextIcon /> 설명서
            </span>
          </Link>
        )}
        {sourcePath && (
          <Link className={styles.docLink} href={`${PROJECT_BASE}/${sourcePath}`} target="_blank">
            <span className={styles.linkInner}>
              <CodeIcon /> 소스코드
            </span>
          </Link>
        )}
        <Link className={styles.docLink} href="https://github.com/developer-choi" target="_blank">
          <span className={styles.linkInner}>
            <GitHubLogoIcon /> GitHub
          </span>
        </Link>
      </nav>
    </header>
  );
}

const GITHUB_BASE = 'https://github.com/developer-choi/monorepo-playground';
const PROJECT_BASE = `${GITHUB_BASE}/tree/master/apps/examples`;
