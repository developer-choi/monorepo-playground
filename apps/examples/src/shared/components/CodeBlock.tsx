import {type BundledLanguage, codeToHtml} from 'shiki';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  code: string;
  lang?: BundledLanguage;
}

export default async function CodeBlock({code, lang = 'tsx'}: CodeBlockProps) {
  const html = await codeToHtml(code, {lang, theme: 'github-light'});

  // eslint-disable-next-line @typescript-eslint/naming-convention
  return <div dangerouslySetInnerHTML={{__html: html}} className={styles.codeBlock} />;
}
