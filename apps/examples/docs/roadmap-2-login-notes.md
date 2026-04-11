# 로드맵 2: 로그인

## 요구사항

- Server/Client 각 단계에서 인증정보를 가져와야 함
- Next.js의 server/client import 제약으로 인한 파일 분리 문제
- 아직 인증 라이브러리 통합 없음
- 어드민 과제 미니멈 버전이 있음 (참고용)

## 테스트케이스

- (구글문서에서 가져오면서 채울 예정)

---

## References

- [When to check session](https://docs.google.com/document/d/1638s0FFCVyc1SDbxUm2rBejPziaHAmCMoEUFwzmt1Z8/edit)
- [Next Auth Solution](https://docs.google.com/document/d/1IJD_63-SDXgiODMoe0fX0RtQhKk6lz27guTKaH65jbw/edit)
- [로그인 성공 후 전역처리를 위한 fetching 모듈 추가 커밋링크](https://github.com/developer-choi/test-playground/commit/9f4a95fb)

---

## 사용법 TODO

ApiClient 추상 클래스는 authPolicy 관련 기능이 없음.
그래서 RP 처럼 customFetch(), onClient, onServer 3개를 따로 구현해야함.

1. 여러 프로젝트마다 재사용되는 부분은 BaseApi 그 자체라서 이렇게 분리했고
2. 프로젝트마다 세션정보 관리방식이 다를 수 있음. (레거시냐 최신이냐)

근데 이게 최선인지 모르겠음.

---

## Request Phase

### authorize

1. 이 API가 private / public / guest API인지 AND 현제 로그인 여부값 서로 대조해서 애초에 호출 할 수 있는지 체크
2. [cache 기본값을 authorize private이 아닌 none을 기준으로 설정하도록 변경](https://github.com/developer-choi/react-playground/commit/a504576d5b487bd9d811dee50fa9ca66249cd14f)
   - [이걸 하는 경우, force-cache를 쓰려고 하는 경우가 많다보니](https://github.com/developer-choi/test-playground/commit/0483ebff00f64a25bc9a0561409b96f56d0956a9) 기본값을 none의 기본값을 force-cache로 했음.
3. [permission parameter를 authorize parameter로 통합](https://github.com/developer-choi/react-playground/commit/ca80b140c6daa101d740f3af0ab7ff16fc4f592d)

### fetchFromClient() / fetchFromServer()

[서버에서 클라이언트꺼, 또는 그 반대의 환경에서 잘못 호출하면 에러 던지도록 추가](https://github.com/developer-choi/react-playground/commit/baeebb1e41dcea7d0c7f0816fe3244ed2b557828)

이거 처음에는 내부에서 require()로 서버냐 클라이언트냐 따져서 유저 세션정보 가져왔다가,
require() 안쓰겠다고 저렇게 파일 분리했었는데,
이게 Nextjs에서 말하는 정석이 맞긴 한데,

혹시나 랭디처럼 서버파일 클라이언트파일 매번 2개씩 만드는게 번거롭다고 하는 회사를 만난다면,
require() 대신 dynamic import (ESM 스펙)으로 가져오면 삽가능함.

### 기타

- [fetch()의 cache parameter의 기본값을 private일 경우 no-store로 설정](https://github.com/developer-choi/react-playground/commit/7602ff8b67cf1c0121e47578c7c734f4c4e9709d)

---

## Dynamic and Static Rendering 둘 다 지원하기

[공통 fetch() 안에서 header, cookies를 가져오게 되는경우, Static Rendering이 될 수 없다는 예시 추가](https://github.com/developer-choi/test-playground/commit/70c135abe1cb8af14c22a2d01f4e861c852bbce1)

```ts
try {
  if (parameter.authorize === 'none') {
    return await customFetch(input, {...parameter, session: null, authorize: 'none'});
  } else {
    const session: Session | null = await auth();
    return await customFetch(input, {...parameter, session});
  }
} catch (error: any) {
  if (error instanceof LoginError) {
    const currentUrl = require('next/headers').headers().get('current-pathname-with-search') ?? '/'; // middleware에서 셋팅
    redirect(`/api/next-auth/logout?redirect=${currentUrl}`);
  } else {
    throw error;
  }
}
```

조건문을 따지지 않고 항상 세션을 조회할 경우,
Static Rendering 되야하는 페이지에서도 Static Rendering되게됨.

그래서 세션 조회는 꼭 Dynamic Rendering인 경우에만 조회하도록 해야함.

---

## environment

[fetch()를 client / server로 분리](https://github.com/developer-choi/react-playground/commit/46dfc61b6b6ac0ee173761ca2e91e768ceafabd0)
계속 고민이 많았는데, require('next/headers').headers() 이런식으로 쓰는게 맞나 싶었음.
결국 아닌건 아니기 때문에, import {headers}를 직접 했고,
그에 따라 client side에서 server 모듈 import를 못하기에

1. 공통 fetch()도 client / server로 분리헀고,
2. api 호출하는 함수들도 client / server로 분리할 수밖에 없었음.

---

## tag

### 타입 정의 방법

[server action + revalidateTag 표준 정의 (fetch 파일에 정의하는게 제일 나은듯)](https://github.com/developer-choi/test-playground/commit/feaefe926bdd7b66f1a636c0597b6bb519ba34d7)

> [REVALIDATE_TAG 삭제](https://github.com/developer-choi/react-playground/commit/47d7e3b2bba188e48ce1a6efacec11f12ab265b4)
> 타입으로만 해결하기로 했음.

### 진짜 오래된 데이터 캐시 삭제하려다 포기

tag값은 미래에 개발정책상 바뀔 수 있고,
이 때 기존 tag값은 안쓰게 될 수도 있으니, 이걸 날리기 위해
force-cache 기본값을 뭐 한달? 설정하려고 헀는데,

tag를 revalidate 하는거지, remove 하는게 아니기 때문에…
포기했음.
