import {DefaultSession} from 'next-auth';

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string | null;
    tenantId?: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string | null;
    tenantId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string | null;
    tenantId?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
