# 시맨틱 마크업 — a/Link, form 요소 선택

태그는 시각적 모양이 아니라 **의미와 기능**에 맞게 선택한다. 스크린 리더·키보드 네비게이션·브라우저 기본 동작(새 탭 열기, 마우스 오른쪽 메뉴 등)이 올바르게 동작하려면 의미 있는 태그를 사용해야 한다.

## 링크 — 페이지 이동 UI

페이지 이동이 발생하는 UI는 텍스트·이미지·버튼 모양 여부와 무관하게 `<a>` (Next.js는 `<Link>`) + `href`를 사용한다.

- `<button onClick={() => router.push(...)}>` — Bad. 중간 클릭(새 탭), 우클릭 메뉴 등 브라우저 기본 동작이 깨진다.
- `<div onClick={() => window.location.href = ...}>` — Bad. 키보드 포커스·스크린 리더 인식 불가.

```tsx
// ❌ Bad — button + router.push
<button onClick={() => router.push(`/board/${id}`)}>게시글 보기</button>

// ❌ Bad — div + window.location
<div onClick={() => (window.location.href = `/board/${id}`)}>게시글 보기</div>

// ✅ Good — Next.js Link
<Link href={`/board/${id}`}>게시글 보기</Link>

// ✅ Good — 기본 a 태그 (외부 링크)
<a href="https://example.com" target="_blank" rel="noreferrer">
  외부 링크
</a>
```

## 폼 — 입력 영역

사용자 입력을 받는 영역은 폼 관련 태그로 구성한다.

- 전체 영역: `<form>` — Enter 키로 submit, reset 동작 등이 자동 처리
- 그룹핑: `<fieldset>` + `<legend>` — 관련 필드 묶음을 스크린 리더가 인식
- 입력/라벨: `<input>` + `<label>` — 라벨 클릭으로 포커스 이동, 접근성 트리 연결

```tsx
// ❌ Bad — div 기반 폼
<div>
  <div>이메일</div>
  <input type="text" />
  <div onClick={handleSubmit}>제출</div>
</div>

// ✅ Good — 시맨틱 폼
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>로그인</legend>
    <label>
      이메일
      <input type="email" name="email" />
    </label>
    <label>
      비밀번호
      <input type="password" name="password" />
    </label>
  </fieldset>
  <button type="submit">제출</button>
</form>
```
