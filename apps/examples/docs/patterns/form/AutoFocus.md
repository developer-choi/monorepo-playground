# 자동 포커스 — 폼 중심 페이지

폼이 페이지의 주된 목적인 곳(로그인, 회원가입, 게시글 쓰기, 검색 전용 페이지 등)에서는 첫 폼 요소에 `autoFocus`를 걸어 사용자의 클릭·터치 한 단계를 생략한다.

## 적용 범위

- ✅ 폼 중심 페이지 — 진입 직후 사용자가 바로 입력을 시작할 것이 예상되는 페이지
- ❌ 콘텐츠를 스크롤로 소비하는 페이지 — 검색 결과, 피드, 기사 + 하단 댓글 폼 등. 재진입 시 복원된 스크롤을 input 포커스가 가로채 탐색 흐름이 깨진다

다중 필드 폼(로그인 email + password, 회원가입 등)이어도 **첫 필드에만** `autoFocus`를 걸면 충분하다.

## 구현

```tsx
<form>
  <Input autoFocus placeholder="이메일" />
  <Input placeholder="비밀번호" type="password" />
  <button type="submit">로그인</button>
</form>
```

HTML 표준 속성이므로 별도 구현이 필요 없다.
