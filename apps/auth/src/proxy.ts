import {NextResponse} from 'next/server';
import {auth} from '../auth';

const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const response = NextResponse.next();

  if (req.auth?.accessToken) {
    response.cookies.set("access_token", req.auth.accessToken as string, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } else {
    response.cookies.delete("access_token");
  }

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
