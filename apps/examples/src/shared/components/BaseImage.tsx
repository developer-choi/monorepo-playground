'use client';

import { type ComponentProps, type ReactElement, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './BaseImage.module.scss';

type Fallback =
  | { type: 'hidden' }
  | { type: 'default-404' }
  | { type: 'replace-image'; src: string }
  | { type: 'replace-element'; element: ReactElement };

interface BaseImageProps extends Omit<ComponentProps<'img'>, 'onError' | 'src'> {
  src: ComponentProps<'img'>['src'] | null | undefined; // 이미지 src 출처가 API 같은 외부이고, 그 값이 유효하지않은 케이스도 대응하기 위함

  /**
   * 이미지 불러오다 실패했을 때 처리
   * (default) 기존 img 동작 그대로 유지 (엑박이미지 노출)
   * hidden 이미지 미노출 처리
   * default-404 디자이너와 협의된 애플리케이션 기본 404 이미지 UI 노출
   * replace-image 대체이미지 노출
   * replace-element 대체 UI 노출
   */
  fallback?: Fallback;
}

export default function BaseImage({
  src,
  fallback,
  className,
  ...rest
}: BaseImageProps) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(!src);
  }, [src]);

  const handleError = useCallback(() => {
    if (!fallback) {
      return;
    }

    setHasError(true);
  }, [fallback]);

  if (!hasError || !fallback) {
    return (
      <img
        {...rest}
        loading="lazy"
        src={src}
        className={classNames(styles.image, className)}
        onError={handleError}
      />
    );
  }

  if (fallback.type === 'replace-image') {
    return (
      <img
        {...rest}
        src={fallback.src}
        className={classNames(styles.image, className)}
        alt={rest.alt ?? 'Fallback image'}
      />
    );
  }

  if (fallback.type === 'hidden') {
    return null;
  }

  if (fallback.type === 'replace-element') {
    return fallback.element;
  }

  return <DefaultPlaceholder className={className} />;
}

function DefaultPlaceholder({ className }: { className?: string }) {
  return (
    <div className={classNames(styles.placeholder, className)}>
      <span className={styles.placeholderIcon}>🖼</span>
    </div>
  );
}
