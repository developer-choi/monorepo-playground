const TOKEN_KEY = "access_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(TOKEN_KEY);
}
