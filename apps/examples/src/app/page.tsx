import {Badge, Card, Container, Flex, Heading, Link, Text} from '@radix-ui/themes';
import {ExternalLinkIcon, GitHubLogoIcon} from '@radix-ui/react-icons';
import NextLink from 'next/link';
import styles from './page.module.scss';

export default function Home() {
  return (
    <Container px="4" py="9" size="3">
      <Flex direction="column" gap="3" mb="8">
        <Heading size="8">Examples</Heading>
        <Text color="gray" size="4">
          실무에서 반복적으로 사용되는 프론트엔드 패턴들을 Next.js 예제로 정리한 프로젝트입니다.
        </Text>
        <Flex gap="4" mt="1">
          <Link href={GITHUB_URL} size="2" target="_blank">
            <Flex align="center" gap="1">
              <GitHubLogoIcon /> GitHub
            </Flex>
          </Link>
          <Link href={DESIGN_SYSTEM_URL} size="2" target="_blank">
            <Flex align="center" gap="1">
              <ExternalLinkIcon /> Design System
            </Flex>
          </Link>
        </Flex>
      </Flex>

      <div className={styles.grid}>
        {ITEMS.map((item) => {
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
    </Container>
  );
}

const GITHUB_URL = 'https://github.com/developer-choi/monorepo-playground';
const DESIGN_SYSTEM_URL = 'https://design-system-eta-six.vercel.app/';

const ITEMS = [
  {
    title: '무한스크롤 게시판',
    href: '/rendering/infinite-scroll',
    description:
      '@tanstack/react-virtual 기반 virtual list와 무한스크롤을 결합하여 대량 데이터를 효율적으로 렌더링하는 방법을 다룹니다.',
    keywords: ['Virtual List', 'Infinite Scroll', '@tanstack/react-virtual'],
  },
  {
    title: '검색결과 목록 UX',
    href: '/rendering/search-result/search',
    description:
      '타이핑 반응성과 검색결과 갱신 속도를 모두 확보하기 위해 useDeferredValue, 디바운싱, 캐싱을 조합하는 방법을 다룹니다.',
    keywords: ['useDeferredValue', 'Debouncing', 'Caching', 'Race Condition'],
  },
  {
    title: 'Design System',
    href: DESIGN_SYSTEM_URL,
    description:
      '핵심 기능과 웹 접근성에 집중한 컴포넌트 라이브러리입니다. Storybook에서 각 컴포넌트의 동작을 확인할 수 있습니다.',
    keywords: ['Accessibility', 'FocusTrap', 'Portal', 'Storybook'],
  },
  {
    title: 'Zod 활용기',
    href: '/validation/integration',
    description:
      '타입 선언과 유효성 검증을 하나의 스키마로 통합하고, 원본 스키마에서 용도별 타입을 파생하는 패턴을 다룹니다.',
    keywords: ['Zod', '스키마 파생', '폼 연동', 'API 검증'],
  },
];
