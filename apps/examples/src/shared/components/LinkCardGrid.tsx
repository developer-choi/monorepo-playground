import {Badge, Card, Flex, Heading, Text} from '@radix-ui/themes';
import NextLink from 'next/link';
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
              <Heading size="4">{item.title}</Heading>
              <Text as="p" color="gray" size="2">
                {item.description}
              </Text>
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
          <NextLink key={item.href} className={styles.cardLink} href={item.href}>
            {card}
          </NextLink>
        );
      })}
    </div>
  );
}
