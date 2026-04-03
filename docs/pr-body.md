~~## Summary

- **Virtual List**: `@tanstack/react-virtual`을 적용하여 뷰포트 밖 DOM을 제거
- 4,000개 이상의 게시글을 로드한 상태에서 스크롤 성능 개선

## 1. 문제 정의

무한 스크롤로 데이터를 계속 쌓으면 DOM 노드가 비례하여 증가합니다. 600개를 로드하면 600개의 `<article>`이 DOM에 존재하고, 브라우저는 스크롤할 때마다 이 모든 노드에 대해 Layout과 Style 재계산을 수행합니다.

## 2. Before — Virtual List 없음

4,000개 이상 로드 후 스크롤 시 Long Task 발생:

| Summary | Detail |
|---|---|
| <img width="497" alt="heavy-summary" src="https://github.com/user-attachments/assets/38d7db0d-da8c-4478-8532-ae333264b975" /> | <img width="700" alt="heavy-detail" src="https://github.com/user-attachments/assets/214f143f-3aa9-42da-954e-bcfe9bac5921" /> |

- **Long Task**: 194ms
- **setAttribute**: 54.6ms (28.1%) — React가 4,000개+ DOM 노드 속성 업데이트
- **Layout**: 43.7ms (22.5%) — 레이아웃 재계산
- **Recalculate style**: 35.0ms (18.0%) — 스타일 재계산
- **DOM 노드 수**: 600개 (article 기준)

Layout + Recalculate style = **78.7ms (40.5%)**가 렌더링에 소비. DOM이 많을수록 이 비용이 비례하여 증가합니다.

## 3. After — Virtual List 적용

`useWindowVirtualizer`로 뷰포트 근처의 행만 DOM에 유지:

| Summary | Detail |
|---|---|
| <img width="700" alt="virtual-summary" src="https://github.com/user-attachments/assets/b1ab4323-262e-483b-bf16-0d6d0f8f8a0a" /> | <img width="700" alt="virtual-detail" src="https://github.com/user-attachments/assets/641ed862-cb0e-421b-a464-8f015dc3e737" /> |

- **Long Task**: 68ms (65% 감소)
- **setAttribute**: 15.4ms (72% 감소)
- **Layout**: 11.8ms (73% 감소)
- **Recalculate style**: 11.1ms (68% 감소)
- **DOM 노드 수**: 36개 (article 기준, 94% 감소)

| | Before | After | 감소율 |
|---|---|---|---|
| Long Task | 194ms | 68ms | 65% |
| setAttribute | 54.6ms | 15.4ms | 72% |
| Layout | 43.7ms | 11.8ms | 73% |
| Recalculate style | 35.0ms | 11.1ms | 68% |
| DOM 노드 (article) | 600개 | 36개 | 94% |

## 4. 구현

`useWindowVirtualizer`로 행(row) 단위 가상화. 4열 그리드이므로 행당 4개 카드를 묶어 가상화 단위로 사용합니다.

```typescript
const virtualizer = useWindowVirtualizer({
  count: rowCount,
  estimateSize: () => estimateRowHeight(containerRef),
  overscan: 5,
});
```

- `estimateSize`: 컨테이너 너비 기반으로 행 높이를 동적 계산 (이미지 aspect ratio 1:1.2 + 정보 영역)
- `overscan: 5`: 뷰포트 위아래 5행을 미리 렌더링하여 스크롤 시 빈 영역 방지~~
