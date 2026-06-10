import {Badge, Card, Flex} from '@radix-ui/themes';
import clsx from 'clsx';
import Link from 'next/link';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './LinkCardGrid.module.scss';

export interface LinkCardItem {
  title: string;
  href: string;
  description: string;
  keywords: string[];
}

interface LinkCardGridProps {
  items: LinkCardItem[];
}

export default function LinkCardGrid({items}: LinkCardGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => {
        const isExternal = item.href.startsWith('http');
        const card = (
          <Card className={styles.card} size="3">
            <Flex direction="column" gap="3">
              <h4 className={typography.h4}>{item.title}</h4>
              <p className={clsx(typography.body2, styles.description)}>{item.description}</p>
              <Flex gap="2" wrap="wrap">
                {item.keywords.map((keyword) => (
                  <Badge key={keyword} variant="soft">
                    {keyword}
                  </Badge>
                ))}
              </Flex>
            </Flex>
          </Card>
        );

        return isExternal ? (
          <a key={item.href} className={styles.cardLink} href={item.href} rel="noopener noreferrer" target="_blank">
            {card}
          </a>
        ) : (
          <Link key={item.href} className={styles.cardLink} href={item.href}>
            {card}
          </Link>
        );
      })}
    </div>
  );
}
