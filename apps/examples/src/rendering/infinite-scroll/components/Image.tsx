import {ComponentPropsWithoutRef} from 'react';
import classNames from 'classnames';
import styles from './Image.module.scss';

interface BaseImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  src: string;
  alt: string;
}

export function BaseImage({src, className, alt, ...rest}: BaseImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...rest} loading="lazy" src={src} alt={alt} className={classNames(styles.image, className)} />
  );
}

interface OptimizedImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'sizes'> {
  src: string;
  alt: string;
  sizes: string;
}

export function OptimizedImage({src, srcSet, sizes, ...rest}: OptimizedImageProps) {
  if (!src.startsWith(CLOUDINARY_ORIGIN)) {
    return <BaseImage src={src} {...rest} />;
  }

  return (
    <BaseImage {...rest} src={toResizedUrl(src, DEFAULT_SIZE)} srcSet={srcSet ?? buildSrcSet(src)} sizes={sizes} />
  );
}

const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com/demo/image/upload';
const IMAGE_STEPS = [300, 400, 500, 600, 700, 800, 900];
const DEFAULT_SIZE = 900;

function toResizedUrl(originalUrl: string, size: number): string {
  const path = originalUrl.replace(CLOUDINARY_ORIGIN, '');
  return `${CLOUDINARY_ORIGIN}/w_${size},c_fill,f_auto${path}`;
}

function buildSrcSet(originalUrl: string): string {
  return IMAGE_STEPS.map((size) => `${toResizedUrl(originalUrl, size)} ${size}w`).join(', ');
}
