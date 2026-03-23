import {Spinner} from '@radix-ui/themes';
import styles from './LoadingPage.module.scss';

export default function LoadingPage() {
  return (
    <div className={styles.loadingPageContainer}>
      <Spinner size="3" />
    </div>
  );
}