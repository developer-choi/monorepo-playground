'use client';

import {useState} from 'react';
import type {Product} from '@/shared/product/type';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({product}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isDiscounted = product.price.original > product.price.final;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div style={{position: 'relative', aspectRatio: '1 / 1', background: '#f5f5f5'}}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
        />
        <button
          onClick={() => setIsFavorite(prev => !prev)}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            lineHeight: 1,
            padding: 4,
          }}
          aria-label={isFavorite ? '좋아요 취소' : '좋아요'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <span style={{fontSize: 12, color: '#888'}}>{product.brand.name}</span>
        <span style={{fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {product.name}
        </span>
        <div style={{display: 'flex', gap: 6, alignItems: 'baseline'}}>
          <span style={{fontSize: 14, fontWeight: 600}}>
            {product.price.final.toLocaleString()}원
          </span>
          {isDiscounted && (
            <span style={{fontSize: 12, color: '#aaa', textDecoration: 'line-through'}}>
              {product.price.original.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
