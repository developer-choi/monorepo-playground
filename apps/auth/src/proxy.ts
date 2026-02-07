import {NextResponse} from 'next/server';
import {auth} from '../auth';

const PUBLIC_PATHS = ["/login"];

function buildLoginUrl(baseUrl: string, pathname: string, search: string) {
  const url = new URL("/login", baseUrl);
  url.searchParams.set("callbackUrl", pathname + search);
  return url;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const hasRefreshError = req.auth?.error === "RefreshAccessTokenError";
  const isAuthenticated = !!req.auth && !hasRefreshError;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const response = NextResponse.next();

  if (hasRefreshError && !isPublicPath) {
    response.cookies.delete("access_token");
    return NextResponse.redirect(buildLoginUrl(req.url, pathname, req.nextUrl.search));
  }

  if (req.auth?.accessToken) {
    response.cookies.set("access_token", req.auth.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } else {
    response.cookies.delete("access_token");
  }

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(buildLoginUrl(req.url, pathname, req.nextUrl.search));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
